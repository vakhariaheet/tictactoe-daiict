import { api, APIError } from 'encore.dev/api';
import { getBookContent, getImageContent } from '../Services/Gemini';
import { saveBookFromURL } from '../utils/File';
import { ElasticSearch } from '../Services/ElasticSearch';
import crypto from 'crypto';
import { readFile } from 'fs/promises';
import { paginate } from '../utils/utils';
import { Subscription, Topic } from 'encore.dev/pubsub';
import log from 'encore.dev/log';
import { SQLDatabase } from 'encore.dev/storage/sqldb';
import { getAuthData } from '~encore/auth';
import type { DBPost, DBPostAttachment, DBRating } from './types.d';
import { auth  } from '~encore/clients'
const db = new SQLDatabase('post', {
	migrations: './migrations',
});
const userdb = SQLDatabase.named('auth')
function calculateRelevanceScore(user: DBUser, post: CombinedPost): number {
	let score = 0;

	// Verified professional posts get highest priority
	if (post.is_verified) {
		score += 100;
	}

	// Peer relevance
	if (user.sem === post.sem && user.yr === post.yr) {
		score += 50;
	} else if (user.yr === post.yr) {
		score += 30;
	}

	// Course and specialization relevance
	if (user.course === post.course) {
		score += 20;
	}
	if (user.specialization === post.specialization) {
		score += 10;
	}

	// University relevance
	if (user.university === post.university) {
		score += 10;
	}

	// Senior posts (1-2 years senior)
	if (0 < post.yr - user.yr && post.yr - user.yr <= 2) {
		score += 15;
	}

	// Junior posts (1-2 years junior)
	if (0 < user.yr - post.yr && user.yr - post.yr <= 2) {
		score += 5;
	}

	// Boost score based on post rating
	score += Math.min(post.avg_rating * 2, 20); // Cap rating boost at 20

	// Recency boost (posts within last 7 days)
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
	if (new Date(post.created_at) >= sevenDaysAgo) {
		score += 10;
	}

	return score;
}

interface AddPostParams {
	files: {
		mimetype: string;
		url: string;
	}[];
	content: string;
}
const postTopic = new Topic('post', {
	deliveryGuarantee: 'exactly-once',
});
interface APISuccess {
	success: boolean;
	data: any;
}
interface ScoredPost {
	content: string;
    avg_rating: number;
    id: string;
    author_id: string;
    created_at: string;
	updated_at: string;
	
	username: string;
	is_student: boolean;
	bio: string;
	university: string;
	specialization: string;
	yr: number;
	sem: number;
	course: string;
	is_verified: boolean;
	has_completed_profile: boolean;
	relevance_score: number;
}
interface RecommendPostParams {
	searchQuery?: string;
	limit?: number;
}
interface ElasticsearchResult {
	postid: string;
	content: string;
	page: number;
	document_id: string;
}

interface CombinedPost {
	content: string;
	avg_rating: number;
	id: string;
	author_id: string;
	created_at: string;
	updated_at: string;
	username: string;
	is_student: boolean;
	bio: string;
	university: string;
	specialization: string;
	yr: number;
	sem: number;
	course: string;
	is_verified: boolean;
	has_completed_profile: boolean;
	relevance_score: number;
}





const _ = new Subscription(postTopic, 'ocr-post', {
	handler: async (data: { postid: string }) => {
		log.debug('ocr-post', data);
		const post =
			await db.queryRow`SELECT * FROM posts WHERE id = ${data.postid}`;
		if (!post) {
			return;
		}
		const postid = post.id;
		const pdfsinDb = db.query`SELECT * FROM post_attachments WHERE post_id = ${postid} AND type = 'pdf'`;
		const pdfs = [];

		for await (let pdf of pdfsinDb) {
			pdfs.push(pdf);
		}

		for (const pdf of pdfs) {
			const input = await saveBookFromURL(pdf.url);
			const content = await getBookContent(input);

			for (const page of content) {
				const resp  = await ElasticSearch.insert(
					postid,
					page,
					'0',
					`DOC_${crypto.randomBytes(16).toString('hex')}`,
				);
				log.debug('ElasticSearch.insert', resp);
			}
		}

		const imagesInDb = db.query`SELECT * FROM post_attachments WHERE post_id = ${postid} AND type = 'image'`;
		const images = [];
		for await (let image of imagesInDb) {
			images.push(image);
		}

		const imagePages = paginate(images, 5);
		for (const imagePage of imagePages) {
			const images = await Promise.all(
				imagePage.map(async (image) => {
					const input = await saveBookFromURL(image.url);
					return {
						inlineData: {
							data: await readFile(input, {
								encoding: 'base64',
							}),
							mimeType: image.mimetype,
						},
					};
				}),
			);

			const content = (await getImageContent(images))?.map((img) => ({
				postid: postid,
				content: img,
				page: '0',
				document_id: `DOC_${crypto.randomBytes(16).toString('hex')}`,
			}));

			if (content)
				content.forEach((page) =>
					ElasticSearch.insert(
						page.postid,
						page.content,
						page.page,
						page.document_id,
					),
				);
		}
	},
});

export const recommendPosts = api(
	{
		method: ['GET'],
		auth: true,
		expose: true,
		path: '/posts/recommend',
	},
	async ({
		searchQuery,
		limit,
	}: RecommendPostParams): Promise<Record<"posts",ScoredPost[]>> => {
		const { userID } = getAuthData();
		const user = await auth.getUser({ userid: userID });
		if (!user) {
			throw APIError.notFound('User not found');
		}
		let posts: DBPost[] = [];
		let esResults: ElasticsearchResult[] = [];

		if (searchQuery) {
			const ocrResults = (
				await ElasticSearch.search(searchQuery)
			).hits.hits.map((hit) => hit._source as ElasticsearchResult);
			// Search both post content and OCR content
			const dbPosts = (await getPostByContent({ content: searchQuery })).posts;
			posts = dbPosts;
			esResults = ocrResults;

			// Get posts from Elasticsearch results that aren't already in dbPosts
			const dbPostIds = new Set(dbPosts.map((p) => p.id));
			const additionalPostIds = esResults
				.map((r) => r.postid)
				.filter((id) => !dbPostIds.has(id));

			const additionalPosts = await getPostsByIds({ids:additionalPostIds});
			posts = [...posts, ...additionalPosts.posts];
		} else {
			// If no search query, fetch recent posts
			posts = await getPosts({ limit: 100 });
		}

		// Get unique user IDs from posts
		const uniqueUserIds = [...new Set(posts.map((post) => post.author_id))];

		// Fetch user data for all post authors
        const postAuthors = (await auth.getUsersFromIds({
            ids: uniqueUserIds,
        })).users;

		// Create a map of user IDs to user data for quick lookup
		const userMap = new Map(postAuthors.map((user) => [user.id, user]));

		// Combine post and user data
		const combinedPosts: CombinedPost[] = posts.map((post) => {
			const postAuthor = userMap.get(post.author_id);
			return {
				...post,
				is_verified: (postAuthor as any).is_verified || false,
				sem: postAuthor?.sem || 0,
				yr: postAuthor?.yr || 0,
				course: postAuthor?.course || '',
				specialization: postAuthor?.specialization || '',
				university: postAuthor?.university || '',
			};
		}) as any;

		// Calculate relevance scores
		const scoredPosts: ScoredPost[] = combinedPosts.map((post) => ({
			...post,
			relevance_score: calculateRelevanceScore(user, post),
		}));

		// If there's a search query, boost the relevance score of matching posts
		if (searchQuery) {
			const esResultsSet = new Set(esResults.map((r) => r.postid));
			scoredPosts.forEach((post) => {
				if (esResultsSet.has(post.id)) {
					post.relevance_score += 500; // Boost for OCR content match
				}
				// Posts from direct database search already have high relevance due to recency
			});
		}

		// Sort posts by relevance score
		scoredPosts.sort((a, b) => b.relevance_score - a.relevance_score);

		return {posts: scoredPosts.slice(0, limit)};
	},
);
interface GetPostsFromUserIdsProps {
	userIds: string[];
}

export const getPostsFromUserIds = api(
	{
		method: ['POST'],
		auth: false,
		expose: false,
		path: '/posts/get-from-user-ids',
	},
	async (query: GetPostsFromUserIdsProps) => {
		const { userIds } = query;
		const posts: DBPost[] = [];
		const dbPosts = db.query<DBPost>`SELECT * FROM posts WHERE author_id IN (${userIds.join(
			',',
		)})`;
		for await (const post of dbPosts) {
			posts.push(post);
		}
		return posts;
	},
);

interface GetPostProps {
	limit?: number;
}

export const getPosts = api(
	{
		method: ['GET'],
		auth: false,
		expose: true,
		path: '/posts',
	},
	async (p: GetPostProps) => {
		const posts: DBPost[] = [];
		const dbPosts = db.query<DBPost>`SELECT * FROM posts LIMIT ${
			p.limit || 100
		}`;
		for await (const post of dbPosts) {
			posts.push(post);
		}
		return posts;
	},
);

interface GetPostByIdProps {
	postId: string ;
}

export const getPostById = api(
	{
		method: ['GET'],
		auth: false,
		expose: true,
		path: '/post/:postId',
	},
    async (query: GetPostByIdProps): Promise<DBPost & DBPostAttachment> => {
        
		const post = await db.queryRow<
			DBPost & DBPostAttachment
		>`SELECT * FROM posts WHERE id = ${query.postId} JOIN post_attachments ON posts.id = post_attachments.post_id`;
		if (!post) {
			throw APIError.notFound('Post not found');
		}
		return post;
	},
);


export const getPostsByIds = api(
    {
        method: [ 'POST' ],
        auth: false,
        expose: true,
        path: '/posts/get-from-ids',
    },
    async (query: { ids: string[] }): Promise<Record<"posts",(DBPost & DBPostAttachment)[]>> => {
        const posts: (DBPost & DBPostAttachment)[] = [];
        const dbPosts = db.query<DBPost & DBPostAttachment>`SELECT * FROM posts WHERE id IN (${query.ids.join(',')}) JOIN post_attachments ON posts.id = post_attachments.post_id`;
        for await (const post of dbPosts) {
            posts.push(post);
        }
        return {posts};
    }
);

export const getPostByContent = api(
	{
		method: ['GET'],
		auth: false,
		expose: true,
		path: '/post/content/:content',
	},
	async (query: { content: string; limit?: number }): Promise<Record<"posts",DBPost[]>> => {
		const posts: DBPost[] = [];
		const dbPosts = db.query<DBPost>`SELECT * FROM posts WHERE content LIKE '%${query.content}%' LIMIT 100`;
		for await (const post of dbPosts) {
			posts.push(post);
		}
		return {posts};
	},
);

interface AddReviewParams {
	postid: string;
	rating: number;
	content: string;
}

export const addReview = api(
	{
		method: ['POST'],
		auth: true,
		expose: true,
		path: '/post/review',
	},
	async (p: AddReviewParams): Promise<APISuccess> => {
		const data = getAuthData();
		log.debug('user', data);
		log.debug('addReview', p);
		await db.exec`INSERT INTO post_ratings(id,post_id,user_id,rating,content) VALUES (${crypto
			.randomBytes(16)
			.toString('hex')},${p.postid},${data.userID},${p.rating},${p.content})`;
		await db.exec`UPDATE posts SET avg_rating = (SELECT AVG(rating) FROM post_ratings WHERE post_id = ${p.postid}) WHERE id = ${p.postid}`;
		return { success: true, data: { message: 'Review Added Successfully' } };
	},
);

interface GetReviewsRating {
	postid: string;
	rating: number;
	content: string;
	created_at: string;
	updated_at: string;
	user_id: string;
	author?: DBUser;
}

export interface DBUser {
	id: string;
	username: string;
	is_student: boolean;
	bio: string;
	university: string;
	specialization: string;
	yr: number;
	sem: number;
	course: string;
	is_verified: boolean;
	has_completed_profile: boolean;
}
interface GetReviewsParams {
	postid: string;
}

export const getReviews = api(
	{
		method: ['GET'],
		auth: false,
		expose: true,
		path: '/post/reviews',
	},
	async (
		query: GetReviewsParams,
	): Promise<Record<'reviews', GetReviewsRating[]>> => {
		log.debug('getReviews', query);
		const dbreviews: DBRating[] = [];
		log.debug('dbreviews', dbreviews);
		const dbReviews = db.query<DBRating>`SELECT * FROM post_ratings WHERE post_id = ${query.postid}`;

		log
		for await (const review of dbReviews) {
			dbreviews.push(review);
		}
		const userIds = dbreviews.map((review) => review.user_id);
		log.debug('userIds', userIds);
		const users: DBUser[] = [];
		try {

			const dbUsers = await auth.getUsersFromIds({ ids: userIds });
		}
		catch (err) {
			log.error('Error fetching users', err);
		}
			
		log.debug('users', users);
		const reviews = dbreviews.map((review) => {
			const user = users.find((user) => user.id === review.user_id);
			return {
				...review,
				...user,
			};
		});
		return { reviews };
	},
);

export const getUserPostRating = api(
	{
		method: ['GET'],
		auth: true,
		expose: true,
		path: '/post/rating/:postid',
	},
	async (query: { postid: string }): Promise<DBRating> => {
		const data = getAuthData();
		const rating =
			await db.queryRow<DBRating>`SELECT * FROM post_ratings WHERE post_id = ${query.postid} AND user_id = ${data.userID}`;
		if (!rating) {
			throw APIError.notFound('Rating not found');
		}
		return rating;
	},
);

export const addPost = api(
	{
		method: ['POST'],
		auth: true,
		expose: true,
		path: '/post',
	},
	async (post: AddPostParams):Promise<APISuccess> => {
		const data = getAuthData();
		log.debug('user', data);
		log.debug('addPost', post);

		const postid = `POS_${crypto.randomBytes(16).toString('hex')}`;
		log.debug('postid', {
			data: `INSERT INTO posts(id,"author_id",content) VALUES (${postid},${data.userID}','${post.content}')`,
		});
		await db.exec`INSERT INTO posts(id,author_id,content) VALUES (${postid},${data.userID},${post.content})`;
		for (let file of post.files) {
			const attachmentId = `ATT_${crypto.randomBytes(16).toString('hex')}`;
			await db.exec`INSERT INTO post_attachments(id,post_id,url,type) VALUES (${attachmentId},${postid},${
				file.url
			},${file.mimetype.includes('pdf') ? 'pdf' : 'image'})`;
		}

		postTopic.publish({
			postid: postid,
		});

		return { success: true, data: { message: 'Post Added Successfully' } };
	},
);

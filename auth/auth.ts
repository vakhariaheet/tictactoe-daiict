import { createClerkClient, verifyToken } from '@clerk/clerk-sdk-node';
import { api, APIError, Gateway } from 'encore.dev/api';
import type { Header } from 'encore.dev/api';
import { secret } from 'encore.dev/config';
import { AUTHORIZED_PARTIES, DOMAIN } from './config';
import log from 'encore.dev/log';
import { authHandler } from 'encore.dev/auth';
import crypto from 'crypto';
import type {
	AddUserInfoParams,
	DBUser,
	UserCreatedHookParams,
} from './types.d';
import { SQLDatabase } from 'encore.dev/storage/sqldb';
import { getAuthData } from '~encore/auth';

const clerkSecretKey = secret('ClerkSecretKey');
const clerkJWTSecret = secret('ClerkJWT');
const clerkClient = createClerkClient({
	secretKey: clerkSecretKey(),
	
});
const db = new SQLDatabase('auth', {
	migrations: './migrations',
});

interface AuthParams {
	authorization: Header<'Authorization'>;
}

interface AuthData {
	userID: string;
	imageUrl: string;
	emailAddress: string | null;
}

const myAuthHandler = authHandler(
	async (params: AuthParams): Promise<AuthData> => {
		const token = params.authorization.replace('Bearer ', '');

		if (!token) {
			throw APIError.unauthenticated('no token provided');
		}

		try {
			log.debug('result before');
			
			const result = await verifyToken(token, {
				jwtKey: clerkJWTSecret(),
				apiUrl: DOMAIN,
				secretKey: clerkSecretKey(),

			});
			log.debug('result', result);

			const user = await clerkClient.users.getUser(result.sub);

			return {
				userID: user.id,
				imageUrl: user.imageUrl,
				emailAddress: user.emailAddresses[ 0 ].emailAddress || null,
			};
		} catch (e) {
			log.error(e);
			throw APIError.unauthenticated('invalid token', e as Error);
		}
	},
);

interface Success {
	success: boolean;
	data: any;
}

export const getUser = api(
	{
		auth: true,
		expose: true,
		method: [ 'GET' ],
		path:'/user/:userid'
	},
	async ({userid}:{userid:string}):Promise<DBUser> => {
		const data = await db.queryRow<DBUser>`SELECT * FROM users WHERE id = ${userid}`;
		log.debug('getUser', data);
		if (!data) {
			throw APIError.notFound('user not found');
		}
		return data;
	},);

export const userCreatedWebhook = api(
		{
			auth: false,
			expose: true,
			method: [ 'POST' ],
			path: '/user-created',
		},
		async (p: UserCreatedHookParams): Promise<Success> => {
			log.debug('webhook', p);
			try {
				await db.exec`INSERT INTO users (id) VALUES (${p.data.id})`;
			} catch (e) {
				log.error(e);
				throw APIError.internal('failed to insert user');
			}
			const allUsers = await db.query`SELECT * FROM users`;
			return { success: true, data: allUsers };
		},
	);



export const addUserInfo = api(
	{
		auth: false,
		expose: true,
		method: [ 'POST' ],
		path: '/profile/add-user-info',
	},
	async (p: AddUserInfoParams) => {
		const data = getAuthData();
		log.debug("user", data);
		log.debug('addUserInfo', p);
		try {
			log.debug('query', {q: `UPDATE users SET is_student = ${p.is_student}, bio = ${p.bio},
				course = ${p.course || null}, yr = ${p.year || null}, sem = ${p.semester || null},
				specialization = ${p.specialization || null}, university = ${p.university || null}
				WHERE id = ${data.userID}`});
			if (p.is_student)
				await db.exec`UPDATE users SET is_student = ${p.is_student},bio='${p.bio}',
				course = '${p.course || null}', yr = ${p.year || null}, sem = ${p.semester || null},
				specialization =' ${p.specialization || null}', university = '${p.university || null}'
				WHERE id ='${data.userID}'`;
			else {
				await db.exec`UPDATE users SET is_student = ${p.is_student}, bio = ${p.bio}
				WHERE id = ${data.userID}`;
			}
		} catch (e) {
			console.log(e);
			log.error(e);
			throw APIError.internal('failed to insert user info');
		}
		return { status: 'ok' };
	},
);

interface UserLists {
	q?: string;
}

export const getUserLists = api({
	auth: true,
	expose: true,
	method: [ 'GET' ],
	path: '/profile/lists',

}, async (query: UserLists): Promise<Success> => {
	log.debug("Query:", query);
	const { userID } = getAuthData();
	const resp = db.query`SELECT * FROM user_lists WHERE user_id = ${userID} AND list_name LIKE ${query.q || '%'}  ORDER BY created_at,total_posts DESC`;
	const rows = [];
	for await (const row of resp) {
		log.debug("Row:", row);
		rows.push(row);
	}

	return { success: true, data: rows };
});

interface UserList {
	name: string;
}
export const addUserList = api({
	auth: true,
	expose: true,
	method: [ 'POST' ],
	path: '/profile/add-list',
}, async (query: UserList): Promise<Success> => {
	const { userID } = getAuthData();
	db.exec`INSERT INTO user_lists (id,user_id, list_name) VALUES (${crypto.randomBytes(16).toString('hex')},${userID}, ${query.name})`;
	return { success: true, data: { name: query.name } };
}
);

export const deleteUserList = api({
	auth: true,
	expose: true,
	method: [ 'DELETE' ],
	path: '/profile/delete-list/:id',

}, (params: {
	id: string;
}) => {
	const { userID } = getAuthData();
	db.exec`DELETE FROM user_lists WHERE id = ${params.id} AND user_id = ${userID}`;
	return { status: 'ok' };
})

export const addPostToUserList = api({
	auth: true,
	expose: true,
	method: [ 'POST' ],
	path: '/profile/add-post-to-list',
}, async (query: { post_id: string; list_id: string }) => {
	const { userID } = getAuthData();
	await db.exec`INSERT INTO user_saved_posts (post_id,list_id,user_id) VALUES (${query.post_id},${query.list_id},${userID})`;
	await db.exec`UPDATE user_lists SET total_posts = total_posts + 1 WHERE id = ${query.list_id}`;
	return { status: 'ok' };
}
);

export const removePostFromUserList = api({
	auth: true,
	expose: true,
	method: [ 'DELETE' ],
	path: '/profile/remove-post-from-list/:id',
}, async (params: { id: string, list_id: string }) => {
	await db.exec`DELETE FROM user_saved_posts WHERE post_id = ${params.id} AND list_id = ${params.list_id}`;

	return { status: 'ok' };
})

interface UserListParams {
	id: string;
}

export const getUserListPosts = api({
	auth: true,
	expose: true,
	method: [ 'GET' ],
	path: '/profile/list-posts/:id',
}, async (params: UserListParams): Promise<Success> => {
	const { userID } = getAuthData();
	const resp = db.query`SELECT * FROM user_saved_posts WHERE list_id = ${params.id} AND user_id = ${userID}`;
	const rows = [];
	for await (const row of resp) {
		rows.push(row);
	}
	return { success: true, data: rows };
});
interface GetUsersFromIdsParams {
	ids: string[];
}


export const getUsersFromIds = api({
	auth: false,
	expose: true,
	method: [ 'POST' ],
	path: '/profile/get-users-from-ids',
}, async (query: GetUsersFromIdsParams): Promise<Record<"users", DBUser[]>> => {
	log.debug("Query:", query);
	const user2 = await clerkClient.users.getUserList();
	log.debug("User2:", user2);
	const users: DBUser[] = [];
	try {
		log.debug('query', query);
		for (const id of query.ids) {
			try {
				const user = await clerkClient.users.getUser(id);
				if (user) {
					users.push({
						id: user.id,
						username: user.username || '',
						is_student: false,
						bio: '',
						university: '',
						specialization: '',
						yr: 0,
						sem: 0,
						course: '',
						is_verified: false,
						has_completed_profile: false,
					});
				}
			} catch (e) { 
				log.debug("dsa", {
					e
				});
			}
			
		}

		return { users };
	} catch (e) {
		console.log(e);
		log.debug("dsa", {
			e
		});
		throw APIError.internal('fa to get users',e as Error);
	}
})


export const mygw = new Gateway({ authHandler: myAuthHandler });

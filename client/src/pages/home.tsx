import { SidebarNav } from '@/components/SidebarNav';
import { MainMenu } from '@/components/MainMenu';
import FeedPost, { Post } from '@/components/FeedPost';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';

const Home = () => {
	const { getToken } = useAuth();
	const [ posts, setPosts ] = useState<Post[]>();
	const [collections, setCollections] = useState<string[]>([]);
	useEffect(() => {
		const fetchPosts = async () => {
			const token = await getToken();
			const response = await fetch('http://localhost:4000/posts/recommend', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
	
			const data = await response.json();

			setPosts(data.posts);
			const collections = await fetch('http://localhost:4000/profile/lists', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`,
				}
			});
			const collectionData = await collections.json();
			setCollections(collectionData.data);
		};
		fetchPosts();

	},[])


	return (
		<div className='flex flex-col min-h-screen'>
		  <div className='w-full'>
    		<MainMenu />
		  </div>

			<div className='flex flex-grow mt-5 gap-72'>
				<div className='top-0 sticky mx-11 w-1/6 h-96 border-black border-2 rounded-lg'>
					<SidebarNav />
				</div>

				<div className='flex flex-col justify-center w-5/6 space-y-5 '>
					
					{
						posts && posts.map((post) => (
							<FeedPost {...post} key={post.id} collections={collections} setCollections={setCollections} />
						))
					}
				</div>
			</div>
		</div>
	);
};

export default Home;

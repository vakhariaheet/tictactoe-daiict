import { SidebarNav } from '@/components/SidebarNav';
import { MainMenu } from '@/components/MainMenu';
import FeedPost from '@/components/FeedPost';

const Home = () => {
	const post = {
		title: 'Post Title',
		attachments: [
			{
				mimeType: 'application/pdf',
				url: 'https://res.cloudinary.com/hzxyensd5/image/upload/w_150,c_scale/v1727505965/doc_codepen_upload/CG_UNIT_1_ASS._psa7nn.pdf',
			},
		],
		avg_rating: 4,
		id: 'POS_a941dfb48c539f7160028003c7317f6b',
		created_at: '2022-01-01',
		updated_at: '2022-01-02',
		author: { name: 'John Doe' },
	};

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
					<FeedPost {...post} />
					<FeedPost {...post} />
				</div>
			</div>
		</div>
	);
};

export default Home;

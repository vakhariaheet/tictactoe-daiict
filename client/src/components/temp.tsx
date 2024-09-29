import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import PdfViewer from './PdfViewer';
import { Star } from 'lucide-react';
import { Bookmark } from 'lucide-react';
import { Download } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from '@/components/ui/dialog';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

interface Post {
	title: string;
	attachments: {
		mimeType: string;
		url: string;
	}[];
	avg_rating: number;
	id: string;
	author: {
		name: string;
	};
	created_at: string;
	updated_at: string;
}
const FeedPost: React.FC<Post> = (post) => {
	const [rating, setRating] = useState(0);
	const [review, setReview] = useState('');

	const handleSubmit = () => {
		alert(
			`Thank you for your review!\nRating: ${rating} stars\nReview: ${review}`,
		);
		// Clear the form after submission
		setRating(0);
		setReview('');
	};

	return (
		<>
			<div>
				<Card>
					<CardHeader>
						<CardTitle className='leading-8'>
							Research Paper on Number of Students Choosing Information
							Technology as a Career
						</CardTitle>
						<CardDescription>
							By {post.author.name} &nbsp;&nbsp; {post.created_at}
						</CardDescription>
					</CardHeader>
					<CardContent className='pdf_container'>
						<PdfViewer pdfUrl={post.attachments[0].url} />
					</CardContent>

					{/* Card Footer with Split Button Groups */}
					<CardFooter className='flex justify-between items-center'>
						{/* Download Button on the Left */}
						<Button className='mt-4'>
							Download &nbsp;
							<Download className='stroke-white' />
						</Button>

						{/* Right Aligned Buttons (Rate and Bookmark) */}
						<div className='flex space-x-4 items-center'>
							{/* Rate Button */}
							<Dialog>
								<DialogTrigger asChild>
									<Button className='mt-4 bg-white hover:bg-lightgray zinc-100...'>
										<Star className='stroke-black' /> &nbsp;
									</Button>
								</DialogTrigger>
								<DialogContent className='sm:max-w-[425px]'>
									<DialogHeader>
										<DialogTitle>Leave a Review</DialogTitle>
										<DialogDescription>
											We would love to hear your thoughts!
										</DialogDescription>
									</DialogHeader>
									<div className='card'>
										{/* Rating Component */}
										<div className='rating'>
											{[...Array(5)].map((_, index) => (
												<span
													key={index}
													className={`star ${index < rating ? 'filled' : ''}`}
													onClick={() => setRating(index + 1)}
													style={{ fontSize: '30px', cursor: 'pointer' }}
												>
													★
												</span>
											))}
										</div>
										{/* Review Input Field */}
										<div className='review-input'>
											<Textarea
												value={review}
												onChange={(e) => setReview(e.target.value)}
												placeholder='Write your review here...'
											/>
										</div>
									</div>
									<DialogFooter>
										<Button onClick={handleSubmit} disabled={!rating}>
											Submit
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>

							{/* Bookmark Button */}
							<Link
								to={`/${post.id}/comments`}
								className={buttonVariants({
									variant: 'outline',
									className: 'mt-4 bg-white hover:bg-lightgray zinc-100...',
								})}
							>
								<MessageCircle className='stroke-black' /> &nbsp;
							</Link>
							<Button className='mt-4 bg-white hover:bg-lightgray zinc-100...'>
								<Bookmark className='stroke-black' /> &nbsp;
							</Button>
						</div>
					</CardFooter>
				</Card>
			</div>
		</>
	);
};

export default FeedPost;

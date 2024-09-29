import { useState } from 'react';
import Editor from './Editor'; // Import Editor component
import FileUpload from './FileUpload'; // Import FileUpload component
import { Button } from '@/components/ui/button'; // Import Button component
import { CirclePlus } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function Post() {
	const [editorContent, setEditorContent] = useState('');
	// Function to toggle the editor and uploader visibility

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant='outline' className='w-80 h-10 text-[18px] stroke-white text-white bg-black'>
					<CirclePlus/>
					&nbsp;&nbsp;Add Post
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle className='h-[2rem]'>Add Post</DialogTitle>
					<DialogDescription>Add a new post to the feed</DialogDescription>
				</DialogHeader>

				<div className="">
					<Editor setEditorContent={setEditorContent} />
					<FileUpload editorContent={editorContent} />
				</div>
			</DialogContent>
		</Dialog>
	);
}

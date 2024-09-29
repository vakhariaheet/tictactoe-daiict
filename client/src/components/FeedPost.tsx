import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { Page, Document } from 'react-pdf';
import { Star, Bookmark, Download, MessageCircle } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState<'review' | 'save'>('review');
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [newCollectionName, setNewCollectionName] = useState('');
  const { getToken } = useAuth();

  const handleReviewSubmit = async () => {
    const token = await getToken();
    const data = {
      postid: post.id,
      rating: rating,
      content: review,
    };

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:4000/post/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: 'Review Submitted',
          description: 'Your review has been submitted successfully.',
        });
        setIsDrawerOpen(false);
      } else {
        alert('Failed to submit the review. Please try again.');
      }
    } catch (error) {
      console.error('An error occurred while submitting the review:', error);
      alert('An error occurred while submitting the review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div>
        <Card className='border-black border-2 z-[10000] rounded-lg'>
          <CardHeader>
            <CardTitle className='leading-8'>
              Research Paper on Number of Students Choosing Information Technology as a Career
            </CardTitle>
            <div>By {post.author.name} &nbsp;&nbsp; {post.created_at}</div>
          </CardHeader>

          <CardContent className='pdf_container'>
            <div className='flex flex-col items-center justify-center w-max relative z-0'>
              <Document
                file={post.attachments[0].url}
                onLoadSuccess={(pdf) => {
                  setNumPages(pdf.numPages);
                }}
              >
                <Page width={300} pageNumber={pageNumber} />
              </Document>
              <div className='absolute opacity-15 hover:opacity-75 gap-3 flex bottom-0 justify-center w-full z-[100]'>
                <Button onClick={() => setPageNumber(pageNumber > 1 ? pageNumber - 1 : 1)}>
                  {'<'}
                </Button>
                <Button onClick={() => setPageNumber(pageNumber < numPages ? pageNumber + 1 : pageNumber)}>
                  {'>'}
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className='flex justify-between items-center'>
            <Button className='mt-4'>
              Download &nbsp;
              <Download className='stroke-white' />
            </Button>

            <div className='flex space-x-4 items-center'>
              <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button onClick={() => { setDrawerContent('review'); setIsDrawerOpen(true); }} className='mt-4'>
                    <Star className='stroke-white' /> &nbsp;
                  </Button>
                </DrawerTrigger>
                <DrawerTrigger asChild>
                  <Button onClick={() => { setDrawerContent('save'); setIsDrawerOpen(true); }} className='mt-4'>
                    <Bookmark className='stroke-white' /> &nbsp;
                  </Button>
                </DrawerTrigger>

                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>
                      {drawerContent === 'review' ? 'Leave a Review' : 'Save to Collection'}
                    </DrawerTitle>
                  </DrawerHeader>

                  {drawerContent === 'review' ? (
                    <div>
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
                      <Textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder='Write your review here...'
                      />
                    </div>
                  ) : (
                    <div>
                      <Input
                        placeholder='New collection name...'
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                      />
                      <Button className='mt-4'>Create Collection</Button>
                    </div>
                  )}

                  <DrawerFooter>
                    {drawerContent === 'review' ? (
                      <Button onClick={handleReviewSubmit} disabled={!rating || isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </Button>
                    ) : (
                      <Button>Save Post</Button>
                    )}
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>

              <Link to={`/${post.id}/comments`} className={buttonVariants({ variant: 'outline', className: 'mt-4 bg-black' })}>
                <MessageCircle className='stroke-white' /> &nbsp;
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default FeedPost;

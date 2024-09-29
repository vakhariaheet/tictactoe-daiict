import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Star, MessageCircle, Download, Bookmark } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@clerk/clerk-react";

const NAMES = [
  "John Doe",
  "Jane Doe",
  "Alice",
  "Bob",
  "Charlie",
  "David",
  "Eve",
  "Frank",
  "Grace",
  "Heidi",
  "Isaac",

  "Jasmine",

  "Karl",
  "Linda",
];

interface Review {
  username: string;
  content: string;
  stars: number;
}

export function CommentsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0); // New rating input
  const [reviewContent, setReviewContent] = useState(""); // New review input
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [ Names, setNames ] = useState(NAMES);
  const { postId } = useParams();
  const { getToken } = useAuth();

  // Fetch existing reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:4000/post/reviews?postid=${postId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await response.json();
        setReviews(data.reviews || []);
      } catch (err: any) {
        setError(err?.message || "Error occurred while fetching reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [postId]);

  // Handle review submission
  const handleSubmitReview = async () => {
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:4000/post/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postid: postId,
          rating,
          content: reviewContent,
        }),
      });

      if (response.ok) {
        toast({ title: 'Review Submitted', description: 'Thank you for your feedback!' });
        setReviews([...reviews, { username: "You", stars: rating, content: reviewContent }]);
        setIsReviewing(false);
      } else {
        toast({ title: "Error", description: "Failed to submit the review" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An error occurred while submitting the review" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="w-full bg-white rounded-lg p-6 shadow-none">
        <h4 className="text-2xl font-semibold mb-4">Comments</h4>
        <Separator className="my-2" />
        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} className="py-4 border-b last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <strong className="text-lg text-gray-800">{
                    review.username || Names[Math.floor(Math.random() * Names.length)]
                  }</strong>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5"
                        fill={i < review.rating ? "#ffb703" : "none"}
                        stroke={i < review.rating ? "#ffb703" : "gray"}
                      />
                    ))}
                  </div>
                </div>
                <Separator className="my-2" />
                <p className="text-md text-gray-600">{review.content}</p>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      </div>

      <Dialog open={isReviewing} onOpenChange={setIsReviewing}>
        <DialogTrigger asChild>
          
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="card">
            <div className="rating flex space-x-1">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`h-6 w-6 ${index < rating ? 'fill-current text-yellow-500' : ''}`}
                  onClick={() => setRating(index + 1)}
                />
              ))}
            </div>
            <Textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="Write your review here..."
              className="mt-4"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSubmitReview} disabled={!rating || isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

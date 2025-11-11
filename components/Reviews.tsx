import React, { useState, useEffect, useCallback } from 'react';
import { getReviews, addReview } from '../services/firestoreService';
import { uploadReviewImage } from '../services/storageService';
import type { Review, FirebaseUser } from '../types';
import { StarRating } from './StarRating';
import { useToast } from '../hooks/useToast';

interface ReviewsProps {
    recipeId: string;
    user: FirebaseUser;
    onReviewAdded: (review: Review) => void;
}

const PhotoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);

export const Reviews: React.FC<ReviewsProps> = ({ recipeId, user, onReviewAdded }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Form state
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { addToast } = useToast();

    const fetchReviews = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedReviews = await getReviews(recipeId);
            setReviews(fetchedReviews);
        } catch (err) {
            setError('Could not load reviews.');
        } finally {
            setIsLoading(false);
        }
    }, [recipeId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            addToast({ message: 'Please select a rating.', type: 'error' });
            return;
        }
        setIsSubmitting(true);
        try {
            let imageUrl: string | undefined = undefined;
            if (imageFile) {
                imageUrl = await uploadReviewImage(imageFile, user.uid, recipeId);
            }

            const newReview: Omit<Review, 'id' | 'createdAt'> = {
                recipeId,
                userId: user.uid,
                userName: user.displayName || 'Anonymous',
                userPhotoUrl: user.photoURL,
                rating,
                comment,
                imageUrl,
            };

            await addReview(newReview);
            
            // Clear form and optimistically update UI
            onReviewAdded(newReview as Review); // Pass to parent for optimistic update
            setReviews(prev => [{...newReview, createdAt: new Date(), id: 'temp-id'}, ...prev]);
            setRating(0);
            setComment('');
            setImageFile(null);
            setImagePreview(null);
            addToast({ message: 'Thank you for your review!', type: 'success' });

        } catch (err) {
            addToast({ message: 'Failed to submit review.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const ReviewItem: React.FC<{ review: Review }> = ({ review }) => (
        <div className="flex gap-4 py-4 border-b border-[--border]">
            <img src={review.userPhotoUrl || undefined} alt={review.userName} className="h-10 w-10 rounded-full bg-[--muted]" referrerPolicy="no-referrer" />
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <p className="font-semibold">{review.userName}</p>
                    <StarRating rating={review.rating} size="sm" />
                </div>
                <p className="text-sm text-[--muted-foreground] mt-1">{review.comment}</p>
                {review.imageUrl && (
                    <img src={review.imageUrl} alt="User-submitted photo of the dish" className="mt-2 rounded-lg max-h-48 w-auto" />
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-[--foreground]">Reviews & Photos</h3>
            {/* Review Form */}
            <div className="bg-[--card] p-4 rounded-lg border border-[--border]">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Your Rating</label>
                        <StarRating rating={rating} onRatingChange={setRating} isInteractive />
                    </div>
                    <div>
                        <label htmlFor="comment" className="sr-only">Comment</label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience..."
                            rows={3}
                            className="block w-full border border-[--border] bg-[--input] rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[--ring] sm:text-sm"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                         <label htmlFor="imageUpload" className="cursor-pointer flex items-center gap-2 text-sm font-medium text-[--muted-foreground] hover:text-[--primary]">
                            <PhotoIcon className="h-5 w-5" />
                            <span>Add a Photo</span>
                            <input id="imageUpload" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                         </label>
                         {imagePreview && (
                            <div className="flex items-center gap-2">
                                <img src={imagePreview} alt="Preview" className="h-10 w-10 object-cover rounded-md" />
                                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-xs text-[--destructive]">Remove</button>
                            </div>
                         )}
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto flex items-center justify-center py-2 px-5 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-[--primary-foreground] bg-[--primary] hover:brightness-95 disabled:bg-[--muted]">
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>
            
            {/* Reviews List */}
            <div>
                {isLoading && <p className="text-center text-[--muted-foreground]">Loading reviews...</p>}
                {error && <p className="text-center text-[--destructive]">{error}</p>}
                {!isLoading && !error && reviews.length === 0 && <p className="text-center text-[--muted-foreground] py-4">Be the first to review this recipe!</p>}
                {!isLoading && !error && reviews.length > 0 && (
                    <div className="space-y-2">
                        {reviews.map(review => <ReviewItem key={review.id} review={review} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

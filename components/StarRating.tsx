// FIX: Import the useState hook from React to manage component state.
import React, { useState } from 'react';

interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    isInteractive?: boolean;
    size?: 'sm' | 'md';
}

const StarIcon: React.FC<{ filled: boolean; className?: string; onClick?: () => void; onMouseEnter?: () => void; onMouseLeave?: () => void }> = ({ filled, className, ...props }) => (
    <svg
        className={`transition-colors duration-150 ${filled ? 'text-yellow-400' : 'text-[--muted-foreground]/50'} ${className}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);


export const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, isInteractive = false, size = 'md' }) => {
    const [hoverRating, setHoverRating] = useState(0);
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

    if (isInteractive && onRatingChange) {
        return (
            <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        type="button"
                        key={star}
                        onClick={() => onRatingChange(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        className="p-1"
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                        <StarIcon
                            filled={star <= (hoverRating || rating)}
                            className={`${starSize} cursor-pointer hover:scale-110 transform transition-transform`}
                        />
                    </button>
                ))}
            </div>
        );
    }
    
    // Static display
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => <StarIcon key={`full-${i}`} filled className={starSize} />)}
            {/* Note: Half star display is omitted for simplicity, rounding to nearest full star */}
            {[...Array(5 - fullStars)].map((_, i) => <StarIcon key={`empty-${i}`} filled={false} className={starSize} />)}
        </div>
    );
};

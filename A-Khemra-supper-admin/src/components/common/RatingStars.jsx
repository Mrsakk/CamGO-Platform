import { useState } from "react";
import { Star } from "lucide-react";
const RatingStars = ({
  rating,
  maxStars = 5,
  size = "md",
  interactive = false,
  onChange,
  showScore = false,
  reviewsCount
}) => {
  const [hoverRating, setHoverRating] = useState(null);
  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-6 h-6"
  };
  const numRating = Number(rating) || 0;
  const currentRating = hoverRating !== null ? hoverRating : numRating;
  return <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, index) => {
    const starValue = index + 1;
    const isFull = currentRating >= starValue;
    const isHalf = currentRating >= starValue - 0.5 && currentRating < starValue;
    return <button
      key={index}
      type="button"
      disabled={!interactive}
      onClick={() => interactive && onChange && onChange(starValue)}
      onMouseEnter={() => interactive && setHoverRating(starValue)}
      onMouseLeave={() => interactive && setHoverRating(null)}
      className={`${interactive ? "cursor-pointer transform hover:scale-110 transition-transform" : "cursor-default"} p-0.5 focus:outline-none`}
    >
              <Star
      className={`${sizeClasses[size]} ${isFull ? "fill-amber-400 text-amber-400" : isHalf ? "fill-amber-400/50 text-amber-400" : "text-stone-300 dark:text-stone-600"} transition-colors`}
    />
            </button>;
  })}
      </div>

      {showScore && <span className="font-semibold text-stone-800 dark:text-stone-700 text-small">
          {numRating.toFixed(1)}
        </span>}

      {reviewsCount !== void 0 && <span className="text-small text-stone-500 dark:text-stone-400">
          ({reviewsCount})
        </span>}
    </div>;
};
export {
  RatingStars
};

import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { X, Send, Loader2 } from "lucide-react";
import { RatingStars } from "@/components/common/RatingStars";
import { reviewsApi } from "@/lib/api/reviews";
import { toast } from "@/store/toastStore";
import {
  RumduolFlower
} from "@/components/common/RumduolMotifs";

const ReviewModal = ({
  isOpen,
  onClose,
  destinationId,
  existingReview,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError(t("reviews.rating_required", "Please select a star rating (1-5)"));
      return;
    }
    if (!comment.trim()) {
      setError(t("reviews.comment_required", "Please share your experience"));
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      if (existingReview) {
        await reviewsApi.updateReview(existingReview.id, { rating, comment });
        toast.success(t("reviews.update_success", "Review updated successfully!"));
      } else {
        await reviewsApi.createReview({
          destination_id: destinationId,
          rating,
          comment
        });
        toast.success(t("reviews.submit_success", "Thank you! Your field review has been submitted for editorial moderation."));
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || t("common.error_occurred", "Failed to save review");
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="silk-glass rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-500/30 relative text-white">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 mb-5">
          <div className="flex items-center gap-2">
            <RumduolFlower className="w-4 h-4 text-amber-500" />
            <span className="text-small font-semibold text-amber-400">
              Field Research Log Entry
            </span>
          </div>
          <h3 className="text-h3 font-bold text-white">
            {existingReview ? t("reviews.edit_review", "Edit Field Log") : t("reviews.write_review", "Document Site Log")}
          </h3>
          <p className="text-body text-stone-300 leading-relaxed max-w-prose">
            {t("reviews.share_feedback_desc", "Help other travelers by documenting your authentic on-site experience.")}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800 text-small text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 font-km">
          {/* Star selector */}
          <div className="flex flex-col items-center justify-center p-4 bg-stone-950/80 rounded-2xl border border-amber-500/20">
            <span className="text-small font-semibold text-amber-400 mb-2">
              {t("reviews.your_rating", "Expedition Assessment Rating")}
            </span>
            <RatingStars
              rating={rating}
              size="lg"
              interactive
              onChange={(newRating) => setRating(newRating)}
            />
            <span className="mt-2 text-small font-semibold text-amber-300">
              {rating === 5 && t("reviews.rating_5", "★ 5.0 - Exemplary Monumental Experience")}
              {rating === 4 && t("reviews.rating_4", "★ 4.0 - Highly Recommended Wonder")}
              {rating === 3 && t("reviews.rating_3", "★ 3.0 - Standard Scenic Attraction")}
              {rating === 2 && t("reviews.rating_2", "★ 2.0 - Under Expectation")}
              {rating === 1 && t("reviews.rating_1", "★ 1.0 - Unfavorable Experience")}
            </span>
          </div>

          {/* Comment text area */}
          <div>
            <label className="block text-small font-semibold text-stone-200 mb-1.5">
              {t("reviews.comment_label", "Field Notes & Practical Advice")}
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("reviews.comment_placeholder", "What did you observe? Best hour for photography? Ticket nuances?")}
              className="w-full rounded-xl border border-stone-700 bg-stone-950 p-3.5 text-body text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 font-km leading-relaxed"
              required
            />
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-700 text-stone-300 hover:bg-stone-800 text-body font-bold transition-colors"
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 text-body font-bold shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t("common.submit", "Transmit Log")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
};

export { ReviewModal };

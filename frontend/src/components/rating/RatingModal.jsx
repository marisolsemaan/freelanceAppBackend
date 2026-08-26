import { useState } from "react";

export default function RatingModal({
  show,
  onClose,
  onSubmit,
  submitting,
  otherUserName,
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [error, setError] = useState("");

  if (!show) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    const success = await onSubmit({
      rating,
      comment: comment.trim() || null,
    });

    if (success) {
      setRating(0);
      setComment("");
    }
  };

  const handleClose = () => {
    if (submitting) return;

    setRating(0);
    setComment("");
    setError("");

    onClose();
  };

  return (
    <div
      className="rating-modal-backdrop"
      onMouseDown={handleClose}
    >
      <div
        className="rating-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          className="rating-modal-close"
          onClick={handleClose}
          disabled={submitting}
        >
          <i className="bi bi-x-lg"></i>
        </button>

        <div className="rating-modal-icon">
          <i className="bi bi-star-fill"></i>
        </div>

        <h4>Rate your experience</h4>

        <p className="rating-modal-description">
          How was your experience with{" "}
          <strong>{otherUserName}</strong>?
        </p>

        <form onSubmit={handleSubmit}>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`rating-star ${
                  star <= rating
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setRating(star)
                }
                disabled={submitting}
                aria-label={`${star} star`}
              >
                <i className="bi bi-star-fill"></i>
              </button>
            ))}
          </div>

          {rating > 0 && (
            <div className="rating-selected-text">
              {rating} / 5
            </div>
          )}

          {error && (
            <div className="rating-modal-error">
              {error}
            </div>
          )}

          <div className="rating-comment-group">
            <label>
              Leave a review
              <span>Optional</span>
            </label>

            <textarea
              value={comment}
              onChange={(event) =>
                setComment(event.target.value)
              }
              placeholder="Share your experience..."
              rows="4"
              disabled={submitting}
            />
          </div>

          <div className="rating-modal-actions">
            <button
              type="button"
              className="btn btn-light"
              onClick={handleClose}
              disabled={submitting}
            >
              Skip
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                submitting ||
                rating === 0
              }
            >
              {submitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                  />

                  Submitting...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2"></i>

                  Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
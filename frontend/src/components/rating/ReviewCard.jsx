function ReviewCard({ review }) {
  if (!review) return null;

  // Support both camelCase/snake_case and PascalCase variants
  const reviewerName =
    review.reviewerFullName || review.ReviewerFullName || "User";

  const createdAt = review.review_CreatedAt || review.Review_CreatedAt;

  const rating =
    review.review_Rating ?? review.Review_Rating ?? review.rating ?? 0;

  const comment = review.review_Comment || review.Review_Comment;

  return (
    <div className="review-card">
      <div className="review-card-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            <i className="bi bi-person-fill"></i>
          </div>

          <div>
            <h3>{reviewerName}</h3>

            <span>
              {createdAt ? new Date(createdAt).toLocaleDateString() : ""}
            </span>
          </div>
        </div>

        <div className="review-rating">
          <i className="bi bi-star-fill"></i>

          <strong>{Number(rating).toFixed(1)}</strong>
        </div>
      </div>

      {comment && <p className="review-comment">{comment}</p>}
    </div>
  );
}

export default ReviewCard;
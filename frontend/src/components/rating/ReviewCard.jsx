function ReviewCard({ review }) {
  return (
    <div className="review-card">
      <div className="review-card-header">

        <div className="reviewer-info">

          <div className="reviewer-avatar">
            <i className="bi bi-person-fill"></i>
          </div>

          <div>
            <h3>{review.reviewerFullName}</h3>

            <span>
              {new Date(
                review.review_CreatedAt
              ).toLocaleDateString()}
            </span>
          </div>

        </div>

        <div className="review-rating">
          <i className="bi bi-star-fill"></i>

          <strong>
            {Number(review.review_Rating).toFixed(1)}
          </strong>
        </div>

      </div>

      {review.review_Comment && (
        <p className="review-comment">
          {review.review_Comment}
        </p>
      )}
    </div>
  );
}

export default ReviewCard;
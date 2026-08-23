import { useNavigate } from "react-router-dom";
import "../../style/clientProfile.css";
import Navbar from "../../components/layout/Navbar";
import { useState } from "react";
import ReviewCard from "../../components/rating/ReviewCard";
import "../../style/reviewCard.css";
function ClientProfile() {
  const navigate = useNavigate();
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Temporary data.
  // Later this comes from GetClientProfileAsync.
  const profile = {
    userId: 1,
    fullName: "Maria Johnson",
    averageRating: 4.8,
    reviewCount: 3,

    reviews: [
      {
        review_Id: 1,
        review_Rating: 5,
        review_Comment:
          "Great client. Clear requirements and excellent communication.",
        review_CreatedAt: "2026-08-15",
      },
      {
        review_Id: 1,
        review_Rating: 5,
        review_Comment:
          "Great client. Clear requirements and excellent communication.",
        review_CreatedAt: "2026-08-15",
      },
      {
        review_Id: 1,
        review_Rating: 5,
        review_Comment:
          "Great client. Clear requirements and excellent communication.",
        review_CreatedAt: "2026-08-15",
      },
      {
        review_Id: 1,
        review_Rating: 5,
        review_Comment:
          "Great client. Clear requirements and excellent communication.",
        review_CreatedAt: "2026-08-15",
      },
      {
        review_Id: 2,
        review_Rating: 4,
        review_Comment:
          "Professional and easy to work with.",
        review_CreatedAt: "2026-08-10",
      },
      {
        review_Id: 3,
        review_Rating: 5,
        review_Comment:
          "Very respectful and easy to communicate with.",
        review_CreatedAt: "2026-08-05",
      },
    ],
  };

  return (
    <>
    <Navbar/>
    
    <div className="client-profile-page">
      <div className="client-profile-container">

        <button
          type="button"
          className="back-button"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left"></i>
          Back
        </button>

        {/* CLIENT HEADER */}

        <div className="client-profile-header">

          <div className="client-avatar">
            <i className="bi bi-person-fill"></i>
          </div>

          <h1>{profile.fullName}</h1>

          <div className="client-rating">
            <i className="bi bi-star-fill"></i>

            <strong>
              {Number(
                profile.averageRating || 0
              ).toFixed(1)}
            </strong>

            <span>
              ({profile.reviewCount} reviews)
            </span>
          </div>

          <p>Client</p>
        </div>

        {/* REVIEWS */}

        <div className="reviews-list">

           {profile.reviews
            .slice(
            0,
            showAllReviews ? profile.reviews.length : 3
            )
            .map((review) => (
            <ReviewCard
                key={review.review_Id}
                review={review}
            />
            ))}

        </div>

      </div>
    </div>
    </>
  );
}

export default ClientProfile;
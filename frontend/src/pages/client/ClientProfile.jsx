import { useEffect, useState } from "react";
import { useNavigate, useParams} from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import ReviewCard from "../../components/rating/ReviewCard";

import { getClientProfile, getTheClientProfile } from "../../services/profileService";

import "../../style/clientProfile.css";
import "../../style/reviewCard.css";

function ClientProfile() {
  const navigate = useNavigate();

  const { clientId } = useParams();
  
  const [profile, setProfile] = useState(null);
  
  const averageRating = profile?.averageRating ??       profile?.user_AvgRating ?? 0;
const reviewCount = profile?.reviewCount ?? profile?.user_ReviewCount ?? 0;
  

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAllReviews, setShowAllReviews] =
    useState(false);

  useEffect(() => {
    loadProfile();
  }, [clientId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = clientId ? await getTheClientProfile(clientId): await getClientProfile();

      const clientProfile =
        response?.data ?? response;

      setProfile(clientProfile);
    } catch (err) {
      console.error("Failed to load client profile:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load client profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const getProfilePhotoUrl = () => {
    if (!profile?.profilePhoto) {
      return null;
    }

    if (
      typeof profile.profilePhoto === "string" &&
      profile.profilePhoto.startsWith("data:")
    ) {
      return profile.profilePhoto;
    }

    return `data:${
      profile.profilePhotoContentType || "image/jpeg"
    };base64,${profile.profilePhoto}`;
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="client-profile-page">
          <div className="client-profile-container">
            <p>Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <Navbar />

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

            <div className="empty-reviews">
              <i className="bi bi-exclamation-circle"></i>

              <p>
                {error || "Client profile not found."}
              </p>
            </div>

          </div>
        </div>
      </>
    );
  }

  const reviews = profile.reviews ?? [];

  return (
    <>
      <Navbar />

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

              {getProfilePhotoUrl() ? (
                <img
                  src={getProfilePhotoUrl()}
                  alt={profile.user_FullName}
                />
              ) : (
                <i className="bi bi-person-fill"></i>
              )}

            </div>

            <h1>
              {profile.user_FullName}
            </h1>

            <div className="client-rating">

              <i className="bi bi-star-fill"></i>

              <strong>
                {Number(
                  averageRating
                ).toFixed(1)}
              </strong>

              <span>
                ({reviewCount} reviews)
              </span>

            </div>

            <p>Client</p>

          </div>

          {/* REVIEWS */}

          <div className="client-reviews-section">

            <div className="reviews-header">

              <div className="section-header">

                <h2>Reviews</h2>

                <p>
                  Reviews from workers who have worked
                  with this client.
                </p>

              </div>

              <div className="reviews-summary">

                <i className="bi bi-star-fill"></i>

                <strong>
                  {Number(
                    averageRating
                  ).toFixed(1)}
                </strong>

                <span>
                  ({reviewCount})
                </span>

              </div>

            </div>

            {reviews.length === 0 ? (
              <div className="empty-reviews">

                <i className="bi bi-chat-square-text"></i>

                <p>No reviews yet.</p>

              </div>
            ) : (
              <>
                <div className="reviews-list">

                  {reviews
                    .slice(
                      0,
                      showAllReviews
                        ? reviews.length
                        : 3
                    )
                    .map((review) => (
                      <ReviewCard
                        key={review.review_Id}
                        review={review}
                      />
                    ))}

                </div>

                {reviews.length > 3 && (
                  <button
                    type="button"
                    className="reviews-toggle-button"
                    onClick={() =>
                      setShowAllReviews(
                        (previous) => !previous
                      )
                    }
                  >
                    {showAllReviews
                      ? "Show Less"
                      : `View All Reviews (${reviews.length})`}

                    <i
                      className={
                        showAllReviews
                          ? "bi bi-chevron-up"
                          : "bi bi-chevron-down"
                      }
                    ></i>
                  </button>
                )}
              </>
            )}

          </div>

        </div>
      </div>
    </>
  );
}

export default ClientProfile;
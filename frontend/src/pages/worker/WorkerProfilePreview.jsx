import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import ReviewCard from "../../components/rating/ReviewCard";

import { getTheWorkerProfile } from "../../services/profileService";

import "../../style/workerProfile.css";
import "../../style/reviewCard.css";

function WorkerProfilePreview() {
  const navigate = useNavigate();
  const { workerId } = useParams();

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [workerId]);

  const loadProfile = async () => {
    try {

    
      setLoading(true);
      setError("");

      const numericWorkerId = Number(workerId);

      if (!Number.isInteger(numericWorkerId) || numericWorkerId <= 0) {
        throw new Error("Invalid worker ID.");
      }

 
      /*
       * getTheWorkerProfile() already returns response.data.
       *
       * Backend response:
       * {
       *   userId,
       *   fullName,
       *   profilePhoto,
       *   profilePhotoContentType,
       *   hourlyRate,
       *   aboutMe,
       *   skills,
       *   professions,
       *   cities,
       *   averageRating,
       *   reviewCount,
       *   reviews
       * }
       */
      const workerProfile =
        await getTheWorkerProfile(numericWorkerId);

          console.log(
  "Worker Profile JSON:",
  JSON.stringify(workerProfile, null, 2)
);

      if (!workerProfile) {
        throw new Error("Worker profile was not returned.");
      }

      setProfile(workerProfile);

    } catch (err) {
      console.error("Failed to load worker profile:", err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load worker profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const getProfilePhotoUrl = () => {
    if (!profile?.profilePhoto) {
      return null;
    }

    if (profile.profilePhoto.startsWith("data:")) {
      return profile.profilePhoto;
    }

    return (
      `data:${profile.profilePhotoContentType};base64,` +
      profile.profilePhoto
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="worker-profile-page">
          <div className="worker-profile-container">
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

        <div className="worker-profile-page">
          <div className="worker-profile-container">

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
                {error || "Worker profile not found."}
              </p>
            </div>

          </div>
        </div>
      </>
    );
  }

  /*
   * These fields exactly match the backend response.
   */


  const averageRating = profile.averageRating;

  const reviewCount = profile.reviewCount;




  const reviews = profile.reviews || [];
const workerProfessions = profile.professions || [];
const workerCities = profile.cities || [];

  
console.log("PROFILE EXACT DATA:", profile);
console.log("reviews:", reviews);
console.log("professions:", workerProfessions);
console.log("cities:", workerCities);

  return (
    <>
      <Navbar />

      <div className="worker-profile-page">

        <div className="worker-profile-container">

          {/* BACK */}

          <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left"></i>
            Back
          </button>


          {/* HEADER */}

          <div className="worker-profile-top">

            <div className="worker-profile-info">

              <div className="worker-photo">

                {getProfilePhotoUrl() ? (
                  <img
                    src={getProfilePhotoUrl()}
                    alt={profile.fullName}
                  />
                ) : (
                  <i className="bi bi-person-fill"></i>
                )}

              </div>


              <div>

                <div className="worker-name-row">

                  <h1>
                    {profile.fullName}
                  </h1>


                  <div className="profile-rating">

                    <i className="bi bi-star-fill"></i>

                    <span>
                      {Number(averageRating).toFixed(1)}
                    </span>

                    <span className="review-count">
                      ({reviewCount})
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* PROFESSION */}

          <div className="profile-section">

            <div className="section-header">

              <h2>Profession</h2>

              <p>
                Professional services offered by this worker.
              </p>

            </div>


            <div className="profile-tags">

              {workerProfessions.length > 0 ? (

                workerProfessions.map((profession) => (

                  <span
                    className="profile-tag"
                    key={profession.profession_Id}
                  >
                    {profession.profession_Title}
                  </span>

                ))

              ) : (

                <span className="profile-value">
                  No profession provided.
                </span>

              )}

            </div>

          </div>


          {/* CITY */}

          <div className="profile-section">

            <div className="section-header">

              <h2>Work Locations</h2>

              <p>
                Cities where this worker is available.
              </p>

            </div>


            <div className="profile-tags">

              {workerCities.length > 0 ? (

                workerCities.map((city) => (

                  <span
                    className="profile-tag"
                    key={city.city_Id}
                  >
                    <i className="bi bi-geo-alt"></i>

                    {city.city_Name}
                  </span>

                ))

              ) : (

                <span className="profile-value">
                  No cities provided.
                </span>

              )}

            </div>

          </div>


          {/* PROFESSIONAL DETAILS */}

          <div className="profile-section">

            <div className="section-header">

              <h2>Professional Details</h2>

              <p>
                Information about this worker's
                experience and services.
              </p>

            </div>


            <div className="form-group">

              <label>
                Hourly Rate
              </label>

              <p className="profile-value">
                ${profile.hourlyRate} / hour
              </p>

            </div>


            <div className="form-group">

              <label>
                About Me
              </label>

              <p className="profile-value profile-description">
                {profile.aboutMe ||
                  "No information provided."}
              </p>

            </div>


            <div className="form-group">

              <label>
                Skills
              </label>

              <p className="profile-value">
                {profile.skills ||
                  "No skills provided."}
              </p>

            </div>

          </div>


          {/* REVIEWS */}

          <div className="profile-section">

            <div className="reviews-header">

              <div className="section-header">

                <h2>Reviews</h2>

                <p>
                  Reviews from clients who have worked
                  with this worker.
                </p>

              </div>


              <div className="reviews-summary">

                <i className="bi bi-star-fill"></i>

                <strong>
                  {Number(averageRating).toFixed(1)}
                </strong>

                <span>
                  ({reviewCount})
                </span>

              </div>

            </div>


            {reviews.length === 0 ? (

              <div className="empty-reviews">

                <i className="bi bi-chat-square-text"></i>

                <p>
                  No reviews yet.
                </p>

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

export default WorkerProfilePreview;


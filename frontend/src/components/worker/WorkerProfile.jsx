import { useState } from "react";
import "../../style/workerProfile.css";
import Navbar from "../layout/Navbar";
import ReviewCard from "../../components/rating/ReviewCard";
import "../../style/reviewCard.css";

function WorkerProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "John Smith",
    photo: "",
    hourlyRate: "25",
    aboutMe:
      "Experienced web developer passionate about building modern and user-friendly applications.",
    skills: "React, JavaScript, HTML, CSS",
    averageRating:4.3,
    reviewCount:20,
    reviews: [
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
          "Great client. it was ok",
        review_CreatedAt: "2026-08-15",
      },
    ]
  });

  const [selectedProfessions, setSelectedProfessions] = useState([
    1,
    8,
  ]);

  const [selectedCities, setSelectedCities] = useState([
    1,
    2,
  ]);

  // Temporary data for now.
  // Later these will come from your API.
  const professions = [
    { id: 1, title: "Web Developer" },
    { id: 2, title: "Graphic Designer" },
    { id: 3, title: "Mobile Developer" },
    { id: 4, title: "Photographer" },
    { id: 5, title: "Electrician" },
    { id: 6, title: "Plumber" },
    { id: 7, title: "Painter" },
    { id: 8, title: "UI/UX Designer" },
  ];

  const cities = [
    { id: 1, name: "Beirut" },
    { id: 2, name: "Jounieh" },
    { id: 3, name: "Byblos" },
    { id: 4, name: "Tripoli" },
    { id: 5, name: "Zahle" },
    { id: 6, name: "Saida" },
    { id: 7, name: "Tyre" },
    { id: 8, name: "Batroun" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleProfessionChange = (e) => {
    const values = Array.from(
      e.target.selectedOptions,
      (option) => Number(option.value)
    );

    setSelectedProfessions(values);
  };

  const handleCityChange = (e) => {
    const values = Array.from(
      e.target.selectedOptions,
      (option) => Number(option.value)
    );

    setSelectedCities(values);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const photoUrl = URL.createObjectURL(file);

    setFormData((previousData) => ({
      ...previousData,
      photo: photoUrl,
    }));
  };

  const handleSave = () => {
    const workerProfileData = {
      ...formData,
      professionIds: selectedProfessions,
      cityIds: selectedCities,
    };

    console.log(workerProfileData);

    // Later:
    // await updateWorkerProfile(workerProfileData);

    setIsEditing(false);
  };

  const selectedProfessionNames = professions.filter((profession) =>
    selectedProfessions.includes(profession.id)
  );

  const selectedCityNames = cities.filter((city) =>
    selectedCities.includes(city.id)
  );

  return (
    <><Navbar /> 
    <div className="worker-profile-page">
      <div className="worker-profile-container">

        <button className="back-button" type="button">
          <i className="bi bi-arrow-left"></i>
          Back to Dashboard
        </button>

        {/* PROFILE HEADER */}

        <div className="worker-profile-top">
          <div className="worker-profile-info">

            <div className="worker-photo">
              {formData.photo ? (
                <img src={formData.photo} alt={formData.fullName} />
              ) : (
                <i className="bi bi-person-fill"></i>
              )}
            </div>

            <div>
              <h1>{formData.fullName}</h1>
             

              
            <div className="profile-rating">
                

                <span>
                {Number(formData.averageRating || 0).toFixed(1)}
                </span>

                <i className="bi bi-star-fill"></i>
            </div>





            </div>
          </div>

          <button
            type="button"
            className="FreelanceApp-primary edit-profile-button"
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
          >
            <i
              className={
                isEditing ? "bi bi-check-lg" : "bi bi-pencil"
              }
            ></i>

            {isEditing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        {/* PHOTO EDIT */}

        {isEditing && (
          <div className="profile-section">
            <div className="section-header">
              <h2>Profile Photo</h2>
              <p>Upload a professional profile photo.</p>
            </div>

            <div className="photo-upload">
              <div className="worker-photo large">
                {formData.photo ? (
                  <img src={formData.photo} alt="Profile" />
                ) : (
                  <i className="bi bi-person-fill"></i>
                )}
              </div>

              <label
                htmlFor="profilePhoto"
                className="upload-photo-button"
              >
                <i className="bi bi-camera"></i>
                Change Photo
              </label>

              <input
                type="file"
                id="profilePhoto"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </div>
          </div>
        )}

        {/* PROFESSIONS */}

        <div className="profile-section">
          <div className="section-header">
            <h2>Professions</h2>
            <p>The services you provide.</p>
          </div>

          {isEditing ? (
            <select
              multiple
              className="profile-multi-select"
              value={selectedProfessions}
              onChange={handleProfessionChange}
            >
              {professions.map((profession) => (
                <option
                  key={profession.id}
                  value={profession.id}
                >
                  {profession.title}
                </option>
              ))}
            </select>
          ) : (
            <div className="profile-tags">
              {selectedProfessionNames.map((profession) => (
                <span
                  className="profile-tag"
                  key={profession.id}
                >
                  {profession.title}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* CITIES */}

        <div className="profile-section">
          <div className="section-header">
            <h2>Where Can You Work?</h2>
            <p>Cities where you are available.</p>
          </div>

          {isEditing ? (
            <select
              multiple
              className="profile-multi-select"
              value={selectedCities}
              onChange={handleCityChange}
            >
              {cities.map((city) => (
                <option
                  key={city.id}
                  value={city.id}
                >
                  {city.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="profile-tags">
              {selectedCityNames.map((city) => (
                <span
                  className="profile-tag"
                  key={city.id}
                >
                  <i className="bi bi-geo-alt"></i>
                  {city.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* PROFESSIONAL DETAILS */}

        <div className="profile-section">
          <div className="section-header">
            <h2>Professional Details</h2>
            <p>Help clients understand your experience and services.</p>
          </div>

          <div className="form-group">
            <label htmlFor="hourlyRate">
              Hourly Rate
            </label>

            {isEditing ? (
              <div className="rate-input">
                <span>$</span>

                <input
                  type="number"
                  id="hourlyRate"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  min="0"
                />

                <small>/ hour</small>
              </div>
            ) : (
              <p className="profile-value">
                ${formData.hourlyRate} / hour
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="aboutMe">
              About Me
            </label>

            {isEditing ? (
              <textarea
                id="aboutMe"
                name="aboutMe"
                value={formData.aboutMe}
                onChange={handleChange}
                rows="5"
              />
            ) : (
              <p className="profile-value profile-description">
                {formData.aboutMe}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="skills">
              Skills
            </label>

            {isEditing ? (
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
              />
            ) : (
              <p className="profile-value">
                {formData.skills}
              </p>
            )}
          </div>
        </div>

        {/* REVIEWS */}

        <div className="reviews-list">

            {formData.reviews
            .slice(
            0,
            showAllReviews ? formData.reviews.length : 3
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

export default WorkerProfile;
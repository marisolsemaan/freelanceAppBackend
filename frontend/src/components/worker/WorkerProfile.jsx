// import { useState } from "react";
// import "../../style/workerProfile.css";
// import Navbar from "../layout/Navbar";
// import ReviewCard from "../../components/rating/ReviewCard";
// import "../../style/reviewCard.css";

// function WorkerProfile() {
//   const [isEditing, setIsEditing] = useState(false);
//   const [showAllReviews, setShowAllReviews] = useState(false);

//   const [formData, setFormData] = useState({
//     fullName: "John Smith",
//     photo: "",
//     hourlyRate: "25",
//     aboutMe:
//       "Experienced web developer passionate about building modern and user-friendly applications.",
//     skills: "React, JavaScript, HTML, CSS",
//     averageRating:4.3,
//     reviewCount:20,
//     reviews: [
//       {
//         review_Id: 1,
//         review_Rating: 5,
//         review_Comment:
//           "Great client. Clear requirements and excellent communication.",
//         review_CreatedAt: "2026-08-15",
//       },

//         {
//         review_Id: 2,
//         review_Rating: 4,
//         review_Comment:
//           "Great client. it was ok",
//         review_CreatedAt: "2026-08-15",
//       },
//     ]
//   });

//   const [selectedProfessions, setSelectedProfessions] = useState([
//     1,
//     8,
//   ]);

//   const [selectedCities, setSelectedCities] = useState([
//     1,
//     2,
//   ]);

//   // Temporary data for now.
//   // Later these will come from your API.
//   const professions = [
//     { id: 1, title: "Web Developer" },
//     { id: 2, title: "Graphic Designer" },
//     { id: 3, title: "Mobile Developer" },
//     { id: 4, title: "Photographer" },
//     { id: 5, title: "Electrician" },
//     { id: 6, title: "Plumber" },
//     { id: 7, title: "Painter" },
//     { id: 8, title: "UI/UX Designer" },
//   ];

//   const cities = [
//     { id: 1, name: "Beirut" },
//     { id: 2, name: "Jounieh" },
//     { id: 3, name: "Byblos" },
//     { id: 4, name: "Tripoli" },
//     { id: 5, name: "Zahle" },
//     { id: 6, name: "Saida" },
//     { id: 7, name: "Tyre" },
//     { id: 8, name: "Batroun" },
//   ];

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((previousData) => ({
//       ...previousData,
//       [name]: value,
//     }));
//   };

//   const handleProfessionChange = (e) => {
//     const values = Array.from(
//       e.target.selectedOptions,
//       (option) => Number(option.value)
//     );

//     setSelectedProfessions(values);
//   };

//   const handleCityChange = (e) => {
//     const values = Array.from(
//       e.target.selectedOptions,
//       (option) => Number(option.value)
//     );

//     setSelectedCities(values);
//   };

//   const handlePhotoChange = (e) => {
//     const file = e.target.files[0];

//     if (!file) return;

//     const photoUrl = URL.createObjectURL(file);

//     setFormData((previousData) => ({
//       ...previousData,
//       photo: photoUrl,
//     }));
//   };

//   const handleSave = () => {
//     const workerProfileData = {
//       ...formData,
//       professionIds: selectedProfessions,
//       cityIds: selectedCities,
//     };

//     console.log(workerProfileData);

//     // Later:
//     // await updateWorkerProfile(workerProfileData);

//     setIsEditing(false);
//   };

//   const selectedProfessionNames = professions.filter((profession) =>
//     selectedProfessions.includes(profession.id)
//   );

//   const selectedCityNames = cities.filter((city) =>
//     selectedCities.includes(city.id)
//   );

//   return (
//     <><Navbar /> 
//     <div className="worker-profile-page">
//       <div className="worker-profile-container">

//         <button className="back-button" type="button">
//           <i className="bi bi-arrow-left"></i>
//           Back to Dashboard
//         </button>

//         {/* PROFILE HEADER */}

//         <div className="worker-profile-top">
//           <div className="worker-profile-info">

//             <div className="worker-photo">
//               {formData.photo ? (
//                 <img src={formData.photo} alt={formData.fullName} />
//               ) : (
//                 <i className="bi bi-person-fill"></i>
//               )}
//             </div>

//             <div>
//               <h1>{formData.fullName}</h1>
             

              
//             <div className="profile-rating">
                

//                 <span>
//                 {Number(formData.averageRating || 0).toFixed(1)}
//                 </span>

//                 <i className="bi bi-star-fill"></i>
//             </div>





//             </div>
//           </div>

//           <button
//             type="button"
//             className="FreelanceApp-primary edit-profile-button"
//             onClick={isEditing ? handleSave : () => setIsEditing(true)}
//           >
//             <i
//               className={
//                 isEditing ? "bi bi-check-lg" : "bi bi-pencil"
//               }
//             ></i>

//             {isEditing ? "Save Changes" : "Edit Profile"}
//           </button>
//         </div>

//         {/* PHOTO EDIT */}

//         {isEditing && (
//           <div className="profile-section">
//             <div className="section-header">
//               <h2>Profile Photo</h2>
//               <p>Upload a professional profile photo.</p>
//             </div>

//             <div className="photo-upload">
//               <div className="worker-photo large">
//                 {formData.photo ? (
//                   <img src={formData.photo} alt="Profile" />
//                 ) : (
//                   <i className="bi bi-person-fill"></i>
//                 )}
//               </div>

//               <label
//                 htmlFor="profilePhoto"
//                 className="upload-photo-button"
//               >
//                 <i className="bi bi-camera"></i>
//                 Change Photo
//               </label>

//               <input
//                 type="file"
//                 id="profilePhoto"
//                 accept="image/*"
//                 onChange={handlePhotoChange}
//               />
//             </div>
//           </div>
//         )}

//         {/* PROFESSIONS */}

//         <div className="profile-section">
//           <div className="section-header">
//             <h2>Professions</h2>
//             <p>The services you provide.</p>
//           </div>

//           {isEditing ? (
//             <select
//               multiple
//               className="profile-multi-select"
//               value={selectedProfessions}
//               onChange={handleProfessionChange}
//             >
//               {professions.map((profession) => (
//                 <option
//                   key={profession.id}
//                   value={profession.id}
//                 >
//                   {profession.title}
//                 </option>
//               ))}
//             </select>
//           ) : (
//             <div className="profile-tags">
//               {selectedProfessionNames.map((profession) => (
//                 <span
//                   className="profile-tag"
//                   key={profession.id}
//                 >
//                   {profession.title}
//                 </span>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* CITIES */}

//         <div className="profile-section">
//           <div className="section-header">
//             <h2>Where Can You Work?</h2>
//             <p>Cities where you are available.</p>
//           </div>

//           {isEditing ? (
//             <select
//               multiple
//               className="profile-multi-select"
//               value={selectedCities}
//               onChange={handleCityChange}
//             >
//               {cities.map((city) => (
//                 <option
//                   key={city.id}
//                   value={city.id}
//                 >
//                   {city.name}
//                 </option>
//               ))}
//             </select>
//           ) : (
//             <div className="profile-tags">
//               {selectedCityNames.map((city) => (
//                 <span
//                   className="profile-tag"
//                   key={city.id}
//                 >
//                   <i className="bi bi-geo-alt"></i>
//                   {city.name}
//                 </span>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* PROFESSIONAL DETAILS */}

//         <div className="profile-section">
//           <div className="section-header">
//             <h2>Professional Details</h2>
//             <p>Help clients understand your experience and services.</p>
//           </div>

//           <div className="form-group">
//             <label htmlFor="hourlyRate">
//               Hourly Rate
//             </label>

//             {isEditing ? (
//               <div className="rate-input">
//                 <span>$</span>

//                 <input
//                   type="number"
//                   id="hourlyRate"
//                   name="hourlyRate"
//                   value={formData.hourlyRate}
//                   onChange={handleChange}
//                   min="0"
//                 />

//                 <small>/ hour</small>
//               </div>
//             ) : (
//               <p className="profile-value">
//                 ${formData.hourlyRate} / hour
//               </p>
//             )}
//           </div>

//           <div className="form-group">
//             <label htmlFor="aboutMe">
//               About Me
//             </label>

//             {isEditing ? (
//               <textarea
//                 id="aboutMe"
//                 name="aboutMe"
//                 value={formData.aboutMe}
//                 onChange={handleChange}
//                 rows="5"
//               />
//             ) : (
//               <p className="profile-value profile-description">
//                 {formData.aboutMe}
//               </p>
//             )}
//           </div>

//           <div className="form-group">
//             <label htmlFor="skills">
//               Skills
//             </label>

//             {isEditing ? (
//               <input
//                 type="text"
//                 id="skills"
//                 name="skills"
//                 value={formData.skills}
//                 onChange={handleChange}
//               />
//             ) : (
//               <p className="profile-value">
//                 {formData.skills}
//               </p>
//             )}
//           </div>
//         </div>

//         {/* REVIEWS */}

//         <div className="reviews-list">

//             {formData.reviews
//             .slice(
//             0,
//             showAllReviews ? formData.reviews.length : 3
//             )
//             .map((review) => (
//             <ReviewCard
//                 key={review.review_Id}
//                 review={review}
//             />
//             ))}
//         </div>

//       </div>
//     </div>
//     </>
//   );
// }

// export default WorkerProfile;

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../layout/Navbar";
import ReviewCard from "../../components/rating/ReviewCard";

import {
  getWorkerProfile,
  updateWorkerProfile,
} from "../../services/profileService";

import {
  getProfessions,
  getCities,
  createProfession,
} from "../../services/lookupService";

import "../../style/workerProfile.css";
import "../../style/reviewCard.css";

function WorkerProfile() {
  const navigate = useNavigate();
  const { workerId } = useParams();

  const [profile, setProfile] = useState(null);

  const [professions, setProfessions] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedProfessionId, setSelectedProfessionId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");

  const [professionSearch, setProfessionSearch] = useState("");
  const [professionDropdownOpen, setProfessionDropdownOpen] =
    useState(false);

  const [formData, setFormData] = useState({
    hourlyRate: "",
    aboutMe: "",
    skills: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  const [creatingProfession, setCreatingProfession] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [workerId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const [profileResponse, professionsResponse, citiesResponse] =
        await Promise.all([
          getWorkerProfile(workerId),
          getProfessions(),
          getCities(),
        ]);

      const workerProfile =
        profileResponse?.profile ?? profileResponse;

      setProfile(workerProfile);

      setProfessions(normalizeProfessions(professionsResponse));
      setCities(normalizeCities(citiesResponse));

      setFormData({
        hourlyRate: workerProfile?.hourlyRate ?? "",
        aboutMe: workerProfile?.aboutMe ?? "",
        skills: workerProfile?.skills ?? "",
      });

      const workerProfession =
        workerProfile?.professions?.[0];

      const workerCity =
        workerProfile?.cities?.[0];

      if (workerProfession) {
        setSelectedProfessionId(
          workerProfession.profession_Id ??
            workerProfession.professionId ??
            workerProfession.id ??
            ""
        );

        setProfessionSearch(
          workerProfession.profession_Title ??
            workerProfession.professionTitle ??
            workerProfession.title ??
            ""
        );
      }

      if (workerCity) {
        setSelectedCityId(
          workerCity.city_Id ??
            workerCity.cityId ??
            workerCity.id ??
            ""
        );
      }
    } catch (err) {
      console.error("Failed to load worker profile:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load worker profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const normalizeProfessions = (data) => {
    const list =
      Array.isArray(data)
        ? data
        : data?.data ?? [];

    return list.map((item) => ({
      id:
        item.profession_Id ??
        item.professionId ??
        item.id,
      title:
        item.profession_Title ??
        item.professionTitle ??
        item.title,
    }));
  };

  const normalizeCities = (data) => {
    const list =
      Array.isArray(data)
        ? data
        : data?.data ?? [];

    return list.map((item) => ({
      id:
        item.city_Id ??
        item.cityId ??
        item.id,
      name:
        item.city_Name ??
        item.cityName ??
        item.name,
    }));
  };

  const filteredProfessions = useMemo(() => {
    const search = professionSearch
      .trim()
      .toLowerCase();

    if (!search) {
      return professions;
    }

    return professions.filter((profession) =>
      profession.title
        ?.toLowerCase()
        .includes(search)
    );
  }, [professions, professionSearch]);

  const professionExists = useMemo(() => {
    const search = professionSearch.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return professions.some(
      (profession) =>
        profession.title?.trim().toLowerCase() === search
    );
  }, [professions, professionSearch]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProfessionSelect = (profession) => {
    setSelectedProfessionId(profession.id);
    setProfessionSearch(profession.title);
    setProfessionDropdownOpen(false);
  };

  const handleCreateProfession = async () => {
    const title = professionSearch.trim();

    if (!title || creatingProfession) {
      return;
    }

    try {
      setCreatingProfession(true);
      setSaveError("");

      const created = await createProfession(title);

      const newProfession = {
        id:
          created?.id ??
          created?.profession_Id ??
          created?.professionId,

        title:
          created?.title ??
          created?.profession_Title ??
          created?.professionTitle ??
          title,
      };

      setProfessions((previous) => [
        ...previous.filter(
          (item) => item.id !== newProfession.id
        ),
        newProfession,
      ]);

      setSelectedProfessionId(newProfession.id);
      setProfessionSearch(newProfession.title);
      setProfessionDropdownOpen(false);
    } catch (err) {
      console.error("Failed to create profession:", err);

      setSaveError(
        err?.response?.data?.message ||
          "Failed to add profession."
      );
    } finally {
      setCreatingProfession(false);
    }
  };

  const handleSave = async () => {
    if (!selectedProfessionId) {
      setSaveError("Please select a profession.");
      return;
    }

    if (!selectedCityId) {
      setSaveError("Please select a city.");
      return;
    }

    try {
      setSaving(true);
      setSaveError("");

      const response = await updateWorkerProfile({
        hourlyRate: Number(formData.hourlyRate),
        aboutMe: formData.aboutMe,
        skills: formData.skills,
        professionId: Number(selectedProfessionId),
        cityId: Number(selectedCityId),
      });

      const updatedProfile =
        response?.profile ?? response;

      setProfile(updatedProfile);

      setFormData({
        hourlyRate: updatedProfile?.hourlyRate ?? "",
        aboutMe: updatedProfile?.aboutMe ?? "",
        skills: updatedProfile?.skills ?? "",
      });

      const updatedProfession =
        updatedProfile?.professions?.[0];

      const updatedCity =
        updatedProfile?.cities?.[0];

      if (updatedProfession) {
        setSelectedProfessionId(
          updatedProfession.profession_Id ??
            updatedProfession.professionId ??
            updatedProfession.id
        );

        setProfessionSearch(
          updatedProfession.profession_Title ??
            updatedProfession.professionTitle ??
            updatedProfession.title ??
            ""
        );
      }

      if (updatedCity) {
        setSelectedCityId(
          updatedCity.city_Id ??
            updatedCity.cityId ??
            updatedCity.id
        );
      }

      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update worker profile:", err);

      setSaveError(
        err?.response?.data?.message ||
          "Failed to update worker profile."
      );
    } finally {
      setSaving(false);
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

  const selectedProfession =
    professions.find(
      (profession) =>
        Number(profession.id) ===
        Number(selectedProfessionId)
    );

  const selectedCity =
    cities.find(
      (city) =>
        Number(city.id) === Number(selectedCityId)
    );

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

  const reviews = profile.reviews ?? [];

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
                  <h1>{profile.fullName}</h1>

                  <div className="profile-rating">
                    <i className="bi bi-star-fill"></i>

                    <span>
                      {Number(
                        profile.averageRating || 0
                      ).toFixed(1)}
                    </span>

                    <span className="review-count">
                      ({profile.reviewCount || 0})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="FreelanceApp-primary edit-profile-button"
              onClick={() => {
                setSaveError("");
                setIsEditing((previous) => !previous);
              }}
              disabled={saving}
            >
              <i
                className={
                  isEditing
                    ? "bi bi-x-lg"
                    : "bi bi-pencil"
                }
              ></i>

              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {/* PHOTO */}

          <div className="profile-section">

            <div className="section-header">
              <h2>Profile Photo</h2>
              <p>
                Your profile photo is the photo uploaded
                during registration.
              </p>
            </div>

            <div className="photo-upload">
              <div className="worker-photo large">
                {getProfilePhotoUrl() ? (
                  <img
                    src={getProfilePhotoUrl()}
                    alt={profile.fullName}
                  />
                ) : (
                  <i className="bi bi-person-fill"></i>
                )}
              </div>
            </div>

          </div>

          {/* PROFESSION */}

          <div className="profile-section">

            <div className="section-header">
              <h2>Profession</h2>
              <p>
                Select your main profession. If it is not
                listed, you can add it.
              </p>
            </div>

            {isEditing ? (
              <div className="profession-picker">

                <input
                  type="text"
                  value={professionSearch}
                  placeholder="Search or add a profession..."
                  onChange={(event) => {
                    setProfessionSearch(
                      event.target.value
                    );
                    setProfessionDropdownOpen(true);
                  }}
                  onFocus={() =>
                    setProfessionDropdownOpen(true)
                  }
                />

                {professionDropdownOpen && (
                  <div className="profession-dropdown">

                    {filteredProfessions.map(
                      (profession) => (
                        <button
                          type="button"
                          key={profession.id}
                          className="profession-option"
                          onClick={() =>
                            handleProfessionSelect(
                              profession
                            )
                          }
                        >
                          {profession.title}
                        </button>
                      )
                    )}

                    {!professionExists &&
                      professionSearch.trim() && (
                        <button
                          type="button"
                          className="profession-add-option"
                          onClick={
                            handleCreateProfession
                          }
                          disabled={creatingProfession}
                        >
                          <i className="bi bi-plus-circle"></i>

                          {creatingProfession
                            ? "Adding..."
                            : `Add "${professionSearch.trim()}"`}
                        </button>
                      )}

                    {filteredProfessions.length === 0 &&
                      professionExists && (
                        <div className="profession-empty">
                          No professions found.
                        </div>
                      )}

                  </div>
                )}

              </div>
            ) : (
              <div className="profile-tags">
                {selectedProfession ? (
                  <span className="profile-tag">
                    {selectedProfession.title}
                  </span>
                ) : (
                  <span className="profile-value">
                    No profession selected.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* CITY */}

          <div className="profile-section">

            <div className="section-header">
              <h2>City</h2>
              <p>
                Select the city where you are based.
              </p>
            </div>

            {isEditing ? (
              <select
                className="profile-single-select"
                value={selectedCityId}
                onChange={(event) =>
                  setSelectedCityId(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select a city
                </option>

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
                {selectedCity ? (
                  <span className="profile-tag">
                    <i className="bi bi-geo-alt"></i>
                    {selectedCity.name}
                  </span>
                ) : (
                  <span className="profile-value">
                    No city selected.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* PROFESSIONAL DETAILS */}

          <div className="profile-section">

            <div className="section-header">
              <h2>Professional Details</h2>

              <p>
                Help clients understand your experience
                and services.
              </p>
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
                  ${formData.hourlyRate || 0} / hour
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
                  {formData.aboutMe ||
                    "No information provided."}
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
                  {formData.skills ||
                    "No skills provided."}
                </p>
              )}

            </div>
          </div>

          {/* SAVE ERROR */}

          {saveError && isEditing && (
            <div className="profile-error">
              {saveError}
            </div>
          )}

          {/* SAVE */}

          {isEditing && (
            <button
              type="button"
              className="FreelanceApp-primary save-profile-button"
              onClick={handleSave}
              disabled={saving}
            >
              <i className="bi bi-check-lg"></i>

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          )}

          {/* REVIEWS */}

          <div className="profile-section">

            <div className="reviews-header">

              <div className="section-header">
                <h2>Reviews</h2>

                <p>
                  Reviews from clients you have worked
                  with.
                </p>
              </div>

              <div className="reviews-summary">
                <i className="bi bi-star-fill"></i>

                <strong>
                  {Number(
                    profile.averageRating || 0
                  ).toFixed(1)}
                </strong>

                <span>
                  ({profile.reviewCount || 0})
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

export default WorkerProfile;
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";

import "../../style/createJob.css";

function CreateJob() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    jobPost_Title: "",
    jobPost_Description: "",
    jobPost_Price: "",
    jobPost_ProfessionId: "",
    jobPost_CityId: "",
    jobPost_BudgetType: "Fixed",
  });

  const [errors, setErrors] = useState({});

  // Temporary data for UI.
  // Later these will come from the backend.
  const professions = [
    {
      profession_Id: 1,
      profession_Title: "Electrical",
    },
    {
      profession_Id: 2,
      profession_Title: "Plumbing",
    },
    {
      profession_Id: 3,
      profession_Title: "Painting",
    },
    {
      profession_Id: 4,
      profession_Title: "Landscaping",
    },
    {
      profession_Id: 5,
      profession_Title: "HVAC",
    },
    {
      profession_Id: 6,
      profession_Title: "Carpentry",
    },
  ];

  const cities = [
    {
      city_Id: 1,
      city_Name: "Beirut",
    },
    {
      city_Id: 2,
      city_Name: "Tripoli",
    },
    {
      city_Id: 3,
      city_Name: "Sidon",
    },
    {
      city_Id: 4,
      city_Name: "Jounieh",
    },
    {
      city_Id: 5,
      city_Name: "Zahle",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.jobPost_Title.trim()) {
      newErrors.jobPost_Title = "Job title is required.";
    }

    if (!formData.jobPost_ProfessionId) {
      newErrors.jobPost_ProfessionId =
        "Please select a profession.";
    }

    if (!formData.jobPost_Description.trim()) {
      newErrors.jobPost_Description =
        "Job description is required.";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // TEMPORARY
    // Later:
    //
    // await createJobPost({
    //   ...formData,
    //   jobPost_Price: Number(formData.jobPost_Price),
    //   jobPost_ProfessionId: Number(formData.jobPost_ProfessionId),
    //   jobPost_CityId: formData.jobPost_CityId
    //     ? Number(formData.jobPost_CityId)
    //     : null,
    // });

    console.log("Job data:", formData);

    navigate("/client/jobs");
  };

  return (
    <>
      <Navbar />

      <main className="create-job-page">
        <div className="container create-job-container">

          {/* Back button */}

          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/client/jobs")}
          >
            <i className="bi bi-arrow-left"></i>

            Back to My Jobs
          </button>

          {/* Page title */}

          <div className="create-job-header">
            <h1>Post a New Job</h1>

            <p>
              Tell professionals what you need and find
              the right person for the job.
            </p>
          </div>

          {/* Form */}

          <div className="card create-job-card">
            <div className="card-body p-4">

              <form
                onSubmit={handleSubmit}
                noValidate
              >

                {/* Job Title */}

                <div className="mb-4">

                  <label
                    htmlFor="jobPost_Title"
                    className="form-label create-job-label"
                  >
                    <i className="bi bi-file-earmark-text"></i>

                    Job Title

                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <input
                    id="jobPost_Title"
                    type="text"
                    name="jobPost_Title"
                    value={formData.jobPost_Title}
                    onChange={handleChange}
                    className={`form-control create-job-input ${
                      errors.jobPost_Title
                        ? "input-error"
                        : ""
                    }`}
                    placeholder="Enter job title"
                  />

                  {errors.jobPost_Title && (
                    <div className="field-error">
                      {errors.jobPost_Title}
                    </div>
                  )}

                </div>

                {/* Profession + City */}

                <div className="row g-3 mb-4">

                  <div className="col-md-6">

                    <label
                      htmlFor="jobPost_ProfessionId"
                      className="form-label create-job-label"
                    >
                      <i className="bi bi-tag"></i>

                      Profession

                      <span className="required-star">
                        *
                      </span>
                    </label>

                    <select
                      id="jobPost_ProfessionId"
                      name="jobPost_ProfessionId"
                      value={formData.jobPost_ProfessionId}
                      onChange={handleChange}
                      className={`form-select create-job-input ${
                        errors.jobPost_ProfessionId
                          ? "input-error"
                          : ""
                      }`}
                    >
                      <option value="">
                        Select profession
                      </option>

                      {professions.map((profession) => (
                        <option
                          key={profession.profession_Id}
                          value={profession.profession_Id}
                        >
                          {profession.profession_Title}
                        </option>
                      ))}

                    </select>

                    {errors.jobPost_ProfessionId && (
                      <div className="field-error">
                        {errors.jobPost_ProfessionId}
                      </div>
                    )}

                  </div>

                  <div className="col-md-6">

                    <label
                      htmlFor="jobPost_CityId"
                      className="form-label create-job-label"
                    >
                      <i className="bi bi-geo-alt"></i>

                      City

                    </label>

                    <select
                      id="jobPost_CityId"
                      name="jobPost_CityId"
                      value={formData.jobPost_CityId}
                      onChange={handleChange}
                      className="form-select create-job-input"
                    >
                      <option value="">
                        Select city
                      </option>

                      {cities.map((city) => (
                        <option
                          key={city.city_Id}
                          value={city.city_Id}
                        >
                          {city.city_Name}
                        </option>
                      ))}

                    </select>

                  </div>

                </div>

                {/* Budget Type */}

                <div className="mb-4">

                  <label className="form-label create-job-label">
                    <i className="bi bi-cash"></i>

                    Budget Type
                  </label>

                  <div className="budget-type-container">

                    <label
                      className={`budget-type-option ${
                        formData.jobPost_BudgetType === "Fixed"
                          ? "budget-type-active"
                          : ""
                      }`}
                    >

                      <input
                        type="radio"
                        name="jobPost_BudgetType"
                        value="Fixed"
                        checked={
                          formData.jobPost_BudgetType === "Fixed"
                        }
                        onChange={handleChange}
                      />

                      <div>
                        <strong>Fixed Price</strong>

                  
                      </div>

                    </label>

                    <label
                      className={`budget-type-option ${
                        formData.jobPost_BudgetType === "Hourly"
                          ? "budget-type-active"
                          : ""
                      }`}
                    >

                      <input
                        type="radio"
                        name="jobPost_BudgetType"
                        value="Hourly"
                        checked={
                          formData.jobPost_BudgetType === "Hourly"
                        }
                        onChange={handleChange}
                      />

                      <div>
                        <strong>Hourly</strong>

                      </div>

                    </label>

                  </div>

                </div>

                {/* Price */}

                <div className="mb-4">

                  <label
                    htmlFor="jobPost_Price"
                    className="form-label create-job-label" >
                    <i className="bi bi-currency-dollar"></i>
                    Price (USD)
                  </label>

                  <div className="price-input-wrapper">

                    <input
                      id="jobPost_Price"
                      type="number"
                      name="jobPost_Price"
                      value={formData.jobPost_Price}
                      onChange={handleChange}
                      className={`form-control create-job-input price-input ${
                        errors.jobPost_Price
                          ? "input-error"
                          : ""
                      }`}
                      placeholder={
                        formData.jobPost_BudgetType === "Fixed"
                          ? "Enter total price"
                          : "Enter hourly rate"
                      }
                      min="0"
                    />

                  </div>

                  {errors.jobPost_Price && (
                    <div className="field-error">
                      {errors.jobPost_Price}
                    </div>
                  )}

                </div>

                {/* Description */}

                <div className="mb-4">

                  <label
                    htmlFor="jobPost_Description"
                    className="form-label create-job-label"
                  >
                    <i className="bi bi-card-text"></i>

                    Description

                    <span className="required-star">
                      *
                    </span>
                  </label>

                  <textarea
                    id="jobPost_Description"
                    name="jobPost_Description"
                    value={formData.jobPost_Description}
                    onChange={handleChange}
                    className={`form-control create-job-textarea ${
                      errors.jobPost_Description
                        ? "input-error"
                        : ""
                    }`}
                    rows="5"
                    placeholder="Describe the work needed, special requirements, access information, or anything the professional should know."
                  />

                  {errors.jobPost_Description && (
                    <div className="field-error">
                      {errors.jobPost_Description}
                    </div>
                  )}

                </div>

                {/* Actions */}

                <div className="create-job-actions">

                  <button
                    type="button"
                    className="btn btn-outline-secondary cancel-job-button"
                    onClick={() =>
                      navigate("/client/jobs")
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn  publish-job-button"
                  >
                    <i className="bi bi-send"></i>

                    Publish Job
                  </button>

                </div>

              </form>

            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default CreateJob;
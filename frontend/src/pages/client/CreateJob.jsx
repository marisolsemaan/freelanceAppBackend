import { useNavigate } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import { useEffect, useState } from "react";
import "../../style/createJob.css";
import { createJobPost, getProfessions, getCities,} from "../../services/jobPostClientService";

function CreateJob() {
  const navigate= useNavigate();
  const [formData, setFormData] = useState({
  jobPost_Title: "",
  jobPost_Description: "",
  jobPost_Price: "",
  jobPost_ProfessionId: "",
  jobPost_CityId: "",
  jobPost_BudgetType: "",
  });

  const [professions, setProfessions] = useState([]);
  const [cities, setCities] = useState([]);

  const [errors, setErrors] = useState({});
  const [pageError, setPageError] = useState("");
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
  const loadLookups = async () => {
    try {
      setLoadingLookups(true);
      setPageError("");

      const [professionsResponse, citiesResponse] =
        await Promise.all([
          getProfessions(),
          getCities(),
        ]);

      if (professionsResponse.success) {
        setProfessions(professionsResponse.data);
      }

      if (citiesResponse.success) {
        setCities(citiesResponse.data);
      }
    } catch (error) {
      console.error("Failed to load job form data:", error);

      setPageError(
        "Unable to load professions and cities. Please try again."
      );
    } finally {
      setLoadingLookups(false);
    }
  };

  loadLookups();
  }, []);

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
      newErrors.jobPost_Title =
        "Job title is required.";
    }

    if (!formData.jobPost_ProfessionId) {
      newErrors.jobPost_ProfessionId =
        "Please select a profession.";
    }

    if (!formData.jobPost_Description.trim()) {
      newErrors.jobPost_Description =
        "Job description is required.";
    }

    const hasPrice =
      formData.jobPost_Price !== "";

    const hasBudgetType =
      formData.jobPost_BudgetType !== "";

    if (hasPrice !== hasBudgetType) {
      if (!hasPrice) {
        newErrors.jobPost_Price =
          "Please enter a price.";
      }

      if (!hasBudgetType) {
        newErrors.jobPost_BudgetType =
          "Please select a budget type.";
      }
    }

    if (
      hasPrice &&
      Number(formData.jobPost_Price) <= 0
    ) {
      newErrors.jobPost_Price =
        "Price must be greater than zero.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setPageError("");

    const validationErrors = validateForm();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const budgetTypeMap = {
      Fixed: 1,
      Hourly: 2,
    };

    const payload = {
    jobPost_Title: formData.jobPost_Title.trim(),
    jobPost_Description:
      formData.jobPost_Description.trim(),

    jobPost_ProfessionId:
      Number(formData.jobPost_ProfessionId),

    jobPost_CityId:
      formData.jobPost_CityId
        ? Number(formData.jobPost_CityId)
        : null,

    jobPost_Price:
      formData.jobPost_Price !== ""
        ? Number(formData.jobPost_Price)
        : null,

    jobPost_BudgetType:
      formData.jobPost_BudgetType
        ? Number(formData.jobPost_BudgetType)
        : null,
    };

    try {
      setSubmitting(true);

      const response = await createJobPost(payload);

      if (!response.success) {
        setPageError(
          response.message ||
            "Unable to create the job post."
        );

        return;
      }

      navigate("/client/jobs");
    } catch (error) {
      console.error("Create job post failed:", error);

      if (error.response?.status === 400) {
        const backendErrors =
          error.response.data?.errors;

        if (backendErrors) {
          setPageError(
            "Please correct the highlighted fields."
          );
        } else {
          setPageError(
            error.response.data?.message ||
              "Unable to create the job post."
          );
        }
      } else {
        setPageError(
          "Something went wrong while creating the job post."
        );
      }
    } finally {
      setSubmitting(false);
    }
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
              {pageError && (<div className="alert alert-danger mb-4">{pageError}</div>)}
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
                      disabled={loadingLookups || submitting}
                    >
                      <option value="">
                        {loadingLookups
                          ? "Loading professions..."
                          : "Select profession"}
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
                      disabled={loadingLookups || submitting}
                    >
                      <option value="">
                        {loadingLookups
                          ? "Loading cities..."
                          : "Select city"}
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

                  <label
                    htmlFor="jobPost_BudgetType"
                    className="form-label create-job-label"
                  >
                    <i className="bi bi-cash"></i>

                    Budget Type
                  </label>

                  <select
                    id="jobPost_BudgetType"
                    name="jobPost_BudgetType"
                    value={formData.jobPost_BudgetType}
                    onChange={handleChange}
                    className={`form-select create-job-input ${
                      errors.jobPost_BudgetType
                        ? "input-error"
                        : ""
                    }`}
                  >
                    <option value="">
                      No budget specified
                    </option>

                    <option value="1">
                      Fixed Price
                    </option>

                    <option value="2">
                      Hourly
                    </option>

                  </select>

                  {errors.jobPost_BudgetType && (
                    <div className="field-error">
                      {errors.jobPost_BudgetType}
                    </div>
                  )}

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
                      formData.jobPost_BudgetType === "1"
                        ? "Enter total price"
                        : formData.jobPost_BudgetType === "2"
                        ? "Enter hourly rate"
                        : "Enter price"
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
                    className="btn publish-job-button"
                    disabled={submitting || loadingLookups}
                  >
                    <i className="bi bi-send"></i>

                    {submitting ? "Publishing..." : "Publish Job"}
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
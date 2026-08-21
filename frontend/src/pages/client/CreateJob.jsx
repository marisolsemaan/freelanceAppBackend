import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createJobPost } from "../../services/jobPostClientService";

import {
  getCities,
  getProfessions,
} from "../../services/lookupService";

import { getApiErrorMessage } from "../../utils/apiError";

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

  const [professions, setProfessions] = useState([]);
  const [cities, setCities] = useState([]);

  const [errors, setErrors] = useState({});
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadLookups = async () => {
    try {
      setLoadingLookups(true);

      const [professionsData, citiesData] =
        await Promise.all([
          getProfessions(),
          getCities(),
        ]);

      setProfessions(professionsData);
      setCities(citiesData);
    } catch (error) {
      console.error("Failed to load form data:", error);

      setErrors({
        server: getApiErrorMessage(error),
      });
    } finally {
      setLoadingLookups(false);
    }
  };

  useEffect(() => {
    loadLookups();
  }, []);


  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      server: "",
    }));
  };


  const validateForm = () => {
    const newErrors = {};

    if (!formData.jobPost_Title.trim()) {
      newErrors.jobPost_Title =
        "Job title is required.";
    }

    if (!formData.jobPost_Description.trim()) {
      newErrors.jobPost_Description =
        "Job description is required.";
    }

    if (!formData.jobPost_Price) {
      newErrors.jobPost_Price =
        "Price is required.";
    } else if (Number(formData.jobPost_Price) <= 0) {
      newErrors.jobPost_Price =
        "Price must be greater than zero.";
    }

    if (!formData.jobPost_ProfessionId) {
      newErrors.jobPost_ProfessionId =
        "Please select a profession.";
    }

    if (!formData.jobPost_BudgetType) {
      newErrors.jobPost_BudgetType =
        "Please select a budget type.";
    }

    return newErrors;
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateForm();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setSubmitting(true);

      const jobPost = {
        jobPost_Title:
          formData.jobPost_Title.trim(),

        jobPost_Description:
          formData.jobPost_Description.trim(),

        jobPost_Price:
          Number(formData.jobPost_Price),

        jobPost_ProfessionId:
          Number(formData.jobPost_ProfessionId),

        jobPost_CityId:
          formData.jobPost_CityId
            ? Number(formData.jobPost_CityId)
            : null,

        jobPost_BudgetType:
          formData.jobPost_BudgetType,
      };

      await createJobPost(jobPost);

      navigate("/client/jobs");

    } catch (error) {
      console.error("Failed to create job post:", error);

      setErrors({
        server: getApiErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };


  if (loadingLookups) {
    return (
      <div className="container py-4">

        <div className="create-job-loading">

          <div
            className="spinner-border"
            role="status"
          >
            <span className="visually-hidden">
              Loading...
            </span>
          </div>

          <p className="text-secondary mb-0">
            Preparing your job form...
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="container py-4 create-job-page">

      {/* Header */}

      <div className="create-job-header">

        <div>

          <Link
            to="/client/jobs"
            className="back-link"
          >
            <i className="bi bi-arrow-left"></i>

            Back to My Jobs
          </Link>

          <h1>
            Post a Job
          </h1>

          <p>
            Tell workers what you need and receive offers.
          </p>

        </div>

      </div>


      {/* Form */}

      <div className="create-job-card">

        {errors.server && (

          <div className="alert alert-danger">

            {errors.server}

          </div>

        )}

        <form
          onSubmit={handleSubmit}
          noValidate
        >

          {/* Job title */}

          <div className="form-field">

            <label htmlFor="jobPost_Title">

              Job Title

              <span className="required-star">
                *
              </span>

            </label>

            <input
              type="text"
              id="jobPost_Title"
              name="jobPost_Title"
              value={formData.jobPost_Title}
              onChange={handleChange}
              className={`form-control ${
                errors.jobPost_Title
                  ? "input-error"
                  : ""
              }`}
              placeholder="Example: Electrical panel upgrade"
            />

            {errors.jobPost_Title && (

              <span className="field-error">

                {errors.jobPost_Title}

              </span>

            )}

          </div>


          {/* Description */}

          <div className="form-field">

            <label htmlFor="jobPost_Description">

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
              className={`form-control ${
                errors.jobPost_Description
                  ? "input-error"
                  : ""
              }`}
              placeholder="Describe the work you need..."
              rows="5"
            />

            {errors.jobPost_Description && (

              <span className="field-error">

                {errors.jobPost_Description}

              </span>

            )}

          </div>


          <div className="row g-3">

            {/* Profession */}

            <div className="col-md-6">

              <div className="form-field">

                <label htmlFor="jobPost_ProfessionId">

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
                  className={`form-select ${
                    errors.jobPost_ProfessionId
                      ? "input-error"
                      : ""
                  }`}
                >

                  <option value="">
                    Select a profession
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

                  <span className="field-error">

                    {errors.jobPost_ProfessionId}

                  </span>

                )}

              </div>

            </div>


            {/* City */}

            <div className="col-md-6">

              <div className="form-field">

                <label htmlFor="jobPost_CityId">

                  City

                  <span className="optional-label">
                    Optional
                  </span>

                </label>

                <select
                  id="jobPost_CityId"
                  name="jobPost_CityId"
                  value={formData.jobPost_CityId}
                  onChange={handleChange}
                  className="form-select"
                >

                  <option value="">
                    Any city
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

          </div>


          <div className="row g-3">

            {/* Budget type */}

            <div className="col-md-6">

              <div className="form-field">

                <label htmlFor="jobPost_BudgetType">

                  Budget Type

                  <span className="required-star">
                    *
                  </span>

                </label>

                <select
                  id="jobPost_BudgetType"
                  name="jobPost_BudgetType"
                  value={formData.jobPost_BudgetType}
                  onChange={handleChange}
                  className="form-select"
                >

                  <option value="Fixed">
                    Fixed Price
                  </option>

                  <option value="Hourly">
                    Hourly
                  </option>

                </select>

              </div>

            </div>


            {/* Price */}

            <div className="col-md-6">

              <div className="form-field">

                <label htmlFor="jobPost_Price">

                  Price

                  <span className="required-star">
                    *
                  </span>

                </label>

                <div className="input-group">

                  <span className="input-group-text">
                    $
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    id="jobPost_Price"
                    name="jobPost_Price"
                    value={formData.jobPost_Price}
                    onChange={handleChange}
                    className={`form-control ${
                      errors.jobPost_Price
                        ? "input-error"
                        : ""
                    }`}
                    placeholder="0.00"
                  />

                </div>

                {errors.jobPost_Price && (

                  <span className="field-error">

                    {errors.jobPost_Price}

                  </span>

                )}

              </div>

            </div>

          </div>


          {/* Actions */}

          <div className="create-job-actions">

            <Link
              to="/client/jobs"
              className="btn btn-light border"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="btn FrelanceApp-primary"
              disabled={submitting}
            >

              {submitting
                ? "Posting Job..."
                : "Post Job"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateJob;
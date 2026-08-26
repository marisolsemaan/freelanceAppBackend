import {useEffect, useState,} from "react";

import { getClientJobPostTitles,  createHireOffer,} from "../../services/conversationService";

export default function HireOfferModal({ conversationId, onClose,  onOfferCreated,}) {
  const [step, setStep] = useState("selection");

  const [jobPosts, setJobPosts] = useState([]);
  const [loadingJobs, setLoadingJobs] =
    useState(false);

  const [selectedJob, setSelectedJob] =
    useState(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [scopeTerms, setScopeTerms] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadJobPosts = async () => {
      try {
        setLoadingJobs(true);

        const response =
          await getClientJobPostTitles();

        if (!response.success) {
          setError(
            response.message ||
            "Failed to load job posts."
          );

          return;
        }

        setJobPosts(response.data || []);

      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Failed to load job posts."
        );
      } finally {
        setLoadingJobs(false);
      }
    };

    loadJobPosts();
  }, []);


  const handleSelectJob = (jobPost) => {
    setSelectedJob(jobPost);

    setTitle(
      jobPost.jobPost_Title
    );

    setStep("details");
  };


  const handleDirectHire = () => {
    setSelectedJob(null);
    setTitle("");
    setStep("details");
  };


  const handleBack = () => {
    setError("");
    setStep("selection");
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Offer title is required.");
      return;
    }

    if (
      !price ||
      Number(price) <= 0
    ) {
      setError(
        "Offer price must be greater than zero."
      );

      return;
    }

    try {
      setSubmitting(true);

      const response =
        await createHireOffer(
          conversationId,
          {
            hireOffer_JobPostId:
              selectedJob
                ? selectedJob.jobPost_Id
                : null,

            hireOffer_Title:
              title.trim(),

            hireOffer_Price:
              Number(price),

            hireOffer_ScopeTerms:
              scopeTerms.trim() || null,
          }
        );

      if (!response.success) {
        setError(
          response.message ||
          "Failed to send hire offer."
        );

        return;
      }

      onOfferCreated?.(
        response.data
      );

      onClose();

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to send hire offer."
      );
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div
      className="hire-offer-modal-backdrop"
      onMouseDown={onClose}
    >
      <div
        className="hire-offer-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        <div className="hire-offer-modal-header">
          <div>
            <h5>
              Create Hire Offer
            </h5>

            <p>
              Send an offer to this worker.
            </p>
          </div>

          <button
            type="button"
            className="hire-offer-close-btn"
            onClick={onClose}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>


        {error && (
          <div className="alert alert-danger mb-0">
            {error}
          </div>
        )}


        {step === "selection" && (
          <div className="hire-offer-content">

            <h6 className="hire-offer-section-title">
              Which job is this for?
            </h6>


            {loadingJobs && (
              <div className="hire-offer-loading">
                <div className="spinner-border spinner-border-sm" />
              </div>
            )}


            {!loadingJobs &&
              jobPosts.map((jobPost) => (
                <button
                  key={jobPost.jobPost_Id}
                  type="button"
                  className="hire-job-option"
                  onClick={() =>
                    handleSelectJob(jobPost)
                  }
                >
                  <div className="hire-job-icon">
                    <i className="bi bi-briefcase-fill"></i>
                  </div>

                  <div className="hire-job-info">
                    <div className="hire-job-title">
                      {jobPost.jobPost_Title}
                    </div>
                  </div>

                  <i className="bi bi-chevron-right hire-job-arrow"></i>
                </button>
              ))}


            <button
              type="button"
              className="hire-direct-option"
              onClick={handleDirectHire}
            >
              <div className="hire-direct-icon">
                <i className="bi bi-plus-lg"></i>
              </div>

              <div>
                <div className="hire-direct-title">
                  Direct Hire
                </div>

                <div className="hire-direct-description">
                  Create an offer not linked to
                  an existing job post.
                </div>
              </div>
            </button>

          </div>
        )}


        {step === "details" && (
          <form
            className="hire-offer-content"
            onSubmit={handleSubmit}
          >

            <button
              type="button"
              className="hire-offer-back"
              onClick={handleBack}
            >
              <i className="bi bi-arrow-left"></i>
              Back to job selection
            </button>


            {selectedJob && (
              <div className="hire-offer-linked-job">
                <i className="bi bi-link-45deg"></i>

                <span>
                  Linked:{" "}
                  {selectedJob.jobPost_Title}
                </span>
              </div>
            )}


            <div className="hire-offer-field">
              <label>
                Offer Title
              </label>

              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Enter offer title"
              />
            </div>


            <div className="hire-offer-field">
              <label>
                Agreed Price ($)
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                className="form-control"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                placeholder="0"
              />
            </div>


            <div className="hire-offer-field">
              <label>
                Scope / Terms
                <span className="optional-label">
                  Optional
                </span>
              </label>

              <textarea
                className="form-control"
                rows="4"
                value={scopeTerms}
                onChange={(event) =>
                  setScopeTerms(event.target.value)
                }
                placeholder="Describe what's included in this offer…"
              />
            </div>


            <button
              type="submit"
              className="btn btn-primary hire-offer-submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Sending...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2"></i>
                  Send Hire Offer
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
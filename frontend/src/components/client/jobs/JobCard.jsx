function JobCard({ job, onClose }) {
  const isOpen = job.jobPost_Status === 0;

  return (
    <div className="card job-card">
      <div className="card-body">

        <div className="d-flex justify-content-between gap-3 job-card-content">

          <div className="flex-grow-1">

            <div className="d-flex align-items-center gap-2 flex-wrap mb-2">

              <h5 className="job-title mb-0">
                {job.jobPost_Title}
              </h5>

              <span
                className={`job-status ${
                  isOpen
                    ? "job-status-open"
                    : "job-status-closed"
                }`}
              >
                {isOpen ? "Open" : "Closed"}
              </span>

              <span className="job-id">
                #{job.jobPost_Id}
              </span>

            </div>

            <p className="job-description">
              {job.jobPost_Description}
            </p>

            <div className="job-meta">

              <span>
                <i className="bi bi-cash me-1"></i>

                ${job.jobPost_Price}
              </span>

              <span className="meta-divider">•</span>

              <span>
                {job.jobPost_BudgetType === 0
                  ? "Fixed Price"
                  : "Hourly"}
              </span>

            </div>

          </div>

          <div className="job-actions">

            <span className="conversation-count">
              <i className="bi bi-chat-dots"></i>

              {job.conversationCount}
            </span>

            {isOpen && (
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => onClose(job.jobPost_Id)}
              >
                Close
              </button>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default JobCard;
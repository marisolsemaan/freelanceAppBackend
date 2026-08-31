import { useNavigate } from "react-router-dom";

export default function JobPostMessageCard({ item }) {
  const navigate = useNavigate();

  const jobPost = item.jobPost;

  if (!jobPost) return null;

  return (
    <div className="timeline-job-post">
      <div className="job-post-message-card">
        <div className="job-post-message-header">
          <i className="bi bi-briefcase-fill"></i>

          <span>
            JOB POST
          </span>

         
        </div>

        <div className="job-post-message-body">
          <h6>
            {jobPost.jobPostTitle}
          </h6>

          <div className="job-post-message-details">
            {jobPost.jobPostProfession && (
              <span>
                <i className="bi bi-briefcase me-1"></i>
                {jobPost.jobPostProfession}
              </span>
            )}

            {jobPost.jobPostCity && (
              <span>
                <i className="bi bi-geo-alt me-1"></i>
                {jobPost.jobPostCity}
              </span>
            )}
          </div>

          {Number(jobPost.jobPostPrice) > 0 && (
            <div className="job-post-message-price">
              ${jobPost.jobPostPrice}
            </div>
          )}
      
          
        </div>
      </div>

      <div className="timeline-card-time">
        {new Date(item.createdAt).toLocaleTimeString(
          [],
          {
            hour: "numeric",
            minute: "2-digit",
          }
        )}
      </div>
    </div>
  );
}
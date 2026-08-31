import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import JobStats from "../../components/client/jobs/JobStats";
import JobCard from "../../components/client/jobs/JobCard";
import { getMyJobPosts, closeJobPost,} from "../../services/jobPostClientService";
import "../../style/myJob.css";
import { getUserStatus } from "../../utils/jwtStorage";
function MyJobs() {

  const navigate = useNavigate();

  const verificationStatus = getUserStatus();
  const isPending = verificationStatus === 0;

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    openJobs: 0,
    closedJobs: 0,
    totalConversations: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {loadJobs();}, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyJobPosts();

      if (!response.success) {
        setError(
          response.message ||
            "Unable to load your job posts."
        );
        return;
      }
      console.log("Job data sample:", response.data.jobs[0]);

      setJobs(response.data.jobs || []);

      setStats(
        response.data.stats || {
          totalJobs: 0,
          openJobs: 0,
          closedJobs: 0,
          totalConversations: 0,
        }
      );
    } catch (error) {
      console.error("Failed to load job posts:", error);

      setError(
        "Unable to load your job posts. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseJob = async (jobPostId) => {
    try {
      setError("");

      await closeJobPost(jobPostId);

      await loadJobs();
    } catch (error) {
      console.error(
        "Failed to close job post:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to close the job post."
      );
    }
  };

  return (
    <>
      <Navbar />

      <main className="my-jobs-page">

        <div className="container-xl py-4 py-md-5">

          {/* Header */}

          <div className="page-header">

            <div>
              <h1>My Posts</h1>

              <p>
                Manage your job posts and conversations.
              </p>
            </div>

            <button className="btn  post-job-button" onClick={() => navigate("/client/jobs/create")}
              disabled={isPending} title={isPending ? "Wait for Admin verification" : ""}
            >

              <i className="bi bi-plus-lg"></i>

              <span>Post a Job</span>

            </button>

          </div>

          {/* Statistics */}

          <JobStats stats={stats} />

          {/* Job Posts */}

          <div className="jobs-section-header">

            <div className="d-flex align-items-center gap-2">

              <i className="bi bi-briefcase"></i>

              <h4>
                My Job Posts
              </h4>

              <span>
                ({jobs.length})
              </span>

            </div>

          </div>

          {/* Jobs */}

          <div className="jobs-list">

            {jobs.map((job) => (
              <JobCard
                key={job.jobPost_Id}
                job={job}
                onClose={handleCloseJob}
              />
            ))}

          </div>

        </div>

      </main>
    </>
  );
}

export default MyJobs;
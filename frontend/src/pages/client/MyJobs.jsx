import { useState } from "react";

import Navbar from "../../components/layout/Navbar";
import JobStats from "../../components/client/jobs/JobStats";
import JobCard from "../../components/client/jobs/JobCard";

import "../../style/myJob.css";

function MyJobs() {
  const [jobs, setJobs] = useState([
    {
      jobPost_Id: 1,
      jobPost_Title: "Electrical panel upgrade for apartment",
      jobPost_Description:
        "Looking for an experienced electrician to upgrade an apartment electrical panel.",
      jobPost_Price: 300,
      jobPost_BudgetType: 0,
      jobPost_Status: 0,
      conversationCount: 3,
    },
    {
      jobPost_Id: 2,
      jobPost_Title: "Kitchen cabinet repainting",
      jobPost_Description:
        "Need a professional painter to repaint kitchen cabinets.",
      jobPost_Price: 150,
      jobPost_BudgetType: 0,
      jobPost_Status: 0,
      conversationCount: 2,
    },
    {
      jobPost_Id: 3,
      jobPost_Title: "Generator maintenance",
      jobPost_Description:
        "Looking for someone experienced in generator maintenance.",
      jobPost_Price: 80,
      jobPost_BudgetType: 1,
      jobPost_Status: 1,
      conversationCount: 6,
    },
  ]);

  const stats = {
    totalJobs: jobs.length,

    openJobs: jobs.filter(
      (job) => job.jobPost_Status === 0
    ).length,

    closedJobs: jobs.filter(
      (job) => job.jobPost_Status === 1
    ).length,

    totalConversations: jobs.reduce(
      (total, job) => total + job.conversationCount,
      0
    ),
  };

  const handleCloseJob = (jobPostId) => {
    setJobs((previousJobs) =>
      previousJobs.map((job) =>
        job.jobPost_Id === jobPostId
          ? {
              ...job,
              jobPost_Status: 1,
            }
          : job
      )
    );
  };

  return (
    <>
      <Navbar />

      <main className="my-jobs-page">

        <div className="container-xl py-4 py-md-5">

          {/* Header */}

          <div className="page-header">

            <div>
              <h1>My Jobs</h1>

              <p>
                Manage your job posts and conversations.
              </p>
            </div>

            <button className="btn FrelanceApp-primary post-job-button">

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
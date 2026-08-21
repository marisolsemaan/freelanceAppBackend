function JobStats({ stats }) {
  return (
    <div className="row g-3 mb-4">

      <div className="col-6 col-lg-3">
        <div className="card stats-card h-100">
          <div className="card-body">
            <div className="stats-icon">
              <i className="bi bi-briefcase"></i>
            </div>

            <h3>{stats.totalJobs}</h3>

            <p>Total Jobs</p>
          </div>
        </div>
      </div>

      <div className="col-6 col-lg-3">
        <div className="card stats-card h-100">
          <div className="card-body">
            <div className="stats-icon">
              <i className="bi bi-folder2-open"></i>
            </div>

            <h3>{stats.openJobs}</h3>

            <p>Open Jobs</p>
          </div>
        </div>
      </div>

      <div className="col-6 col-lg-3">
        <div className="card stats-card h-100">
          <div className="card-body">
            <div className="stats-icon">
              <i className="bi bi-lock"></i>
            </div>

            <h3>{stats.closedJobs}</h3>

            <p>Closed Jobs</p>
          </div>
        </div>
      </div>

      <div className="col-6 col-lg-3">
        <div className="card stats-card h-100">
          <div className="card-body">
            <div className="stats-icon">
              <i className="bi bi-chat-dots"></i>
            </div>

            <h3>{stats.totalConversations}</h3>

            <p>Conversations</p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default JobStats;
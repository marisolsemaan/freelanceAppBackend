import { useParams, useLocation, useNavigate } from "react-router-dom";

export default function Conversation() {
  const { jobPostId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="container-xl py-4" style={{ maxWidth: 720 }}>
      <button type="button" className="btn btn-link ps-0 text-secondary" onClick={() => navigate(-1)}>
        <i className="bi bi-arrow-left me-1" />
        Back to search
      </button>

      <div className="card rounded-3">
        <div className="card-body">
          <h5 className="fw-bold mb-1">{state?.jobTitle ?? `Job #${jobPostId}`}</h5>
          <p className="text-secondary small mb-3">Conversation with {state?.clientName ?? "the client"}</p>

          <div className="alert alert-info small mb-0">
            Messaging isn't wired up yet — there's no conversation/message 
          </div>
        </div>
      </div>
    </div>
  );
}
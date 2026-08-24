import { Link, useNavigate , useLocation} from "react-router-dom";
import "../../style/layout.css";
import { getUserRole,getUserStatus, clearAuth } from "../../utils/jwtStorage";

function Navbar() {
  const navigate= useNavigate();
  const location= useLocation();

  const role= getUserRole();
  const status= getUserStatus();

  if(!role){
    return null;
  }

  const isClient= role===1;
  const homePath= isClient? "/client/jobs" : "/worker/search-jobs";

  const navItems= isClient ? [
        { to: "/client/profile", label: "Profile", icon: "bi-person-circle" },
        { to: "/messages", label: "Messages", icon: "bi-chat-dots" },
        { to: "/client/jobs", label: "My Jobs", icon: "bi-briefcase" },
      ]
    : [
        { to: "/worker/profile", label: "Profile", icon: "bi-person-circle" },
        { to: "/messages", label: "Messages", icon: "bi-chat-dots" },
        { to: "/worker/search-jobs", label: "Browse Jobs", icon: "bi-search" },
      ];

  const handleLogout=()=>{
    clearAuth();
    navigate("/login");
  };

  const statusState= 
    status===1
      ?"Verified"
      : status==2
      ? "Unverified"
      :"Pending";

  const statusClass =
    status === 1
      ? "status-pill-accepted"
      : status === 2
      ? "status-pill-rejected"
      : "status-pill-pending";
  return (
    <nav className="app-navbar">
      <div className="container-xl d-flex align-items-center justify-content-between">
        <Link to={homePath} className="app-logo">
          ConnectedIn <span>LB</span>
        </Link>

        
          <div className="navbar-links d-flex align-items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                aria-label={item.label}
                className={`navbar-link ${
                  location.pathname.startsWith(item.to) ? "navbar-link-active" : ""
                }`}
              >
                <i className={`bi ${item.icon}`}></i>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="d-flex align-items-center gap-3">

            {statusState && (
              <span className={`status-pill ${statusClass}`}>
                {statusState}
              </span>
            )}

            <button
              type="button"
              className="btn btn-outline-secondary btn-sm navbar-logout"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right"></i>
              <span>Logout</span>
            </button>

          </div>
      </div>
    </nav>
  );
}

export default Navbar;
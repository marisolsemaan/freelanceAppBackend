import { Link } from "react-router-dom";
import "../../style/layout.css";

function Navbar() {
  return (
    <nav className="app-navbar">
      <div className="container-xl d-flex align-items-center justify-content-between">
        <Link to="/client/jobs" className="app-logo">
          ConnectedIn <span>LB</span>
        </Link>

        <div className="d-flex align-items-center gap-3">
          <button className="navbar-icon-button">
            <i className="bi bi-bell"></i>
          </button>

          <div className="user-avatar">
            M
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
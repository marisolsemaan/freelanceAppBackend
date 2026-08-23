import { Link } from "react-router-dom";
import "../../style/layout.css";

function Navbar() {
  return (
    <nav className="app-navbar">
      <div className="container-xl d-flex align-items-center justify-content-between">
        <Link to="/client/jobs" className="app-logo">
          ConnectedIn <span>LB</span>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
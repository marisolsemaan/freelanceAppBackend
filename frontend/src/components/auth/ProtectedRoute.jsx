import { Navigate } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../../utils/jwtStorage";

function ProtectedRoute({ children, allowedRole }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole();

  if (allowedRole !==undefined && role !== allowedRole) {
    const fallbackPath =
      role === 1 ? "/client/jobs" 
      : role===2 ? "/worker/search-jobs"
      :"/login";

    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

export default ProtectedRoute;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import "../style/Login.css";
import { saveAuth } from "../utils/jwtStorage";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const result = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      saveAuth(result);

      console.log("login response: ", result);

      navigate("/")

    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Could not connect to the server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* brand */}
        <div className="auth-brand">
          <h1 className="auth-brand-title">
            ConnectedIn <span>LB</span>
          </h1>
        </div>

        <div className="auth-card-body">
          <h2 className="auth-heading">Welcome back</h2>
          <p className="auth-subheading">Sign in to your account.</p>

          {/* error */}
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* email */}
            <div className="auth-field">
              <label htmlFor="email">
                Email <span className="required-star text-danger">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="auth-input"
                autoComplete="email"
              />
            </div>

            {/* password */}
            <div className="auth-field">
              <label htmlFor="password">
                Password <span className="required-star text-danger">*</span>
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="auth-input"
                autoComplete="current-password"
              />
            </div>

            {/* submit */}
            <button
              type="submit"
              className="auth-button FrelanceApp-primary"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* switch link */}
          <p className="auth-switch-text">
            Don't have an account?{" "}
            <Link to="/register" className="auth-switch">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

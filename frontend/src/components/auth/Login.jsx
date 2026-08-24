import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import "../../style/login.css";
import { saveAuth } from "../../utils/jwtStorage";
import { getApiErrorMessage } from "../../utils/apiError";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous)=>({
      ...previous,
      [name]:"",
    }));
  };

  const validateForm = () => {
  const newErrors = {};

  if (!formData.email.trim()) {
    newErrors.email = "Email is required.";
  }

  if (!formData.password) {
    newErrors.password = "Password is required.";
  }

  return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors= validateForm();

    setErrors(validationErrors);

    if(Object.keys(validationErrors).length>0){
      return;
    }

    try {
      setLoading(true);

      const result = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      saveAuth(result);

      console.log("login success: ", result);

      if(result.role ===1 ){
        navigate("/client/jobs");
      }
      else if(result.role===2){
        navigate("/worker/search-jobs");

      }

    } catch (error) {
    console.error("login error:", error);

    setErrors({
      server: getApiErrorMessage(error),
    });
    
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
          {errors.server && <div className="auth-error">{errors.server}</div>}

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
                className={`auth-input ${ errors.email ? "input-error" : ""}`}
                autoComplete="email"
              />
              {errors.email && (<span className="field-error">{errors.email}</span>)}
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
                className={`auth-input ${errors.password ? "input-error" : ""}`}
                autoComplete="current-password"
              />
              {errors.password && (<span className="field-error">{errors.password}</span>)}
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


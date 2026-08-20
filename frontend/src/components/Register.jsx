import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { isValidLebanesePhone } from "../utils/validation";
import { saveAuth } from "../utils/jwtStorage";
import "../style/Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    role: 1,
  });

  const [idFile, setIdFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [professionProofFile, setProfessionProofFile] = useState(null);

  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleIdFileChange = (e) => {
    setIdFile(e.target.files[0] || null);
    setError("");
  };

  const handlePhotoChange = (e) => {
    setPhotoFile(e.target.files[0] || null);
    setError("");
  };

  const handleProfessionProofChange = (e) => {
    setProfessionProofFile(e.target.files[0] || null);
    setError("");
  };

    const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
        return;
    }

    const data = new FormData();

    data.append("FullName", formData.fullName.trim());
    data.append("Phone", formData.phone.trim());
    data.append("Email", formData.email.trim());
    data.append("Password", formData.password);
    data.append("Role", formData.role);

    data.append("idFile", idFile);
    data.append("photoFile", photoFile);

    if (Number(formData.role) === 2) {
        data.append(
        "professionProofFile",
        professionProofFile
        );
    }

    try {
        setLoading(true);

        const result = await registerUser(data);


          saveAuth(result);

          console.log("registration response:", result);
      
          navigate("/")
          
    } catch (error) {
        // Backend/general errors can go here
    } finally {
        setLoading(false);
    }
    };


  const validateForm= ()=>{ 
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (formData.phone.trim() && !isValidLebanesePhone(formData.phone)) {
      setError("Please enter a valid Lebanese phone number.");
      return;
    }

    if (!idFile) {
      setError("Please upload your government ID.");
      return;
    }

    if (!photoFile) {
      setError("Please upload your photo.");
      return;
    }

    if (Number(formData.role) === 2 && !professionProofFile) {
      setError("Workers must upload profession proof.");
      return;
    }

    return newErrors;
  };

//     const data = new FormData();

//     data.append("FullName", formData.fullName.trim());
//     data.append("Phone", formData.phone.trim());
//     data.append("Email", formData.email.trim());
//     data.append("Password", formData.password);
//     data.append("Role", formData.role);

//     data.append("idFile", idFile);
//     data.append("photoFile", photoFile);

//     if (Number(formData.role) === 2) {
//       data.append("professionProofFile", professionProofFile);
//     }

//     try {
//       setLoading(true);

//       const result = await registerUser(data);

//       saveAuth(result);

//       console.log("registration response:", result);
      
//       navigate("/")

//     } catch (error) {
//       if (error.response?.data?.message) {
//         setError(error.response.data.message);
//       } else {
//         setError("Could not connect to the server. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

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
          <h2 className="auth-heading mb-2" >Create account</h2>

          {/* error */}
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* full name */}
            <div className="auth-field">
              <label htmlFor="fullName">
                Full Name <span className="required-star text-danger">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="auth-input"
                autoComplete="name"
              />
            </div>

            {/* email */}
            <div className="auth-field ">
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
                placeholder="At least 6 characters"
                className="auth-input"
                autoComplete="new-password"
              />
            </div>

            {/* phone */}
            <div className="auth-field">
              <label htmlFor="phone">Phone</label>
              <div className="auth-phone">
                <span className="auth-phone-prefix">+961</span>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="3 123 456"
                  className="auth-input"
                  autoComplete="tel-national"
                />
              </div>
            </div>

            {/* role */}
            <div className="auth-field">
              <label htmlFor="role">
                Role <span className="required-star text-danger ">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="role-select auth-input"
              >
                <option value={1}>Client</option>
                <option value={2}>Worker</option>
              </select>
            </div>

            {/* id */}
            <div className="auth-field">
              <label htmlFor="idFile">
                Government ID <span className="required-star text-danger">*</span>
              </label>
              <input
                id="idFile"
                type="file"
                onChange={handleIdFileChange}
                className="auth-input file-input"
                accept="image/jpeg,image/png,application/pdf"
              />
              <span className="file-help">JPG, PNG or PDF</span>
            </div>

            {/* photo */}
            <div className="auth-field">
              <label htmlFor="photoFile">
                Your Photo <span className="required-star text-danger">*</span>
              </label>
              <input
                id="photoFile"
                type="file"
                onChange={handlePhotoChange}
                className="auth-input file-input"
                accept="image/jpeg,image/png"
              />
              <span className="file-help">Upload a clear photo of yourself</span>
            </div>

            {/* profession proof (workers only) */}
            {Number(formData.role) === 2 && (
              <div className="auth-field">
                <label htmlFor="professionProofFile">
                  Profession Documents <span className="required-star text-danger">*</span>
                </label>
                <input
                  id="professionProofFile"
                  type="file"
                  onChange={handleProfessionProofChange}
                  className="auth-input file-input"
                  accept="image/jpeg,image/png,application/pdf"
                />
                <span className="file-help">
                  Diploma, certificate or professional proof
                </span>
              </div>
            )}

            {/* submit */}
            <button
              type="submit"
              className="auth-button FrelanceApp-primary"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* switch link */}
          <p className="auth-switch-text">
            Already have an account?{" "}
            <Link to="/login" className="auth-switch">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;

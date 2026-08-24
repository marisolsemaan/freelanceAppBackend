import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import { saveAuth } from "../../utils/jwtStorage";
import "../../style/register.css";
import { getApiErrorMessage } from "../../utils/apiError";

function Register() {
  const navigate = useNavigate();

  const [serverError, setServerError] = useState("");

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

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleIdFileChange = (e) => {
    setIdFile(e.target.files[0] || null);

    setErrors((previous) => ({
      ...previous,
      idFile: "",
    }));
  };

  const handlePhotoChange = (e) => {
    setPhotoFile(e.target.files[0] || null);
    setErrors((previous) => ({
      ...previous,
      photoFile: "",
    }));
  };

  const handleProfessionProofChange = (e) => {
    setProfessionProofFile(e.target.files[0] || null);
    setErrors((previous) => ({
      ...previous,
      professionProofFile: "",
    }));
  };

    const handleSubmit = async (e) =>
  {
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
      
      if(result.role ===1 ){
        navigate("/client/jobs");
      }
      else if(result.role===2){
        navigate("/worker/search-jobs");

      }
    } 
    catch (error) {
      console.error("Registration error:", error);

      setErrors({
        server: getApiErrorMessage(error),
      });

    } finally {

      setLoading(false);
    
    }
  };


  const validateForm = () => {
    const newErrors = {};

    // check required fields
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    if (!idFile) {
      newErrors.idFile = "Government ID is required.";
    }

    if (!photoFile) {
      newErrors.photoFile = "Your photo is required.";
    }

    if (
      Number(formData.role) === 2 &&
      !professionProofFile
    ) {
      newErrors.professionProofFile =
        "Profession documents are required for workers.";
    }

    return newErrors;
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
          <h2 className="auth-heading mb-2" >Create account</h2>
          {errors.server && ( <div className="auth-error"> {errors.server} </div> )}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* full name */}
            <div className="auth-field">
              <label htmlFor="fullName">
                Full Name <span className=" text-danger">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange }
                placeholder="Full Name"
                className={`auth-input ${errors.fullName ? "input-error" : ""}`}
                autoComplete="name"
              />
              {errors.fullName && ( <span className="field-error"> {errors.fullName} </span> )}
            </div>

            {/* email */}
            <div className="auth-field ">
              <label htmlFor="email">
                Email <span className=" text-danger">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`auth-input ${errors.email ? "input-error" : ""}`}
                autoComplete="email"
              />
              {errors.email && ( <span className="field-error"> {errors.email} </span> ) }
            </div>

            {/* password */}
            <div className="auth-field">
              <label htmlFor="password">
                Password <span className=" text-danger">*</span>
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className={`auth-input ${errors.password ? "input-error" : ""}`}
                autoComplete="new-password"
              />
              {errors.password && ( <span className="field-error"> {errors.password} </span> ) }
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
                Role 
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`role-select auth-input ${errors.role ? "input-error" : ""}`}
              >
                <option value={1}>Client</option>
                <option value={2}>Worker</option>
              </select>
              {errors.role && ( <span className="field-error"> {errors.role} </span> ) }
            </div>

            {/* id */}
            <div className="auth-field">
              <label htmlFor="idFile">
                Government ID <span className=" text-danger">*</span>
              </label>
              <input
                id="idFile"
                type="file"
                onChange={handleIdFileChange}
                className={`auth-input file-input ${errors.idFile ? "input-error" : ""}`}
                accept="image/jpeg,image/png,application/pdf"
              />
              {errors.idFile && ( <span className="field-error"> {errors.idFile} </span> ) }
              <span className="file-help">JPG, PNG or PDF</span>
            </div>

            {/* photo */}
            <div className="auth-field">
              <label htmlFor="photoFile">
                Your Photo <span className=" text-danger">*</span>
              </label>
              <input
                id="photoFile"
                type="file"
                onChange={handlePhotoChange}
                className={`auth-input file-input ${errors.photoFile ? "input-error" : ""}`}
                accept="image/jpeg,image/png"
              />
              {errors.photoFile && ( <span className="field-error"> {errors.photoFile} </span> ) }
              <span className="file-help">Upload a clear photo of yourself</span>
            </div>

            {/* profession proof (workers only) */}
            {Number(formData.role) === 2 && (
              <div className="auth-field">
                <label htmlFor="professionProofFile">
                  Profession Documents <span className="text-danger">*</span>
                </label>
                <input
                  id="professionProofFile"
                  type="file"
                  onChange={handleProfessionProofChange}
                  className={`auth-input file-input ${errors.professionProofFile ? "input-error" : ""}`}
                  accept="image/jpeg,image/png,application/pdf"
                />
                {errors.professionProofFile && ( <span className="field-error"> {errors.professionProofFile} </span> ) }
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


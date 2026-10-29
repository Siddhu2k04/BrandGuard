import React, { useState } from "react";
import {
  Building2,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  FileText,
  User,
} from "lucide-react";
import Brand from "../components/Brand";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage({ onLogin }) {
  const { login, registerCompany, registerEmployee } = useAuth();
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [role, setRole] = useState("Company");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }
    setError("");
    setLoading(true);

    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      onLogin({ role });
    } else {
      setError(result.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let result;
    if (role === "Company") {
      if (!companyName.trim() || !fullName.trim()) {
        setError("Please fill in all required fields.");
        setLoading(false);
        return;
      }
      result = await registerCompany({
        company_name: companyName,
        company_description: companyDescription,
        admin_full_name: fullName,
        admin_email: email.trim(),
        password: password,
      });
    } else {
      if (!fullName.trim() || !invitationCode.trim()) {
        setError("Please fill in all required fields.");
        setLoading(false);
        return;
      }
      result = await registerEmployee({
        full_name: fullName,
        email: email.trim(),
        password: password,
        invitation_code: invitationCode,
      });
    }

    setLoading(false);

    if (result.success) {
      onLogin({ role });
    } else {
      setError(result.error);
    }
  };

  return (
    <main className="login-page">
      <div className="login-overlay" />
      <div className="login-top">
        <Brand />
        <div className="login-links">
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="#help">Help</a>
        </div>
      </div>
      <section className="hero-copy">
        <p className="eyebrow">CONTENT GOVERNANCE PLATFORM</p>
        <h1>
          One Platform for
          <br />
          <span>Companies</span> and <em>Employees</em>
        </h1>
        <p className="hero-subtitle">
          Streamline brand governance and build trust in every piece of content.
        </p>
        <div className="hero-feature">
          <span className="feature-icon blue">
            <FileText size={27} />
          </span>
          <div>
            <b>For Companies</b>
            <p>Follow the guidelines.</p>
          </div>
        </div>
        <div className="hero-feature">
          <span className="feature-icon gold">
            <UserRound size={27} />
          </span>
          <div>
            <b>For Employees</b>
            <p>Content and marketing.</p>
          </div>
        </div>
      </section>
      <section className="login-card">
        <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
        <p className="muted center">
          {mode === "login"
            ? "Login to your account"
            : "Register a new account"}
        </p>

        <div className="role-switch">
          <button
            type="button"
            className={role === "Company" ? "selected" : ""}
            onClick={() => {
              setRole("Company");
              setError("");
            }}
          >
            <Building2 size={19} /> Company
          </button>
          <button
            type="button"
            className={role === "Employee" ? "selected" : ""}
            onClick={() => {
              setRole("Employee");
              setError("");
            }}
          >
            <UserRound size={19} /> Employee
          </button>
        </div>

        <div className="login-role-icon">
          <div>
            {role === "Company" ? (
              <Building2 size={31} />
            ) : (
              <UserRound size={31} />
            )}
          </div>
        </div>

        <h3>{mode === "login" ? `${role} Login` : `${role} Registration`}</h3>
        <p className="muted center small">
          {role === "Company"
            ? "Manage company guidelines"
            : "Upload content for company review"}
        </p>

        <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
          {mode === "register" && (
            <>
              <label htmlFor="full-name">Full Name</label>
              <div className="input-wrap">
                <User size={18} />
                <input
                  id="full-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              {role === "Company" && (
                <>
                  <label htmlFor="company-name">Company Name</label>
                  <div className="input-wrap">
                    <Building2 size={18} />
                    <input
                      id="company-name"
                      type="text"
                      placeholder="Enter company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>

                  <label htmlFor="company-description">
                    Company Description (Optional)
                  </label>
                  <div className="input-wrap">
                    <FileText size={18} />
                    <input
                      id="company-description"
                      type="text"
                      placeholder="Include invitation code in description"
                      value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                    />
                  </div>
                </>
              )}

              {role === "Employee" && (
                <>
                  <label htmlFor="invitation-code">Invitation Code</label>
                  <div className="input-wrap">
                    <FileText size={18} />
                    <input
                      id="invitation-code"
                      type="text"
                      placeholder="Enter invitation code"
                      value={invitationCode}
                      onChange={(e) => setInvitationCode(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
            </>
          )}

          <label htmlFor="login-email">
            {role === "Company" ? "Company Email" : "Employee Email"}
          </label>
          <div className="input-wrap">
            <Mail size={18} />
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              placeholder={
                role === "Company"
                  ? "Enter company email"
                  : "Enter employee email"
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label htmlFor="login-password">Password</label>
          <div className="input-wrap">
            <LockKeyhole size={18} />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="field-action"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <button
            className="primary-button full"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : mode === "login"
                ? "Login"
                : "Register"}{" "}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="login-foot">
          {mode === "login" ? (
            <span>
              Don't have an account?{" "}
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
              >
                Register
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                Login
              </button>
            </span>
          )}
        </div>
      </section>
      <div className="login-bottom">
        © 2026 BrandGuard <span>·</span> Content · Trust · Grow
      </div>
    </main>
  );
}

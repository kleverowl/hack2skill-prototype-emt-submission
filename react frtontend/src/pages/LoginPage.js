import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebase"; // adjust path
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import emt from "../emt.png"

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Email/Password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged in App.js will handle the redirect
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged in App.js will handle the redirect
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Guest login
  const handleGuestLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, "aishwarya@gmail.com", "12345678");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-pages my-5 pt-sm-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 col-xl-5">
            <div className="text-center">
              <a href="/" className="auth-logo mb-5 d-block">
                <img
                  src={emt}
                  alt=""
                  height="70"
                  className="logo logo-dark"
                />
                <img
                  src={emt}
                  alt=""
                  height="70"
                  className="logo logo-light"
                />
              </a>

              <h4>Sign in</h4>
              <p className="text-muted mb-4">Sign in to continue.</p>
            </div>

            <div className="card">
              <div className="card-body p-4">
                <div className="p-3">
                  <form onSubmit={handleLogin}>
                    {error && (
                      <p className="text-danger mb-3" style={{ fontSize: "14px" }}>
                        {error}
                      </p>
                    )}

                    {/* Email */}
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <div className="input-group mb-3 bg-light-subtle rounded-3">
                        <span className="input-group-text text-muted">
                          <i className="ri-mail-line"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control form-control-lg border-light bg-light-subtle"
                          placeholder="Enter Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                      <div className="float-end">
                        <a href="/forgot-password" className="text-muted font-size-13">
                          Forgot password?
                        </a>
                      </div>
                      <label className="form-label">Password</label>
                      <div className="input-group mb-3 bg-light-subtle rounded-3">
                        <span className="input-group-text text-muted">
                          <i className="ri-lock-2-line"></i>
                        </span>
                        <input
                          type="password"
                          className="form-control form-control-lg border-light bg-light-subtle"
                          placeholder="Enter Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Email Login Button */}
                    <div className="d-grid mb-3">
                      <button
                        className="btn btn-primary waves-effect waves-light"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                            <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span className="ms-1">Loading...</span></>
                        ) : (
                            "Sign in"
                        )}
                      </button>
                    </div>

                    {/* Google Login Button */}
                    <div className="d-grid">
                      <button
                        type="button"
                        className="btn waves-effect waves-light"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                         style={{
    backgroundColor: "#4285F4",
    borderColor: "#4285F4",
    color: "#ffffff"
  }}
                      >
                        {loading ? (
                            <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span className="ms-1">Loading...</span></>
                        ) : (
                            <><i className="ri-google-fill me-2"></i> Sign in with Google</>
                        )}
                      </button>
                    </div>
                    {/* Guest Login Button */}
                
                  </form>
                </div>
              </div>
            </div>

            <div className="mt-5 text-center">
              <p>
                Don't have an account ?{" "}
                <Link to="/register" className="fw-medium text-primary">
                  Signup now
                </Link>
              </p>
            <a
  href="#"
  className="text-primary"
  onClick={(e) => {
    e.preventDefault(); // prevent page reload
    handleGuestLogin();
  }}
  style={{ pointerEvents: loading ? "none" : "auto", opacity: loading ? 0.7 : 1 }}
>
  {loading ? (
    <>
      <span
        className="spinner-border spinner-border-sm"
        role="status"
        aria-hidden="true"
      ></span>
      <span className="ms-1">Loading...</span>
    </>
  ) : (
    "Login by Demo Credentials"
  )}
</a>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

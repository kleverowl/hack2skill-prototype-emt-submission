import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider, database } from "../firebase"; // adjust path
import { ref, set } from "firebase/database"; // adjust path
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";
import axios from 'axios';
import emt from "../emt.png"

const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);



     const API_URL = "https://us-central1-hack2skill-emt.cloudfunctions.net/api/createUserProfile";

    const handleSubmit = async (user) => {
        try {
            if (!user || !user.uid) {
                console.error("No user or UID to submit");
                return;
            }

            // Create initial user object in Realtime Database
          // Create initial user object in Realtime Database with blank payload
await set(ref(database, "users/user_id/" + user.uid), {
  itineraries: {
    itinerary_id_1: {
      messages: {
        typing: false,
      message_id: {}
      },
      state: {
        budget: {
          currency: "",
          total_budget: 0,
        },
        currency_exchange: {
          from_currency: "",
          last_updated: "",
          to_currency: "",
        },
        itinerary: {
          days: [],
          destination: "",
          end_date: "",
          origin: "",
          start_date: "",
          trip_name: "",
        },
        persons_details: [
          {
            gender: "",
            name: "",
            relation_to_user: "",
            age: 0,
          },
        ],
        preferences: {
          cuisine_preferences: [],
          dietary_restrictions: [],
          flight_seat_type: "",
          hotel_type: "",
          interests: [],
          travel_theme: [],
        },
        user_details: {
          email: "",
          home_address: "",
          name: "",
          passport_nationality: "",
          phone_number: "",
        },
      },
      status: "draft",
    },
  },
  preferences: {
    food: [],
  },
  profile: {
    email: user.email,
    displayName: user.displayName || username,
  },
  createdAt: new Date().toISOString(),
});


            
            const onboardingData = {
                uid: user.uid
            };
            const response = await axios.post(API_URL, onboardingData);
            console.log('Saving onboarding data:', response);
        } catch (err) {
            console.error("Error saving onboarding data:", err);
            // You might want to set an error state here as well
        } finally {
        }
    };

  // Email/Password Sign Up
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update displayName with username
      if (username) {
        await updateProfile(userCredential.user, { displayName: username });
      }
      await handleSubmit(userCredential.user);
      navigate("/onboarding"); // redirect after signup
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google Sign Up
  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await handleSubmit(userCredential.user);
      navigate("/onboarding");
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
            <div className="text-center mb-4">
              <a  className="auth-logo mb-5 d-block">
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

              <h4>Sign up</h4>
              <p className="text-muted mb-4">Get your account now.</p>
            </div>

            <div className="card">
              <div className="card-body p-4">
                <div className="p-3">
                  <form onSubmit={handleSignup}>
                    {error && (
                      <p className="text-danger mb-3" style={{ fontSize: "14px" }}>
                        {error}
                      </p>
                    )}

                    {/* Email */}
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <div className="input-group bg-light-subtle rounded-3 mb-3">
                        <span className="input-group-text text-muted">
                          <i className="ri-mail-line"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control form-control-lg bg-light-subtle border-light"
                          placeholder="Enter Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Username (optional, stored in displayName) */}
                    {/* <div className="mb-3">
                      <label className="form-label">Username</label>
                      <div className="input-group bg-light-subtle mb-3 rounded-3">
                        <span className="input-group-text border-light text-muted">
                          <i className="ri-user-2-line"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control form-control-lg bg-light-subtle border-light"
                          placeholder="Enter Username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div> */}

                    {/* Password */}
                    <div className="mb-4">
                      <label className="form-label">Password</label>
                      <div className="input-group bg-light-subtle mb-3 rounded-3">
                        <span className="input-group-text border-light text-muted">
                          <i className="ri-lock-2-line"></i>
                        </span>
                        <input
                          type="password"
                          className="form-control form-control-lg bg-light-subtle border-light"
                          placeholder="Enter Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Signup Button */}
                    <div className="d-grid mb-3">
                      <button className="btn btn-primary waves-effect waves-light" type="submit" disabled={loading}>
                        {loading ? (
                            <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span className="ms-1">Loading...</span></>
                        ) : (
                            "Sign up"
                        )}
                      </button>
                    </div>

                    {/* Google Signup Button */}
                    <div className="d-grid">
                      <button
                        type="button"
                        className="btn waves-effect waves-light"
                        onClick={handleGoogleSignup}
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
                            <><i className="ri-google-fill me-2"></i> Sign up with Google</>
                        )}
                      </button>
                    </div>

                    <div className="mt-4 text-center">
                      <p className="text-muted mb-0">
                        By registering you agree to the {" "}
                        <a href="#" className="text-primary">
                          Terms of Use
                        </a>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="mt-5 text-center">
              <p>
                Already have an account ?{" "}
                <Link to="/login" className="fw-medium text-primary">
                  Signin
                </Link>
              </p>
              <p>
                {/* © {new Date().getFullYear()} Chatvia. Crafted with{" "}
                <i className="mdi mdi-heart text-danger"></i> by Themesbrand */}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;
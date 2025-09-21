import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';
import axios from 'axios';

const OnboardingPage = () => {
    const navigate = useNavigate();
    const user = auth.currentUser;

    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [gender, setGender] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setEmail(user.email || '');

            if (user.displayName) {
                const nameParts = user.displayName.split(' ');
                setFirstname(nameParts[0] || '');
                setLastname(nameParts.slice(1).join(' ') || '');
            }
        } else {
            navigate('/login');
        }
    }, [user, navigate]);

    const API_URL = "https://us-central1-hack2skill-emt.cloudfunctions.net/api/createUserProfile";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!user) {
            setError('No user is signed in.');
            setLoading(false);
            return;
        }

        try {
            const displayName = `${firstname} ${lastname}`.trim();
            
            if (displayName) {
                await updateProfile(user, { displayName });
            }

            const onboardingData = {
                uid: user.uid,
                firstname,
                lastname,
                gender,
                phone,
                email
            };
            const response = await axios.post(API_URL, onboardingData);
            console.log('Saving onboarding data:', response);

            navigate('/');

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
                            <h4>Complete Your Profile</h4>
                            <p className="text-muted mb-4">Just a few more details to get you started.</p>
                        </div>
                        <div className="card">
                            <div className="card-body p-4">
                                <div className="p-3">
                                    <form onSubmit={handleSubmit}>
                                        {error && <p className="text-danger">{error}</p>}
                                        
                                        <div className="mb-3">
                                            <label className="form-label">Email</label>
                                            <input type="email" className="form-control" value={email} disabled readOnly />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">First Name</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={firstname} 
                                                onChange={(e) => setFirstname(e.target.value)} 
                                                placeholder="Enter your first name" 
                                                required 
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Last Name</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={lastname} 
                                                onChange={(e) => setLastname(e.target.value)} 
                                                placeholder="Enter your last name" 
                                                required 
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Phone</label>
                                            <input 
                                                type="tel" 
                                                className="form-control" 
                                                value={phone} 
                                                onChange={(e) => setPhone(e.target.value)} 
                                                placeholder="Enter your phone number" 
                                                required 
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Gender</label>
                                            <select 
                                                className="form-select" 
                                                value={gender} 
                                                onChange={(e) => setGender(e.target.value)} 
                                                required
                                                disabled={loading}
                                            >
                                                <option value="" disabled>Select your gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div className="d-grid">
                                            <button className="btn btn-primary waves-effect waves-light" type="submit" disabled={loading}>
                                                {loading ? (
                                                    <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span className="ms-1">Loading...</span></>
                                                ) : (
                                                    "Complete Profile"
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingPage;
//  

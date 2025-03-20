import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from "./Dashboard"; 
import "./Home.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faHouse, faEdit, faDownload, faSignInAlt } from "@fortawesome/free-solid-svg-icons";

function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userChecked, setUserChecked] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setIsLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");
      } else {
        // User is signed out - check if we have persisted data
        const persistedUserData = localStorage.getItem('userData');
        const persistedAuthToken = localStorage.getItem('authToken');
        
        if (persistedUserData && persistedAuthToken) {
          // We have persisted data, but Firebase auth session might have expired
          // Keep the user logged in for UX purposes - they'll be redirected to login if needed
          setIsLoggedIn(true);
        } else {
          // No persisted data, user is definitely logged out
          setIsLoggedIn(false);
          localStorage.removeItem("isLoggedIn");
        }
      }
      setLoading(false);
      setUserChecked(true);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    setShowDashboard(false);
  };

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/basicdetails");
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      <header className="header">
        <h1>Resume Maker</h1>
        <nav className="nav">
          {loading ? (
            <div className="loading-indicator">Loading...</div>
          ) : isLoggedIn ? (
            <button 
              onClick={() => setShowDashboard(!showDashboard)} 
              className="profile-btn"
              title="View Profile"
            >
              <FontAwesomeIcon icon={faUser} />
            </button>
          ) : (
            <>
              <Link to="/signup" className="nav-log-sign">Signup</Link>
              <Link to="/login" className="nav-log-sign">Login</Link>
            </>
          )}
        </nav>
      </header>

      {showDashboard && (
        <Dashboard closeDashboard={() => setShowDashboard(false)} onLogout={handleLogout} />
      )}

      <div className="home-container">
        <div className="home-container-details">
          <h1 className="home-title">Welcome to Resume Maker!</h1>
          <p className="home-description">
            This Resume Maker helps you create a professional resume with ease.
          </p>
          <button 
            className="get-started-btn" 
            onClick={handleGetStarted}
            disabled={loading}
          >
            {loading ? "Loading..." : "Get Started"}
          </button>
        </div>

        {/* Step-by-Step Guide */}
        <div className="steps-container">
          <h2 className="steps-title">How to Use Resume Maker 📝</h2>
          <div className="steps">
            <div className="step">
              <FontAwesomeIcon icon={faSignInAlt} className="step-icon" />
              <p><strong>Step 1:</strong> Sign up or Log in</p>
            </div>
            <div className="step">
              <FontAwesomeIcon icon={faEdit} className="step-icon" />
              <p><strong>Step 2:</strong> Fill in your resume details</p>
            </div>
            <div className="step">
              <FontAwesomeIcon icon={faDownload} className="step-icon" />
              <p><strong>Step 3:</strong> Download your resume in PDF</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
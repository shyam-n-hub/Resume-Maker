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

  useEffect(() => {
    const storedLoginState = localStorage.getItem("isLoggedIn");
    if (storedLoginState === "true") {
      setIsLoggedIn(true);
    }

    onAuthStateChanged(auth, (user) => {
      setLoading(false);
      if (user) {
        setIsLoggedIn(true);
      }
    });
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <>
      <header className="header">
        <h1>Resume Maker</h1>
        <nav className="nav">
          {!isLoggedIn ? (
            <>
              <Link to="/signup" className="nav-log-sign">Signup</Link>
              <Link to="/login" className="nav-log-sign">Login</Link>
            </>
          ) : (
            <button onClick={() => setShowDashboard(!showDashboard)} className="profile-btn">
            Profile
            </button>
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
        <button className="get-started-btn" onClick={() => navigate(isLoggedIn ? "/basicdetails" : "/login")}>
          Get Started
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

import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from "./Dashboard"; 
import "./Home.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

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
          <Link to="/" style={{fontSize:"16px",padding: "8px 12px",}}>Home</Link>

          {!isLoggedIn ? (
            <>
              <Link to="/signup">Signup</Link>
              <Link to="/login">Login</Link>
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
        <h1 className="home-title">Welcome to Resume Maker!</h1>
        <p className="home-description">
          This Resume Maker helps you create a professional resume with ease.
        </p>
        <button className="get-started-btn" onClick={() => navigate(isLoggedIn ? "/basicdetails" : "/login")}>
          Get Started
        </button>
      </div>
    </>
  );
}

export default Home;

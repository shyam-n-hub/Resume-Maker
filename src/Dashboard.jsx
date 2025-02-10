import React, { useEffect, useState, useRef } from "react";
import { ref as storageRef, getDownloadURL } from "firebase/storage";
import { ref as dbRef, get, child } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { storage, auth, database } from "./firebase";
import "./dashboard.css";

function Dashboard({ closeDashboard, onLogout }) {
  const [resumeUrl, setResumeUrl] = useState(null);
  const [userData, setUserData] = useState({});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const dashboardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userEmail = user.email;

        // Fetch user profile data from Realtime Database
        const userRef = dbRef(database, `users/${user.uid}`);
        get(child(userRef, "/"))
          .then((snapshot) => {
            if (snapshot.exists()) {
              const userInfo = snapshot.val();
              setUserData({
                name: userInfo.name || "User",
                email: userEmail,
                profileImage: userInfo.profileImage || "default-image.jpg",
              });
            }
          })
          .catch((error) => console.error("Error fetching user data:", error));

        // Fetch resume URL from Firebase Storage
        const resumeReference = storageRef(storage, `resumes/${userEmail}.pdf`);
        getDownloadURL(resumeReference)
          .then((url) => setResumeUrl(url))
          .catch(() => setResumeUrl(null));
      }
    });

    // Handle click outside to close the dashboard
    const handleClickOutside = (event) => {
      if (dashboardRef.current && !dashboardRef.current.contains(event.target)) {
        closeDashboard();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeDashboard]);

  const handleClose = () => {
    const dashboardElement = dashboardRef.current;
    if (dashboardElement) {
      dashboardElement.classList.add("slide-out");
      setTimeout(() => {
        closeDashboard();
      }, 300); // Timeout matches the slide-out animation duration
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    signOut(auth)
      .then(() => {
        setIsLoggingOut(false);
        setShowLogoutConfirm(false);
        setShowSuccessMessage(true); // Show success message
        setTimeout(() => {
          setShowSuccessMessage(false);
          handleClose(); // Close the sidebar
          onLogout();
          navigate("/"); // Redirect to the home page
        }, 2000);
      })
      .catch((error) => {
        setIsLoggingOut(false);
        console.error("Error logging out: ", error);
      });
  };

  return (
    <div className="dashboard-sidebar" ref={dashboardRef}>
      <button className="close-btn" onClick={handleClose}>
        ✖
      </button>
      <h2 className="dash-h2">My Dashboard</h2>
      {userData.email && (
        <>
          <img
            src="https://thumbs.dreamstime.com/b/man-profile-cartoon-smiling-vector-illustration-graphic-design-135443492.jpg"
            style={{ width: "100px", height: "100px" }}
            alt="Profile"
            className="dash-profile-image"
          />
          <p className="dash-user-name">{userData.name}</p>
          <p className="dash-user-email">{userData.email}</p>
        </>
      )}
      <h3 className="dash-h3">My Resume</h3>
      {resumeUrl ? (
        <a className="dash-resume-link" href={resumeUrl} target="_blank" rel="noopener noreferrer">
          View Updated Resume
        </a>
      ) : (
        <p className="no-resume-text">No resume uploaded yet.</p>
      )}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        style={{
          marginLeft: "10px",
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          padding: "5px 15px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      {showLogoutConfirm && (
        <div className="logout-confirm-box">
          <p>Are you sure you want to logout?</p>
          <div className="logout-buttons">
            <button
              className="confirm-btn"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging Out..." : "Confirm"}
            </button>
            <button className="cancel-btn" onClick={() => setShowLogoutConfirm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {showSuccessMessage && (
        <div className="logout-success-message">
           Successfully Logout !...
        </div>
      )}
    </div>
  );
}

export default Dashboard;

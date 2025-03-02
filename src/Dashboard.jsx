import React, { useEffect, useState, useRef } from "react";
import { ref as storageRef, getDownloadURL } from "firebase/storage";
import { ref as dbRef, get } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { storage, auth, database } from "./firebase";
import "./dashboard.css";

function Dashboard({ closeDashboard, onLogout }) {
  const [resumeUrl, setResumeUrl] = useState(null);
  const [userData, setUserData] = useState({
    name: "User",
    email: "",
    profileImage: "/default-image.jpg", 
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const dashboardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user data from Firebase Realtime Database
          const userRef = dbRef(database, `users/${user.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const userInfo = snapshot.val();
            setUserData({
              name: userInfo.name || "User",
              email: userInfo.email,
              profileImage: userInfo.profileImage || "https://thumbs.dreamstime.com/b/man-profile-cartoon-smiling-vector-illustration-graphic-design-135443492.jpg",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }

        // Fetch resume URL from Firebase Storage
        try {
          const resumeReference = storageRef(storage, `resumes/${user.email}.pdf`);
          const url = await getDownloadURL(resumeReference);
          setResumeUrl(url);
        } catch {
          setResumeUrl(null);
        }
      }
    });

    // Close dashboard on outside click
    const handleClickOutside = (event) => {
      if (dashboardRef.current && !dashboardRef.current.contains(event.target)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      unsubscribe();
    };
  }, [closeDashboard]);

  const handleClose = () => {
    if (dashboardRef.current) {
      dashboardRef.current.classList.add("slide-out");
      setTimeout(() => closeDashboard(), 300);
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    signOut(auth)
      .then(() => {
        setIsLoggingOut(false);
        setShowLogoutConfirm(false);
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          handleClose();
          onLogout();
          navigate("/Home"); // Directly go to Home page after logout
        }, 1000);
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
          <p className="dash-user-name" style={{ textTransform: "uppercase" }}>{userData.name}</p>
          <p className="dash-user-email" style={{fontSize:"17px"}}>{userData.email}</p>
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
        onClick={() => setShowLogoutConfirm(true)} className="profile-log"
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

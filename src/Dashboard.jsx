import React, { useEffect, useState, useRef } from "react";
import { ref as storageRef, getDownloadURL } from "firebase/storage";
import { ref as dbRef, get, onValue } from "firebase/database";
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
  const [loading, setLoading] = useState(true);
  const dashboardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user in localStorage first to immediately display data
    const cachedUserData = localStorage.getItem('userData');
    if (cachedUserData) {
      try {
        const parsedData = JSON.parse(cachedUserData);
        setUserData(parsedData);
        setResumeUrl(parsedData.resumeLink || null);
        setLoading(false);
      } catch (error) {
        console.error("Error parsing cached user data:", error);
      }
    }

    // Set up authentication listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Set up real-time listener for user data
          const userRef = dbRef(database, `users/${user.uid}`);
          
          // Use onValue instead of get for real-time updates
          const userListener = onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
              const userInfo = snapshot.val();
              const updatedUserData = {
                name: userInfo.name || "User",
                email: userInfo.email || user.email,
                profileImage: userInfo.profileImage || "/default-image.jpg",
                resumeLink: userInfo.resumeLink || null
              };
              
              // Update state with fetched data
              setUserData(updatedUserData);
              setResumeUrl(userInfo.resumeLink || null);
              
              // Cache user data in localStorage
              localStorage.setItem('userData', JSON.stringify(updatedUserData));
              setLoading(false);
            } else {
              // If no user data exists, create default data from auth object
              const defaultUserData = {
                name: user.displayName || "User",
                email: user.email,
                profileImage: "/default-image.jpg",
                resumeLink: null
              };
              setUserData(defaultUserData);
              localStorage.setItem('userData', JSON.stringify(defaultUserData));
              setLoading(false);
            }
          }, (error) => {
            console.error("Error fetching user data:", error);
            setLoading(false);
          });
          
          // Return cleanup function to remove the listener
          return () => userListener();
        } catch (error) {
          console.error("Error setting up user data listener:", error);
          setLoading(false);
        }
      } else {
        // No user is signed in, clear cached data
        localStorage.removeItem('userData');
        setUserData({
          name: "User",
          email: "",
          profileImage: "/default-image.jpg",
        });
        setResumeUrl(null);
        setLoading(false);
      }
    });
  
    return () => unsubscribe();
  }, []);
  
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
        // Clear local storage and session storage
        localStorage.removeItem('userData');
        sessionStorage.clear();
  
        // Ensure Firebase does not keep the session
        document.cookie = "firebase:authUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
        setIsLoggingOut(false);
        setShowLogoutConfirm(false);
        setShowSuccessMessage(true);
  
        setTimeout(() => {
          setShowSuccessMessage(false);
          handleClose();
          onLogout();
          navigate("/Home"); // Redirect to Home page after logout
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
        
      </button>
      <h2 className="dash-h2">My Profile</h2>
      
      {loading ? (
        <p>Loading profile data...</p>
      ) : userData.email ? (
        <>
          <img
            src={userData.profileImage !== "/default-image.jpg" ? userData.profileImage : "https://thumbs.dreamstime.com/b/man-profile-cartoon-smiling-vector-illustration-graphic-design-135443492.jpg"}
            style={{ width: "100px", height: "100px" }}
            alt="Profile"
            className="dash-profile-image"
          />
          <p className="dash-user-name" style={{ textTransform: "uppercase" }}>{userData.name}</p>
          <p className="dash-user-email" style={{fontSize:"17px"}}>{userData.email}</p>
        </>
      ) : (
        <p>Please sign in to view your profile</p>
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
        className="profile-log"
        disabled={!userData.email}
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
      <div>
        <p className="develop">Developed by <a href="https://www.linkedin.com/in/shyam--n/" className="develop-a">IoT Engineer</a></p>
        <p style={{textAlign:"center",display:"flex",flexDirection:"row",margin:"auto"}}><a href="https://rapcodetechsolutions.netlify.app/" className="develop-aa"><img src="Frame - Copy (2).png" style={{width:"15px",height:"15px",display:"flex",margin:"auto",flexDirection:"row"}} alt="RapCode Logo"></img>RapCode Tech Solutions</a></p>
      </div>
    </div>
  );
}

export default Dashboard;
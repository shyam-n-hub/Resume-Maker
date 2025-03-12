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
  const userListenerRef = useRef(null);

  useEffect(() => {
    // Check if Firebase already has a user session
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        fetchUserData(user.uid);
      } else {
        // No user is signed in, check localStorage for last user token
        const persistedAuthUser = localStorage.getItem('firebaseAuthUser');
        
        if (persistedAuthUser) {
          try {
            const userData = JSON.parse(persistedAuthUser);
            // We have persistent data but no auth session
            // Show cached data but mark as loading until we can verify
            setUserData({
              name: userData.name || "User",
              email: userData.email || "",
              profileImage: userData.profileImage || "/default-image.jpg",
            });
            setResumeUrl(userData.resumeLink || null);
            
            // Still mark as not loading since we're displaying data
            setLoading(false);
          } catch (error) {
            console.error("Error parsing persisted auth user:", error);
            clearUserData();
          }
        } else {
          // No persisted data either
          clearUserData();
        }
      }
    });

    // Clean up the auth listener when component unmounts
    return () => {
      unsubscribe();
      // Also clean up any database listeners
      if (userListenerRef.current) {
        userListenerRef.current();
      }
    };
  }, []);

  const fetchUserData = (userId) => {
    try {
      // Set up real-time listener for user data
      const userRef = dbRef(database, `users/${userId}`);
      
      // Clean up previous listener if exists
      if (userListenerRef.current) {
        userListenerRef.current();
      }
      
      // Use onValue for real-time updates
      userListenerRef.current = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userInfo = snapshot.val();
          const updatedUserData = {
            name: userInfo.name || "User",
            email: userInfo.email || auth.currentUser?.email || "",
            profileImage: userInfo.profileImage || "/default-image.jpg",
            resumeLink: userInfo.resumeLink || null
          };
          
          // Update state with fetched data
          setUserData(updatedUserData);
          setResumeUrl(userInfo.resumeLink || null);
          
          // Persist user data more robustly
          localStorage.setItem('userData', JSON.stringify(updatedUserData));
          localStorage.setItem('firebaseAuthUser', JSON.stringify(updatedUserData));
          
          setLoading(false);
        } else {
          // If no user data exists, create default data from auth object
          const defaultUserData = {
            name: auth.currentUser?.displayName || "User",
            email: auth.currentUser?.email || "",
            profileImage: "/default-image.jpg",
            resumeLink: null
          };
          
          setUserData(defaultUserData);
          localStorage.setItem('userData', JSON.stringify(defaultUserData));
          localStorage.setItem('firebaseAuthUser', JSON.stringify(defaultUserData));
          
          setLoading(false);
        }
      }, (error) => {
        console.error("Error fetching user data:", error);
        
        // Try to use cached data if available
        const cachedUserData = localStorage.getItem('userData');
        if (cachedUserData) {
          try {
            setUserData(JSON.parse(cachedUserData));
          } catch (e) {
            console.error("Error parsing cached data:", e);
          }
        }
        
        setLoading(false);
      });
    } catch (error) {
      console.error("Error setting up user data listener:", error);
      setLoading(false);
    }
  };

  const clearUserData = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('firebaseAuthUser');
    setUserData({
      name: "User",
      email: "",
      profileImage: "/default-image.jpg",
    });
    setResumeUrl(null);
    setLoading(false);
  };
  
  const handleClose = () => {
    if (dashboardRef.current) {
      dashboardRef.current.classList.add("slide-out");
      setTimeout(() => closeDashboard(), 300);
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    
    // Clean up any database listeners first
    if (userListenerRef.current) {
      userListenerRef.current();
      userListenerRef.current = null;
    }
    
    signOut(auth)
      .then(() => {
        // Clear all storage
        localStorage.removeItem('userData');
        localStorage.removeItem('firebaseAuthUser');
        sessionStorage.clear();
  
        // Clear Firebase auth cookies
        document.cookie = "firebase:authUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "firebase:session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
        setIsLoggingOut(false);
        setShowLogoutConfirm(false);
        setShowSuccessMessage(true);
  
        setTimeout(() => {
          setShowSuccessMessage(false);
          handleClose();
          if (onLogout) onLogout();
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
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
  const [authInitialized, setAuthInitialized] = useState(false);
  const dashboardRef = useRef(null);
  const userListenerRef = useRef(null);
  const navigate = useNavigate();

  // Initialize and handle auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in - set up database listener for this user
        setupUserDataListener(user.uid);
      } else {
        // No authenticated user found - check localStorage for persisted data
        const persistedUserData = localStorage.getItem('userData');
        const persistedAuthUser = localStorage.getItem('firebaseAuthUser');
        
        if (persistedUserData || persistedAuthUser) {
          try {
            // Try to use persisted data
            const userData = persistedUserData ? JSON.parse(persistedUserData) : JSON.parse(persistedAuthUser);
            setUserData({
              name: userData.name || "User",
              email: userData.email || "",
              profileImage: userData.profileImage || "/default-image.jpg",
            });
            setResumeUrl(userData.resumeLink || null);
            setLoading(false);
          } catch (error) {
            console.error("Error parsing persisted user data:", error);
            clearUserData();
          }
        } else {
          // No persisted data either - user is truly not logged in
          clearUserData();
        }
      }
      
      setAuthInitialized(true);
    });

    return () => {
      unsubscribe();
      if (userListenerRef.current) {
        userListenerRef.current();
        userListenerRef.current = null;
      }
    };
  }, []);

  // Setup real-time listener for user data changes
  const setupUserDataListener = (userId) => {
    try {
      // Clean up any existing listener
      if (userListenerRef.current) {
        userListenerRef.current();
      }
      
      // Set up new listener
      const userRef = dbRef(database, `users/${userId}`);
      userListenerRef.current = onValue(
        userRef,
        (snapshot) => {
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
            
            // Persist to localStorage for quick access and offline support
            localStorage.setItem('userData', JSON.stringify(updatedUserData));
            localStorage.setItem('firebaseAuthUser', JSON.stringify(updatedUserData));
            
            setLoading(false);
          } else {
            // No user data in database yet
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
        },
        (error) => {
          console.error("Error fetching user data:", error);
          
          // Try to use cached data on error
          const cachedUserData = localStorage.getItem('userData');
          if (cachedUserData) {
            try {
              setUserData(JSON.parse(cachedUserData));
              setLoading(false);
            } catch (e) {
              console.error("Error parsing cached data:", e);
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
        }
      );
    } catch (error) {
      console.error("Error setting up user data listener:", error);
      setLoading(false);
    }
  };

  const clearUserData = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('firebaseAuthUser');
    localStorage.removeItem('authToken');
    
    // Clear any Firebase auth persistence
    document.cookie = "firebase:authUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "firebase:session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
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
    
    // Sign out and clear data
    signOut(auth)
      .then(() => {
        clearUserData();
        sessionStorage.clear();
  
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
        disabled={!userData.email || isLoggingOut}
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
            <button 
              className="cancel-btn" 
              onClick={() => setShowLogoutConfirm(false)}
              disabled={isLoggingOut}
            >
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
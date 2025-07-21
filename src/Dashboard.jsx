import React, { useEffect, useState, useRef } from "react";
import { ref as storageRef, getDownloadURL, uploadBytes, uploadBytesResumable, updateMetadata } from "firebase/storage";
import { ref as dbRef, get, onValue, update, set } from "firebase/database";
import { onAuthStateChanged, signOut, signInWithCustomToken } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { storage, auth, database } from "./firebase";
import "./dashboard.css";

function Dashboard({ closeDashboard, onLogout }) {
  const [resumeUrl, setResumeUrl] = useState(null);
  const [resumeType, setResumeType] = useState(null); // 'generated' or 'manual'
  const [resumeFileName, setResumeFileName] = useState(null);
  const [userData, setUserData] = useState({
    name: "User",
    email: "",
    department: "Department",
    profileImage: "/default-image.jpg",
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [editedUserData, setEditedUserData] = useState({});
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false);
  
  // Resume upload states
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showResumeOptions, setShowResumeOptions] = useState(false);
  
  const dashboardRef = useRef(null);
  const fileInputRef = useRef(null);
  const resumeFileInputRef = useRef(null);
  const userListenerRef = useRef(null);
  const navigate = useNavigate();

  // Handle clicks outside the dashboard to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dashboardRef.current && !dashboardRef.current.contains(event.target)) {
        handleClose();
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Initialize and handle auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("Firebase Auth active user found in Dashboard:", user.uid);
        // User is signed in - set up database listener for this user
        setupUserDataListener(user.uid);
        
        // Store auth state in localStorage for persistence
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('uid', user.uid);
        
        // Get or refresh token if we don't have one
        if (!localStorage.getItem('authToken')) {
          try {
            const token = await user.getIdToken();
            localStorage.setItem('authToken', token);
          } catch (error) {
            console.error("Error getting auth token:", error);
          }
        }
      } else {
        // No authenticated user found - check localStorage for persisted data
        const persistedLoginState = localStorage.getItem('isLoggedIn');
        const persistedUid = localStorage.getItem('uid');
        const persistedToken = localStorage.getItem('authToken');
        
        if (persistedLoginState === 'true' && persistedUid && persistedToken) {
          console.log("Local storage indicates user is logged in, attempting to restore session");
          
          try {
            // Try to restore the Firebase auth session
            await signInWithCustomToken(auth, persistedToken);
            console.log("Session restored successfully");
            
            // After successful restoration, the auth state will change and trigger this effect again
          } catch (error) {
            console.error("Error restoring auth session:", error);
            
            // Even if token restoration fails, we'll still try to load persisted user data
            const persistedUserData = localStorage.getItem('userData');
            
            if (persistedUserData) {
              try {
                const userData = JSON.parse(persistedUserData);
                setUserData({
                  name: userData.name || "User",
                  email: userData.email || "",
                  department: userData.department || "Department",
                  profileImage: userData.profileImage || "/default-image.jpg",
                });
                setResumeUrl(userData.resumeLink || null);
                setResumeType(userData.resumeType || null);
                setResumeFileName(userData.resumeFileName || null);
                setLoading(false);
              } catch (error) {
                console.error("Error parsing persisted user data:", error);
                clearUserData();
                navigate("/login");
              }
            } else {
              clearUserData();
              navigate("/login");
            }
          }
        } else {
          // No persisted data either - user is truly not logged in
          console.log("No login data found in localStorage, redirecting to login");
          clearUserData();
          navigate("/login");
        }
      }
      
      setAuthInitialized(true);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (userListenerRef.current) {
        userListenerRef.current();
        userListenerRef.current = null;
      }
    };
  }, [navigate]);

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
              department: userInfo.department || "Department",
              profileImage: userInfo.profileImage || "/default-image.jpg",
              resumeLink: userInfo.resumeLink || null,
              resumeType: userInfo.resumeType || null,
              resumeFileName: userInfo.resumeFileName || null,
            };
            
            // Update state with fetched data
            setUserData(updatedUserData);
            setResumeUrl(userInfo.resumeLink || null);
            setResumeType(userInfo.resumeType || null);
            setResumeFileName(userInfo.resumeFileName || null);
            
            // Persist to localStorage for quick access and offline support
            localStorage.setItem('userData', JSON.stringify(updatedUserData));
            
            setLoading(false);
          } else {
            // No user data in database yet
            if (auth.currentUser) {
              const defaultUserData = {
                name: auth.currentUser.displayName || "User",
                email: auth.currentUser.email || "",
                department: "Department",
                profileImage: "/default-image.jpg",
                resumeLink: null,
                resumeType: null,
                resumeFileName: null,
              };
              
              setUserData(defaultUserData);
              localStorage.setItem('userData', JSON.stringify(defaultUserData));
            }
            
            setLoading(false);
          }
        },
        (error) => {
          console.error("Error fetching user data:", error);
          
          // Try to use cached data on error
          const cachedUserData = localStorage.getItem('userData');
          if (cachedUserData) {
            try {
              const userData = JSON.parse(cachedUserData);
              setUserData(userData);
              setResumeUrl(userData.resumeLink || null);
              setResumeType(userData.resumeType || null);
              setResumeFileName(userData.resumeFileName || null);
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
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('uid');
    
    setUserData({
      name: "User",
      email: "",
      department: "Department",
      profileImage: "/default-image.jpg",
    });
    setResumeUrl(null);
    setResumeType(null);
    setResumeFileName(null);
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
        
        // Even if Firebase signout fails, clear local data
        clearUserData();
        if (onLogout) onLogout();
        navigate("/Home");
      });
  };

  const handleEditProfile = () => {
    setEditedUserData({ ...userData });
    setShowProfileEditor(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUserData({
      ...editedUserData,
      [name]: value
    });
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      // Create a temporary URL for preview
      const tempUrl = URL.createObjectURL(file);
      setEditedUserData({
        ...editedUserData,
        profileImage: tempUrl
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Check for auth status
      const uid = auth.currentUser?.uid || localStorage.getItem('uid');
      
      if (!uid) {
        console.error("No user ID found for saving profile");
        return;
      }

      const userRef = dbRef(database, `users/${uid}`);
      
      // First, handle the profile image upload if there's a new file
      let imageUrl = editedUserData.profileImage;
      if (profileImageFile) {
        const imageRef = storageRef(storage, `profileImages/${uid}`);
        await uploadBytes(imageRef, profileImageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Update the user data in the database
      const updatedData = {
        ...editedUserData,
        profileImage: imageUrl
      };
      
      await update(userRef, updatedData);
      
      // Update local state
      setUserData(updatedData);
      
      // Save to localStorage
      localStorage.setItem('userData', JSON.stringify(updatedData));
      
      // Cleanup and show success message
      setProfileImageFile(null);
      setShowProfileEditor(false);
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleResumeFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file only.');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size should be less than 10MB.');
        return;
      }
      
      uploadManualResume(file);
    }
  };

  const uploadManualResume = async (file) => {
    const uid = auth.currentUser?.uid || localStorage.getItem('uid');
    
    if (!uid) {
      alert("Please log in to upload resume.");
      return;
    }

    setIsUploadingResume(true);
    setUploadProgress(0);

    try {
      const fileName = `${userData.name.replace(/\s+/g, '_')}_Manual_Resume_${Date.now()}.pdf`;
      const resumeStorageRef = storageRef(storage, `resumes/${uid}/${fileName}`);
      
      const uploadTask = uploadBytesResumable(resumeStorageRef, file, {
        contentType: "application/pdf",
      });

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Error uploading resume: ", error);
          alert("Upload failed. Please try again.");
          setIsUploadingResume(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(resumeStorageRef);
            
            // Add metadata
            const metadata = { 
              customMetadata: { 
                name: userData.name, 
                userEmail: userData.email,
                createdAt: new Date().toISOString(),
                type: 'manual'
              } 
            };
            await updateMetadata(resumeStorageRef, metadata);

            // Update the resume info in the database
            await set(dbRef(database, `users/${uid}/resume`), {
              downloadURL,
              name: userData.name,
              userEmail: userData.email,
              fileName,
              createdAt: new Date().toISOString(),
              type: 'manual'
            });

            // Update the user record with new resume info
            await update(dbRef(database, `users/${uid}`), {
              resumeLink: downloadURL,
              resumeType: 'manual',
              resumeFileName: file.name
            });

            // Update local state
            setResumeUrl(downloadURL);
            setResumeType('manual');
            setResumeFileName(file.name);
            
            alert("Resume uploaded successfully!");
            setShowResumeOptions(false);
          } catch (error) {
            console.error("Error updating resume metadata: ", error);
            alert("Upload completed but there was an error updating metadata.");
          } finally {
            setIsUploadingResume(false);
          }
        }
      );
    } catch (error) {
      console.error("Error starting resume upload:", error);
      alert("Failed to start upload. Please try again.");
      setIsUploadingResume(false);
    }
  };

  const triggerResumeFileInput = () => {
    resumeFileInputRef.current.click();
  };

  const toggleAboutUs = () => {
    setShowAboutUs(!showAboutUs);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleResumeAction = () => {
    setShowResumeOptions(true);
  };

  const handleGenerateNewResume = () => {
    navigate("/basicdetails");
    setShowResumeOptions(false);
  };
  
  return (
    <div className="dashboard-overlay">
      <div className="dashboard-sidebar" ref={dashboardRef}>
        <button className="close-btn" onClick={handleClose}></button>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading profile data...</p>
          </div>
        ) : !showProfileEditor ? (
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-image-container">
                <img
                  src={userData.profileImage !== "/default-image.jpg" ? userData.profileImage : "https://thumbs.dreamstime.com/b/man-profile-cartoon-smiling-vector-illustration-graphic-design-135443492.jpg"}
                  alt="Profile"
                  className="profile-image"
                />
              </div>
              <div className="profile-info">
                <h3 className="profile-name">{userData.name}</h3>
                <p className="profile-email">{userData.email}</p>
                <p className="profile-department">{userData.department}</p>
              </div>
            </div>
            
            <div className="action-buttons">
              <button className="action-btn follow-btn" onClick={handleEditProfile}>
                Edit Profile
              </button>
            </div>
            
            <div className="profile-actions">
              <button className="profile-action-btn about-btn" onClick={toggleAboutUs}>
                About Us
              </button>
              
              {/* Enhanced Resume Section */}
              <div className="resume-section">
                {resumeUrl ? (
                  <div className="resume-info">
                    <a className="profile-action-btn resume-btn" href={resumeUrl} target="_blank" rel="noopener noreferrer">
                      View Resume ({resumeType === 'manual' ? 'Uploaded' : 'Generated'})
                    </a>
                    {resumeFileName && resumeType === 'manual' && (
                      <p className="resume-filename">File: {resumeFileName}</p>
                    )}
                  </div>
                ) : (
                  <button className="profile-action-btn resume-btn disabled">
                    No Resume Available
                  </button>
                )}
                
                <button 
                  className="profile-action-btn resume-manage-btn" 
                  onClick={handleResumeAction}
                  disabled={isUploadingResume}
                >
                  {isUploadingResume ? `Uploading... ${Math.round(uploadProgress)}%` : 'Manage Resume'}
                </button>
              </div>
              
              <button
                onClick={() => setShowLogoutConfirm(true)} 
                className="profile-action-btn logout-btn"
                disabled={!userData.email || isLoggingOut}
              >
                Logout
              </button>
            </div>

            {/* Resume Options Modal */}
            {showResumeOptions && (
              <div className="resume-options-overlay">
                <div className="resume-options-box">
                  <h3>Resume Options</h3>
                  <div className="resume-option-buttons">
                    <button 
                      className="option-btn upload-btn" 
                      onClick={triggerResumeFileInput}
                      disabled={isUploadingResume}
                    >
                      Upload Resume (PDF)
                    </button>
                    <button 
                      className="option-btn generate-btn" 
                      onClick={handleGenerateNewResume}
                    >
                      Generate New Resume
                    </button>
                    <button 
                      className="option-btn cancel-btn" 
                      onClick={() => setShowResumeOptions(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden file inputs */}
            <input
              type="file"
              ref={resumeFileInputRef}
              onChange={handleResumeFileChange}
              accept=".pdf"
              style={{ display: 'none' }}
            />

            {showAboutUs && (
              <div className="about-us-panel">
                <h3>About Resume Builder</h3>
                <p>
                  Welcome to our professional Resume Builder application. We help job seekers create standout resumes that get noticed by employers. Our platform allows you to easily customize your resume, manage your professional profile, and track your job applications in one place.
                </p>
                <p>
                  With our intuitive interface, you can update your information, upload your latest resume, and maintain a professional online presence that showcases your skills and experience.
                </p>
                <button className="close-about-btn" onClick={toggleAboutUs}>Close</button>
              </div>
            )}
          </div>
        ) : (
          <div className="profile-editor">
            <h2 className="editor-title">Edit Profile</h2>
            
            <div className="profile-image-editor">
              <img
                src={editedUserData.profileImage}
                alt="Profile"
                className="profile-image-preview"
              />
              <button className="change-image-btn" onClick={triggerFileInput}>
                Change Image
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfileImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
            
            <div className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editedUserData.name || ''}
                  onChange={handleInputChange}
                  placeholder="Your name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editedUserData.email || ''}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={editedUserData.department || ''}
                  onChange={handleInputChange}
                  placeholder="Your department"
                />
              </div>
              
              <div className="editor-actions">
                <button className="save-btn" onClick={handleSaveProfile}>
                  Save Profile
                </button>
                <button className="cancel-btn" onClick={() => setShowProfileEditor(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showLogoutConfirm && (
          <div className="logout-confirm-overlay">
            <div className="logout-confirm-box">
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout?</p>
              <div className="logout-buttons">
                <button
                  className="confirm-btn"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? "Logging Out..." : "Yes, Logout"}
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
          </div>
        )}

        {showSuccessMessage && (
          <div className="logout-success-message">
            Successfully Logged Out!
          </div>
        )}
        
        {saveSuccess && (
          <div className="save-success-message">
            Profile updated successfully!
          </div>
        )}

        <div className="footer-content">
          <p className="copyright">Developed by <a href="https://www.linkedin.com/in/shyam--n/" className="develop-a">IoT Engineer</a></p>
          {/* <p className="copyright1" style={{flexDirection:"row"}}><a href="https://rapcodetechsolutions.netlify.app/" className="develop-aa"><img src="Frame - Copy (2).png" style={{width:"15px",height:"15px",display:"flex",margin:"auto",flexDirection:"row"}} alt="RapCode Logo"></img>RapCode Tech Solutions</a></p> */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
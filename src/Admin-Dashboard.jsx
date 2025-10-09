import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database } from "./firebase";
import { signOut } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalResumes, setTotalResumes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all users from Firebase
    const usersRef = ref(database, "users");
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        // Count total users
        const userCount = Object.keys(data).length;
        setTotalUsers(userCount);
        
        // Count users with resumes
        let resumeCount = 0;
        
        const userList = Object.entries(data).map(([userId, user]) => {
          // Check if user has a resume and count it
          const hasResume = user.resume?.downloadURL || user.resumeLink;
          if (hasResume) {
            resumeCount++;
          }
          
          // Get resume information from either location
          const resumeName = user.resume?.name || user.name || "N/A";
          const resumeURL = user.resume?.downloadURL || user.resumeLink || null;
          const resumeType = user.resumeType || user.resume?.type || null;
          const resumeFileName = user.resumeFileName || 
                                 (user.resume?.fileName ? user.resume.fileName : 
                                 (resumeName !== "N/A" ? `${resumeName}_Resume.pdf` : "N/A"));
          
          return {
            id: userId,
            name: user.name || "N/A",
            email: user.email || "N/A",
            department: user.department || "N/A",
            resumeName: resumeFileName,
            resumeURL: resumeURL,
            resumeType: resumeType,
            hasResume: hasResume,
            createdAt: user.createdAt || user.resume?.createdAt || null,
          };
        });

        // Sort users: users with resumes first, then by creation date
        userList.sort((a, b) => {
          // First sort by resume status
          if (a.hasResume && !b.hasResume) return -1;
          if (!a.hasResume && b.hasResume) return 1;
          
          // Then sort by creation date if available
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          
          return 0;
        });

        setTotalResumes(resumeCount);
        setUsers(userList);
        setLoading(false);
      } else {
        // No users found
        setUsers([]);
        setTotalUsers(0);
        setTotalResumes(0);
        setLoading(false);
      }
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    signOut(auth)
      .then(() => {
        setIsLoggingOut(false);
        setShowLogoutConfirm(false);
        setShowSuccessMessage(true);
        
        // Hide success message and navigate to login
        setTimeout(() => {
          setShowSuccessMessage(false);
          navigate("/login");
        }, 1500);
      })
      .catch((error) => {
        setIsLoggingOut(false);
        console.error("Error logging out: ", error);
      });
  };

  return (
    <div className="admin1-container">
      {/* Admin Navbar */}
      <header className="admin1-header">
        <h1>Admin Panel</h1>
        <nav>
          <button onClick={() => navigate("/admin-home")}>Admin Home</button>
          <button onClick={() => navigate("/admin-dashboard")}>Admin Dashboard</button>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="logout-btn1"
            style={{ color: "black" }}
          >
            Logout
          </button>
        </nav>
      </header>

      {/* Analytics Cards */}
      <div className="analytics-container">
        <div className="analytics-card">
          <div className="analytics-icon users-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="analytics-info">
            <h3>Total Users</h3>
            <div className="analytics-count">{totalUsers}</div>
          </div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-icon resumes-icon">
            <i className="fas fa-file-alt"></i>
          </div>
          <div className="analytics-info">
            <h3>Resumes Generated</h3>
            <div className="analytics-count">{totalResumes}</div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Box */}
      {showLogoutConfirm && (
        <div className="ad1-logout-overlay">
          <div className="ad1-logout-confirm-box">
            <p>Are you sure you want to logout?</p>
            <div className="ad1-logout-buttons">
              <button
                className="ad1-confirm-btn"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging Out..." : "Confirm"}
              </button>
              <button
                className="ad1-cancel-btn"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="ad1-logout-success-message">
          Successfully Logged Out!
        </div>
      )}

      {/* Admin Dashboard Content */}
      <div className="admin-content">
        <h1>All Registered Users</h1>
        
        {loading ? (
          <div className="loading-container">
            <p>Loading users...</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Resume Status</th>
                <th>Resume Name</th>
                <th>Resume Link</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.department}</td>
                    <td>
                      <span className={user.hasResume ? "status-badge status-active" : "status-badge status-inactive"}>
                        {user.hasResume ? "✓ Available" : "✗ Not Available"}
                      </span>
                    </td>
                    <td>
                      {user.resumeName !== "N/A" ? (
                        <span>
                          {user.resumeName}
                          {user.resumeType && (
                            <span className="resume-type-badge">
                              ({user.resumeType === 'manual' ? 'Uploaded' : 'Generated'})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="no-resume-text">-</span>
                      )}
                    </td>
                    <td>
                      {user.resumeURL ? (
                        <a
                          className="dash-resume-link"
                          href={user.resumeURL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Resume
                        </a>
                      ) : (
                        <span className="no-resume-text">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                    No users found in the database
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
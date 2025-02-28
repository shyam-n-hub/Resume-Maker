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

  useEffect(() => {
    // Fetch all users from Firebase
    const usersRef = ref(database, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.entries(data)
          .map(([userId, user]) => ({
            id: userId,
            name: user.resume?.name || "N/A",
            email: user.resume?.userEmail || "N/A",
            resumeName: user.resume?.name
              ? `${user.resume.name}_Resume.pdf`
              : "N/A",
            resumeURL: user.resume?.downloadURL || null,
          }))
          .filter((user) => user.name !== "N/A" && user.email !== "N/A"); // Remove empty users

        setUsers(userList);
      }
    });
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
            onClick={() => setShowLogoutConfirm(true)}  // Show confirmation box
            className="logout-btn1"
            style={{ color: "black" }}
          >
            Logout
          </button>
        </nav>
      </header>

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
        <h1>Registered Users & Resumes</h1>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Resume Name</th>
              <th>Resume Link</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.resumeName}</td>
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
                      <span className="no-resume-text">
                        No resume uploaded yet
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No resumes found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;

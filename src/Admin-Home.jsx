import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { useState } from "react";
import { signOut } from "firebase/auth";
import "./AdminHome.css";

function AdminHome() {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // const handleLogout = () => {
  //   auth.signOut().then(() => {
  //     navigate("/login");
  //   });
  // };

  const handleLogout = () => {
    setIsLoggingOut(true);
    signOut(auth)
      .then(() => {
        setIsLoggingOut(false);
        setShowLogoutConfirm(false);
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(true);

          // Hide the success message after a short delay and navigate to login
          setTimeout(() => {
            setShowSuccessMessage(false);
            navigate("/login");
          }, 1500);
        }, 300);
      })
      .catch((error) => {
        setIsLoggingOut(false);
        console.error("Error logging out: ", error);
      });
  };

  return (
    <div className="admin-container">
      {/* Admin Navbar */}
      <header className="admin-header">
        <h1>Admin Panel</h1>
        <nav>
          <button onClick={() => navigate("/admin-home")}>Admin Home</button>
          <button onClick={() => navigate("/admin-dashboard")}>Admin Dashboard</button>
          <button
            onClick={() => setShowLogoutConfirm(true)}  // Show confirmation box
            className="logout-btn"
            style={{ color: "black" }}
          >
            Logout
          </button>
        </nav>
      </header>

      {/* Logout Confirmation Box */}
      {showLogoutConfirm && (
        <div className="ad-logout-overlay">
          <div className="ad-logout-confirm-box">
            <p>Are you sure you want to logout?</p>
            <div className="ad-logout-buttons">
              <button
                className="ad-confirm-btn"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging Out..." : "Confirm"}
              </button>
              <button
                className="ad-cancel-btn"
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
        <div className="ad-logout-success-message">
          Successfully Logged Out!
        </div>
      )}

      {/* Admin Home Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
          padding: "0px",
          backgroundImage: 'url("back.jpg")',
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          borderRadius: "0px 0px 10px 10px",
          marginTop: "50px", // To avoid content being hidden under fixed navbar
        }}
      >
        <h1 style={{ fontSize: "3rem", color: "black", marginBottom: "10px" }}>
          Welcome to Admin Panel!
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#495057",
            textAlign: "center",
            maxWidth: "600px",
            marginBottom: "30px",
          }}
        >
          Here You Can View All Students' Updated Resumes.
        </p>
        <button
          style={{
            padding: "15px 30px",
            backgroundColor: "black",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "1rem",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onClick={() => navigate("/admin-dashboard")}
        >
          Go To Dashboard
        </button>
      </div>
    </div>
  );
}

export default AdminHome;

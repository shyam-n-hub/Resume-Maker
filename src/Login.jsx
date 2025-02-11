import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();

  const adminEmails = ["admin1@example.com", "admin2@example.com", "admin3@example.com"];

  const handleLogin = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        setMessage("Login Successful! Redirecting...");
        setTimeout(() => {
          onLogin();
          if (adminEmails.includes(email)) {
            navigate("/Admin");
          } else {
            navigate("/basicdetails");
          }
        }, 2000);
      })
      .catch(() => {
        setMessage("Incorrect email or password. Please try again.");
        setTimeout(() => setMessage(""), 4000);
      });
  };

  const handleForgotPassword = () => {
    setShowResetModal(true);
  };

  const handleResetPassword = () => {
    if (!resetEmail) {
      alert("Please enter your email address.");
      return;
    }

    sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
        setMessage("Reset password link sent! Check your email.");
        setShowResetModal(false);
        setTimeout(() => setMessage(""), 4000);
      })
      .catch((error) => {
        setMessage("Failed to send reset link. Please try again.");
        console.error("Error:", error);
        setTimeout(() => setMessage(""), 4000);
      });
  };

  return (
    <div className="loginbox">
      <form className="loginbox1" onSubmit={handleLogin}>
        <h1 className="loginh1">Login</h1>

        <input
          className="logininput"
          type="email"
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="password-container">
          <input
            className="logininput"
            type={showPassword ? "text" : "password"}
            placeholder="Enter Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="login-show">
          <label className="login-show-password">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show Password
          </label>
          <p className="forgotpasswordlink" onClick={handleForgotPassword}>
            Forgot Password?
          </p>
        </div>
        <button type="submit" className="loginbutton">
          Login
        </button>

        {message && <div className="loginmessage">{message}</div>}

        <p className="signup-link">
          Don’t have an account? <Link to="/signup">Create Account</Link>
        </p>
      </form>

      {showResetModal && (
        <div className="reset-modal">
          <div className="reset-modal-content">
            <h2>Reset Password</h2>
            <input
              type="email"
              placeholder="Enter your email for reset"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="reset-email-input"
            />
            <button className="reset-button" onClick={handleResetPassword}>
              Reset
            </button>
            <button
              className="cancel-button"
              onClick={() => setShowResetModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;

import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { auth, database } from "./firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { ref, get } from "firebase/database";
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  
  const adminEmails = [
    "abcd1234@gmail.com",
    "admin2@example.com",
    "admin3@example.com",
    "admin4@example.com",
  ];

  // Check if user is already logged in on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is already signed in, store this info
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('uid', user.uid);
        
        // Get user data from database and store in localStorage
        const userRef = ref(database, `users/${user.uid}`);
        get(userRef).then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            localStorage.setItem('userData', JSON.stringify(userData));
          }
        });
        
        // Redirect appropriately
        if (adminEmails.includes(user.email)) {
          navigate("/admin-home");
        } else {
          navigate("/basicdetails");
        }
        
        // If onLogin callback exists, call it
        if (onLogin) {
          onLogin();
        }
      } else {
        // Clear login status if no user is found
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('uid');
      }
      setCheckingAuth(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate, onLogin, adminEmails]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // First set persistence to ensure login survives page refreshes
      await setPersistence(auth, browserLocalPersistence);
      
      // Then sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store the authentication token and user ID in localStorage for extra persistence
      const token = await user.getIdToken();
      localStorage.setItem('authToken', token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('uid', user.uid);
      
      // Get user data from database and store in localStorage for quick access
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('firebaseAuthUser', JSON.stringify(userData));
      }
      
      setMessage("Login Successful! Redirecting...");
      
      setTimeout(() => {
        if (onLogin) onLogin();
        if (adminEmails.includes(email)) {
          navigate("/admin-home");
        } else {
          navigate("/basicdetails");
        }
      }, 2000);
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Incorrect email or password. Please try again.");
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForgotPassword = () => {
    setShowResetModal(true);
  };

  const handleResetPassword = () => {
    if (!resetEmail) {
      alert("Please enter your email address.");
      return;
    }

    setIsProcessing(true);
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
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  if (checkingAuth) {
    return <div className="loading-container">Checking authentication status...</div>;
  }

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
          disabled={isProcessing}
        />

        <div className="password-container">
          <input
            className="logininput"
            type={showPassword ? "text" : "password"}
            placeholder="Enter Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isProcessing}
          />
        </div>
        <div className="login-show">
          <label className="login-show-password">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              disabled={isProcessing}
            />
            Show Password
          </label>
          <p className="forgotpasswordlink" onClick={handleForgotPassword}>
            Forgot Password?
          </p>
        </div>
        <button type="submit" className="loginbutton" disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Login"}
        </button>

        {message && (
          <div
            className={`loginmessage ${
              message.includes("Successful") ? "success" : "error"
            }`}
          >
            {message}
          </div>
        )}

        <p className="signup-link">
          Don't have an account? <Link to="/signup">Create Account</Link>
        </p>
      </form>

      {/* Reset Password Modal */}
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
              disabled={isProcessing}
            />
            <button 
              className="reset-button" 
              onClick={handleResetPassword}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Reset"}
            </button>
            <button
              className="cancel-button"
              onClick={() => setShowResetModal(false)}
              disabled={isProcessing}
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
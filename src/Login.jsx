import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { auth, database } from "./firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { ref, get, set } from "firebase/database";
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
    "shyam44n@gmail.com",
    "admin2@example.com",
    "admin3@example.com",
    "admin4@example.com",
  ];

  // Initialize Google Auth Provider
  const googleProvider = new GoogleAuthProvider();

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

  const handleGoogleSignIn = async () => {
    setIsProcessing(true);
    
    try {
      // Set persistence first
      await setPersistence(auth, browserLocalPersistence);
      
      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Store authentication data
      const token = await user.getIdToken();
      localStorage.setItem('authToken', token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('uid', user.uid);
      
      // Check if user data exists in database, if not create it
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      
      let userData;
      if (!snapshot.exists()) {
        // Create new user data for Google sign-in users
        userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL || '',
          provider: 'google',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        
        // Save user data to database
        await set(userRef, userData);
      } else {
        userData = snapshot.val();
        // Update last login time
        await set(ref(database, `users/${user.uid}/lastLogin`), new Date().toISOString());
      }
      
      // Store user data in localStorage
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('firebaseAuthUser', JSON.stringify(userData));
      
      setMessage("Google Sign-in Successful! Redirecting...");
      
      setTimeout(() => {
        if (onLogin) onLogin();
        if (adminEmails.includes(user.email)) {
          navigate("/admin-home");
        } else {
          navigate("/basicdetails");
        }
      }, 2000);
      
    } catch (error) {
      console.error("Google sign-in error:", error);
      
      // Handle specific Google sign-in errors
      if (error.code === 'auth/popup-closed-by-user') {
        setMessage("Sign-in was cancelled.");
      } else if (error.code === 'auth/popup-blocked') {
        setMessage("Popup blocked. Please allow popups for this site.");
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        setMessage("An account already exists with this email using a different sign-in method.");
      } else {
        setMessage("Google sign-in failed. Please try again.");
      }
      
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

        {/* Divider */}
        <div className="login-divider">
          <span>or</span>
        </div>

        {/* Google Sign-in Button */}
        <button 
          type="button" 
          className="google-signin-button" 
          onClick={handleGoogleSignIn}
          disabled={isProcessing}
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isProcessing ? "Processing..." : "Continue with Google"}
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
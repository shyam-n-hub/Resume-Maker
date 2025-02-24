import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import React, { useState } from "react";
import { auth, database } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";

function Signup({ onSignup }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const adminEmail = "abcd1234@gmail.com";

  const handleSignup = (e) => {
    e.preventDefault();
  
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
  
        // Store user data in Firebase Realtime Database
        set(ref(database, `users/${user.uid}`), {
          name: name,
          email: email,
          profileImage: "/default-image.jpg", // Default profile image
          resumeLink: "", // Initially empty
        });
  
        setMessage("Account Created Successfully! Redirecting...");
        setTimeout(() => {
          onSignup();
          if (email === adminEmail) {
            navigate("/admin-home");
          } else {
            navigate("/basicdetails");
          }
        }, 2000);
      })
      .catch(() => {
        setMessage("Failed to create account. Please try again.");
        setTimeout(() => setMessage(""), 4000);
      });
  };
  
  return (
    <div className="signupbox">
      <form className="signupbox1" onSubmit={handleSignup}>
        <h1 className="signuph1">Signup</h1>
        <input
          className="signupinput"
          type="text"
          placeholder="Enter Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ textTransform: "uppercase" }}
        />
        <input
          className="signupinput"
          type="email"
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="password-container">
          <input
            className="signupinput"
            type={showPassword ? "text" : "password"}
            placeholder="Create Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
        </div>
        <div className="signup-show">
        <label className="signup-show-password">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show Password
          </label>
        </div>
        <button type="submit" className="signupbutton">
          Sign Up
        </button>
        {message && <div className="signupmessage">{message}</div>}
        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
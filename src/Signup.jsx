import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import React, { useState } from "react";
import { auth, database } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
// import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

function Signup({ onSignup }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const adminEmails = ["abcd1234@gmail.com", "admin2@example.com", "admin3@example.com", "admin4@example.com"];

 
  const handleSignup = (e) => {
    e.preventDefault();
  
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const defaultProfileImage = "/default-image.jpg";
       
        // Store user data in Firebase Realtime Database
        set(ref(database, `users/${user.uid}`), {
          name: name,
          email: email,
          profileImage: defaultProfileImage,
          resumeLink: "", // Auto-generate resume link
        });
  
        setMessage("Account Created Successfully! Redirecting...");
        setTimeout(() => {
          onSignup();
          if (adminEmails.includes(email)) {
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
  
  
//   const auth = getAuth();

// setPersistence(auth, browserLocalPersistence)
//   .then(() => {
//     // Proceed with sign-in
//     return signInWithEmailAndPassword(auth, email, password);
//   })
//   .catch((error) => {
//     console.error("Persistence error:", error);
//   });


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
            className="signupinput-password"
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
        {message && (
  <div className={`signupmessage ${message.includes("Successful") ? "success" : "error"}`}>
    {message}
  </div>
)}
        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
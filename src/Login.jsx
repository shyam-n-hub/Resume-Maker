// Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig.js"; 
import './index.css';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/basicdetails"); 
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-form-container">
      <h2 className="login">Login</h2>
      <form onSubmit={handleLogin} className="formsubmit">
        <input className="email"type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="email" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="submit" type="submit">Login</button>
      </form>
      <button  className="submit" onClick={() => navigate("/signup")}>Go to Signup</button>
    </div>
  );
}

export default Login;

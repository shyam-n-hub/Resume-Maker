import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebaseConfig"; // Import Firebase configuration
import { getDatabase, ref, set } from "firebase/database"; // Import Realtime Database functions

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Passwords do not match");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Save user data to Realtime Database
      const database = getDatabase();
      await set(ref(database, `users/${userId}`), {
        name: name,
        email: email,
      });

      navigate("/basicdetails"); // Redirect after signup
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-form-container">
      <h2 className="login">Signup</h2>
      <form onSubmit={handleSignup} className="formsubmit">
        <input className="email" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="email" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input className="email"
          type="password"
          placeholder="Re-enter Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button className="submit"  type="submit">Signup</button>
      </form>
      <button className="submit" onClick={() => navigate("/login")}>Go to Login</button>
    </div>
  );
}

export default Signup;

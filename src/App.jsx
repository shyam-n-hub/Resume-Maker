
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BasicDetails from "./BasicDetails";
import FullResume from "./FullResume";
import Home from "./Home";
import Login from "./Login";
import AdminHome from "./Admin-Home";
import AdminDashboard from "./Admin-Dashboard";
import Signup from "./Signup";
import Dashboard from "./Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loggedInStatus === "true");
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <Router>
      {showDashboard && <Dashboard closeDashboard={() => setShowDashboard(false)} onLogout={handleLogout} />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin-home" element={<AdminHome />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onSignup={handleLogin} />} />
        <Route path="/basicdetails" element={<BasicDetails />} />
        <Route path="/fullresume" element={<FullResume />} />
      </Routes>
    </Router>
  );
}

export default App;



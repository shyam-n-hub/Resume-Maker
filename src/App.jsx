// import React, { useState, useEffect } from "react";
// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import BasicDetails from "./BasicDetails";
// import FullResume from "./FullResume";
// import Home from "./Home";
// import { auth } from "./firebase";
// import Login from "./Login";
// import AdminHome from "./Admin-Home";
// import AdminDashboard from "./Admin-Dashboard";
// import Signup from "./Signup";
// import Dashboard from "./Dashboard";

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [showDashboard, setShowDashboard] = useState(false);

//   useEffect(() => {
//     const loggedInStatus = localStorage.getItem("isLoggedIn");
//     setIsLoggedIn(loggedInStatus === "true");
//   }, []);

//   const handleLogin = () => {
//     setIsLoggedIn(true);
//     localStorage.setItem("isLoggedIn", "true");
//   };

//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     localStorage.removeItem("isLoggedIn");
//   };

//   return (
//     <Router>
//       <header
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           padding: "10px 20px",
//           backgroundColor: "#2d3436",
//           borderRadius: "10px 10px 0px 0px",
//         }}
//       >
//         <h1 style={{ margin: 0, color: "white", fontSize: "30px" }}>Resume Maker</h1>
//         <nav style={{ display: "flex", alignItems: "center" }}>
//           <Link
//             to="/"
//             style={{
//               margin: "10px",
//               textDecoration: "none",
//               backgroundColor: "aliceblue",
//               borderRadius: "5px",
//               color: "black",
//               padding: "5px",
//               fontSize: "18px",
//             }}
//           >
//             Home
//           </Link>
//           {!isLoggedIn ? (
//             <>
//               <Link to="/signup" style={{ margin: "10px", color: "white" }}>Signup</Link>
//               <Link to="/login" style={{ margin: "10px", color: "white" }}>Login</Link>
//             </>
//           ) : (
//             <button
//               onClick={() => setShowDashboard(!showDashboard)}
//               style={{
//                 marginLeft: "10px",
//                 backgroundColor: "#007bff",
//                 color: "white",
//                 border: "none",
//                 padding: "5px 15px",
//                 borderRadius: "5px",
//                 cursor: "pointer",
//               }}
//             >
//               Profile
//             </button>
//           )}
//         </nav>
//       </header>

//       {showDashboard && <Dashboard closeDashboard={() => setShowDashboard(false)} onLogout={handleLogout} />}

//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/admin-home" element={<AdminHome />} />
//         <Route path="/admin-dashboard" element={<AdminDashboard />} />
//         <Route path="/Home" element={<Home />} />
//         <Route path="/login" element={<Login onLogin={handleLogin} />} />
//         <Route path="/signup" element={<Signup onSignup={handleLogin} />} />
//         <Route path="/basicdetails" element={<BasicDetails />} />
//         <Route path="/fullresume" element={<FullResume />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;  


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

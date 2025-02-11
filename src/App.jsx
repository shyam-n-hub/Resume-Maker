// import React, { useState, useEffect } from "react";
// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import BasicDetails from "./BasicDetails";
// import FullResume from "./FullResume";
// import Home from "./Home";
// import { auth } from "./firebase";
// import Login from "./Login";
// import Admin from "./Admin"
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
//           borderRadius: "10px",
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
//         <Route path="/Home" element={<Home />} />
//         <Route path="/Admin" element={<Admin/>} />
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
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import BasicDetails from "./BasicDetails";
import FullResume from "./FullResume";
import Home from "./Home";
import { auth } from "./firebase";
import Login from "./Login";
import Admin from "./Admin";
import Signup from "./Signup";
import Dashboard from "./Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const adminEmail = "abcd1234@gmail.com";

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        if (user.email === adminEmail) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    });
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    localStorage.removeItem("isLoggedIn");
    auth.signOut();
  };

  return (
    <Router>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          backgroundColor: "#2d3436",
          borderRadius: "10px",
        }}
      >
        <h1 style={{ margin: 0, color: "white", fontSize: "30px" }}>Resume Maker</h1>
        <nav style={{ display: "flex", alignItems: "center" }}>
          <Link
            to="/"
            style={{
              margin: "10px",
              textDecoration: "none",
              backgroundColor: "aliceblue",
              borderRadius: "5px",
              color: "black",
              padding: "5px",
              fontSize: "18px",
            }}
          >
            Home
          </Link>
          {!isLoggedIn ? (
            <>
              <Link to="/signup" style={{ margin: "10px", color: "white" }}>
                Signup
              </Link>
              <Link to="/login" style={{ margin: "10px", color: "white" }}>
                Login
              </Link>
            </>
          ) : (
            <>
              {isAdmin && (
                <Link
                  to="/Admin"
                  style={{
                    margin: "10px",
                    textDecoration: "none",
                    backgroundColor: "#007bff",
                    color: "white",
                    borderRadius: "5px",
                    padding: "5px 10px",
                  }}
                >
                  Admin-Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                style={{
                  marginLeft: "10px",
                  backgroundColor: "#e74c3c",
                  color: "white",
                  border: "none",
                  padding: "5px 15px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home isAdmin={isAdmin} />} />
        <Route path="/Home" element={<Home isAdmin={isAdmin} />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/basicdetails" element={<BasicDetails />} />
        <Route path="/fullresume" element={<FullResume />} />
      </Routes>
    </Router>
  );
}

export default App;

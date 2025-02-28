// import { useNavigate } from "react-router-dom";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "./firebase";
// import { useEffect } from "react";
// import './Home.css';

// function Home() {
//   const navigate = useNavigate();
//   const adminemail="abcd1234@gmail.com"

//   const handleNavigation = () => {
//     onAuthStateChanged(auth, (user) => {
//       if (user) {
//         if(user.email===adminemail){
//           navigate("/Admin");
//           return;
//         }
//         navigate("/basicdetails");
//       } else {
//         navigate("/login");
//       }
//     });
//   };

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//         minHeight: "100vh",
//         backgroundColor: "#f8f9fa",
//         padding: "20px",
//         backgroundImage:'url("back.jpg")',
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//         backgroundSize: "cover",
//         borderRadius: "0px 0px 10px 10px",
//       }}
//     >
//       {/* Header Text */}
//       <h1 style={{ fontSize: "3rem", color: "black", marginBottom: "10px" }}>
//         Welcome to Resume Maker!
//       </h1>

//       {/* Paragraph Description */}
//       <p
//         style={{
//           fontSize: "1.2rem",
//           color: "#495057",
//           textAlign: "center",
//           maxWidth: "600px",
//           marginBottom: "30px",
//         }}
//       >
//         This Resume Maker helps you create a professional resume with ease. 
//         Fill in your personal details, highlight your skills, and showcase your experiences. 
//         Get a beautifully formatted resume ready to download and share.
//       </p>

//       {/* Navigation Button */}
//       <button
//         style={{
//           padding: "15px 30px",
//           backgroundColor: "black",
//           color: "white",
//           border: "none",
//           borderRadius: "5px",
//           fontSize: "1rem",
//           cursor: "pointer",
//           transition: "background-color 0.3s",
//         }}
//         onClick={handleNavigation}
//         onMouseEnter={(e) => (e.target.style.backgroundColor = "rgb(39, 35, 35)")}
//         onMouseLeave={(e) => (e.target.style.backgroundColor = "black")}
//       >
//         Get Started
//       </button>
//     </div>
//   );
// }

// export default Home;

import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from "./Dashboard"; 
import "./Home.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";



function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  
  const adminemail="abcd1234@gmail.com"


  useEffect(() => {
    const storedLoginState = localStorage.getItem("isLoggedIn");
    if (storedLoginState === "true") {
      setIsLoggedIn(true);
    }
    onAuthStateChanged(auth, (user) => {
      if (user) {
        if(user.email===adminemail){
          navigate("/admin-home");
          return;
        }
        navigate("/basicdetails");
      } else {
        navigate("/login");
      }
    });
  }, []);

  

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          backgroundColor: "#2d3436",
          borderRadius: "10px 10px 0px 0px",
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
              <Link to="/signup" style={{ margin: "10px", color: "white" }}>Signup</Link>
              <Link to="/login" style={{ margin: "10px", color: "white" }}>Login</Link>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowDashboard(!showDashboard)}
                style={{
                  marginLeft: "10px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "5px 15px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Profile
              </button>
            </>
          )}
        </nav>
      </header>

      {showDashboard && (
        <Dashboard
          closeDashboard={() => setShowDashboard(false)}
          onLogout={handleLogout}
        />
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
          padding: "20px",
          backgroundImage: 'url("back.jpg")',
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          borderRadius: "0px 0px 10px 10px",
        }}
      >
        <h1 style={{ fontSize: "3rem", color: "black", marginBottom: "10px" }}>
          Welcome to Resume Maker!
        </h1>
        <p style={{
          fontSize: "1.2rem",
          color: "#495057",
          textAlign: "center",
          maxWidth: "600px",
          marginBottom: "30px",
        }}>
          This Resume Maker helps you create a professional resume with ease.
        </p>
        <button
          style={{
            padding: "15px 30px",
            backgroundColor: "black",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "1rem",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onClick={() => navigate(isLoggedIn ? "/basicdetails" : "/login")}
        >
          Get Started
        </button>
      </div>
    </>
  );
}

export default Home;

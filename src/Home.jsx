import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useEffect } from "react";
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const adminemail="abcd1234@gmail.com"

  const handleNavigation = () => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        if(user.email===adminemail){
          navigate("/Admin");
          return;
        }
        navigate("/basicdetails");
      } else {
        navigate("/login");
      }
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        padding: "20px",
        backgroundImage:'url("back.jpg")',
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        borderRadius:"10px",
      }}
    >
      {/* Header Text */}
      <h1 style={{ fontSize: "3rem", color: "black", marginBottom: "10px" }}>
        Welcome to Resume Maker!
      </h1>

      {/* Paragraph Description */}
      <p
        style={{
          fontSize: "1.2rem",
          color: "#495057",
          textAlign: "center",
          maxWidth: "600px",
          marginBottom: "30px",
        }}
      >
        This Resume Maker helps you create a professional resume with ease. 
        Fill in your personal details, highlight your skills, and showcase your experiences. 
        Get a beautifully formatted resume ready to download and share.
      </p>

      {/* Navigation Button */}
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
        onClick={handleNavigation}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "rgb(39, 35, 35)")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "black")}
      >
        Get Started
      </button>
    </div>
  );
}

export default Home;

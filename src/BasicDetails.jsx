import React, { useState, useEffect } from "react";
import { useNavigate,Link } from "react-router-dom";
import "./BasicDetails.css";
import Dashboard from "./Dashboard";

function BasicDetails() {
  const navigate = useNavigate();
  const [showDashboard, setShowDashboard] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [details, setDetails] = useState({
    name: "",
    department: "",
    phone: "",
    email: "",
    address: "",
    linkedin: "",
    github: "",
    leetcode: "",
    careerObjective: "",
    college: "",
    degree: "",
    cgpa: "",
    highSchool: "",
    school: "",
    technicalSkills: [],
    softSkills: [],
    extracurricular: [],
    interests: [],
    internships: [],
    projects: [],
    profileImage: null,
  });
  
  useEffect(() => {
      const storedLoginState = localStorage.getItem("isLoggedIn");
      if (storedLoginState === "true") {
        setIsLoggedIn(true);
      }
    }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails({ ...details, [name]: value });
  };

  const handleAddItem = (field) => {
    let items = [];
    for (let i = 0; i < 2; i++) {
      let newItem = prompt(`Enter a ${field} (at least 2 required)`);
      if (newItem) items.push(newItem);
      else return alert(`You must enter at least 2 ${field}!`);
    }
    setDetails({ ...details, [field]: [...details[field], ...items] });
  };

  const handleAddObjectItem = (field) => {
    let newItems = [];
    for (let i = 0; i < 2; i++) {
      let name = prompt(`Enter the name for ${field} (at least 2 required)`);
      let description = prompt(`Enter the description for ${field}`);
      if (name && description) newItems.push({ name, description });
      else return alert(`You must enter at least 2 ${field}!`);
    }
    setDetails({ ...details, [field]: [...details[field], ...newItems] });
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  
  const checkLoginStatus = () => {
    const storedLoginState = localStorage.getItem("isLoggedIn");
    if (storedLoginState === "true") {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      navigate("/login");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDetails({ ...details, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.setItem("isLoggedIn", "false");
    setIsLoggedIn(false);
    setShowDashboard(false);
    navigate("/login");
  };
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);


  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const form = e.target.form;
      const index = Array.from(form.elements).indexOf(e.target);
      form.elements[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const validateFields = () => {
    const requiredFields = [
      "name",
      "department",
      "phone",
      "email",
      "address",
      "linkedin",
      "github",
      "leetcode",
      "careerObjective",
      "college",
      "degree",
      "cgpa",
      "highSchool",
      "school",
    ];

    for (const field of requiredFields) {
      if (!details[field]) {
        alert(`Please fill in the ${field} field.`);
        return false;
      }
    }

    if (details.technicalSkills.length < 0) {
      alert("Please add at least two technical skills.");
      return false;
    }

    if (details.softSkills.length < 0) {
      alert("Please add at least two soft skills.");
      return false;
    }

    if (details.extracurricular.length < 0) {
      alert("Please add at least two extracurricular activities.");
      return false;
    }

    if (details.interests.length < 0) {
      alert("Please add at least two areas of interest.");
      return false;
    }

    if (details.internships.length < 0) {
      alert("Please add at least two internships.");
      return false;
    }

    if (details.projects.length < 0) {
      alert("Please add at least two projects.");
      return false;
    }

    if (!details.profileImage) {
      alert("Please upload a profile image.");
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (validateFields()) {
      navigate("/fullresume", {
        state: { ...details },
      });
    }
  };

  return (
    <div className="basicheaderfirst">
    
      <header className="header" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#2d3436",
        borderRadius: "10px 10px 0px 0px",
      }}>
        <h1 style={{ margin: 0, color: "white", fontSize: "30px" }}>Resume Maker</h1>
        <nav style={{ display: "flex", alignItems: "center" }}>
          {isLoggedIn ? (
            <>
              <Link to="/" style={{
                margin: "10px",
                textDecoration: "none",
                backgroundColor: "aliceblue",
                borderRadius: "5px",
                color: "black",
                padding: "5px",
                fontSize: "18px",
              }}>
                Home
              </Link>
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
          ) : (
            <>
              <Link to="/" style={{
                margin: "10px",
                textDecoration: "none",
                backgroundColor: "aliceblue",
                borderRadius: "5px",
                color: "black",
                padding: "5px",
                fontSize: "18px",
              }}>
                Home
              </Link>
              <Link to="/signup" style={{
                margin: "10px",
                textDecoration: "none",
                color: "white",
                fontSize: "18px",
              }}>
                Signup
              </Link>
              <Link to="/login" style={{
                margin: "10px",
                textDecoration: "none",
                color: "white",
                fontSize: "18px",
              }}>
                Login
              </Link>
            </>
          )}
        </nav>
      </header>

      {showDashboard && <Dashboard closeDashboard={() => setShowDashboard(false)} onLogout={handleLogout} />}
      <div className="basicheader">
        <div>
          <form>
            <h2 className="bheader">Enter Your Details</h2>
            <label style={{color:"Black"
            }}>
              {" "}
              Profile :
              <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="binput"
              />
            </label>
            {details.profileImage && (
              <img
                src={details.profileImage}
                alt="Profile Preview"
                style={{ width: "100px", height: "100px", borderRadius: "20%" }}
              />
            )}
            <input
              type="text"
              name="name"
              placeholder="Name"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="department"
              placeholder="Department"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="linkedin"
              placeholder="LinkedIn"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="github"
              placeholder="GitHub"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="leetcode"
              placeholder="Leetcode"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />

            <textarea
              name="careerObjective"
              className="careerobjective"
              placeholder="Career Objective"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              required
            />

            <input
              type="text"
              name="college"
              placeholder="College"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="degree"
              placeholder="Degree"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="cgpa"
              placeholder="CGPA"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="highSchool"
              placeholder="High School"
              onChange={handleChange}
              className="binput"
              required
            />
            <input
              type="text"
              name="school"
              placeholder="School"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
          </form>

          <h3 style={{color:"black", margin:"10px 0px"}}>Technical Skills</h3>
          <button
            onClick={() => handleAddItem("technicalSkills")}
            className="bbutton"
          >
            Add Skill
          </button>
          <ul>
            {details.technicalSkills.map((skill, i) => (
              <li key={i}>{skill}</li>
            ))}
          </ul>

          <h3 style={{color:"black", margin:"10px 0px"}}>Soft Skills</h3>
          <button onClick={() => handleAddItem("softSkills")} className="bbutton">
            Add Skill
          </button>
          <ul>
            {details.softSkills.map((skill, i) => (
              <li key={i}>{skill}</li>
            ))}
          </ul>

          <h3 style={{color:"black", margin:"10px 0px"}}>Extra-Curricular Activities</h3>
          <button
            onClick={() => handleAddItem("extracurricular")}
            className="bbutton"
          >
            Add Activity
          </button>
          <ul>
            {details.extracurricular.map((activity, i) => (
              <li key={i}>{activity}</li>
            ))}
          </ul>

          <h3 style={{color:"black", margin:"10px 0px"}}>Areas of Interest</h3>
          <button onClick={() => handleAddItem("interests")} className="bbutton">
            Add Interest
          </button>
          <ul>
            {details.interests.map((interest, i) => (
              <li key={i}>{interest}</li>
            ))}
          </ul>

          <h3 style={{color:"black", margin:"10px 0px"}}>Internships</h3>
          <button
            onClick={() => handleAddObjectItem("internships")}
            className="bbutton"
          >
            Add Internship
          </button>
          <ul>
            {details.internships.map((internship, i) => (
              <li key={i}>
                <strong>{internship.name}</strong>: {internship.description}
              </li>
            ))}
          </ul>

          <h3 style={{color:"black", margin:"10px 0px"}}>Projects</h3>
          <button
            onClick={() => handleAddObjectItem("projects")}
            className="bbutton"
          >
            Add Project
          </button>
          <ul>
            {details.projects.map((project, i) => (
              <li key={i}>
                <strong>{project.name}</strong>: {project.description}
              </li>
            ))}
          </ul>

          <button className="generate-button" onClick={handleSubmit}>
            Generate Resume
          </button>
        </div>
      </div>
    </div>
  );
}

export default BasicDetails;

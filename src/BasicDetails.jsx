import React, { useState, useEffect } from "react";
import { useNavigate,Link } from "react-router-dom";
import "./BasicDetails.css";
import Dashboard from "./Dashboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser} from "@fortawesome/free-solid-svg-icons";

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
    highschool: "",
    highschool1:"",
    highschool2:"",
    school: "",
    school1:"",
    school2:"",
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
    let newItem = prompt(`Enter a ${field}`);
    if (newItem) {
      setDetails({ ...details, [field]: [...details[field], newItem] });
    }
  };
   

  const handleRemoveItem = (field, index) => {
    setDetails({
      ...details,
      [field]: details[field].filter((_, i) => i !== index),
    });
  };
  
  const handleRemoveObjectItem = (field, index) => {
    setDetails((prevDetails) => ({
      ...prevDetails,
      [field]: prevDetails[field].filter((_, i) => i !== index),
    }));
  };
  
  const handleAddObjectItem = (field) => {
    if (field === "internships") {
      let name = prompt(`Enter the name for ${field}`);
      let description = prompt(`Enter the description for ${field}`);
      let startDate = prompt(`Enter the Starting Date for ${field} (YYYY-MM-DD)`);
      let endDate = prompt(`Enter the Ending Date for ${field} (YYYY-MM-DD)`);
  
      if (name && description && startDate && endDate) {
        setDetails((prevDetails) => ({
          ...prevDetails,
          [field]: [...prevDetails[field], { name, description, startDate, endDate }],
        }));
      }
    } else if (field === "projects") {
      let name = prompt("Enter the name for the project");
      let description = prompt("Enter the description for the project");
  
      if (name && description) {
        setDetails((prevDetails) => ({
          ...prevDetails,
          [field]: [...prevDetails[field], { name, description }],
        }));
      }
    }
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
      "highschool",
      "highschool1",
      "highschool2",
      "school",
      "school1",
      "school2",
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
    if (window.innerWidth < 768) {
      alert("For better visibility, please enable 'Desktop Site' in your browser settings.");
  

    }
    
    if (validateFields()) {
      navigate("/fullresume", {
        state: { ...details },
      });
    }
  };

  return (
    <div className="basicheaderfirst">
    
    <header className="headerh">
        <h1>Resume Maker</h1>
        <nav className="nav">
          <Link to="/" style={{fontSize:"16px",padding: "8px 12px",}} className="nav-home">Home</Link>

          {!isLoggedIn ? (
            <>
              <Link to="/signup">Signup</Link>
              <Link to="/login">Login</Link>
            </>
          ) : (
            <button onClick={() => setShowDashboard(!showDashboard)} className="profile-btn">
                <FontAwesomeIcon icon={faUser} title="User" />
            </button>
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
              Choose Your Profile Image:
              <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="profileinput"
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
              placeholder="First Name and Last Name"
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
              placeholder="Phone Number"
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
              placeholder="LinkedIn (Id or Link)"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="github"
              placeholder="GitHub (Id or Link)"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="leetcode"
              placeholder="Leetcode (Id or Link)"
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
              placeholder="Name Of The College"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="degree"
              placeholder="Degree (College)"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="cgpa"
              placeholder="Current CGPA only"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="highschool"
              placeholder="Name Of The School"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="highschool1"
              placeholder="School Degree (eg.. HSC)"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="highschool2"
              placeholder="Percentage with year (eg.. 76%  in 2014)"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
             <input
              type="text"
              name="school"
              placeholder="Name Of The School"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="school1"
              placeholder="School Degree (eg.. SSLC)"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="school2"
              placeholder="Percentage with year (eg.. 76%  in 2012)"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
          </form>

          <h3 style={{color:"black", margin:"10px 0px"}} className="basich3">Technical Skills</h3>
          <button
            onClick={() => handleAddItem("technicalSkills")}
            className="bbutton"
          >
            Add Skill
          </button>
          <ul>
            {details.technicalSkills.map((skill, i) => (
              <li key={i} className="bbutton-li">{skill}<span className="remove" onClick={() => handleRemoveItem("technicalSkills", i)}>✖</span></li>
            ))}
          </ul>

          <h3 style={{color:"black", margin:"10px 0px"}} className="basich3">Soft Skills</h3>
          <button onClick={() => handleAddItem("softSkills")} className="bbutton">
            Add Skill
          </button>
          <ul>
            {details.softSkills.map((skill, i) => (
              <li key={i} className="bbutton-li">{skill} <span className="remove" onClick={() => handleRemoveItem("softSkills", i)}>✖</span></li>
            ))}
          </ul>

          <h3 style={{color:"black", margin:"10px 0px"}} className="basich3">Extra-Curricular Activities</h3>
          <button
            onClick={() => handleAddItem("extracurricular")}
            className="bbutton"
          >
            Add Activity
          </button>
          <ul>
            {details.extracurricular.map((activity, i) => (
              <li key={i} className="bbutton-li">{activity}<span className="remove" onClick={() => handleRemoveItem("extracurricular", i)}>✖</span></li>
            ))}
          </ul>

          <h3 style={{color:"black", margin:"10px 0px"}} className="basich3">Areas of Interest</h3>
          <button onClick={() => handleAddItem("interests")} className="bbutton">
            Add Interest
          </button>
          <ul>
            {details.interests.map((interest, i) => (
              <li key={i} className="bbutton-li">{interest}<span className="remove" onClick={() => handleRemoveItem("interests", i)}>✖</span></li>
            ))}
          </ul>

          <h3 style={{color:"black", margin:"10px 0px"}} className="basich3">Internships / Workshops</h3>
          <button
            onClick={() => handleAddObjectItem("internships")}className="bbutton" >
            Add Internship
          </button>
          <ul>
            {details.internships.map((internship, i) => (
              <li key={i} className="bbutton-li">
                <strong>{internship.name}</strong>: {internship.description} <br />
                <em>{internship.startDate} - {internship.endDate}</em>
                <span className="remove" onClick={() => handleRemoveObjectItem("internships", i)}>✖</span></li>
            ))}
          </ul>

          <h3 style={{color:"black", margin:"10px 0px"}}className="basich3">Projects / Certifications</h3>
          <button
            onClick={() => handleAddObjectItem("projects")}
            className="bbutton"
          >
            Add Project
          </button>
          <ul>
            {details.projects.map((project, i) => (
              <li key={i} className="bbutton-li">
                <strong>{project.name}</strong>: {project.description}
                <span className="remove" onClick={() => handleRemoveObjectItem("projects", i)}>✖</span></li>
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
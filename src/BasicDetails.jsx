import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BasicDetails.css";

function BasicDetails() {
  const navigate = useNavigate();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails({ ...details, [name]: value });
  };

  const handleAddItem = (field) => {
    const newItem = prompt(`Enter a new ${field}`);
    if (newItem) {
      setDetails({ ...details, [field]: [...details[field], newItem] });
    }
  };

  const handleAddObjectItem = (field) => {
    const name = prompt(`Enter the name for ${field}`);
    const description = prompt(`Enter the description for ${field}`);
    if (name && description) {
      setDetails({
        ...details,
        [field]: [...details[field], { name, description }],
      });
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

    if (details.technicalSkills.length === 0) {
      alert("Please add at least one technical skill.");
      return false;
    }

    if (details.softSkills.length === 0) {
      alert("Please add at least one soft skill.");
      return false;
    }

    if (details.extracurricular.length === 0) {
      alert("Please add at least one extracurricular activity.");
      return false;
    }

    if (details.interests.length === 0) {
      alert("Please add at least one area of interest.");
      return false;
    }

    if (details.internships.length === 0) {
      alert("Please add at least one internship.");
      return false;
    }

    if (details.projects.length === 0) {
      alert("Please add at least one project.");
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
      <div className="basicheader">
        <div>
          <form>
            <h2 className="bheader">Enter Your Details</h2>
            <label>
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

          <h3>Technical Skills</h3>
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

          <h3>Soft Skills</h3>
          <button onClick={() => handleAddItem("softSkills")} className="bbutton">
            Add Skill
          </button>
          <ul>
            {details.softSkills.map((skill, i) => (
              <li key={i}>{skill}</li>
            ))}
          </ul>

          <h3>Extra-Curricular Activities</h3>
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

          <h3>Areas of Interest</h3>
          <button onClick={() => handleAddItem("interests")} className="bbutton">
            Add Interest
          </button>
          <ul>
            {details.interests.map((interest, i) => (
              <li key={i}>{interest}</li>
            ))}
          </ul>

          <h3>Internships</h3>
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

          <h3>Projects</h3>
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

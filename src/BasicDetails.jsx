import React, { useState } from "react";
import './BasicDetails.css';

function BasicDetails({ toggleResume, onDetailsChange }) {
  const [details, setDetails] = useState({
    name: "",
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
    profileImage: null
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
        [field]: [...details[field], { name, description }]
      });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDetails({ ...details, profileImage: reader.result }); // Set image data as base64
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


  const handleSubmit = () => {
    onDetailsChange(details);
    toggleResume();
  };

  return (
    <div className="basicheader">
      <form>
      <h2 className="header">Enter Your Details</h2>
      <label > Profile : 
      <input type="file"  onChange={handleImageUpload} accept="image/*" /></label>
      {details.profileImage && <img src={details.profileImage} alt="Profile Preview" style={{ width: '100px', height: '100px', borderRadius: '20%' }} />}
      <input type="text" name="name" placeholder="Name" onChange={handleChange} onKeyDown={handleKeyDown}/>
      <input type="text" name="department" placeholder="Department" onChange={handleChange} onKeyDown={handleKeyDown}/>
      <input type="text" name="phone" placeholder="Phone" onChange={handleChange} onKeyDown={handleKeyDown}/>
      <input type="email" name="email" placeholder="Email" onChange={handleChange} onKeyDown={handleKeyDown}/>
      <input type="text" name="address" placeholder="Address" onChange={handleChange} onKeyDown={handleKeyDown}/>
      <input type="text" name="linkedin" placeholder="LinkedIn" onChange={handleChange} onKeyDown={handleKeyDown}/>
      <input type="text" name="github" placeholder="GitHub" onChange={handleChange} onKeyDown={handleKeyDown}/>
      <input type="text" name="leetcode" placeholder="Leetcode" onChange={handleChange} onKeyDown={handleKeyDown}/>

      <textarea name="careerObjective" className="careerobjective"placeholder="Career Objective" onChange={handleChange} onKeyDown={handleKeyDown}/>

      <input type="text" name="college" placeholder="College" onChange={handleChange} onKeyDown={handleKeyDown}/>
      <input type="text" name="degree" placeholder="Degree" onChange={handleChange} onKeyDown={handleKeyDown}/>
      <input type="text" name="cgpa" placeholder="CGPA" onChange={handleChange} onKeyDown={handleKeyDown}/>
      <input type="text" name="highSchool" placeholder="High School" onChange={handleChange} />
      <input type="text" name="school" placeholder="School" onChange={handleChange} onKeyDown={handleKeyDown}/>
      </form>
      <h3>Technical Skills</h3>
      <button onClick={() => handleAddItem("technicalSkills")}>Add Skill</button>
      <ul>{details.technicalSkills.map((skill, i) => <li key={i}>{skill}</li>)}</ul>

      <h3>Soft Skills</h3>
      <button onClick={() => handleAddItem("softSkills")}>Add Skill</button>
      <ul>{details.softSkills.map((skill, i) => <li key={i}>{skill}</li>)}</ul>

      <h3>Extra-Curricular Activities</h3>
      <button onClick={() => handleAddItem("extracurricular")}>Add Activity</button>
      <ul>{details.extracurricular.map((activity, i) => <li key={i}>{activity}</li>)}</ul>

      <h3>Areas of Interest</h3>
      <button onClick={() => handleAddItem("interests")}>Add Interest</button>
      <ul>{details.interests.map((interest, i) => <li key={i}>{interest}</li>)}</ul>

      <h3>Internships</h3>
      <button onClick={() => handleAddObjectItem("internships")}>Add Internship</button>
      <ul>
        {details.internships.map((internship, i) => (
          <li key={i}>
            <strong>{internship.name}</strong>: {internship.description}
          </li>
        ))}
      </ul>

      <h3>Projects</h3>
      <button onClick={() => handleAddObjectItem("projects")}>Add Project</button>
      <ul>
        {details.projects.map((project, i) => (
          <li key={i}>
            <strong>{project.name}</strong>: {project.description}
          </li>
        ))}
      </ul>

      <button className="generate-button"  onClick={handleSubmit}>Generate Resume</button>
    </div>
  );
}

export default BasicDetails;

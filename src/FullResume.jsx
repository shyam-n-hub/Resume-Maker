import React from "react";
import './FullResume.css';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "/image.png";

function FullResume({ toggleResume, name,department, phone, email, address, linkedin, github, leetcode, careerObjective, college, degree, cgpa, highSchool, school, technicalSkills, softSkills, extracurricular, interests, internships, projects, profileImage  }) {
  const downloadResume = () => {
    const resumeElement = document.querySelector(".full-resume-container");
    html2canvas(resumeElement, { ignoreElements: el => el.tagName === 'BUTTON' }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
      pdf.save("resume.pdf");
    });
  };
  return (
    <div className="full-resume-container">
    <div className="resume-header">
      {profileImage && <img src={profileImage} alt="Profile" className="profile-pic" />}
      <div className="name">
        <h1 className="name">{name}</h1>
        <hr />
        <h2 className="name">{department}</h2>
      </div>
      <img src={logo} alt="Logo" className="resume-logo" />

    </div>
      <div className="resume-content">
        {/* Left Column */}
        <div className="left-column">
          <section className="contact-section">
            <h3>My Contact</h3>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Phone:</strong> {phone}</p>
            <p><strong>Address:</strong> {address}</p>
            <p><strong>LinkedIn:</strong> {linkedin}</p>
            <p><strong>GitHub:</strong> {github}</p>
            <p><strong>Leetcode:</strong> {leetcode}</p>
          </section>

          <section className="technical-skills-section">
            <h3>Technical Skills</h3>
            <ul>
              {technicalSkills.map((skill, index) => <li key={index}>{skill}</li>)}
            </ul>
          </section>

          <section className="soft-skills-section">
            <h3>Soft Skills</h3>
            <ul>
              {softSkills.map((skill, index) => <li key={index}>{skill}</li>)}
            </ul>
          </section>

          <section className="extra-curricular-section">
            <h3>Extra-Curricular Activities</h3>
            <ul>
              {extracurricular.map((activity, index) => <li key={index}>{activity}</li>)}
            </ul>
          </section>

          <section className="interests-section">
            <h3>Areas of Interest</h3>
            <ul>
              {interests.map((interest, index) => <li key={index}>{interest}</li>)}
            </ul>
          </section>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <section className="career-objective-section">
            <h3>Career Objective</h3>
            <p>{careerObjective}</p>
          </section>

          <section className="education-section">
            <h3>Education Background</h3>
            <p><strong>{college}</strong></p>
            <p>{degree}, CGPA: {cgpa}</p>
            <p><strong>{highSchool}</strong></p>
            <p>{school}</p>
          </section>

          <section className="internships-section">
            <h3>Internships/Workshops</h3>
            {internships.map((internship, index) => (
              <div key={index}>
                <p><strong>{internship.name}</strong></p>
                <p>{internship.description}</p>
              </div>
            ))}
          </section>

          <section className="projects-section">
            <h3>Projects/Certifications</h3>
            {projects.map((project, index) => (
              <div key={index}>
                <p><strong>{project.name}</strong></p>
                <p>{project.description}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
      <button className="btn" onClick={downloadResume}>Download Resume</button><hr></hr>
      <button onClick={toggleResume}>Back to Basic Details</button>
    </div>
  );
}

export default FullResume;

import React, { useState, useEffect } from "react";
import './FullResume.css';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "/image.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faAddressBook, faCode } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faSquareGithub } from "@fortawesome/free-brands-svg-icons";
import { storage, database } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL, updateMetadata } from "firebase/storage";
import { set, ref as dbRef } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useLocation, useNavigate } from 'react-router-dom';

function FullResume() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resumeData, setResumeData] = useState(null);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (location.state) {
      setResumeData(location.state);
    } else {
      alert("No resume details found. Please fill in your details first.");
      navigate('/basicdetails');
    }
  }, [location.state, navigate]);

  if (!resumeData) {
    return <div>Loading resume details...</div>;
  }

  const {
    name = "Your Name",
    department = "Your Department",
    phone = "N/A",
    email = "N/A",
    address = "N/A",
    linkedin = "N/A",
    github = "N/A",
    leetcode = "N/A",
    careerObjective = "No objective provided",
    college = "N/A",
    degree = "N/A",
    cgpa = "N/A",
    highSchool = "N/A",
    school = "N/A",
    technicalSkills = [],
    softSkills = [],
    extracurricular = [],
    interests = [],
    internships = [],
    projects = [],
    profileImage = null
  } = resumeData;

  const uploadAndDownloadResume = async (pdfBlob) => {
    if (!currentUser) {
      alert("User not authenticated. Please log in.");
      return;
    }

    const userId = currentUser.uid;
    const userEmail = currentUser.email;
    const storageRef = ref(storage, `resumes/${userEmail}.pdf`);
    const uploadTask = uploadBytesResumable(storageRef, pdfBlob, { contentType: "application/pdf" });

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error("Error uploading resume: ", error);
        alert("Upload failed. Please try again.");
        setLoading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(storageRef);
          console.log("Resume successfully uploaded at:", downloadURL);

          const metadata = { customMetadata: { name, userEmail } };
          await updateMetadata(storageRef, metadata);

          set(dbRef(database, `users/${userId}/resume`), { downloadURL, name, userEmail });

          alert("Resume uploaded successfully!");
          
          // Trigger the browser download
          const downloadLink = document.createElement("a");
          downloadLink.href = URL.createObjectURL(pdfBlob);
          downloadLink.download = `${name}_Resume.pdf`;
          downloadLink.click();

        } catch (error) {
          console.error("Error updating metadata: ", error);
        } finally {
          setLoading(false);
        }
      }
    );
  };
  

  const generateAndUploadResume = () => {
    const resumeElement = document.querySelector(".full-resume-container");
    const scale = 2;
    setLoading(true);

    html2canvas(resumeElement, {
      scale: scale,
      useCORS: true,
      ignoreElements: el => el.tagName === 'BUTTON',
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight > pageHeight ? pageHeight : imgHeight);
      const pdfBlob = pdf.output("blob");
      uploadAndDownloadResume(pdfBlob);
    });
  };

  const toggleResume = () => {
    navigate('/basicdetails');
  };

  return (
    <div className="area">
      <div className="full-resume-container">
        <div className="resume-header">
          {profileImage && <img src={profileImage} alt="Profile" className="profile-pic" />}
          <div className="header-name">
            <h1 className="header-name">{name}</h1>
            <br />
            <h3 className="header-subname">{department}</h3>
          </div>
          <img src={logo} alt="Logo" className="resume-logo" />
        </div>

        <div className="resume-content">
          {/* Left Column */}
          <div className="left-column">
            <section className="contact-section">
              <h2 className="resumeh2">My Contact</h2>
              <p className="word"><strong><FontAwesomeIcon icon={faEnvelope} /></strong> {email}</p>
              <p className="word"><strong><FontAwesomeIcon icon={faPhone} /></strong> {phone}</p>
              <p className="word"><strong><FontAwesomeIcon icon={faAddressBook} /></strong> {address}</p>
              <p className="word"><strong><FontAwesomeIcon icon={faLinkedin} /></strong> {linkedin}</p>
              <p className="word"><strong><FontAwesomeIcon icon={faSquareGithub} /></strong> {github}</p>
              <p className="word"><strong><FontAwesomeIcon icon={faCode} /></strong> {leetcode}</p>
            </section>

            <section className="technical-skills-section">
              <h2 className="resumeh2">Technical Skills</h2>
              <ul className="resumeul">
                {technicalSkills.map((skill, index) => <li className="resumeli" key={index}>{skill}</li>)}
              </ul>
            </section>

            <section className="soft-skills-section">
              <h2 className="resumeh2">Soft Skills</h2>
              <ul className="resumeul">
                {softSkills.map((skill, index) => <li className="resumeli" key={index}>{skill}</li>)}
              </ul>
            </section>

            <section className="extra-curricular-section">
              <h2 className="resumeh2">Extra-Curricular Activities</h2>
              <ul className="resumeul">
                {extracurricular.map((activity, index) => <li className="resumeli" key={index}>{activity}</li>)}
              </ul>
            </section>

            <section className="interests-section">
              <h2 className="resumeh2">Areas of Interest</h2>
              <ul className="resumeul">
                {interests.map((interest, index) => <li className="resumeli" key={index}>{interest}</li>)}
              </ul>
            </section>
          </div>

          {/* Right Column */}
          <div className="right-column">
            <section className="career-objective-section">
              <h2 className="resumeh2">Career Objective</h2>
              <p className="car-para">{careerObjective}</p>
            </section>

            <section className="education-section">
              <h2 className="resumeh2">Education Background</h2>
              <p className="paragraph"><strong>{college}</strong></p>
              <h5 className="para">-{degree}, CGPA: {cgpa}</h5>
              <p className="paragraph"><strong>{highSchool}</strong></p>
              <h5 className="para">-{school}</h5>
            </section>

            <section className="internships-section">
              <h2 className="resumeh2">Internships/Workshops</h2>
              {internships.map((internship, index) => (
                <div key={index}>
                  <p className="paragraph"><strong>{internship.name}</strong></p>
                  <h5 className="para">{internship.description}</h5>
                </div>
              ))}
            </section>

            <section className="projects-section">
              <h2 className="resumeh2">Projects/Certifications</h2>
              {projects.map((project, index) => (
                <div key={index}>
                  <p className="paragraph"><strong>{project.name}</strong></p>
                  <h5 className="para">{project.description}</h5>
                </div>
              ))}
            </section>
          </div>
        </div>

        <div className="vv"></div>
        <button className="btn" onClick={generateAndUploadResume} disabled={loading}>
          {loading ? `Uploading... ${Math.round(uploadProgress)}%` : "Download Resume"}
        </button>
        <hr />
        <button className="back-to-generate-button" onClick={toggleResume}>Back to Basic Details</button>
      </div>
    </div>
  );
}

export default FullResume;


/* so second thing is give the same functionality and methods with ui of header/navbar code to  fullresume code also*/
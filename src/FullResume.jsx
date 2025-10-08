import React, { useState, useEffect } from "react";
import "./FullResume.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "/pngegg.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faLocationDot,
  faCode,
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons";
import { storage, database } from "./firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  updateMetadata,
} from "firebase/storage";
import { set, ref as dbRef, get, update } from "firebase/database";
import { getAuth, onAuthStateChanged, setPersistence, browserSessionPersistence } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";

function FullResume() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resumeData, setResumeData] = useState(null);
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [showConfirmBox, setShowConfirmBox] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Set stronger persistence and handle auth state changes
  useEffect(() => {
    const auth = getAuth();
    
    // Set persistent auth session
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        console.log("Set persistence successful");
      })
      .catch((error) => {
        console.error("Error setting persistence:", error);
      });
      
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoadingAuth(false);
      setCurrentUser(user);
      
      if (!user) {
        console.log("No authenticated user found");
        const savedResumeData = sessionStorage.getItem('resumeData');
        if (!savedResumeData) {
          alert("Please log in to continue.");
          navigate("/login", { state: { returnPath: '/fullresume' }});
        }
      } else {
        console.log("User authenticated:", user.email);
        if (!resumeData) {
          loadResumeData();
        }
      }
    });
  
    return () => unsubscribe();
  }, [navigate]);
  
  const loadResumeData = () => {
    if (location.state) {
      setResumeData(location.state);
      sessionStorage.setItem('resumeData', JSON.stringify(location.state));
      return;
    }
    
    const savedData = sessionStorage.getItem('resumeData');
    if (savedData) {
      try {
        setResumeData(JSON.parse(savedData));
        return;
      } catch (error) {
        console.error("Error parsing saved resume data:", error);
      }
    }
    
    if (currentUser) {
      const userRef = dbRef(database, `users/${currentUser.uid}/resumeData`);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setResumeData(data);
          sessionStorage.setItem('resumeData', JSON.stringify(data));
        } else {
          alert("No resume details found. Please fill in your details first.");
          navigate("/basicdetails");
        }
      }).catch(error => {
        console.error("Error fetching resume data:", error);
        alert("Error loading your resume. Please try again.");
      });
    } else {
      alert("No resume details found. Please fill in your details first.");
      navigate("/basicdetails");
    }
  };

  const saveResumeData = (newData) => {
    setResumeData(newData);
    sessionStorage.setItem('resumeData', JSON.stringify(newData));
    
    if (currentUser) {
      const userRef = dbRef(database, `users/${currentUser.uid}/resumeData`);
      set(userRef, newData).catch(error => {
        console.error("Error saving resume data:", error);
      });
    }
  };

  useEffect(() => {
    if (!isLoadingAuth && !resumeData) {
      loadResumeData();
    }
  }, [isLoadingAuth, resumeData, location.state, navigate]);

  const handleEdit = (field, index = null) => {
    const isConfirmed = window.confirm("Are you sure you want to edit this?");
    if (isConfirmed) {
      const newValue = prompt("Enter new value:", resumeData[field]);
      if (newValue !== null) {
        const updatedData = {...resumeData};
        if (index !== null) {
          const updatedArray = [...updatedData[field]];
          updatedArray[index] = newValue;
          updatedData[field] = updatedArray;
        } else {
          updatedData[field] = newValue;
        }
        saveResumeData(updatedData);
      }
    }
  };

  const handleEditInternship = (index, field) => {
    const confirmEdit = window.confirm("Do you want to edit this field?");
    if (confirmEdit) {
      const newValue = prompt("Enter new value:");
      if (newValue) {
        const updatedData = {...resumeData};
        const updatedInternships = [...updatedData.internships];
        updatedInternships[index] = {
          ...updatedInternships[index],
          [field]: newValue,
        };
        updatedData.internships = updatedInternships;
        saveResumeData(updatedData);
      }
    }
  };

  const handleEditProject = (index, field) => {
    const confirmEdit = window.confirm("Do you want to edit this field?");
    if (confirmEdit) {
      const newValue = prompt("Enter new value:");
      if (newValue) {
        const updatedData = {...resumeData};
        const updatedProjects = [...updatedData.projects];
        updatedProjects[index] = {
          ...updatedProjects[index],
          [field]: newValue,
        };
        updatedData.projects = updatedProjects;
        saveResumeData(updatedData);
      }
    }
  };

  if (isLoadingAuth) {
    return <div className="loading-container">Checking authentication...</div>;
  }

  if (!resumeData) {
    return <div className="loading-container">Loading resume details...</div>;
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
    highschool = "N/A",
    highschool1 = "N/A",
    highschool2 = "N/A",
    school = "N/A",
    school1 = "N/A",
    school2 = "N/A",
    technicalSkills = [],
    softSkills = [],
    extracurricular = [],
    interests = [],
    internships = [],
    projects = [],
    profileImage = null,
  } = resumeData;

  const uploadAndDownloadResume = async (pdfBlob) => {
    if (!currentUser) {
      alert("User not authenticated. Please log in.");
      navigate("/login", { state: { returnPath: '/fullresume' }});
      return;
    }

    const userId = currentUser.uid;
    const userEmail = currentUser.email;
    const fileName = `${name.replace(/\s+/g, '_')}_Resume_${Date.now()}.pdf`;
    const storageRef = ref(storage, `resumes/${userId}/${fileName}`);
    
    const uploadTask = uploadBytesResumable(storageRef, pdfBlob, {
      contentType: "application/pdf",
    });

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

          const metadata = { 
            customMetadata: { 
              name, 
              userEmail,
              createdAt: new Date().toISOString()
            } 
          };
          await updateMetadata(storageRef, metadata);

          await set(dbRef(database, `users/${userId}/resume`), {
            downloadURL,
            name,
            userEmail,
            fileName,
            createdAt: new Date().toISOString()
          });

          await update(dbRef(database, `users/${userId}`), {
            resumeLink: downloadURL
          });

          alert("Resume generated and uploaded successfully!");

          const downloadLink = document.createElement("a");
          downloadLink.href = URL.createObjectURL(pdfBlob);
          downloadLink.download = fileName;
          downloadLink.click();
        } catch (error) {
          console.error("Error updating metadata: ", error);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  // IMPROVED PDF GENERATION - Fixed multi-page support
  const generateAndUploadResume = () => {
    const resumeElement = document.querySelector(".full-resume-container");
    if (!resumeElement) {
      alert("Error: Resume content not found.");
      return;
    }

    setLoading(true);
    
    // Hide edit buttons during capture
    document.querySelectorAll('.full-resume-container button').forEach(btn => {
      btn.style.display = 'none';
    });
    
    // Temporarily remove fixed height to capture full content
    const originalHeight = resumeElement.style.height;
    resumeElement.style.height = 'auto';
    
    const originalBackgroundColor = resumeElement.style.backgroundColor;
    resumeElement.style.backgroundColor = '#ffffff';
    
    // Use scrollHeight to get the actual full height of content
    const fullHeight = resumeElement.scrollHeight;
    
    html2canvas(resumeElement, {
      scale: 2.5, // Good balance between quality and file size
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
      height: fullHeight,
      windowHeight: fullHeight,
      scrollX: 0,
      scrollY: -window.scrollY,
      ignoreElements: (element) => {
        return element.tagName === 'BUTTON';
      },
      onclone: (clonedDoc) => {
        const clonedElem = clonedDoc.querySelector('.full-resume-container');
        if (clonedElem) {
          // Remove height constraint in cloned document
          clonedElem.style.height = 'auto';
          clonedElem.style.minHeight = 'auto';
          
          clonedElem.querySelectorAll('button').forEach(btn => btn.style.display = 'none');
          
          clonedElem.querySelectorAll('.svg-inline--fa').forEach(icon => {
            icon.style.width = '1em';
            icon.style.height = '1em';
            icon.style.verticalAlign = 'middle';
            icon.style.display = 'inline-block';
            
            if (!icon.getAttribute('viewBox')) {
              icon.setAttribute('viewBox', '0 0 512 512');
            }
            
            icon.querySelectorAll('path').forEach(path => {
              path.style.fill = 'currentColor';
            });
          });
        }
      }
    })
    .then((canvas) => {
      // Restore original state
      resumeElement.style.height = originalHeight;
      resumeElement.style.backgroundColor = originalBackgroundColor;
      document.querySelectorAll('.full-resume-container button').forEach(btn => {
        btn.style.display = '';
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // A4 dimensions in mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = 210; // A4 width
      const pdfHeight = 297; // A4 height
      
      // Calculate image dimensions to fit PDF width
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Set PDF properties
      pdf.setProperties({
        title: `${name} - Resume`,
        subject: 'Resume',
        author: name,
        keywords: 'resume, cv, job application',
        creator: 'Resume Maker App'
      });

      // Add pages dynamically based on content height
      let heightLeft = imgHeight;
      let position = 0;
      let pageCount = 0;
      
      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, null, 'FAST');
      heightLeft -= pdfHeight;
      pageCount++;
      
      // Add additional pages if content exceeds one page
      while (heightLeft > 0) {
        position = -(pdfHeight * pageCount);
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, null, 'FAST');
        heightLeft -= pdfHeight;
        pageCount++;
      }
      
      console.log(`Generated PDF with ${pageCount} page(s)`);
      
      const pdfOutput = pdf.output('blob');
      uploadAndDownloadResume(pdfOutput);
    })
    .catch((error) => {
      console.error("Error generating PDF:", error);
      
      // Restore original state
      resumeElement.style.height = originalHeight;
      resumeElement.style.backgroundColor = originalBackgroundColor;
      document.querySelectorAll('.full-resume-container button').forEach(btn => {
        btn.style.display = '';
      });
      
      alert("Failed to generate the resume. Please try again.");
      setLoading(false);
    });
  };

  const handleGoBack = () => {
    sessionStorage.removeItem('resumeData');
    navigate("/basicdetails");
  };

  const styles = {
    fontFamily: "'Calibri', 'Helvetica', 'Arial', sans-serif",
  };

  const iconStyles = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "16px",
    height: "16px",
    marginRight: "8px",
    verticalAlign: "middle",
  };

  return (
    <div className="area">
      <div>
        <div className="full-resume-container">
          <div className="resume-header">
            {profileImage && (
              <img src={profileImage} alt="Profile" className="profile-pic" />
            )}
            <div
              className={`resume-text ${
                name.length > 15 ? "normal-position" : "centered-container"
              }`}
            >
              <h1 onClick={() => handleEdit("name")} className="header-name">
                {name}
              </h1>
              <h3
                onClick={() => handleEdit("department")}
                className="header-subname"
              >
                {department}
              </h3>
            </div>
            <img src={logo} alt="Logo" className="resume-logo" />
          </div>

          <div className="resume-content" style={{ width: "100%" }}>
            {/* Left Column */}
            <div className="left-column" style={{ width: "20%" }}>
              <section className="contact-section" style={styles}>
                <h2 className="resumeh2">My Contact</h2>
                <p
                  className="word"
                  onClick={() => handleEdit("email")}
                  style={styles}
                >
                  <div className="icon-container" style={{ display: "flex", alignItems: "center" }}>
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      style={{
                        ...iconStyles,
                        fontSize: "14px",
                      }}
                      fixedWidth
                    />
                    <span style={{ paddingLeft: "5px", margin:"7px 0px 3px 0px", fontSize: "17px" }}>
                      {email}
                    </span>
                  </div>
                </p>
                <p
                  className="word"
                  onClick={() => handleEdit("phone")}
                  style={styles}
                >
                  <div className="icon-container" style={{ display: "flex", alignItems: "center" }}>
                    <FontAwesomeIcon
                      icon={faPhone}
                      style={{
                        ...iconStyles,
                        fontSize: "14px",
                      }}
                      fixedWidth
                    />
                    <span style={{ paddingLeft: "5px", margin:"4px 0px 3px 0px", fontSize: "17px"  }}>
                      + 91 - {phone}
                    </span>
                  </div>
                </p>
                <p
                  className="word2"
                  onClick={() => handleEdit("address")}
                  style={styles}
                >
                  <div className="icon-container" style={{ display: "flex", alignItems: "flex-start" }}>
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      style={{
                        ...iconStyles,
                        fontSize: "14px",
                        marginTop: "4px",
                      }}
                      fixedWidth
                    />
                    <span
                      style={{
                        display: "inline-block",
                        maxWidth: "250px",
                        paddingLeft: "5px",
                        margin:"3px 0px 3px 0px" , fontSize: "17px"
                      }}
                    >
                      {address}
                    </span>
                  </div>
                </p>

                <p
                  className="word"
                  onClick={() => handleEdit("linkedin")}
                  style={styles}
                >
                  <div className="icon-container" style={{ display: "flex", alignItems: "center" }}>
                    <FontAwesomeIcon
                      icon={faLinkedin}
                      style={{
                        ...iconStyles,
                        fontSize: "14px",
                      }}
                      fixedWidth
                    />
                    <span
                      style={{
                        display: "inline-block",
                        maxWidth: "250px",
                        paddingLeft: "5px",
                        margin:"4px 0px 3px 0px" , fontSize: "17px"
                      }}
                    >
                      LinkedIn: {linkedin}
                    </span>
                  </div>
                </p>
                <p
                  className="word"
                  onClick={() => handleEdit("github")}
                  style={styles}
                >
                  <div className="icon-container" style={{ display: "flex", alignItems: "center" }}>
                    <FontAwesomeIcon
                      icon={faGithub}
                      style={{
                        ...iconStyles,
                        fontSize: "15px",
                      }}
                      fixedWidth
                    />
                    <span
                      style={{
                        display: "inline-block",
                        maxWidth: "250px",
                        paddingLeft: "5px",
                        margin:"4px 0px 3px 0px" , fontSize: "17px"
                      }}
                    >
                      GitHub: {github}
                    </span>
                  </div>
                </p>
                <p
                  className="word"
                  onClick={() => handleEdit("leetcode")}
                  style={styles}
                >
                  <div className="icon-container" style={{ display: "flex", alignItems: "center" }}>
                    <FontAwesomeIcon
                      icon={faCode}
                      style={{
                        ...iconStyles,
                        fontSize: "15px",
                      }}
                      fixedWidth
                    />
                    <span
                      style={{
                        display: "inline-block",
                        maxWidth: "250px",
                        paddingLeft: "5px", fontSize: "17px"
                      }}
                    >
                      Leetcode: {leetcode}
                    </span>
                  </div>
                </p>
              </section>

              <section className="technical-skills-section" style={styles}>
                <h2 className="resumeh2tech" style={styles}>Technical Skills</h2>
                <ul className="resumeul" style={styles}>
                  {technicalSkills.map((skill, index) => (
                    <li style={styles}
                      id="ul-li"
                      className="resumeli"
                      key={index}
                      onClick={() => handleEdit("technicalSkills", index)}
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="soft-skills-section" style={styles}>
                <h2 className="resumeh2soft"style={styles}>Soft Skills</h2>
                <ul className="resumeul"style={styles}>
                  {softSkills.map((skill, index) => (
                    <li style={styles}
                    id="ul-li"
                      className="resumeli"
                      key={index}
                      onClick={() => handleEdit("softSkills", index)}
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="extra-curricular-section" style={styles}>
                <h2 className="resumeh2e" style={styles}>Extra-Curricular Activities</h2>
                <ul className="resumeul" style={styles}>
                  {extracurricular.map((activity, index) => (
                    <li style={styles}
                    id="ul-li"
                      className="resumeli"
                      key={index}
                      onClick={() => handleEdit("extracurricular", index)}
                    >
                      {activity}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="interests-section" style={styles}>
                <h2 className="resumeh2" >Areas of Interest</h2>
                <ul className="resumeul" style={styles}>
                  {interests.map((interest, index) => (
                    <li style={styles}
                    id="ul-li"
                      className="resumeli"
                      key={index}
                      onClick={() => handleEdit("interests", index)}
                    >
                      {interest}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Right Column */}
            <div className="right-column" style={{ width: "80%" }}>
              <section className="career-objective-section" style={styles}>
                <h2 className="resumeh2car" style={styles}>Career Objective</h2>
                <p style={styles}
                  className="car-para"
                  onClick={() => handleEdit("careerObjective")}
                >
                  {careerObjective}
                </p>
              </section>

              <section className="education-section" style={styles}>
                <h2 className="resumeh2car" style={styles}>Education Background</h2>
                
                <h3 className="para" onClick={() => handleEdit("degree")} >{degree} 
                </h3>

                <h4 className="para1" onClick={() => handleEdit("college") } style={styles}> {college}
                </h4>

                <h4 style={styles} className="para1" onClick={() => handleEdit("cgpa")}>{" "}Pursuing with {cgpa} CGPA
                </h4>
                
                <h3   className="para" onClick={() => handleEdit("highschool1")}>{highschool1}
                </h3>

                <h4 style={{fontStyle:"normal"} } className="para1" onClick={() => handleEdit("highschool")}>{highschool}
                </h4>

                <h4 style={styles} className="para1" onClick={() => handleEdit("highschool2")}>Completed with {highschool2}
                </h4>

                
                <h3  className="para" onClick={() => handleEdit("school1")}>{school1}
                </h3>

                <h4 style={styles} className="para1" onClick={() => handleEdit("school")}>{school}
                </h4>

                <h4 style={styles} className="para1" onClick={() => handleEdit("school2")}>Completed with {school2}
                </h4>
              </section>

              <section className="internships-section" style={styles}>
                <h2 className="resumeh2car" style={styles}>Internships/Workshops</h2>
                {internships.map((internship, index) => (
                  <div key={index}>
                    <p style={styles}
                      className="para"
                      onClick={() => handleEditInternship(index, "name")}
                    >
                      <strong>{internship.name}</strong>
                    </p>
                    <h5  
                      className="parain"
                      onClick={() => handleEditInternship(index, "description")}
                    >
                      {internship.description}
                    </h5>
                    {internship.date && (
                      <p style={styles}
                        className="parain1"
                        onClick={() => handleEditInternship(index, "date")}
                      >
                        {internship.date}
                      </p>
                    )}
                  </div>
                ))}
              </section>

              <section className="projects-section" style={styles}>
                <h2 className="resumeh2pro" style={styles}>Projects/Certifications</h2>
                {projects.map((project, index) => (
                  <div key={index}>
                    <p style={styles}
                      className="parapro"
                      onClick={() => handleEditProject(index, "name")}
                    >
                      <strong>{project.name}</strong>
                    </p>
                    <h5 style={styles}
                      className="parapro1"
                      onClick={() => handleEditProject(index, "description")}
                    >
                      {project.description}
                    </h5>
                  </div>
                ))}
              </section>
            </div>
          </div>
          <div className="vv"></div>
        </div>

        <div className="fotter-r">
          <button
            className="btn"
            onClick={generateAndUploadResume}
            disabled={loading}
          >
            {loading
              ? `Please Wait... ${Math.round(uploadProgress)}%`
              : "Download Resume"}
          </button>
          <button
            className="back-to-generate-button"
            onClick={() => setShowConfirmBox(true)}
          >
            Back to Create New Resume
          </button>

          {showConfirmBox && (
            <div className="confirm-overlay">
              <div className="confirm-box">
                <p>If you go back, you will need to enter all details again.</p>
                <div className="confirm-buttons">
                  <button className="confirm-btn" onClick={handleGoBack}>
                    Go Back
                  </button>
                  <button className="cancel-btn" onClick={() => setShowConfirmBox(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FullResume;
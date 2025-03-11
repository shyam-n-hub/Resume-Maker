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
  faDesktop,
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons";
import { storage, database } from "./firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  updateMetadata,
} from "firebase/storage";
import { set, ref as dbRef, get } from "firebase/database";
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
  const [isMobileView, setIsMobileView] = useState(false);
  const [isDesktopMode, setIsDesktopMode] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobileView = () => {
      const width = window.innerWidth;
      setIsMobileView(width < 768); // Common breakpoint for mobile devices
    };

    // Initial check
    checkMobileView();

    // Add event listener to update on resize
    window.addEventListener('resize', checkMobileView);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

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
        // Try to recover resume data from sessionStorage before redirecting
        const savedResumeData = sessionStorage.getItem('resumeData');
        if (!savedResumeData) {
          alert("Please log in to continue.");
          navigate("/login", { state: { returnPath: '/fullresume' }});
        }
      } else {
        console.log("User authenticated:", user.email);
        // If resumeData doesn't exist yet, try to load from location state or session storage
        if (!resumeData) {
          loadResumeData();
        }
      }
    });
  
    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [navigate]);
  
  // Load resume data from various sources
  const loadResumeData = () => {
    // First try to get from location state
    if (location.state) {
      setResumeData(location.state);
      // Save to session storage as backup
      sessionStorage.setItem('resumeData', JSON.stringify(location.state));
      return;
    }
    
    // Then try to get from session storage
    const savedData = sessionStorage.getItem('resumeData');
    if (savedData) {
      try {
        setResumeData(JSON.parse(savedData));
        return;
      } catch (error) {
        console.error("Error parsing saved resume data:", error);
      }
    }
    
    // If user is logged in, try to fetch from database
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
      // Last resort - if all else fails
      alert("No resume details found. Please fill in your details first.");
      navigate("/basicdetails");
    }
  };

  // Switch to desktop view
  const switchToDesktopView = () => {
    if (isMobileView) {
      // Set viewport meta tag to use desktop width
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=1024, initial-scale=0.5');
      } else {
        // Create viewport meta if it doesn't exist
        const newViewport = document.createElement('meta');
        newViewport.setAttribute('name', 'viewport');
        newViewport.setAttribute('content', 'width=1024, initial-scale=0.5');
        document.head.appendChild(newViewport);
      }
      
      // Add class to body for additional styling
      document.body.classList.add('desktop-mode');
      
      // Update state
      setIsDesktopMode(true);
      
      // Store preference in localStorage
      localStorage.setItem('preferDesktopView', 'true');
    }
  };
  
  // Switch back to mobile view
  const switchToMobileView = () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
    }
    
    document.body.classList.remove('desktop-mode');
    setIsDesktopMode(false);
    localStorage.setItem('preferDesktopView', 'false');
  };

  // Check for stored preference on component mount
  useEffect(() => {
    const preferDesktop = localStorage.getItem('preferDesktopView') === 'true';
    if (preferDesktop && isMobileView) {
      switchToDesktopView();
    }
  }, [isMobileView]);

  // Save resumeData changes to both state, session storage and database
  const saveResumeData = (newData) => {
    setResumeData(newData);
    sessionStorage.setItem('resumeData', JSON.stringify(newData));
    
    // Save to database if user is logged in
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
    const storageRef = ref(storage, `resumes/${userEmail}.pdf`);
    const uploadTask = uploadBytesResumable(storageRef, pdfBlob, {
      contentType: "application/pdf",
    });

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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

          set(dbRef(database, `users/${userId}/resume`), {
            downloadURL,
            name,
            userEmail,
          });

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
    const lastElement = document.querySelector(".vv"); // Ensure we capture up to this

    if (!resumeElement || !lastElement) {
      alert("Error: Resume container or last section not found.");
      return;
    }

    setLoading(true);

    // Dynamically calculate the exact height up to `.vv` (including its border)
    const resumeHeight =
      lastElement.offsetTop +
      lastElement.offsetHeight -
      resumeElement.offsetTop;

    html2canvas(resumeElement, {
      scale: 3, // High-quality scaling
      useCORS: true,
      logging: false,
      ignoreElements: (el) => el.tagName === "BUTTON",
      height: resumeHeight, // Capture only up to `.vv`
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/jpeg", 1.0); // High-quality image
        const pdf = new jsPDF("p", "mm", "a4");

        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight, "", "FAST");

        const pdfBlob = pdf.output("blob");
        uploadAndDownloadResume(pdfBlob);
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
        alert("Failed to generate the resume. Try again.");
      });
  };

  const handleGoBack = () => {
    // Clear session storage to prevent old data reappearing
    sessionStorage.removeItem('resumeData');
    navigate("/basicdetails"); // Navigates back to BasicDetails
  };

  const styles = {
    fontFamily: "'Poppins', sans-serif",
  };

  return (
    <div className="area">
      {isMobileView && (
        <div className="view-mode-toggle">
          {isDesktopMode ? (
            <button className="switch-view-btn" onClick={switchToMobileView}>
              <FontAwesomeIcon icon={faPhone} className="view-icon" /> Switch to Mobile View
            </button>
          ) : (
            <button className="switch-view-btn" onClick={switchToDesktopView}>
              <FontAwesomeIcon icon={faDesktop} className="view-icon" /> Switch to Desktop View
            </button>
          )}
        </div>
      )}
      
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
                  <strong>
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      style={{ fontSize: "18px", paddingRight: "5px",display:"flex",gap:"5px", marginTop:"4px" }}
                    />
                  </strong>{" "}
                  <span style={{paddingLeft:"5px", fontFamily: 'Poppins, sans-serif',}}>
                  {email}</span>
                </p>
                <p
                  className="word"
                  onClick={() => handleEdit("phone")}
                  style={styles}
                >
                  <strong>
                    <FontAwesomeIcon
                      icon={faPhone}
                      style={{ fontSize: "16px", paddingRight: "5px" , display:"flex",gap:"5px", marginTop:"4px"}}
                    />
                  </strong>{" "}                  <span style={{paddingLeft:"5px", fontFamily: 'Poppins, sans-serif',}}>

                  + 91 -{phone}</span>
                </p>
                <p
                  className="word2"
                  onClick={() => handleEdit("address")}
                  style={styles}
                >
                  <strong>
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      style={{
                        fontSize: "20px",
                        paddingRight: "10px",
                        marginTop: "0px",
                        fontFamily: 'Poppins, sans-serif',
                        marginTop:"4px"
                      }}
                    />
                  </strong>{" "}
                  <span
                    style={{
                      display: "inline-block",
                      maxWidth: "250px",
                      marginTop: "5px",
                      fontFamily: 'Poppins, sans-serif',
                      marginTop:"4px"
                    }}
                  
                  >
                    {address}
                  </span>
                </p>

                <p
                  className="word"
                  onClick={() => handleEdit("linkedin")}
                  style={styles}
                >
                  <strong>
                    <FontAwesomeIcon
                      icon={faLinkedin}
                      style={{
                        fontSize: "22px",
                        paddingRight: "10px",
                        marginTop: "0px",
                        fontFamily: 'Poppins, sans-serif',
                        marginTop:"8px"
                      }}
                    />
                  </strong>{" "}
                  <span
                    style={{
                      display: "inline-block",
                      maxWidth: "250px",
                      marginTop: "5px",
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  
                  >
                  LinkedIn: {linkedin}</span>
                </p>
                <p
                  className="word"
                  onClick={() => handleEdit("github")}
                  style={styles}
                >
                  <strong>
                    <FontAwesomeIcon
                      icon={faGithub}
                      style={{
                        fontSize: "20px",
                        paddingRight: "10px",
                        marginTop: "0px",
                        fontFamily: 'Poppins, sans-serif',
                         marginTop:"8px"
                      }}                    />
                  </strong>{" "}
                  <span
                    style={{
                      display: "inline-block",
                      maxWidth: "250px",
                      marginTop: "5px",
                      fontFamily: 'Poppins, sans-serif',
                       marginTop:"8px"
                    }}
                  
                  >
                  GitHub: {github}</span>
                </p>
                <p
                  className="word"
                  onClick={() => handleEdit("leetcode")}
                  style={styles}
                >
                  <strong>
                    <FontAwesomeIcon
                      icon={faCode}
                      style={{
                        fontSize: "15px",
                        paddingRight: "10px",
                        fontFamily: 'Poppins, sans-serif',
                        marginTop:"4px",
                      }}                    />
                  </strong>{" "}
                  <span
                    style={{
                      display: "inline-block",
                      maxWidth: "250px",
                      marginTop: "5px",
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  
                  >
                  Leetcode: {leetcode}</span>
                </p>
              </section>

              <section className="technical-skills-section" style={styles}>
                <h2 className="resumeh2" style={styles}>Technical Skills</h2>
                <ul className="resumeul" style={styles}>
                  {technicalSkills.map((skill, index) => (
                    <li style={styles}
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
                <h2 className="resumeh2"style={styles}>Soft Skills</h2>
                <ul className="resumeul"style={styles}>
                  {softSkills.map((skill, index) => (
                    <li style={styles}
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
                <p className="paragraph" onClick={() => handleEdit("college")} style={styles}>
                  <strong>{college}</strong>
                </p>
                <h5 className="para" onClick={() => handleEdit("degree")}  style={{ fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }}>
                  {degree}
                </h5>
                <h5 style={styles} className="para1" onClick={() => handleEdit("degree")}>
                  {" "}
                  Pursuing with {cgpa} CGPA
                </h5>
                <p style={styles}
                  className="paragraph"
                  onClick={() => handleEdit("highschool")}
                >
                  <strong>{highschool}</strong>
                </p>
                <h5   style={{ fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }} className="para" onClick={() => handleEdit("highschool1")}>
                  {highschool1}
                </h5>
                <h5 style={styles} className="para1" onClick={() => handleEdit("highschool2")}>
                Completed with {highschool2} 
                </h5>

                <p style={styles} className="paragraph" onClick={() => handleEdit("school")}>
                  <strong>{school}</strong>
                </p>
                <h5  style={{ fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }} className="para" onClick={() => handleEdit("school1")}>
                  {school1}
                </h5>
                <h5 style={styles} className="para1" onClick={() => handleEdit("school2")}>
                Completed with {school2} 
                </h5>
              </section>

              <section className="internships-section" style={styles}>
                <h2 className="resumeh2car" style={styles}>Internships/Workshops</h2>
                {internships.map((internship, index) => (
                  <div key={index}>
                    <p style={styles}
                      className="paragraph"
                      onClick={() => handleEditInternship(index, "name")}
                    >
                      <strong>{internship.name}</strong>
                    </p>
                    <h5  style={{ fontFamily: 'Poppins, sans-serif', fontStyle: 'italic' }}
                      className="parain"
                      onClick={() => handleEditInternship(index, "description")}
                    >
                      {internship.description}
                    </h5>
                    <p  style={styles}
                      className="parain1"
                      onClick={() => handleEditInternship(index, "startDate")}
                    >
                        {internship.startDate} - {internship.endDate}
                    
                    </p>
                  </div>
                ))}
              </section>

              <section className="projects-section" style={styles}>
                <h2 className="resumeh2car" style={styles}>Projects/Certifications</h2>
                {projects.map((project, index) => (
                  <div key={index}>
                    <p style={styles}
                      className="paragraph"
                      onClick={() => handleEditProject(index, "name")}
                    >
                      <strong>{project.name}</strong>
                    </p>
                    <h5 style={styles}
                      className="para"
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
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./BasicDetails.css";
import Dashboard from "./Dashboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "./firebase";
import { ref, set, get, child } from "firebase/database";

function BasicDetails() {
  const navigate = useNavigate();
  const [showDashboard, setShowDashboard] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
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
    highschool1: "",
    highschool2: "",
    school: "",
    school1: "",
    school2: "",
    technicalSkills: [],
    softSkills: [],
    extracurricular: [],
    interests: [],
    internships: [],
    projects: [],
    profileImage: null,
  });

  // Use Firebase Auth state to determine login status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setCurrentUser(user);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("uid", user.uid);

        // Load user data from Firebase
        loadUserDataFromFirebase(user.uid);
      } else {
        // If no Firebase user but we have localStorage data, recheck
        const storedLoginState = localStorage.getItem("isLoggedIn");
        const uid = localStorage.getItem("uid");
        const token = localStorage.getItem("authToken");

        if (storedLoginState === "true" && uid && token) {
          // We have local storage data indicating login, but Firebase doesn't recognize it
          // This could happen if Firebase session expired but local storage wasn't cleared
          console.log(
            "Local storage indicates logged in, but Firebase doesn't recognize. Redirecting to login..."
          );
          handleLogout(); // Clear everything and redirect
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      }
      setIsAuthChecking(true);

      // After checking auth, verify if we should redirect
      if (!user && !localStorage.getItem("isLoggedIn")) {
        navigate("/login");
      }

      setIsAuthChecking(false);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Function to load user data from Firebase
  const loadUserDataFromFirebase = async (userId) => {
    try {
      setIsLoading(true);
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `users/${userId}/basicDetails`));

      if (snapshot.exists()) {
        const userData = snapshot.val();
        console.log("Loaded user data from Firebase:", userData);
        setDetails(userData);
      } else {
        console.log("No user data found in Firebase, using default values");
      }
    } catch (error) {
      console.error("Error loading user data from Firebase:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save user data to Firebase
  const saveUserDataToFirebase = async (userDetails) => {
    if (!currentUser) {
      console.error("No current user found");
      return;
    }

    try {
      const userRef = ref(database, `users/${currentUser.uid}/basicDetails`);
      await set(userRef, userDetails);
      console.log("User data saved to Firebase successfully");
    } catch (error) {
      console.error("Error saving user data to Firebase:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newDetails = { ...details, [name]: value };
    setDetails(newDetails);

    // Save to Firebase on every change (debounced approach would be better for production)
    if (currentUser) {
      saveUserDataToFirebase(newDetails);
    }
  };

  const handleAddItem = (field) => {
    let newItem = prompt(`Enter a ${field}`);
    if (newItem) {
      const newDetails = { ...details, [field]: [...details[field], newItem] };
      setDetails(newDetails);

      // Save to Firebase
      if (currentUser) {
        saveUserDataToFirebase(newDetails);
      }
    }
  };

  const handleRemoveItem = (field, index) => {
    const newDetails = {
      ...details,
      [field]: details[field].filter((_, i) => i !== index),
    };
    setDetails(newDetails);

    // Save to Firebase
    if (currentUser) {
      saveUserDataToFirebase(newDetails);
    }
  };

  const handleRemoveObjectItem = (field, index) => {
    setDetails((prevDetails) => {
      const newDetails = {
        ...prevDetails,
        [field]: prevDetails[field].filter((_, i) => i !== index),
      };

      // Save to Firebase
      if (currentUser) {
        saveUserDataToFirebase(newDetails);
      }

      return newDetails;
    });
  };

  const handleAddObjectItem = (field) => {
    if (field === "internships") {
      let name = prompt(`Enter the name for ${field}`);
      let description = prompt(`Enter the description for ${field}`);
      let startDate = prompt(
        `Enter the Starting Date for ${field} (YYYY-MM-DD)`
      );
      let endDate = prompt(`Enter the Ending Date for ${field} (YYYY-MM-DD)`);

      if (name && description && startDate && endDate) {
        setDetails((prevDetails) => {
          const newDetails = {
            ...prevDetails,
            [field]: [
              ...prevDetails[field],
              { name, description, startDate, endDate },
            ],
          };

          // Save to Firebase
          if (currentUser) {
            saveUserDataToFirebase(newDetails);
          }

          return newDetails;
        });
      }
    } else if (field === "projects") {
      let name = prompt("Enter the name for the project");
      let description = prompt("Enter the description for the project");

      if (name && description) {
        setDetails((prevDetails) => {
          const newDetails = {
            ...prevDetails,
            [field]: [...prevDetails[field], { name, description }],
          };

          // Save to Firebase
          if (currentUser) {
            saveUserDataToFirebase(newDetails);
          }

          return newDetails;
        });
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newDetails = { ...details, profileImage: reader.result };
        setDetails(newDetails);

        // Save to Firebase
        if (currentUser) {
          saveUserDataToFirebase(newDetails);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    // Clear all authentication related data
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("uid");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("firebaseAuthUser");

    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowDashboard(false);
    navigate("/login");
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthChecking && !isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate, isAuthChecking]);

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

    if (details.technicalSkills.length < 3) {
      alert("Please add at least three technical skills.");
      return false;
    }

    if (details.softSkills.length < 3) {
      alert("Please add at least three soft skills.");
      return false;
    }

    if (details.extracurricular.length < 2) {
      alert("Please add at least two extracurricular activities.");
      return false;
    }

    if (details.interests.length < 2) {
      alert("Please add at least two areas of interest.");
      return false;
    }

    if (details.internships.length < 3) {
      alert("Please add at least three internships.");
      return false;
    }

    if (details.projects.length < 2) {
      alert("Please add at least two projects.");
      return false;
    }

    if (!details.profileImage) {
      alert("Please upload a profile image.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (window.innerWidth < 768) {
      alert(
        "For better visibility, please enable 'Desktop Site' in your browser settings."
      );
    }

    // Double check login status before proceeding
    if (!isLoggedIn) {
      alert("You need to be logged in to generate a resume.");
      navigate("/login");
      return;
    }

    if (validateFields()) {
      // Start loading state
      setIsGenerating(true);

      try {
        // Save final data to Firebase before navigating
        if (currentUser) {
          await saveUserDataToFirebase(details);
          console.log("Final data saved to Firebase before navigation");
        }

        // Simulate processing time (you can remove this in production)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        navigate("/fullresume", {
          state: { ...details },
        });
      } catch (error) {
        console.error("Error saving final data:", error);
        alert("Error saving data. Please try again.");
      } finally {
        // Stop loading state
        setIsGenerating(false);
      }
    }
  };

  if (isAuthChecking || isLoading) {
    return (
      <div className="loading-container">
        {isAuthChecking ? "Checking authentication..." : "Loading your data..."}
      </div>
    );
  }

  return (
    <div className="basicheaderfirst">
      {isGenerating && (
        <div className="loading-container resume-loading">
          <div className="loading-spinner"></div>
          <div className="loading-text loading-text-animated">
            Generating Your Resume
          </div>
          <div className="loading-subtitle">
            Please wait while we process your information...
          </div>
          <div className="loading-progress">
            <div className="loading-progress-bar"></div>
          </div>
          <div className="loading-dots">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        </div>
      )}

      <header className="headerh">
        <h1>Resume Maker</h1>
        <nav className="nav">
          <Link
            to="/"
            style={{ fontSize: "16px", padding: "8px 12px" }}
            className="nav-home"
          >
            Home
          </Link>

          {!isLoggedIn ? (
            <>
              <Link to="/signup">Signup</Link>
              <Link to="/login">Login</Link>
            </>
          ) : (
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className="profile-btn"
            >
              <FontAwesomeIcon icon={faUser} title="User" />
            </button>
          )}
        </nav>
      </header>

      {showDashboard && (
        <Dashboard
          closeDashboard={() => setShowDashboard(false)}
          onLogout={handleLogout}
        />
      )}
      <div className="basicheader">
        <div>
          <form>
            <h2 className="bheader">Enter Your Details</h2>
            <label style={{ color: "Black" }}>
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
              value={details.name}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="department"
              placeholder="Department"
              value={details.department}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={details.phone}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={details.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={details.address}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="linkedin"
              placeholder="LinkedIn (Id or Link)"
              value={details.linkedin}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="github"
              placeholder="GitHub (Id or Link)"
              value={details.github}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="leetcode"
              placeholder="Leetcode (Id or Link)"
              value={details.leetcode}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />

            <textarea
              name="careerObjective"
              className="careerobjective"
              placeholder="Career Objective"
              value={details.careerObjective}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              required
            />

            <input
              type="text"
              name="college"
              placeholder="Name Of The College"
              value={details.college}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="degree"
              placeholder="Degree (College)"
              value={details.degree}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="cgpa"
              placeholder="Current CGPA only"
              value={details.cgpa}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="highschool"
              placeholder="Name Of The School"
              value={details.highschool}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="highschool1"
              placeholder="School Degree (eg.. HSC)"
              value={details.highschool1}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="highschool2"
              placeholder="Percentage with year (eg.. 76%  in 2014)"
              value={details.highschool2}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="school"
              placeholder="Name Of The School"
              value={details.school}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="school1"
              placeholder="School Degree (eg.. SSLC)"
              value={details.school1}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
            <input
              type="text"
              name="school2"
              placeholder="Percentage with year (eg.. 76%  in 2012)"
              value={details.school2}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="binput"
              required
            />
          </form>

          <h3
            style={{ color: "black", margin: "10px 0px" }}
            className="basich3"
          >
            Technical Skills
          </h3>
          <button
            onClick={() => handleAddItem("technicalSkills")}
            className="bbutton"
          >
            Add Skill
          </button>
          <ul>
            {details.technicalSkills.map((skill, i) => (
              <li key={i} className="bbutton-li">
                {skill}
                <span
                  className="remove"
                  onClick={() => handleRemoveItem("technicalSkills", i)}
                >
                  ✖
                </span>
              </li>
            ))}
          </ul>

          <h3
            style={{ color: "black", margin: "10px 0px" }}
            className="basich3"
          >
            Soft Skills
          </h3>
          <button
            onClick={() => handleAddItem("softSkills")}
            className="bbutton"
          >
            Add Skill
          </button>
          <ul>
            {details.softSkills.map((skill, i) => (
              <li key={i} className="bbutton-li">
                {skill}{" "}
                <span
                  className="remove"
                  onClick={() => handleRemoveItem("softSkills", i)}
                >
                  ✖
                </span>
              </li>
            ))}
          </ul>

          <h3
            style={{ color: "black", margin: "10px 0px" }}
            className="basich3"
          >
            Extra-Curricular Activities
          </h3>
          <button
            onClick={() => handleAddItem("extracurricular")}
            className="bbutton"
          >
            Add Activity
          </button>
          <ul>
            {details.extracurricular.map((activity, i) => (
              <li key={i} className="bbutton-li">
                {activity}
                <span
                  className="remove"
                  onClick={() => handleRemoveItem("extracurricular", i)}
                >
                  ✖
                </span>
              </li>
            ))}
          </ul>

          <h3
            style={{ color: "black", margin: "10px 0px" }}
            className="basich3"
          >
            Areas of Interest
          </h3>
          <button
            onClick={() => handleAddItem("interests")}
            className="bbutton"
          >
            Add Interest
          </button>
          <ul>
            {details.interests.map((interest, i) => (
              <li key={i} className="bbutton-li">
                {interest}
                <span
                  className="remove"
                  onClick={() => handleRemoveItem("interests", i)}
                >
                  ✖
                </span>
              </li>
            ))}
          </ul>

          <h3
            style={{ color: "black", margin: "10px 0px" }}
            className="basich3"
          >
            Internships / Workshops
          </h3>
          <button
            onClick={() => handleAddObjectItem("internships")}
            className="bbutton"
          >
            Add Internship
          </button>
          <ul>
            {details.internships.map((internship, i) => (
              <li key={i} className="bbutton-li">
                <strong>{internship.name}</strong>: {internship.description}{" "}
                <br />
                <em>
                  {internship.startDate} - {internship.endDate}
                </em>
                <span
                  className="remove"
                  onClick={() => handleRemoveObjectItem("internships", i)}
                >
                  ✖
                </span>
              </li>
            ))}
          </ul>

          <h3
            style={{ color: "black", margin: "10px 0px" }}
            className="basich3"
          >
            Projects / Certifications
          </h3>
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
                <span
                  className="remove"
                  onClick={() => handleRemoveObjectItem("projects", i)}
                >
                  ✖
                </span>
              </li>
            ))}
          </ul>

          <button
            className={`generate-button ${isGenerating ? "loading" : ""}`}
            onClick={handleSubmit}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Resume"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BasicDetails;

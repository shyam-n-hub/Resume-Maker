// import React, { useState } from "react";
// import BasicDetails from "./BasicDetails";
// import FullResume from "./FullResume";
// import Login from "./Login.jsx";
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Signup from "./Signup.jsx"

// function App() {
 


//   return (
//     <>
  
// <Router>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/basicdetails" element={<BasicDetails />} />
//         <Route path="/fullresume" element={<FullResume />} />
//         <Route path="/signup" element={<Signup />} />
        
//       </Routes>
//     </Router>
//     </>
    
    
      
     

//   );
// }

// export default App;
import React, { useState } from "react";
import BasicDetails from "./BasicDetails";
import FullResume from "./FullResume";

function App() {
  const [showFullResume, setShowFullResume] = useState(false);
  const [basicDetails, setBasicDetails] = useState({
    name: "",
    department:"",
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
    projects: []
  });

  const toggleResume = () => setShowFullResume(!showFullResume);

  const handleBasicDetailsChange = (details) => setBasicDetails(details);

  return (
    <div className="App">
      {showFullResume ? (
        <FullResume
          toggleResume={toggleResume}
          {...basicDetails}
        />
      ) : (
        <BasicDetails
          toggleResume={toggleResume}
          onDetailsChange={handleBasicDetailsChange}
        />
      )}
    </div>
  );
}

export default App;
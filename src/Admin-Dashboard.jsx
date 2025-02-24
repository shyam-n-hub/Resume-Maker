import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database, storage } from "./firebase";
import { signOut } from "firebase/auth";
import { ref, onValue, update } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import "./AdminDashboard.css";
function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [resumeUrl, setResumeUrl] = useState(null);

  useEffect(() => {
    // Fetch all users from Firebase
    const usersRef = ref(database, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.values(data).map((user) => ({
          name: user.resume?.name || "N/A",
          email: user.resume?.userEmail || "N/A",
          resumeName: user.resume?.name ? `${user.resume.name}_Resume.pdf` : "N/A",
          resumeURL: user.resume?.downloadURL || null,
        }));
        setUsers(userList);
      }
    });
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error logging out: ", error);
      });
  };

  const handleResumeUpload = async (e, userId) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileRef = storageRef(storage, `resumes/${userId}/${file.name}`);
    await uploadBytes(fileRef, file);

    const downloadURL = await getDownloadURL(fileRef);

    // Update user's resume link in Firebase
    const userRef = ref(database, `users/${userId}`);
    update(userRef, { resumeLink: downloadURL });
  };

  return (
    <div className="admin-container">
      {/* Admin Navbar */}
      <header className="admin-header">
        <h1>Admin Panel</h1>
        <nav>
          <button onClick={() => navigate("/admin-home")}>Admin Home</button>
          <button onClick={() => navigate("/admin-dashboard")}>Admin Dashboard</button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </nav>
      </header>

      {/* Admin Dashboard Content */}
      <div className="admin-content">
        <h1>Registered Users & Resumes</h1>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Resume Name</th>
              <th>Resume Link</th>
            </tr>
          </thead>
          <tbody>
          {users.length > 0 ? (
            users.map((user, index) => (
              <tr key={index}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.resumeName}</td>
                <td>
                {resumeUrl ? (
        <a className="dash-resume-link" href={resumeUrl} target="_blank" rel="noopener noreferrer">
          View Updated Resume
        </a>
      ) : (
        <p className="no-resume-text">No resume uploaded yet.</p>
      )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No resumes found</td>
            </tr>
          )}
        </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;

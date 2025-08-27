import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Pen, Save, X } from "lucide-react";
import './UserInfo.css';

const UserInfo = () => {
  const { user, token, setUser } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const[email,setEmail]=useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch current user details from backend
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!token) return;

      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/api/auth/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const userData = response.data;
        setName(userData.name || "");
        setEmail(userData.email || "");
        setBio(userData.bio || "");

        // Update context with fresh data
        if (setUser) setUser(userData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [token, setUser]);

  const handleSave = async () => {
    if (!name.trim()) {
      setMessage("Name cannot be empty.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.put(
        "http://localhost:5000/api/auth/update-profile",
        { name: name.trim(), bio: bio.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (setUser) {
        setUser(response.data);
      }

      setMessage("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-info-container">
      <div className="profile-header">
        <h2>Profile Information</h2>
        {!editing && (
          <Pen
            className="edit-icon"
            size={18}
            onClick={() => setEditing(true)}
            style={{ cursor: "pointer" }}
          />
        )}
      </div>

      <div className="profile-form">
        <label>Name:</label>
        {editing ? (
          <input value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
        ) : (
          <p>{name || "-"}</p>
        )}

<label>Email:</label>
        {editing ? (
          <input value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
        ) : (
          <p>{email || "-"}</p>
        )}



        <label>Bio:</label>
        {editing ? (
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} disabled={loading} />
        ) : (
          <p>{bio || "-"}</p>
        )}

        {editing && (
          <div className="profile-actions">
            <button onClick={handleSave} disabled={loading}>
              <Save size={16} /> {loading ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setEditing(false)} disabled={loading}>
              <X size={16} /> Cancel
            </button>
          </div>
        )}

        {message && <p className="update-message">{message}</p>}
      </div>
    </div>
  );
};

export default UserInfo;

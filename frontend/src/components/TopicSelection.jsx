import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const TopicSelection = () => {
  const navigate = useNavigate();
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [error, setError] = useState(""); // for validation error

  // Topics grouped by categories
  const topicCategories = {
    "Technology & Programming": ["JavaScript", "React", "Node.js", "Python", "AI & ML", "Blockchain", "Cybersecurity", "Web Development", "Mobile Apps", "Game Development"],
    "Science & Math": ["Physics", "Chemistry", "Biology", "Astronomy", "Mathematics", "Environment", "Climate Change", "Space Exploration"],
    "Arts & Culture": ["Music", "Painting", "Photography", "Sculpture", "Literature", "Poetry", "Theater", "Cinema", "Dance", "Fashion"],
    "Entertainment": ["Movies", "TV Shows", "Anime", "Comics", "Gaming", "Esports", "Podcasts", "Memes", "Celebrity News"],
    "Lifestyle & Self-improvement": ["Fitness", "Yoga", "Meditation", "Nutrition", "Mental Health", "Travel", "Food & Cooking", "DIY Projects", "Gardening", "Minimalism", "Personal Finance"],
    "Sports": ["Football", "Cricket", "Basketball", "Tennis", "Badminton", "Swimming", "Running", "Cycling", "Esports"],
    "Education & Learning": ["Languages", "History", "Geography", "Philosophy", "Psychology", "Economics", "Politics", "Sociology"],
    "Miscellaneous": ["Gadgets", "Smartphones", "VR & AR", "Tech News", "Startups", "Entrepreneurship", "Adventure", "Nature", "Animals", "Pets", "Motivation"]
  };

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
    setError(""); // clear error when user selects/unselects
  };

  const handleSubmit = () => {
    if (selectedTopics.length < 3) {
      setError("Please select at least 3 topics to continue.");
      return;
    }
    localStorage.setItem("interestedTopics", JSON.stringify(selectedTopics));
    navigate("/register");
  };

  const handleSkip = () => {
    navigate("/register");
  };

  return (
    <div style={styles.container}>
      <button style={styles.skipBtn} onClick={handleSkip}>
        Skip for now
      </button>
 <h2>Select Topics You Are Interested In</h2>
       {/* Display error */}

      {Object.entries(topicCategories).map(([category, topics]) => (
        <div key={category} style={styles.categoryBlock}>
          <h3 style={styles.categoryTitle}>{category}</h3>
          <div style={styles.topicsWrapper}>
            {topics.map((topic) => (
              <div
                key={topic}
                onClick={() => toggleTopic(topic)}
                style={{
                  ...styles.topicChip,
                  ...(selectedTopics.includes(topic) ? styles.selectedChip : {})
                }}
              >
                {topic}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={handleSubmit} style={styles.submitBtn}>
        Continue
      </button>
     
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
};

// Inline Styles
const styles = {
  container: {
    maxWidth: "800px",
    margin: "50px auto",
    padding: "20px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  skipBtn: {
    backgroundColor: "transparent",
    border: "none",
    color: "#555",
    fontSize: "14px",
    cursor: "pointer",
    textDecoration: "underline",
    marginBottom: "20px",
  },
  categoryBlock: {
    marginBottom: "30px",
    textAlign: "left",
  },
  categoryTitle: {
    fontSize: "18px",
    marginBottom: "10px",
    color: "#333",
  },
  topicsWrapper: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  topicChip: {
    padding: "8px 15px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    backgroundColor: "#f9f9f9",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  selectedChip: {
    border: "2px solid #1a8917",
    backgroundColor: "#d3f7d3",
  },
  submitBtn: {
    marginTop: "20px",
    padding: "12px 25px",
    backgroundColor: "#1a8917",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  error: {
    color: "#f44336",
    marginBottom: "15px",
  },
};

export default TopicSelection;

// src/components/PublicBlogs.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const PublicBlogs = () => {
  const { category } = useParams(); // category from URL
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBlogs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `http://localhost:5000/api/blogs/public?sortBy=${category || "trending"}&page=1&limit=10`
      );

      if (response.data.success) {
        setBlogs(response.data.data);
      } else {
        setBlogs([]);
        setError("No blogs found.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch blogs.");
      setBlogs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, [category]);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      {/* Category Buttons */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        {["trending", "latest", "recent", "mostLiked"].map((cat) => (
          <button
            key={cat}
            style={{
              padding: "8px 16px",
              backgroundColor: category === cat ? "#1a8917" : "#f0f0f0",
              color: category === cat ? "#fff" : "#000",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => navigate(`/blogs/${cat}`)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading / Error */}
      {loading && <p>Loading blogs...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Blog List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {blogs.length > 0 ? (
          blogs.map((blog) => (
            <div
              key={blog._id}
              style={{
                border: "1px solid #e2e2e2",
                borderRadius: "10px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {blog.featuredImage && (
                <img
                  src={blog.featuredImage}
                  alt={blog.title}
                  style={{
                    width: "100%",
                    maxHeight: "300px",
                    objectFit: "cover",
                    marginBottom: "10px",
                  }}
                />
              )}
              <h3 style={{ margin: "0 0 10px 0" }}>{blog.title}</h3>
              <p style={{ fontSize: "14px", color: "#555", marginBottom: "10px" }}>
                By <strong>{blog.author?.name || "Unknown"}</strong> |{" "}
                {new Date(blog.createdAt).toLocaleDateString()} | Categories:{" "}
                {blog.categories?.join(", ")}
              </p>
              <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#333" }}>
                {blog.content?.paragraphs?.[0] || "No content available"}...
              </p>

              {/* Tags */}
              <div style={{ marginTop: "10px" }}>
                {blog.tags?.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: "#f0f0f0",
                      padding: "5px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      marginRight: "5px",
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Read More */}
              <button
                style={{
                  marginTop: "15px",
                  padding: "10px 20px",
                  backgroundColor: "#1a8917",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/blog/${blog.slug}`)}
              >
                Read More
              </button>
            </div>
          ))
        ) : (
          !loading && <p>No blogs available.</p>
        )}
      </div>
    </div>
  );
};

export default PublicBlogs;

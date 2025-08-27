import React, { useState } from "react";
import axios from "axios";
import { FaThumbsUp, FaComment } from "react-icons/fa";

const SearchByTag = () => {
  const [tag, setTag] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!tag.trim()) return;
    setLoading(true);
    setError("");

    try {
      // Send tag as query string
      const res = await axios.get(`http://localhost:5000/api/public/blogs?tag=${encodeURIComponent(tag)}`);
      setBlogs(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Error fetching blogs");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Search Blogs by Tag</h2>

      {/* Search Input */}
      <div style={{ display: "flex", marginBottom: "20px", gap: "10px" }}>
        <input
          type="text"
          placeholder="Enter tag..."
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "10px 20px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#1a8917",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>

      {loading && <p>Loading blogs...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !blogs.length && tag && <p>No blogs found for tag "{tag}"</p>}

      {/* Blogs List */}
      {blogs.map((blog) => (
        <div
          key={blog._id}
          style={{
            display: "flex",
            flexDirection: "column",
            border: "1px solid #e2e2e2",
            borderRadius: "10px",
            marginBottom: "30px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          {blog.featuredImage && (
            <img
              src={blog.featuredImage}
              alt={blog.title}
              style={{ width: "100%", maxHeight: "300px", objectFit: "cover" }}
            />
          )}
          <div style={{ padding: "20px" }}>
            <h3>{blog.title}</h3>
            <p style={{ fontSize: "14px", color: "#555", marginBottom: "10px" }}>
              By <strong>{blog.author.name}</strong> | {new Date(blog.createdAt).toLocaleDateString()} |{" "}
              {blog.categories.join(", ")}
            </p>

            {/* Likes & Comments */}
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <FaThumbsUp /> {blog.likes?.length || 0}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <FaComment /> {blog.comments?.length || 0}
              </span>
            </div>

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
              onClick={() => (window.location.href = `/blog/${blog.slug}`)}
            >
              Read More
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchByTag;

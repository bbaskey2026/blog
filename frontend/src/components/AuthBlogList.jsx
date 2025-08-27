import { useNavigate } from "react-router-dom";
import { Edit, Trash } from "lucide-react";

import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import "./AuthBlogList.css";

const AuthBlogList = () => {
  const { token, user } = useContext(AuthContext);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/api/blogs/user-blogs",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const editableBlogs = response.data.filter(
          (b) => b.author?._id === user.id
        );

        setBlogs(editableBlogs);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user blogs:", err);
        setError(
          err.response?.data?.message || "Failed to load blogs. Check server/API URL."
        );
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [token, user]);

  const handleEdit = (blogId) => {
    navigate(`/edit-blogs`, { state: { blogId } });
  };

  if (loading)
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading your blogs...</p>
      </div>
    );

  if (error) return <p className="error">{error}</p>;
  if (blogs.length === 0) return <p>No editable blogs found. Create one!</p>;

const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await axios.delete(`http://localhost:5000/api/blogs/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBlogs(blogs.filter((blog) => blog._id !== id));
      } catch (error) {
        console.error("Error deleting blog:", error);
      }
    }
  };


  return (
    <div className="blog-list-container">
      {blogs.map((blog) => (
        <div key={blog._id} className="blog-card">
          <div className="blog-card-content">
            <h2 className="blog-title">{blog.title}</h2>
            <p className="blog-status">{blog.status.toUpperCase()}</p>
            <p className="blog-meta">
              By <strong>{blog.author?.name || "You"}</strong> |{" "}
              {new Date(blog.createdAt).toLocaleDateString()}
            </p>
            <div className="blog-actions">
              <button
                onClick={() => handleEdit(blog._id)}
                className="edit-blog-btn"
                title="Edit this blog"
              >
                <Edit size={16} /> Edit
              </button>
               <button
            onClick={() => handleDelete(blog._id)}
            className="edit-blog-btn"
                title="Edit this blog"
          >
            <Trash size={16} />
            Delete
          </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuthBlogList;

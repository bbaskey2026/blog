import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import UserInfo from "./UserInfo";
import AuthBlogList from "./AuthBlogList";
import CreateBlog from "./CreateBlog";
import { useNavigate, useLocation } from "react-router-dom";
import AuthDebug from "./AuthDebug";
import "./Dashboard.css";

// ✅ Lucide React icons
import { User, PenSquare, LogOut, FileText } from "lucide-react";

const Dashboard = () => {
  const { user, logout, token, loading: authLoading } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState("userInfo");
  const [selectedBlogId, setSelectedBlogId] = useState(null); // Blog to edit
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Update active section based on route
  useEffect(() => {
    if (location.pathname.endsWith("/my-blogs")) {
      setActiveSection("blogs");
    }
  }, [location.pathname]);

  // Authentication check
  useEffect(() => {
    if (authLoading) return;
    const checkAuth = setTimeout(() => {
      if (!user || !token) {
        navigate("/login", { state: { from: "/dashboard" }, replace: true });
      } else {
        setLoading(false);
      }
    }, 100);
    return () => clearTimeout(checkAuth);
  }, [user, token, authLoading, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleCreateBlog = () => {
    setSelectedBlogId(null);
    setActiveSection("editor");
  };

  const handleEditBlog = (blogId) => {
    setSelectedBlogId(blogId);
    setActiveSection("editor");
  };

  const goToMyBlogs = () => {
    navigate("/dashboard/my-blogs");
    setActiveSection("blogs");
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!user || !token) return null;

  return (
    <div className="dashboard-container">
      {process.env.NODE_ENV === "development" && <AuthDebug />}

      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Dashboard</h2>
          <div className="user-welcome">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="welcome-info">
              <p className="welcome-text">Welcome back!</p>
              <p className="user-name">{user?.name || "Guest"}</p>
              <p className="user-bio">{user?.bio}</p> 
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="create-blog-btn" onClick={handleCreateBlog}>
            <PenSquare className="btn-icon" size={18} /> Create Blog
          </button>

          <div className="nav-divider"></div>

          <button
            className={`nav-btn ${activeSection === "userInfo" ? "active" : ""}`}
            onClick={() => setActiveSection("userInfo")}
          >
            <User className="btn-icon" size={18} /> User Info
          </button>

          <button
            className={`nav-btn ${activeSection === "blogs" ? "active" : ""}`}
            onClick={goToMyBlogs}
          >
            <FileText className="btn-icon" size={18} /> My Blogs
          </button>

          <div className="nav-divider"></div>

          <button className="logout-btn" onClick={handleLogout}>
            <LogOut className="btn-icon" size={18} /> Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="main-header">
          <h1 className="section-title">
            {activeSection === "userInfo"
              ? "Profile Information"
              : activeSection === "blogs"
              ? "My Blog Posts"
              : "Edit Blog"}
          </h1>
          <p className="section-description">
            {activeSection === "userInfo"
              ? "Manage your account information and preferences"
              : activeSection === "blogs"
              ? "View and manage all your published blog posts"
              : "Edit your blog content and settings"}
          </p>
        </div>

        <div className="main-content">
          {activeSection === "userInfo" && <UserInfo />}
          {activeSection === "blogs" && (
            <AuthBlogList onEditBlog={handleEditBlog} />
          )}
          {activeSection === "editor" && <CreateBlog blogId={selectedBlogId} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
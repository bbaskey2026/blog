// src/components/Header.jsx
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Menu, X, User, LogIn, UserPlus, LogOut, Search } from "lucide-react";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery("");
    }
  };

  return (
    <header style={styles.header}>
      {/* Logo */}
      <div style={styles.logo} onClick={() => navigate("/")}>
        <h1 style={{ margin: 0, color: "#1a8917" }}>MyBlog</h1>
      </div>

      {/* Search Bar (desktop only) */}
      <form style={styles.searchForm} onSubmit={handleSearch} className="desktop-search">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <button type="submit" style={styles.searchButton}>
          <Search size={18} />
        </button>
      </form>

      {/* Desktop nav */}
      <nav style={styles.nav} className="desktop-nav">
        <Link style={styles.navLink} to="/">Home</Link>
        <Link style={styles.navLink} to="/blogs">Blogs</Link>
        {user && <Link style={styles.navLink} to="/dashboard">Dashboard</Link>}
        <Link style={styles.navLink} to="/about">About</Link>
      </nav>

      {/* Auth buttons (desktop) */}
      <div style={styles.authButtons} className="desktop-auth">
        {user ? (
          <>
            <span style={styles.userName}>
              <User size={18} /> {user.name}
            </span>
            <button style={styles.logoutButton} onClick={logout}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <button style={styles.loginButton} onClick={() => navigate("/login")}>
              <LogIn size={16} /> Login
            </button>
            <button style={styles.registerButton} onClick={() => navigate("/select-interested-topics")}>
              <UserPlus size={16} /> Register
            </button>
          </>
        )}
      </div>

      {/* Mobile menu toggle */}
      <div style={styles.mobileMenuIcon} className="mobile-menu-toggle" onClick={toggleMenu}>
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div style={styles.mobileNav}>
          {/* Mobile search */}
          <form style={{ ...styles.searchForm, marginBottom: "10px" }} onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <button type="submit" style={styles.searchButton}>
              <Search size={18} />
            </button>
          </form>

          <Link style={styles.mobileNavLink} to="/" onClick={toggleMenu}>Home</Link>
          <Link style={styles.mobileNavLink} to="/blogs" onClick={toggleMenu}>Blogs</Link>
          {user && <Link style={styles.mobileNavLink} to="/dashboard" onClick={toggleMenu}>Dashboard</Link>}
          <Link style={styles.mobileNavLink} to="/about" onClick={toggleMenu}>About</Link>

          {/* Auth actions in mobile */}
          {user ? (
            <>
              <div style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: "5px" }}>
                <User size={16} /> <span>{user.name}</span>
              </div>
              <button
                style={{ ...styles.mobileAuthButton, backgroundColor: "#f44336" }}
                onClick={() => {
                  logout();
                  toggleMenu();
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <button style={styles.mobileAuthButton} onClick={() => { navigate("/login"); toggleMenu(); }}>
                <LogIn size={16} /> Login
              </button>
              <button style={styles.mobileAuthButton} onClick={() => { navigate("/select-interested-topics"); toggleMenu(); }}>
                <UserPlus size={16} /> Register
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 20px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    position: "sticky",
    top: 0,
    backgroundColor: "#fff",
    zIndex: 1000,
    gap: "20px",
  },
  logo: { cursor: "pointer" },
  nav: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
  },
  navLink: {
    textDecoration: "none",
    color: "#333",
    fontWeight: 500,
  },
  searchForm: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ccc",
    borderRadius: "5px",
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  searchInput: {
    border: "none",
    padding: "6px 10px",
    outline: "none",
    fontSize: "14px",
    flex: 1,
  },
  searchButton: {
    background: "none",
    border: "none",
    padding: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    color: "#1a8917",
  },
  authButtons: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  loginButton: {
    padding: "6px 12px",
    backgroundColor: "#1a8917",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    cursor: "pointer",
  },
  registerButton: {
    padding: "6px 12px",
    backgroundColor: "#fff",
    color: "#1a8917",
    border: "1px solid #1a8917",
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    cursor: "pointer",
  },
  logoutButton: {
    padding: "6px 12px",
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    cursor: "pointer",
  },
  userName: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontWeight: 500,
    color: "#333",
  },
  mobileMenuIcon: {
    display: "block", // 👈 hide with CSS for desktop
    cursor: "pointer",
  },
  mobileNav: {
    position: "absolute",
    top: "60px",
    right: 0,
    backgroundColor: "#fff",
    width: "220px",
    boxShadow: "-2px 0 6px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    padding: "10px",
  },
  mobileNavLink: {
    padding: "10px 0",
    textDecoration: "none",
    color: "#333",
    borderBottom: "1px solid #e2e2e2",
  },
  mobileAuthButton: {
    padding: "8px 12px",
    marginTop: "5px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "#1a8917",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
};

export default Header;

// CreateBlogDebug.jsx - Add this component temporarily for debugging
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const CreateBlogDebug = () => {
  const { user, token } = useContext(AuthContext);

  const testConnection = async () => {
    try {
      console.log("Testing server connection...");
      const response = await axios.get('http://localhost:5000/api/blogs/all', {
        timeout: 5000
      });
      console.log("Server connection test successful:", response.data);
      alert("Server connection: OK");
    } catch (error) {
      console.error("Server connection test failed:", error);
      alert(`Server connection failed: ${error.message}`);
    }
  };

  const testAuth = async () => {
    try {
      console.log("Testing authentication...");
      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000
      });
      console.log("Auth test successful:", response.data);
      alert("Authentication: OK");
    } catch (error) {
      console.error("Auth test failed:", error);
      alert(`Authentication failed: ${error.response?.status || error.message}`);
    }
  };

  const testCreateEndpoint = async () => {
    try {
      console.log("Testing create blog endpoint...");
      const testPayload = {
        title: "Test Blog",
        content: {
          paragraphs: ["This is a test paragraph"],
          images: [],
          videos: []
        },
        featuredImage: "",
        categories: ["test"],
        tags: ["test"],
        seo: {
          metaTitle: "Test Blog",
          metaDescription: "",
          metaKeywords: [],
          canonicalUrl: ""
        },
        status: "draft"
      };

      const response = await axios.post(
        'http://localhost:5000/api/blogs/create-new-blogs',
        testPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 10000
        }
      );
      console.log("Create endpoint test successful:", response.data);
      alert("Create endpoint: OK");
    } catch (error) {
      console.error("Create endpoint test failed:", error);
      alert(`Create endpoint failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="debug-info">
      <h4>CreateBlog Debug</h4>
      
      <div>
        <strong>User:</strong> {user ? user.name : "Not found"}
      </div>
      <div>
        <strong>Token:</strong> {token ? "Present" : "Missing"}
      </div>
      {token && (
        <div>
          <strong>Token Preview:</strong> {token.substring(0, 20)}...
        </div>
      )}
      
      <div className="debug-buttons">
        <button onClick={testConnection} className="test-btn">
          Test Server
        </button>
        <button onClick={testAuth} className="inspect-btn">
          Test Auth
        </button>
        <button onClick={testCreateEndpoint} className="log-btn">
          Test Create
        </button>
        <button 
          onClick={() => console.log({user, token: token?.substring(0,50)})} 
          className="clear-btn"
        >
          Log State
        </button>
      </div>
    </div>
  );
};

export default CreateBlogDebug;
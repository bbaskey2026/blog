import React, { useState, useRef, useEffect } from "react";
import { Plus, X, Image, Video, Settings, Globe, Save, Code, Quote,File } from "lucide-react";

import "./CreateBlog.css";
import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import  CodeMirror  from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
const CreateBlog = () => {

const languageMap = {
  javascript,
  python,
  java
};


  // Get blog ID for edit functionality
  const location = useLocation();
  const blogId = location.state?.blogId || null;
  
  // Get auth info from context
  const { user, token, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Basic blog info
  const [title, setTitle] = useState("");
  const [paragraphs, setParagraphs] = useState([""]);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [featuredImage, setFeaturedImage] = useState("");
  const [categories, setCategories] = useState("");
  const [tags, setTags] = useState("");
const [codeBlocks, setCodeBlocks] = useState([]);
const [fileBlocks, setFileBlocks] = useState([]);

const [blockQuotes, setQuotes] = useState([""]); // Each string is a blockquote

  const [status, setStatus] = useState("draft");

  // SEO
  const [seoMetaTitle, setSeoMetaTitle] = useState("");
  const [seoMetaDescription, setSeoMetaDescription] = useState("");
  const [seoMetaKeywords, setSeoMetaKeywords] = useState("");
  const [seoCanonicalUrl, setSeoCanonicalUrl] = useState("");

  const [message, setMessage] = useState("");
  const [showSeoPanel, setShowSeoPanel] = useState(false);
  const [showMediaPanel, setShowMediaPanel] = useState(false);
  const [activeElement, setActiveElement] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const titleRef = useRef(null);
  const paragraphRefs = useRef([]);

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      console.log("User not authenticated, redirecting to login...");
      navigate("/login", { 
        state: { from: blogId ? `/edit-blog/${blogId}` : '/create-blog' },
        replace: true 
      });
    }
  }, [isAuthenticated, navigate, blogId]);

  // Load existing blog if editing - NEW FUNCTIONALITY
  useEffect(() => {
    if (!blogId) return; // Only run if we have an ID (edit mode)

    const fetchBlog = async () => {
      try {
        setIsLoading(true);
        console.log(`Fetching blog with ID: ${blogId}`);
        
        const res = await axios.get(`http://localhost:5000/api/blogs/user-blogs/${blogId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const blog = res.data;
        console.log("Fetched blog data:", blog);
// Extract blockquotes
const quoteContent = blog.content
  ? blog.content.filter(c => c.type === "quote").map(q => q.value)
  : [];
setQuotes(quoteContent); // Make sure you have a state for quotes
// const [quotes, setQuotes] = useState([]);
const codeContent = blog.content
  ? blog.content.filter(c => c.type === "code").map(code => ({
      id: Date.now() + Math.random(),
      code: code.value,
      language: code.language || "javascript",
      position: code.position || 0,
    }))
  : [];
setCodeBlocks(codeContent); // Make sure you have a state for code blocks
// const [codeBlocks, setCodeBlocks] = useState([]);

        // Populate form fields with existing blog data
        setTitle(blog.title || "");
        
        // Extract paragraphs from content array
        const paragraphContent = blog.content
          ? blog.content.filter(c => c.type === "paragraph").map(p => p.value)
          : [""];
        setParagraphs(paragraphContent.length > 0 ? paragraphContent : [""]);
        
        // Extract images from content array
        const imageContent = blog.content
          ? blog.content.filter(c => c.type === "image").map(img => ({
              id: Date.now() + Math.random(),
              url: img.value,
              name: img.name || "Uploaded image",
              position: img.position || 0
            }))
          : [];
        setImages(imageContent);
        
        // Extract videos from content array
        const videoContent = blog.content
          ? blog.content.filter(c => c.type === "video").map(vid => ({
              id: Date.now() + Math.random(),
              url: vid.value,
              name: vid.name || "Uploaded video",
              position: vid.position || 0
            }))
          : [];
        setVideos(videoContent);
        
        setFeaturedImage(blog.featuredImage || "");
        setCategories(blog.categories ? blog.categories.join(", ") : "");
        setTags(blog.tags ? blog.tags.join(", ") : "");
        
        // SEO data
        setSeoMetaTitle(blog.seo?.metaTitle || "");
        setSeoMetaDescription(blog.seo?.metaDescription || "");
        setSeoMetaKeywords(blog.seo?.metaKeywords ? blog.seo.metaKeywords.join(", ") : "");
        setSeoCanonicalUrl(blog.seo?.canonicalUrl || "");
        
        setStatus(blog.status || "draft");
        
        setMessage("Blog loaded successfully for editing!");
        setTimeout(() => setMessage(""), 3000);
        
      } catch (err) {
        console.error("Failed to fetch blog:", err);
        let errorMessage = "Failed to load blog for editing";
        
        if (err.response) {
          switch (err.response.status) {
            case 404:
              errorMessage = "Blog not found. It may have been deleted.";
              break;
            case 401:
              errorMessage = "Authentication failed. Please login again.";
              setTimeout(() => {
                navigate("/login", { state: { from: `/edit-blog/${blogId}` } });
              }, 2000);
              break;
            case 403:
              errorMessage = "You don't have permission to edit this blog.";
              break;
            default:
              errorMessage = `Error loading blog: ${err.response.data?.message || "Unknown error"}`;
          }
        }
        
        setMessage(`Error: ${errorMessage}`);
        setTimeout(() => {
          navigate("/dashboard"); // Redirect to dashboard on error
        }, 3000);
      } finally {
        setIsLoading(false);
      
    };
    }
    fetchBlog();
  }, [blogId, token, navigate]);

  useEffect(() => {
    paragraphRefs.current = paragraphRefs.current.slice(0, paragraphs.length);
  }, [paragraphs]);

  // Don't render if not authenticated
  if (!user || !token) {
    return (
      <div className="create-blog-loading">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

const handleBlockQuoteChange = (e, idx) => {
  const value = e.target.value;
  setQuotes((prev) => {
    const newQuotes = [...prev];
    newQuotes[idx] = value;
    return newQuotes;
  });
};

const addQuoteBlock = (idx = paragraphs.length + images.length + videos.length + codeBlocks.length) => {
  setQuotes(prev => {
    const newQuotes = [...prev];
    newQuotes.splice(idx, 0, "");
    return newQuotes;
  });
};

const removeBlockQuote = (idx) => {
  if (blockQuotes.length > 0) {
    setQuotes((prev) => prev.filter((_, i) => i !== idx));
  }
};

const handleCodeChange = (newValue, idx) => {
  setCodeBlocks((prevBlocks) => {
    const updatedBlocks = [...prevBlocks]; // copy the array
    updatedBlocks[idx] = {
      ...updatedBlocks[idx], // copy the object
      code: newValue,        // update only the code
    };
    return updatedBlocks;
  });
};

const handleLanguageChange = (newLanguage, idx) => {
  setCodeBlocks((prevBlocks) => {
    const updatedBlocks = [...prevBlocks];
    updatedBlocks[idx] = {
      ...updatedBlocks[idx],
      language: newLanguage, // update language
    };
    return updatedBlocks;
  });
};


const addCodeBlock = (idx = codeBlocks.length) => {
  setCodeBlocks(prev => {
    const newBlocks = [...prev];
    newBlocks.splice(idx, 0, { id: Date.now(), code: "", language: "javascript", position: idx });
    return newBlocks;
  });
};

const removeCodeBlock = (idx) => {
  if (codeBlocks.length > 0) {
    setCodeBlocks((prev) => prev.filter((_, i) => i !== idx));
  }
};

const addFileBlock = (insertIndex) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"; // Add more as needed
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = {
          id: Date.now() + Math.random(),
          url: event.target.result, // base64 string
          name: file.name,
          type: file.type,
          position: insertIndex,
          file: file,
        };
        setFileBlocks((prev) => {
          const newFiles = [...prev];
          newFiles.splice(insertIndex, 0, fileData);
          return newFiles;
        });
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
};

const removeFileBlock = (idx) => {
  setFileBlocks((prev) => prev.filter((_, i) => i !== idx));
};


  // Handle featured image upload
  const handleFeaturedImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFeaturedImage(event.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Paragraph change
  const handleParagraphChange = (e, idx) => {
    const value = e.target.innerHTML;
    setParagraphs((prev) => {
      const newParas = [...prev];
      newParas[idx] = value;
      return newParas;
    });
  };

  const addParagraph = (idx = paragraphs.length) => {
    setParagraphs((prev) => {
      const newParas = [...prev];
      newParas.splice(idx, 0, "");
      return newParas;
    });

    setTimeout(() => {
      if (paragraphRefs.current[idx]) paragraphRefs.current[idx].focus();
    }, 0);
  };

  const removeParagraph = (idx) => {
    if (paragraphs.length > 1) {
      setParagraphs((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  // Add/remove image
  const addImage = (insertIndex) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = {
            id: Date.now() + Math.random(),
            url: event.target.result,
            file: file,
            position: insertIndex,
            name: file.name,
          };

          setImages((prev) => {
            const newImages = [...prev];
            newImages.splice(insertIndex, 0, imageData);
            return newImages;
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const removeImage = (idx) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  // Add/remove video
  const addVideo = (insertIndex) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const videoData = {
            id: Date.now() + Math.random(),
            url: event.target.result,
            file: file,
            position: insertIndex,
            name: file.name,
          };

          setVideos((prev) => {
            const newVideos = [...prev];
            newVideos.splice(insertIndex, 0, videoData);
            return newVideos;
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const removeVideo = (idx) =>
    setVideos((prev) => prev.filter((_, i) => i !== idx));

  const handleKeyDown = (e, idx) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addParagraph(idx + 1);
    }
  };

  // Submit blog - ENHANCED FOR EDIT FUNCTIONALITY
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // Validation
    if (!title.trim()) {
      setMessage("Error: Title is required");
      setIsLoading(false);
      return;
    }

    if (!token) {
      setMessage("Error: Authentication token missing");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        content: [
          ...paragraphs
            .filter((p) => p.trim() !== "")
            .map((p) => ({ type: "paragraph", value: p })),

          ...images.map((img) => ({
            type: "image",
            value: img.url,
            name: img.name,
            position: img.position,
          })),

          ...videos.map((vid) => ({
            type: "video",
            value: vid.url,
            name: vid.name,
            position: vid.position,
          })),

...codeBlocks
  .filter(c => c.value.trim() !== "")
  .map((c, idx) => ({
    type: "code",
    value: c.value,
    language: c.language,
    position: idx * 5 + 2
  })),

  ...fileBlocks.map(f => ({
    type: "file",
    value: f.url,
    name: f.name,
    fileType: f.type,
    position: f.position
  })),

...blockQuotes
  .filter((q) => q.trim() !== "")
  .map((q, idx) => ({ type: "quote", value: q, position: idx * 6 + 4 })),

        ],
        featuredImage: featuredImage || "",
        categories: categories.split(",").map((c) => c.trim()).filter(Boolean),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        seo: {
          metaTitle: seoMetaTitle || title,
          metaDescription: seoMetaDescription || "",
          metaKeywords: seoMetaKeywords.split(",").map((k) => k.trim()).filter(Boolean),
          canonicalUrl: seoCanonicalUrl || "",
        },
        status,
      };

      console.log("Submitting blog with payload:", payload);
      console.log("Edit mode:", blogId ? "true" : "false");

      let response;
      
      if (blogId) {
        // Update existing blog
        console.log(`Updating blog with ID: ${blogId}`);
        response = await axios.put(
          `http://localhost:5000/api/blogs/${blogId}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            timeout: 30000,
          }
        );
        setMessage("Blog updated successfully!");
      } else {
        // Create new blog
        console.log("Creating new blog");
        response = await axios.post(
          "http://localhost:5000/api/blogs/create-new-blogs",
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            timeout: 30000,
          }
        );
        setMessage("Blog created successfully!");
      }

      console.log("Operation successful:", response.data);

      // Only reset form for new blog creation, not for updates
      if (!blogId) {
        setTitle("");
        setParagraphs([""]);
        setImages([]);
        setVideos([]);
        setFeaturedImage("");
        setCategories("");
        setTags("");
        setSeoMetaTitle("");
        setSeoMetaDescription("");
        setSeoMetaKeywords("");
        setSeoCanonicalUrl("");
      }

      // Redirect to dashboard after successful operation
     

    } catch (err) {
      console.error("Full error object:", err);

      let errorMessage = blogId ? "Failed to update blog" : "Failed to create blog";

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        console.log("Server error - Status:", status);
        console.log("Server error - Data:", data);

        switch (status) {
          case 400:
            errorMessage = `Bad Request: ${data?.message || "Invalid data provided"}`;
            break;
          case 401:
            errorMessage = "Authentication failed. Please login again.";
            setTimeout(() => {
              navigate("/login", { 
                state: { from: blogId ? `/edit-blog/${blogId}` : '/create-blog' } 
              });
            }, 2000);
            break;
          case 403:
            errorMessage = blogId 
              ? "Access denied. You don't have permission to edit this blog."
              : "Access denied. You don't have permission to create blogs.";
            break;
          case 404:
            errorMessage = blogId 
              ? "Blog not found. It may have been deleted."
              : "API endpoint not found. Please check the server.";
            break;
          case 422:
            errorMessage = `Validation Error: ${data?.message || "Please check your input"}`;
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = `Server Error (${status}): ${data?.message || "Unknown error"}`;
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      } else {
        errorMessage = `Error: ${err.message}`;
      }

      setMessage(`Error: ${errorMessage}`);

    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 8000);
    }
  };

  const renderContent = () => {
    const allContent = [];

    paragraphs.forEach((para, idx) => {
      allContent.push({ type: "paragraph", index: idx, position: idx * 3 });
    });

    images.forEach((img, idx) => {
      allContent.push({
        type: "image",
        index: idx,
        position: img.position || idx * 3 + 1,
      });
    });

    videos.forEach((vid, idx) => {
      allContent.push({
        type: "video",
        index: idx,
        position: vid.position || idx * 3 + 2,
      });
    });
// During renderContent()
allContent.push(...codeBlocks.map((c, i) => ({ type: "code", index: i, position: i*4+3 })));
allContent.push(...blockQuotes.map((q, i) => ({ type: "quote", index: i, position: i*6+4 })));
allContent.push(...fileBlocks.map((f, i) => ({ type: "file", index: i, position: i * 5 + 10 })));

    allContent.sort((a, b) => a.position - b.position);

    return allContent.map((item) => {
      if (item.type === "paragraph") {
        const idx = item.index;
        const para = paragraphs[idx];
        return (
          <div key={`para-${idx}`} className="paragraph-container">
            <div
              ref={(el) => (paragraphRefs.current[idx] = el)}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => handleParagraphChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              dangerouslySetInnerHTML={{ __html: para }}
              onFocus={() => setActiveElement({ type: "paragraph", index: idx })}
            />
            <div className="paragraph-controls">


<button onClick={() => addQuoteBlock(idx + 1)} title="Add quote"><Quote size={16} /></button>
<button onClick={() => addCodeBlock(idx + 1)} title="Add code"><Code size={16} /></button>


<button onClick={() => addFileBlock(idx + 1)} title="Add file"><File size={16} /></button>
        <button onClick={() => removeFileBlock(idx)} title="Delete file"><X size={16} /></button>



              <button onClick={() => addParagraph(idx + 1)} title="Add paragraph">
                <Plus size={16} />
              </button>
              <button onClick={() => addImage(idx + 1)} title="Add image">
                <Image size={16} />
              </button>
              <button onClick={() => addVideo(idx + 1)} title="Add video">
                <Video size={16} />
              </button>
              {paragraphs.length > 1 && (
                <button onClick={() => removeParagraph(idx)} title="Delete paragraph">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        );

 



















      } else if (item.type === "image") {
        const img = images[item.index];
        return (
          <div key={`img-${img.id}`} className="content-media">
            <img src={img.url} alt={img.name} />
            <button onClick={() => removeImage(item.index)} className="remove-media-btn">
              <X size={16} />
            </button>
            {img.name && <div className="media-name">{img.name}</div>}
          </div>
        );
      } else if (item.type === "video") {
        const vid = videos[item.index];
        return (
          <div key={`vid-${vid.blogId}`} className="content-media">
            <video src={vid.url} controls />
            <button onClick={() => removeVideo(item.index)} className="remove-media-btn">
              <X size={16} />
            </button>
            {vid.name && <div className="media-name">{vid.name}</div>}
          </div>
        );
      }

else if (item.type === "file") {
  const idx = item.index;
  const file = fileBlocks[idx];
  return (
    <div key={`file-${file.id}`} className="fileblock-container">
      <a href={file.url} download={file.name} className="file-link">
        {file.name} ({file.type})
      </a>
      <div className="fileblock-controls">
        
      </div>
    </div>
  );
}
















else if (item.type === "code") {
  const idx = item.index;
  return (
    <div key={`code-${idx}`} className="codeblock-container">
      <select
        value={codeBlocks[idx].language}
        onChange={(e) => handleLanguageChange(e.target.value, idx)}
      >
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        {/* Add more languages as needed */}
      </select>

      <CodeMirror
  value={codeBlocks[idx].code} // current code
  height="200px"
  extensions={[languageMap[codeBlocks[idx].language]?.() || javascript()]}
  onChange={(value) => handleCodeChange(value, idx)}
/>



      <div className="codeblock-controls">
        <button onClick={() => addCodeBlock(idx + 1)}><Plus size={16} /></button>
        <button onClick={() => removeCodeBlock(idx)}><X size={16} /></button>
      </div>
    </div>
  );
}

else if (item.type === "quote") {
  const idx = item.index;
  const quote = blockQuotes[idx];
  return (
    <div key={`quote-${idx}`} className="blockquote-container">
      <textarea
        value={quote}
        onChange={(e) => handleBlockQuoteChange(e, idx)}
        placeholder="Write a quote..."
        className="blockquote"
      />
      <div className="blockquote-controls">
        <button onClick={() => addBlockQuote(idx + 1)} title="Add quote">
          <Plus size={16} />
        </button>
        <button onClick={() => removeBlockQuote(idx)} title="Delete quote">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}













      return null;
    });
  };

  return (
    <div className="create-blog-container">
      {/* Header */}
      <div className="create-blog-header">
        <div className="create-blog-header-inner">
          <h1>{blogId ? "Edit Blog" : "Create New Blog"}</h1>
          <div className="user-info">
            <span>Writing as: <strong>{user.name}</strong></span>
          </div>
          <div className="button-group">
            <button onClick={() => setShowMediaPanel(!showMediaPanel)} title="Media & Settings">
              <Settings size={20} />
            </button>
            <button onClick={() => setShowSeoPanel(!showSeoPanel)} title="SEO Settings">
              <Globe size={20} />
            </button>
            <button
              onClick={() => setStatus(status === "draft" ? "published" : "draft")}
              className={`status-button ${status === "draft" ? "publish" : "draft"}`}
            >
              {status === "draft" ? "Publish" : "Draft"}
            </button>
            <button onClick={handleSubmit} className="save-button" disabled={isLoading || !title.trim()}>
              {isLoading ? (
                <>
                  <div className="spinner"></div> {blogId ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save size={16} /> {blogId ? "Update" : "Save"}
                </>
              )}
            </button>
          </div>
        </div>
        {message && (
          <div className={`create-blog-header-message ${message.includes("Error") || message.includes("Authentication") ? "error" : "success"}`}>
            {message}
          </div>
        )}
      </div>

      {/* Main */}
      <div className="create-blog-main">
        {featuredImage && (
          <div className="featured-image-container">
            <img src={featuredImage} alt="Featured" />
            <button onClick={() => setFeaturedImage("")}>
              <X size={16} />
            </button>
          </div>
        )}

        <textarea
          ref={titleRef}
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="blog-title"
          rows={1}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
        />

        {/* Render paragraphs, images, videos */}
        {renderContent()}

        {/* Add paragraph button */}
        <div className="add-paragraph-button" onClick={() => addParagraph()}>
          <Plus size={24} />






        </div>






      </div>

      {/* Media Panel */}
      {showMediaPanel && (
        <div className="panel">
          <div className="panel-header">
            <h3>Media & Settings</h3>
            <button onClick={() => setShowMediaPanel(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="panel-content">
            <div>
              <label>Featured Image</label>
              <div className="file-upload-container">
                <input
                  type="text"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="Image URL or upload file"
                />
                <button type="button" onClick={handleFeaturedImageUpload} className="upload-btn">
                  Upload
                </button>
              </div>
            </div>
            <div>
              <label>Categories</label>
              <input
                type="text"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                placeholder="Tech, Lifestyle, etc."
              />
            </div>
            <div>
              <label>Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="programming, design, etc."
              />
            </div>
          </div>
        </div>
      )}

      {/* SEO Panel */}
      {showSeoPanel && (
        <div className="panel">
          <div className="panel-header">
            <h3>SEO Settings</h3>
            <button onClick={() => setShowSeoPanel(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="panel-content">
            <div>
              <label>Meta Title</label>
              <input
                type="text"
                value={seoMetaTitle}
                onChange={(e) => setSeoMetaTitle(e.target.value)}
                placeholder="SEO optimized title"
              />
            </div>
            <div>
              <label>Meta Description</label>
              <textarea
                rows={3}
                value={seoMetaDescription}
                onChange={(e) => setSeoMetaDescription(e.target.value)}
                placeholder="Brief description for search engines"
              />
            </div>
            <div>
              <label>Keywords</label>
              <input
                type="text"
                value={seoMetaKeywords}
                onChange={(e) => setSeoMetaKeywords(e.target.value)}
                placeholder="keyword1, keyword2, etc."
              />
            </div>
            <div>
              <label>Canonical URL</label>
              <input
                type="text"
                value={seoCanonicalUrl}
                onChange={(e) => setSeoCanonicalUrl(e.target.value)}
                placeholder="https://example.com/blog-post"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateBlog;
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaThumbsUp, FaComment } from "react-icons/fa";

/**
 * Robust BlogDetail component
 * - Normalizes API response shapes (res.data.data or res.data)
 * - Normalizes content into ordered blocks (best-effort fallback)
 * - Handles like/comment responses with multiple possible shapes
 * - Uses token from AuthContext
 */
const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchBlog = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`http://localhost:5000/api/blogs/${encodeURIComponent(slug)}`);
        // normalize response: backend might return { data: blog } or blog directly
        const payload = res?.data?.data ?? res?.data ?? null;
        if (!payload) throw new Error("Invalid response shape from server");

        // ensure consistent blog shape: convert Mongoose doc to plain object
        const blogObj = payload.toObject ? payload.toObject() : payload;

        // If content is present as object (legacy), normalize later via normalizeContent
        if (mounted) setBlog(blogObj);
      } catch (err) {
        console.error("Fetch blog error:", err);
        if (mounted) setError(err.response?.data?.message || err.message || "Failed to fetch blog");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBlog();
    return () => { mounted = false; };
  }, [slug]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!blog) return <p>No blog found.</p>;

  // Helper: create a consistent array of content blocks in the original order if possible.
  // If backend already returns content as an array [{type, value, order?}, ...] we'll use it.
  const normalizeContent = (content) => {
    // If backend already stores an ordered array of blocks: use it.
    if (Array.isArray(content)) {
      // If blocks have an explicit order property, sort by it.
      if (content.some((b) => typeof b.order === "number")) {
        return [...content].sort((a, b) => (a.order || 0) - (b.order || 0));
      }
      return content;
    }

    // If content is object with paragraphs / images / videos:
    // Try to reconstruct order using optional 'position' fields on images/videos,
    // otherwise fall back to concatenation: paragraphs -> images -> videos.
    if (content && typeof content === "object") {
      const paragraphs = Array.isArray(content.paragraphs) ? content.paragraphs : [];
      const images = Array.isArray(content.images) ? content.images : [];
      const videos = Array.isArray(content.videos) ? content.videos : [];

      // Check if media items contain numeric 'position' fields.
      const mediaWithPos = [...images, ...videos].filter((m) => m && typeof m.position === "number");
      if (mediaWithPos.length > 0) {
        // Find max position
        const positions = mediaWithPos.map((m) => m.position);
        const maxPos = Math.max(...positions, paragraphs.length - 1, 0);
        // allocate array of size maxPos+1
        const slots = new Array(maxPos + 1).fill(null);

        // Place media in slots by position
        images.forEach((img) => {
          if (img && typeof img.position === "number") slots[img.position] = { type: "image", value: img.url ?? img };
        });
        videos.forEach((vid) => {
          if (vid && typeof vid.position === "number") slots[vid.position] = { type: "video", value: vid.url ?? vid };
        });

        // Fill remaining slots with paragraphs in order
        let paraIndex = 0;
        for (let i = 0; i < slots.length; i++) {
          if (!slots[i]) {
            if (paraIndex < paragraphs.length) {
              slots[i] = { type: "paragraph", value: paragraphs[paraIndex++] };
            }
          }
        }
        // any leftover paragraphs append at end
        while (paraIndex < paragraphs.length) {
          slots.push({ type: "paragraph", value: paragraphs[paraIndex++] });
        }

        // Filter nulls and return
        return slots.filter(Boolean);
      }

      // Fallback: no position info — concatenate paragraphs then images then videos
      const blocks = [];
      paragraphs.forEach((p) => blocks.push({ type: "paragraph", value: p }));
      images.forEach((img) => blocks.push({ type: "image", value: img.url ?? img }));
      videos.forEach((v) => blocks.push({ type: "video", value: v.url ?? v }));
      return blocks;
    }

    // Ultimately if content is a string, return one paragraph block
    if (typeof content === "string") return [{ type: "paragraph", value: content }];

    return [];
  };

  // Utility to safely get author display name
  const getAuthorName = (author) => author?.username || author?.name || author?.email || "Anonymous";

  // --- Actions: like and add comment ---
  const handleLike = async () => {
    if (!token) return alert("Please login to like the blog.");
    try {
      const res = await axios.post(
        `http://localhost:5000/api/blogs/${blog._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // backend might return different shapes:
      // - res.data.data = { likes: number, isLiked: boolean }
      // - res.data.data = { likes: [ids], isLiked: boolean }
      // - res.data = blog (updated blog)
      const payload = res?.data?.data ?? res?.data ?? null;
      if (!payload) return;

      if (Array.isArray(payload)) {
        // maybe returned full comments/likes arrays — not expected, but handle
        // just refresh full blog from server
        const fresh = await axios.get(`http://localhost:5000/api/blogs/${encodeURIComponent(slug)}`);
        setBlog(fresh?.data?.data ?? fresh?.data ?? fresh);
        return;
      }

      // If payload looks like the whole blog, replace it
      if (payload._id && payload._id === blog._id) {
        setBlog(payload);
        return;
      }

      // If likes is numeric or array, update blog.likes to an array of that length
      let likesCount = 0;
      if (typeof payload.likes === "number") likesCount = payload.likes;
      else if (Array.isArray(payload.likes)) likesCount = payload.likes.length;
      else likesCount = blog.likes?.length ?? 0;

      // Update isLiked if provided
      const isLiked = typeof payload.isLiked === "boolean" ? payload.isLiked : blog.isLiked;

      setBlog((prev) => ({
        ...prev,
        likes: Array(likesCount).fill(null), // preserve .length usage in UI
        isLiked,
      }));
    } catch (err) {
      console.error("Like error:", err);
      alert(err.response?.data?.message || "Failed to toggle like");
    }
  };

  const handleAddComment = async () => {
    if (!token) return alert("Please login to comment.");
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:5000/api/blogs/${blog._id}/comments`,
        { content: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const payload = res?.data?.data ?? res?.data ?? null;
      // If server returned full blog or comments list:
      if (Array.isArray(payload)) {
        setBlog((prev) => ({ ...prev, comments: payload }));
      } else if (payload && payload.comments) {
        setBlog((prev) => ({ ...prev, comments: payload.comments }));
      } else if (payload && payload._id === blog._id) {
        setBlog(payload);
      } else {
        // fallback: refetch blog
        const fresh = await axios.get(`http://localhost:5000/api/blogs/${encodeURIComponent(slug)}`);
        setBlog(fresh?.data?.data ?? fresh?.data ?? fresh);
      }

      setCommentText("");
    } catch (err) {
      console.error("Add comment error:", err);
      alert(err.response?.data?.message || "Failed to add comment");
    }
  };

  // Render
  const blocks = normalizeContent(blog.content);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        ← Back
      </button>

      <h1>{blog.title}</h1>
<p style={{ fontSize: 20, color: "#000000ff", display: "flex", alignItems: "center", gap: "10px" }}>
  {/* Profile Image */}
  <img 
    src={blog.author?.image || "/src/assets/avatar.jpg"} 
    alt={getAuthorName(blog.author)} 
    style={{ width: 40, height: 40, borderRadius: "50%",objectFit:"cover" }}
  />
  
  {/* Author + Date + Categories */}
  <span>
     Written By <strong>{getAuthorName(blog.author)}</strong> |{" "}
    {new Date(blog.createdAt).toLocaleDateString()} |{" "}
    {Array.isArray(blog.categories) ? blog.categories.join(", ") : blog.categories}
  </span>
</p>


      {blog.featuredImage && (
        <img src={blog.featuredImage} alt={blog.title} style={{ width: "100%", margin: "20px 0", borderRadius: 10 }} />
      )}

      {/* content blocks */}
      {blocks.map((block, idx) => {
        if (block.type === "paragraph") {
          return (
            <p key={idx} style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 15 }}>
              {block.value}
            </p>
          );
        }
        if (block.type === "image") {
          return (
            <img
              key={idx}
              src={block.value}
              alt={`content-${idx}`}
              style={{ width: "100%",height:"200px", margin: "20px 0", }}
            />
          );
        }
        if (block.type === "video") {
          return (
            <video key={idx} src={block.value} controls style={{ width: "100%", margin: "20px 0" }} />
          );
        }
        if (block.type === "code") {
          return (
            <pre key={idx} style={{ background: "#000000ff", padding: 12, color:"white", overflowX: "auto" }}>
              <code>{block.value}</code>
            </pre>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote key={idx} style={{ fontStyle: "italic", borderLeft: "3px solid #ccc", margin: "20px 0", paddingLeft: 12,backgroundColor:"#ebececff",color:"#000000ff" }}>
              {block.value}
            </blockquote>
          );
        }
        return null;
      })}

      <div style={{ margin: "10px 0" }}>
        {Array.isArray(blog.tags) &&
          blog.tags.map((t) => (
            <span key={t} style={{ backgroundColor: "#f0f0f0", padding: "5px 10px", borderRadius: 20, fontSize: 12, marginRight: 5 }}>
              #{t}
            </span>
          ))}
      </div>

      {/* Likes & comments summary */}
      <div style={{ marginTop: 15, display: "flex", alignItems: "center", gap: 15 }}>
        <button
          onClick={handleLike}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #1a8917",
            backgroundColor: blog.isLiked ? "#1a8917" : "#fff",
            color: blog.isLiked ? "#fff" : "#1a8917",
            cursor: "pointer",
          }}
        >
          <FaThumbsUp />
          {typeof blog.likes === "number" ? blog.likes : (Array.isArray(blog.likes) ? blog.likes.length : (blog.likes?.length ?? 0))}
        </button>

        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FaComment />
          {Array.isArray(blog.comments) ? blog.comments.length : (typeof blog.comments === "number" ? blog.comments : 0)}
        </span>
      </div>

      {/* Add comment */}
      {token ? (
        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
          />
          <button onClick={handleAddComment} style={{ padding: "8px 14px", borderRadius: 6, background: "#1a8917", color: "#fff", border: "none", cursor: "pointer" }}>
            Comment
          </button>
        </div>
      ) : (
        <p style={{ color: "#666", marginTop: 12 }}>Log in to like or comment.</p>
      )}

      {/* Comments list */}
      <div style={{ marginTop: 20 }}>
        {Array.isArray(blog.comments) && blog.comments.length > 0 ? (
          blog.comments.map((c, i) => (
            <div key={c._id ?? `c-${i}`} style={{ padding: 10, borderBottom: "1px solid #eee" }}>
              <strong>{c.user?.username ?? c.user?.name ?? "Anonymous"}</strong>
              <div style={{ marginTop: 6 }}>{c.content}</div>
              <small style={{ color: "#888" }}>{new Date(c.createdAt).toLocaleString()}</small>
            </div>
          ))
        ) : (
          <p style={{ color: "#666" }}>No comments yet.</p>
        )}
      </div>
    </div>
  );
};

export default BlogDetail;

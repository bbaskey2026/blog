// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart,Pencil, MessageCircle, Eye, User, Globe ,Star} from "lucide-react"; // Lucide icons
import './BlogList.css';

const HomePage = () => {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Calculate engagement score
  const calculateScore = (blog) => {
    const likes = blog.likesCount || 0;
    const comments = blog.commentsCount || 0;
    const views = blog.viewsCount || 0;
    return likes * 3 + comments * 2 + views * 1;
  };

  // Fetch blogs with pagination
  const fetchBlogs = async (pageNumber) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/blogs/all?page=${pageNumber}&limit=6`
      );
      const data = await res.json();

      let newBlogs;
      if (pageNumber === 1) {
        newBlogs = data.items;
      } else {
        newBlogs = [...blogs, ...data.items];
      }

      setBlogs(newBlogs);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBlogs(nextPage);
    }
  };

  // Extract preview text
  const getPreviewText = (content) => {
    if (!Array.isArray(content)) return "";
    const firstParagraph = content.find((c) => c.type === "paragraph");
    if (firstParagraph) {
      return firstParagraph.value.length > 180
        ? firstParagraph.value.substring(0, 180) + "..."
        : firstParagraph.value;
    }
    return "";
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate read time
  const calculateReadTime = (content) => {
    if (!Array.isArray(content)) return "1 min read";
    const wordCount = content.reduce((count, item) => {
      if (item.type === "paragraph") {
        return count + item.value.split(" ").length;
      }
      return count;
    }, 0);
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    return `${readTime} min read`;
  };

  // Pick top 10 featured blogs by engagement
  const featuredBlogs = [...blogs]
    .sort((a, b) => calculateScore(b) - calculateScore(a))
    .slice(0, 10);

  return (
    <div className="medium-container">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">MyBlog</h1>
          <p className="hero-subtitle">
            A place to read, write, and deepen your understanding
          </p>
          <div className="hero-cta">
            <Link to="/create-blog" className="cta-button primary">
            <Pencil size={20}/>
              Start Writing
            </Link>
            <Link to="/explore" className="cta-button secondary">
             <Globe size={20}/> Explore
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {/* Featured Stories */}
          {featuredBlogs.length > 0 && (
            <section className="featured-section">
              <h2 className="section-title">Featured Stories
                 <Star size={30} color="green" />
              </h2>
              <div className="featured-grid">
                {featuredBlogs.map((blog) => (
                  <article key={blog._id} className="featured-article">
                    {/* Featured Image */}
                    <img
                      src={
                        blog.featuredImage
                          ? blog.featuredImage
                          : "/src/assets/avatar.jpg"
                      }
                      alt={blog.title}
                      className="featured-image"
                    />

                    <div className="featured-content">
                      {/* Author Info */}
                      <div className="author-info">
                        {blog.author?.image ? (
                          <img
                            src={blog.author.image}
                            alt={blog.author.name}
                            className="author-avatar"
                          />
                        ) : (
                          <div className="author-avatar">
                            <User size={20} />
                          </div>
                        )}
                        <div className="author-details">
                          <span className="author-name">
                            {blog.author?.name || "Anonymous"}
                          </span>
                          <span className="article-meta">
                            {formatDate(blog.createdAt)} ·{" "}
                            {calculateReadTime(blog.content)}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h1 className="featured-title">
                        <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                      </h1>

                      {/* Preview */}
                      <p className="featured-preview">
                        {getPreviewText(blog.content)}
                      </p>

                      {/* Tags */}
                      <div className="article-tags">
                        <span className="tag">Featured</span>
                        {blog.category && (
                          <span className="tag">{blog.category}</span>
                        )}
                      </div>

                      {/* Engagement Stats */}
                      <div className="engagement-stats">
                        <span className="stat">
                          <Heart size={20} color="red" /> {blog.likesCount || 0}
                        </span>
                        <span className="stat">
                          <MessageCircle size={20}  color="green"/> {blog.commentsCount || 0}
                        </span>
                        <span className="stat">
                          <Eye size={20}  color="black"/> {blog.viewsCount || 0}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Latest Stories */}
          <section className="stories-section">
            <h2 className="section-title">Latest Stories</h2>
            <div className="stories-grid">
              {blogs
                .filter(
                  (b) => !featuredBlogs.some((fb) => fb._id === b._id) // exclude featured
                )
                .map((blog) => (
                  <article key={blog._id} className="story-card">
                    {/* Thumbnail */}
                    <Link to={`/blog/${blog.slug}`}>
                      <img
                        src={
                          blog.featuredImage
                            ? blog.featuredImage
                            : "/default-featured.jpg"
                        }
                        alt={blog.title}
                        className="story-image"
                      />
                    </Link>

                    {/* Content */}
                    <div className="story-content">
                      <div className="author-info">
                        {blog.author?.image ? (
                          <img
                            src={blog.author.image}
                            alt={blog.author.name}
                            className="author-avatar"
                          />
                        ) : (
                          <div className="author-avatar">
                            <User size={16} />
                          </div>
                        )}
                        <div className="author-details">
                          <span className="author-name">
                            {blog.author?.name || "Anonymous"}
                          </span>
                          <span className="article-meta">
                            {formatDate(blog.createdAt)} ·{" "}
                            {calculateReadTime(blog.content)}
                          </span>
                        </div>
                      </div>

                      <h2 className="story-title">
                        <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                      </h2>

                      <p className="story-preview">
                        {getPreviewText(blog.content)}
                      </p>

                      <div className="story-footer">
                        <div className="engagement-stats">
                          <span className="stat">
                            <Heart size={16} /> {blog.likesCount || 0}
                          </span>
                          <span className="stat">
                            <MessageCircle size={16} />{" "}
                            {blog.commentsCount || 0}
                          </span>
                          <span className="stat">
                            <Eye size={16} /> {blog.viewsCount || 0}
                          </span>
                        </div>
                        {blog.category && (
                          <span className="category-tag">{blog.category}</span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          </section>

          {/* Load More */}
          {page < totalPages && (
            <div className="load-more-section">
              <button
                className={`load-more-btn ${loading ? "loading" : ""}`}
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div> Loading...
                  </>
                ) : (
                  "Load More Stories"
                )}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;

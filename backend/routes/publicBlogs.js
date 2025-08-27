// routes/publicBlogs.js
import express from "express";
import Blog from "../models/Blog.js";

const router = express.Router();

// Public endpoint: Fetch blogs with filters & pagination (Production ready)
router.get("/", async (req, res) => {
  try {
    // Destructure query parameters with defaults
    const {
      category = null,        // Filter by category
      tag = null,             // Filter by tag
      search = null,          // Search by title
      sortBy = "trending",    // trending, latest, recent, mostLiked
      page = 1,               // Page number
      limit = 10,             // Items per page
    } = req.query;

    // Ensure numeric pagination
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50); // max 50 per page

    // Build filters
    const filter = {};
    if (category) filter.categories = category;
    if (tag) filter.tags = tag;
    if (search) filter.title = { $regex: search, $options: "i" };

    // Base query
    let query = Blog.find(filter).populate("author", "name email");

    // Sorting
    switch (sortBy) {
      case "trending":
        query = query.sort({ views: -1 }); // Most viewed first
        break;
      case "latest":
        query = query.sort({ updatedAt: -1 }); // Recently updated first
        break;
      case "recent":
        query = query.sort({ createdAt: -1 }); // Recently created first
        break;
      case "mostLiked":
        query = query.sort({ likeCount: -1 }); // Most liked first (if you maintain likeCount)
        break;
      default:
        query = query.sort({ createdAt: -1 });
        break;
    }

    // Pagination
    const total = await Blog.countDocuments(filter);
    const blogs = await query
      .skip((pageNumber - 1) * pageLimit)
      .limit(pageLimit);

    // Response with meta data
    res.json({
      success: true,
      meta: {
        total,                     // Total number of blogs matching filter
        page: pageNumber,           // Current page
        limit: pageLimit,           // Items per page
        totalPages: Math.ceil(total / pageLimit),
      },
      data: blogs,
    });
  } catch (err) {
    console.error("Error fetching blogs:", err.message);
    res.status(500).json({
      success: false,
      message: "Server Error. Please try again later.",
    });
  }
});

export default router;

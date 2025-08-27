import express from "express";
import { body, validationResult } from "express-validator";
import Blog from "../models/Blog.js";
import  {auth}  from "../middleware/auth.js";
import upload from "../middleware/upload.js";
const router = express.Router();


// Helper: pagination
function getPagination(query) {
  const page = Math.max(parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "10", 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

// Helper: generate slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")  // remove special chars
    .replace(/\s+/g, "-");     // replace spaces with dash
}

/**
 * 1️⃣ GET: Get all blogs (paginated)
 */
router.get("/all", async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const [items, total] = await Promise.all([
      Blog.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "name email profilePic")
        .populate({
          path: "comments",
          select: "content author createdAt",
          populate: { path: "author", select: "name profilePic" }
        })
        .select("-__v")
        .lean()
        .exec(),
      Blog.countDocuments({})
    ]);

    const blogs = items.map(blog => ({
      ...blog,
      totalLikes: blog.likes ? blog.likes.length : 0,
      totalComments: blog.comments ? blog.comments.length : 0
    }));

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items: blogs
    });
  } catch (e) {
    next(e);
  }
});

/**
 * 2️⃣ GET: Get blogs of authenticated user
 */
router.get("/user-blogs", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const blogs = await Blog.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate("author", "name email");
    res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 3️⃣ POST: Create new blog
 */


// Single route to handle multiple files and content
router.post(
  "/create-new-blogs",
  auth,
  upload.array("files"), // 'files' is the field name in Postman/form-data
  async (req, res, next) => {
    try {
      // Check if title exists
      const title = req.body.title;
      if (!title) return res.status(400).json({ message: "Title is required" });

      // Parse content safely
      let content = [];
      if (req.body.content) {
        try {
          content = JSON.parse(req.body.content);
          if (!Array.isArray(content) || content.length === 0) {
            return res.status(400).json({ message: "Content must be a non-empty array" });
          }
        } catch (err) {
          return res.status(400).json({ message: "Content must be valid JSON array" });
        }
      }

      // Parse optional fields
      const categories = req.body.categories ? JSON.parse(req.body.categories) : [];
      const tags = req.body.tags ? JSON.parse(req.body.tags) : [];
      const seo = req.body.seo ? JSON.parse(req.body.seo) : {};
      const status = req.body.status || "draft";

      const data = {
        title,
        content,
        categories,
        tags,
        seo,
        status,
        author: req.user.id,
      };

      // Handle uploaded files
      if (req.files && req.files.length > 0) {
        const uploadedFiles = req.files.map(file => {
          const typeMap = {
            "image/png": "image",
            "image/jpeg": "image",
            "image/jpg": "image",
            "image/gif": "image",
            "video/mp4": "video",
            "video/mov": "video",
            "video/avi": "video",
            "application/pdf": "file",
            "application/msword": "file",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "file",
            "application/vnd.ms-excel": "file",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "file",
            "text/csv": "file",
            "text/plain": "file",
          };
          return {
            type: typeMap[file.mimetype] || "file",
            value: `/uploads/${file.filename}`,
            name: file.originalname,
          };
        });
        data.content = [...data.content, ...uploadedFiles];
      }

      // Generate unique slug
      let slug = generateSlug(data.title);
      const exists = await Blog.findOne({ slug });
      if (exists) slug = `${slug}-${Date.now()}`;
      data.slug = slug;

      const blog = await Blog.create(data);
      res.status(201).json(blog);

    } catch (e) {
      next(e);
    }
  }
);




/**
 * GET: Get single blog by ID for authenticated user
 */
router.get("/user-blogs/:id", auth, async (req, res) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id, author: req.user.id })
      .populate("author", "name email profilePic")
      .populate({
        path: "comments",
        select: "content author createdAt likes replies",
        populate: { path: "author", select: "name profilePic" }
      });

    if (!blog) return res.status(404).json({ message: "Blog not found or access denied" });

    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching blog" });
  }
});


/**
 * 4️⃣ GET: Get single blog by slug
 */
router.get("/:slug", async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: "published" })
      .populate("author", "name email");

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Increment views
    blog.views = (blog.views || 0) + 1;
    await blog.save();

    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching blog" });
  }
});

/**
 * 5️⃣ PATCH: Update blog
 */
router.patch("/:id", auth, async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    if (blog.author.toString() !== req.user.id) return res.status(403).json({ message: "Forbidden" });

    const updatable = ["title", "content", "categories", "code","tags", "featuredImage", "status", "seo"];
    updatable.forEach(k => {
      if (req.body[k] !== undefined) blog[k] = req.body[k];
    });

    // Update slug if title changed
    if (req.body.title && req.body.title !== blog.title) {
      let newSlug = generateSlug(req.body.title);
      const exists = await Blog.findOne({ slug: newSlug, _id: { $ne: blog._id } });
      if (exists) newSlug = `${newSlug}-${Date.now()}`;
      blog.slug = newSlug;
    }

    await blog.save();
    res.json(blog);
  } catch (e) {
    next(e);
  }
});

/**
 * 6️⃣ DELETE: Delete blog
 */
router.delete("/:id",auth, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
/**
 * 7️⃣ POST: Like/unlike blog
 */
router.post("/:id/like", auth, async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Not found" });

    const uid = req.user.id;
    const has = blog.likes.some(u => u.toString() === uid);
    if (has) blog.likes = blog.likes.filter(u => u.toString() !== uid);
    else blog.likes.push(uid);

    await blog.save();
    res.json({ likesCount: blog.likes.length, liked: !has });
  } catch (e) {
    next(e);
  }
});

/**
 * 8️⃣ POST: Add comment
 */
router.post("/:id/comments", auth, body("content").notEmpty(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Not found" });

    blog.comments.push({ user: req.user.id, content: req.body.content });
    await blog.save();
    res.status(201).json(blog.comments.at(-1));
  } catch (e) {
    next(e);
  }
});

/**
 * 9️⃣ POST: Like comment
 */
router.post("/:id/comments/:commentId/like", auth, async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Not found" });

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const uid = req.user.id;
    const has = comment.likes.some(u => u.toString() === uid);
    if (has) comment.likes = comment.likes.filter(u => u.toString() !== uid);
    else comment.likes.push(uid);

    await blog.save();
    res.json({ likesCount: comment.likes.length, liked: !has });
  } catch (e) {
    next(e);
  }
});

/**
 *  🔟 POST: Add reply
 */
router.post("/:id/comments/:commentId/replies", auth, body("content").notEmpty(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Not found" });

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.replies.push({ user: req.user.id, content: req.body.content });
    await blog.save();
    res.status(201).json(comment.replies.at(-1));
  } catch (e) {
    next(e);
  }
});

export default router;

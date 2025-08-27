import mongoose from "mongoose";
import slugify from "slugify";

const ReplySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
  content: { type: String, trim: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
  content: { type: String, trim: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  replies: [ReplySchema],
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const ContentBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["paragraph", "image", "video", "code", "quote"]
  },
  value: { type: String },
  language: { type: String } // for code blocks
}, { _id: false });

const BlogSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  slug: { type: String, unique: true, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
 // optional
  content: { type: [ContentBlockSchema], default: [] },
  categories: [{ type: String, index: true }],
  tags: [{ type: String, index: true }],
  featuredImage: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [CommentSchema],
  status: { 
    type: String, 
    enum: ["draft", "published", "archived"], 
    default: "draft", 
    index: true 
  },
  views: { type: Number, default: 0 },
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    canonicalUrl: String
  }
}, { timestamps: true });

// Auto-generate slug if not provided
BlogSchema.pre("validate", function(next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model("Blog", BlogSchema);

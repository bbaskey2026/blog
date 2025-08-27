import Blog from "../models/Blog.js";

export async function ensureTextIndex() {
  try {
    await Blog.collection.createIndex(
      { title: "text", "content.value": "text", tags: 1, categories: 1 },
      { name: "blog_text_index" }
    );
    console.log("✅ Text index ensured");
  } catch (e) {
    console.warn("Text index creation skipped:", e?.message);
  }
}

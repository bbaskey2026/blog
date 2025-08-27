import "dotenv/config.js";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { apiLimiter } from "./middleware/rateLimit.js";
import { notFound, errorHandler } from "./middleware/error.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import blogRoutes from "./routes/blogs.js";
import { ensureTextIndex } from "./utils/textIndex.js";
import adminRoute from "./routes/adminRoute.js"
const app = express();

// Core middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(compression());
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
app.use("/api", apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/admin",adminRoute)
app.use(notFound);
app.use(errorHandler);

// Start
const port = process.env.PORT || 5000;
const uri = process.env.MONGO_URI;

connectDB(uri)
  .then(ensureTextIndex)
  .then(() => app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`)))
  .catch((e) => {
    console.error("Failed to start:", e);
    process.exit(1);
  });

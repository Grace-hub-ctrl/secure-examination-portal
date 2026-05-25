import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./server/db.ts";
import authRoutes from "./server/routes/authRoutes.ts";
import examRoutes from "./server/routes/examRoutes.ts";
import resultRoutes from "./server/routes/resultRoutes.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Start MongoDB connection in background
  connectDB().catch(err => console.error("Initial DB connection failed:", err));

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/exams", examRoutes);
  app.use("/api/results", resultRoutes);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  let vite: any;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
  }

  // Fallback to index.html
  app.get("*", async (req, res, next) => {
    if (req.url.startsWith("/api")) return next();

    try {
      let template: string;
      let html: string;
      
      if (process.env.NODE_ENV !== "production" && vite) {
        template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        html = await vite.transformIndexHtml(req.url, template);
      } else {
        html = fs.readFileSync(path.resolve(process.cwd(), "dist", "index.html"), "utf-8");
      }
      
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      console.error("Error serving index.html:", e);
      next(e);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ExamGuard Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical server error:", err);
});

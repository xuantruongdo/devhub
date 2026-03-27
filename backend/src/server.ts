import "reflect-metadata";
import "dotenv/config";
import express from "express";
import { AppDataSource } from "./config/data-source";

const app = express();
const PORT = Number(process.env.PORT) || 4040;

app.use(express.json());

// Connect DB trước khi start server
AppDataSource.initialize()
  .then(() => {
    console.log("✅ Connected to PostgreSQL");

    app.get("/", (req, res) => {
      res.send("API is running...");
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err);
  });

export default app;

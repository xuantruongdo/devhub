import "reflect-metadata";
import "dotenv/config";
import express from "express";
import { AppDataSource } from "./config/data-source";
import { useContainer, useExpressServer } from "routing-controllers";
import { UserController } from "./controllers/UserController";
import { ErrorHandler } from "./middlewares/ErrorHandler";
import Container from "typedi"; 

useContainer(Container);

const PORT = Number(process.env.PORT) || 4040;

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Connected to PostgreSQL");

    const app = express();

    app.get("/", (req, res) => {
      res.send("API is running...");
    });

    useExpressServer(app, {
      controllers: [UserController],
      middlewares: [ErrorHandler],
      cors: {
        origin: "*",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      },
      validation: {
        whitelist: true,
        forbidNonWhitelisted: true,
      },
      routePrefix: "/api",
      defaultErrorHandler: false,
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err);
  });

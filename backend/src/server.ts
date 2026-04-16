import "reflect-metadata";
import "dotenv/config";
import express from "express";
import { AppDataSource } from "./config/data-source";
import { Action, useContainer, useExpressServer } from "routing-controllers";
import { UserController } from "./controllers/UserController";
import { ErrorHandler } from "./middlewares/ErrorHandler";
import Container from "typedi";
import {
  AuthMiddleware,
  authorizationChecker,
} from "./middlewares/AuthMiddleware";
import cookieParser from "cookie-parser";
import { PostController } from "./controllers/PostController";
import { StorageController } from "./controllers/StorageController";
import { NotificationController } from "./controllers/NotificationController";
import { ChatController } from "./controllers/ChatController";
import { initSocket } from "./config/socket";
import http from "http";
import { initWorkers } from "./config/worker";

useContainer(Container);

const PORT = Number(process.env.PORT) || 4040;

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Connected to PostgreSQL");

    // Tạm tắt phần queue, BẬT lại sau khi build redis
    // initWorkers();

    const app = express();

    app.use(cookieParser());

    app.get("/", (req, res) => {
      res.send("API is running...");
    });

    useExpressServer(app, {
      controllers: [
        UserController,
        PostController,
        StorageController,
        NotificationController,
        ChatController,
      ],
      middlewares: [ErrorHandler, AuthMiddleware],
      authorizationChecker: authorizationChecker,
      currentUserChecker: async (action: Action) => {
        const req = action.request;
        return req.user;
      },
      cors: {
        origin: [process.env.FRONTEND_URL],
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      },
      validation: {
        whitelist: true,
        forbidNonWhitelisted: true,
      },
      routePrefix: "/api/v1",
      defaultErrorHandler: false,
    });

    const httpServer = http.createServer(app);

    initSocket(httpServer);

    // IMPORTANT: listen on httpServer, NOT app
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection error:", err);
  });

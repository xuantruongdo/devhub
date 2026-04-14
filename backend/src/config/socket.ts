import { Server } from "socket.io";
import http from "http";

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  console.log("⚡ Socket.IO initialized successfully");

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    /**
     * JOIN USER ROOM
     * dùng để push notification / message riêng user
     */
    socket.on("user:join", (userId: number) => {
      const id = Number(userId);
      if (!id) return;

      socket.join(`user:${id}`);

      console.log(`👤 User joined room: user:${id}`);
    });

    /**
     * JOIN CONVERSATION ROOM
     * dùng để chat realtime theo conversation
     */
    socket.on("conversation:join", (conversationId: number) => {
      const id = Number(conversationId);
      if (!id) return;

      socket.join(`conversation:${id}`);

      console.log(`💬 Joined conversation room: conversation:${id}`);
    });

    socket.on(
      "call:offer",
      ({ to, from, offer, conversationId, callerName, callerAvatar }) => {
        socket.to(`user:${to}`).emit("call:incoming", {
          from,
          offer,
          conversationId,
          callerName,
          callerAvatar,
        });
      },
    );

    socket.on("call:answer", ({ to, from, answer }) => {
      socket.to(`user:${to}`).emit("call:answered", {
        from,
        answer,
      });
    });

    socket.on("call:ice-candidate", ({ to, candidate }) => {
      socket.to(`user:${to}`).emit("call:ice-candidate", {
        candidate,
      });
    });

    socket.on("call:end", ({ to, from }) => {
      socket.to(`user:${to}`).emit("call:ended", { from });
    });

    socket.on("call:reject", ({ to, from, conversationId }) => {
      socket.to(`user:${to}`).emit("call:rejected", {
        from,
        conversationId,
      });
    });

    socket.on("call:cancel", ({ to, from, conversationId }) => {
      socket.to(`user:${to}`).emit("call:cancelled", {
        from,
        conversationId,
      });
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

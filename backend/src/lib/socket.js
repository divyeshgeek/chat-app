import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Used to store online users
const userSocketMap = new Map(); // {userId: socketId}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  socket.on("disconnect", () => {
    console.log(userId, "A user disconnected", socket.id);
    delete userSocketMap[userId];
    console.log("userSocketMap :: after disconnect", userSocketMap);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  console.log(userId, "A user connected", socket.id);
  if (userId) {
    userSocketMap[userId] = socket.id;
    // io.emit is used to send a message to all connected clients
    console.log("userSocketMap", userSocketMap);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }
});

export { io, app, server };

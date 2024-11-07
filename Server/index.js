import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import UserRoutes from "./Routes/UserRoutes.js";
import chatRoutes from "./Routes/chatRoutes.js";
import { Server as SocketIO } from "socket.io";
import http from "http";
import Chat from "./Model/Chat.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = new SocketIO(server, {
  cors: {
    origin: ["http://localhost:5173", process.env.CLIENT_URL],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
  // transports: ["websocket", "polling"],
});

console.log("MongoURL " , process.env.MONGO_URL);

// Connect to MongoDB
connectDB();

app.use(
  cors({
    origin: ["http://localhost:5173", process.env.CLIENT_URL],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

app.use("/api/users", UserRoutes);
app.use("/api/chats", chatRoutes);
app.use("/uploads", express.static("uploads"));

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle the 'join' event to subscribe users to their own room
  socket.on("join", (username) => {
    socket.join(username); // User joins their own room
    console.log(`${username} joined room ${username}`);
  });

  // Handle the 'sendMessage' event
  socket.on("sendMessage", async ({ sender, receiver, text, timestamp }) => {
    try {
      const newMessage = new Chat({ sender, receiver, text, timestamp });
      await newMessage.save();

      // Emit to both sender and receiver rooms
      io.to(receiver).emit("receiveMessage", { sender, text, timestamp });

      console.log(`Message sent from ${sender} to ${receiver}`);
      console.log(`Emitting message to ${receiver} and ${sender}`);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // Handle new user registration
  socket.on("newUser", (userData) => {
    // Broadcast to everyone except the new user
    socket.broadcast.emit("newUserRegistered", userData);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

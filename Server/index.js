import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import UserRoutes from "./Routes/UserRoutes.js";
import chatRoutes from "./Routes/chatRoutes.js";
import { Server as SocketIO } from "socket.io";
import http from "http";
import path from "path";
import Chat from "./Model/Chat.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration for both HTTP routes and Socket.IO
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://chatterbox-frontend-ikdb.onrender.com",
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allows cookies or authorization headers
};

// Apply CORS middleware for HTTP routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Preflight requests

// Middleware
app.use(express.json());

// API Routes
app.use("/api/users", UserRoutes);
app.use("/api/chats", chatRoutes);
app.use("/uploads", express.static("uploads"));

// Connect to MongoDB
connectDB();

// Serve static files from React build folder
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend", "build")));

  // Catch-all route to serve index.html for any route not defined in the API
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
  });
}

// Configure Socket.IO with CORS options
const io = new SocketIO(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://chatterbox-frontend-ikdb.onrender.com",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"],
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle the 'join' event
  socket.on("join", (username) => {
    socket.join(username); // User joins their own room
    console.log(`${username} joined room ${username}`);
  });

  // Handle the 'sendMessage' event
  socket.on("sendMessage", async ({ sender, receiver, text, timestamp }) => {
    try {
      const newMessage = new Chat({ sender, receiver, text, timestamp });
      await newMessage.save();

      // Emit message to receiver room
      io.to(receiver).emit("receiveMessage", { sender, text, timestamp });

      console.log(`Message sent from ${sender} to ${receiver}`);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // Handle new user registration
  socket.on("newUser", (userData) => {
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

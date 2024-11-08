import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import UserRoutes from "./Routes/UserRoutes.js";
import chatRoutes from "./Routes/chatRoutes.js";
import { Server as SocketIO } from "socket.io";
import http from "http";
import path from "path"; // Import path module
import Chat from "./Model/Chat.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://chatterbox-frontend-ikdb.onrender.com",
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Middleware
app.use(express.json());

// API Routes
app.use("/api/users", UserRoutes);
app.use("/api/chats", chatRoutes);
app.use("/uploads", express.static("uploads"));

// Connect to MongoDB
connectDB();

// Serve React static files in production
if (process.env.NODE_ENV === "production") {
  // Correct path to 'Client/dist' folder (assuming you have a dist folder after build)
  app.use(express.static(path.join(__dirname, "Client", "dist")));

  // Send all other requests to the React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "Client", "dist", "index.html"));
  });
}

// Socket.IO setup
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

  socket.on("join", (username) => {
    socket.join(username);
    console.log(`${username} joined room ${username}`);
  });

  socket.on("sendMessage", async ({ sender, receiver, text, timestamp }) => {
    try {
      const newMessage = new Chat({ sender, receiver, text, timestamp });
      await newMessage.save();
      io.to(receiver).emit("receiveMessage", { sender, text, timestamp });
      console.log(`Message sent from ${sender} to ${receiver}`);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("newUser", (userData) => {
    socket.broadcast.emit("newUserRegistered", userData);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

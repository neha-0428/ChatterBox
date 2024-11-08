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

// Configure CORS for Socket.IO
const io = new SocketIO(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://chatterbox-frontend-7jkd.onrender.com",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});

// Connect to MongoDB
connectDB();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://chatterbox-frontend-7jkd.onrender.com",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// API Routes
app.use("/api/users", UserRoutes);
app.use("/api/chats", chatRoutes);
app.use("/uploads", express.static("uploads"));

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "/Client/dist")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "Client", "dist", "index.html"))
  );
}

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

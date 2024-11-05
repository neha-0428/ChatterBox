import express from "express";
import User from "../Model/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); // Created the uploads directory
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

// File type validation for image uploads
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});

// Route to update user profile picture
router.post(
  "/uploadProfilePicture",
  upload.single("profilePicture"),
  async (req, res) => {
    const { userId } = req.body;
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : "";

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.profilePicture = profilePicture;
      await user.save();

      res.status(200).json({
        message: "Profile picture updated successfully",
        profilePicture,
      });
    } catch (error) {
      console.error("Error in /uploadProfilePicture route:", error.message);
      res.status(500).json({ error: error.message || "Server error" });
    }
  }
);

// Register Route
router.post("/register", async (req, res) => {
  const {
    username,
    email,
    password,
    confirmPassword,
    securityQuestion,
    securityAnswer,
  } = req.body;

  // Validate password match
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedSecurityAnswer = await bcrypt.hash(securityAnswer, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      securityQuestion,
      securityAnswer: hashedSecurityAnswer,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Password does not match" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({
      token,
      username: user.username,
      userId: user._id,
      profilePicture: user.profilePicture,
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// Fetch all chats for a user
// Fetch a specific user by username (for profile picture)
router.get("/user/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      username: user.username,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add a user to the chat list
router.post("/addChat/:username", async (req, res) => {
  const { username } = req.params;
  const { newChatUsername } = req.body;

  try {
    const user = await User.findOne({ username });
    const newChatUser = await User.findOne({ username: newChatUsername });

    if (!newChatUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (newChatUsername === username) {
      return res
        .status(400)
        .json({ message: "You cannot add yourself to chats" });
    }

    if (!user.chats.includes(newChatUser._id)) {
      user.chats.push(newChatUser._id);
      await user.save();
      res.status(200).json({ message: "Chat added successfully" });
    } else {
      res.status(200).json({ message: "User already in chat list" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//Get username and profilePicture of a user
router.get("/userPic/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      username: user.username,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

//get chats of a user
router.get("/user/:username/chats", async (req, res) => {
  const { username } = req.params;

  try {
    // Find the user and get their chats
    const user = await User.findOne({ username }).populate("chats");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the list of chats
    res.json({ chats: user.chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Reset the password
router.post("/reset-password", async (req, res) => {
  const { email, password, securityAnswer } = req.body;

  if (!email || !password || !securityAnswer) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Compare the provided security answer with the hashed answer in the database
    const isAnswerCorrect = await bcrypt.compare(
      securityAnswer,
      user.securityAnswer
    );
    if (!isAnswerCorrect) {
      return res.status(400).json({ error: "Security answer is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

//Forgot the password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    return res.json({ message: "Please reset password" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get security question by email
router.get("/security-question/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    return res.json({ securityQuestion: user.securityQuestion });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;

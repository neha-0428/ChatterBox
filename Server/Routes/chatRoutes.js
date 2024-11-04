import express from "express";
import Message from "../Model/Chat.js";

const router = express.Router();

// Get messages between two users
router.get("/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post a new message
router.post("/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;
  const { message } = req.body;

  try {
    const newMessage = new Message({
      sender: user1,
      receiver: user2,
      text: message,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

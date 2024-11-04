import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Store the users they have chatted with
  securityQuestion: { type: String, required: true },
  securityAnswer: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

export default User;

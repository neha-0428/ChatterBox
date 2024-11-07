// src/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");
// const socket = io("https://chatterbox-server-c59o.onrender.com");

export default socket;

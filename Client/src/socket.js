// src/socket.js
import { io } from "socket.io-client";

export const BASE_URL = "https://chatterbox-70lg.onrender.com";

const socket = io(BASE_URL);

export default socket;

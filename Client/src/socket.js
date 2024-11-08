// src/socket.js
import { io } from "socket.io-client";

export const BASE_URL = "http://localhost:5000";

const socket = io(BASE_URL);

export default socket;

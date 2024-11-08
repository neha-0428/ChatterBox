// src/socket.js
import { io } from "socket.io-client";

export const BASE_URL = import.meta.env.VITE_API_URL;
// export const BASE_URL = "http://localhost:5000";

const socket = io(BASE_URL);

export default socket;

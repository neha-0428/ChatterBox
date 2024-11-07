// src/socket.js
import { io } from "socket.io-client";

export const BASE_URL = import.meta.env.VITE_BASE_URL;

const socket = io(BASE_URL);

export default socket;

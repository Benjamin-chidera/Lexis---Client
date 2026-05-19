import { io } from "socket.io-client";

// Get the server URL from the VITE_API_URL (removes the /api part)
const SERVER_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : "http://localhost:8000";

// withCredentials: true causes the browser to send the HttpOnly access_token cookie
// automatically with every socket.io request (polling and WebSocket upgrade).
const socket = io(SERVER_URL, {
  autoConnect: false,
  withCredentials: true,
});

export default socket;

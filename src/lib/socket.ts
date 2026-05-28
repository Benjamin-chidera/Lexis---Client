import { io } from "socket.io-client";

// In dev: VITE_SOCKET_URL is unset, so socket.io connects to the same origin
// (localhost:5173), which Vite proxies to localhost:8000. Cookies are same-origin.
// In prod: set VITE_SOCKET_URL=https://your-backend.fly.dev in Vercel env vars.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;

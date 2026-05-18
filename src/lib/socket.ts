import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:8000";

// withCredentials: true causes the browser to send the HttpOnly access_token cookie
// automatically with every socket.io request (polling and WebSocket upgrade).
const socket = io(SERVER_URL, {
  autoConnect: false,
  withCredentials: true,
});

export default socket;

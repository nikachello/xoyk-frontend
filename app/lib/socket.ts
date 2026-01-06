import { io } from "socket.io-client";

export const socket = io("https://xoyk-backend.onrender.com", {
  transports: ["websocket"],
});

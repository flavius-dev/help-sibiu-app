import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { buildRouter } from "./routes.js";

const PORT = Number(process.env.PORT || 4000);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const SOCKET_CORS_ORIGIN = process.env.SOCKET_CORS_ORIGIN || CORS_ORIGIN;

const app = express();
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: SOCKET_CORS_ORIGIN, credentials: true },
});

io.on("connection", (socket) => {
  socket.emit("server:hello", { name: "help-sibiu-backend", ts: Date.now() });
});

app.use("/api", buildRouter(io));
app.get("/", (req, res) => res.send("Help-Sibiu backend OK"));

server.listen(PORT, () => console.log(`Help-Sibiu backend listening on :${PORT}`));

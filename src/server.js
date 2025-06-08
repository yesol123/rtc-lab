import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  socket.on("join_room", (roomName, done) => {
    socket.join(roomName);
    done();
  
    const room = io.sockets.adapter.rooms.get(roomName);
    console.log(`🧾 ${roomName} 방 인원 수: ${room?.size}`);
  
    if (room && room.size === 2) {
      socket.to(roomName).emit("welcome");
      console.log("📨 welcome 이벤트 전송됨");
    }
  });

  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });

  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });

  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

server.listen(3033, () => {
  console.log("🚀 Server running on http://localhost:3033");
});
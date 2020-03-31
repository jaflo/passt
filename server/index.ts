import * as http from "http";
import socketIo from "socket.io";
import { mongoose } from "@typegoose/typegoose";
import { exit } from "process";
import { seedCards } from "./seedCards";
import { Shape, FillStyle, Color } from "./db/card";
import { RoomController } from "./controllers/roomController";

const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/passt";
if (!MONGODB_URI) {
  console.error("Please set the MONGODB_URI environment variable");
  exit(1);
}

const app = http.createServer();
const io = socketIo(app);
const roomController = new RoomController();

io.on("connection", (socket) => {
  socket.on("create", (data: { open: boolean }) =>
    roomController
      .createRoom(data.open)
      .then((room) => socket.emit("createdRoom", room))
  );
  socket.on("join", (data: { roomCode: string; playerName: string }) =>
    roomController
      .joinRoom(data.roomCode, socket.id, data.playerName)
      .then(({ room, player }) => {
        socket.join(room.roomCode);
        socket.broadcast.to(room.roomCode).emit("new_player", player);
        socket.emit("joined_successfully", room);
      })
      .catch((err) => socket.emit("error", err.toString()))
  );

  socket.on("start", (data: { roomCode: string }) => {
    roomController.startGame(data.roomCode).then((room) => {
      const board = room.board;
      const players = room.players.map(({ name, points }) => {
        return { name, points };
      });
      io.to(room.roomCode).emit("game_started", { board, players });
    });
  });

  socket.on("disconnect", () =>
    roomController.removePlayer(socket.id).then((affectedRooms) => {
      if (!affectedRooms) {
        console.error(
          `No rooms will be notified of socket ${socket.id}'s disconnection`
        );
        return;
      }
      socket.leaveAll();
      affectedRooms.forEach((affectedRoom) =>
        io.to(affectedRoom.roomCode).emit("player_disconnected", socket.id)
      );
    })
  );
});

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    seedCards(
      [Shape.CIRCLE, Shape.SQUARE, Shape.TRIANGLE],
      [FillStyle.EMPTY, FillStyle.FILLED, FillStyle.LINED],
      [Color.BLUE, Color.GREEN, Color.RED],
      [1, 2, 3]
    ).then(() => {
      app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
      });
    });
  })
  .catch((err) => console.error(err));

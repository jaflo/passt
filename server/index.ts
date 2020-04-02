import * as http from "http";
import socketIo from "socket.io";
import { mongoose } from "@typegoose/typegoose";
import { exit } from "process";
import { seedCards } from "./seedCards";
import { Shape, FillStyle, Color, CardClass } from "./db/card";
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

enum SocketEvent {
  CREATE_ROOM = "createRoom",
  ROOM_CREATED = "roomCreated",
  JOIN_ROOM = "joinRoom",
  JOINED_SUCCESSFULLY = "joinedSuccessfully",
  NEW_PLAYER = "newPlayer",
  START_ROOM = "startRoom",
  ROOM_STARTED = "roomStarted",
  PLAY = "play",
  MOVE_PLAYED = "movePlayed",
  PLAYER_DISCONNECTED = "playerDisconnected",
}

io.on("connection", (socket) => {
  console.log(`${socket.id} has connected!`);
  socket.on(SocketEvent.CREATE_ROOM, async (data: { open: boolean }) => {
    try {
      const room = await roomController.createRoom(data.open);
      socket.emit(SocketEvent.ROOM_CREATED, room);
    } catch (err) {
      socket.emit("error", err.toString());
    }
  });
  socket.on(
    SocketEvent.JOIN_ROOM,
    async (data: { roomCode: string; playerName: string }) => {
      try {
        const { room, player } = await roomController.joinRoom(
          data.roomCode,
          socket.id,
          data.playerName
        );
        socket.join(room.roomCode);
        socket.broadcast.to(room.roomCode).emit(SocketEvent.NEW_PLAYER, player);
        socket.emit(SocketEvent.JOINED_SUCCESSFULLY, room);
      } catch (err) {
        socket.emit("error", err.toString());
      }
    }
  );

  socket.on(SocketEvent.START_ROOM, async () => {
    try {
      const room = await roomController.startGame(socket.id);
      const { board, players } = room;
      io.to(room.roomCode).emit(SocketEvent.ROOM_STARTED, { board, players });
    } catch (err) {
      socket.emit("error", err.toString());
    }
  });

  socket.on(SocketEvent.PLAY, async (data: { cards: Array<CardClass> }) => {
    try {
      const { room, updated, player } = await roomController.playMove(
        socket.id,
        data.cards
      );
      io.to(room.roomCode).emit(SocketEvent.MOVE_PLAYED, {
        room,
        updated,
        player,
      });
    } catch (err) {}
  });

  socket.on("disconnect", async () => {
    try {
      const affectedRooms = await roomController.removePlayer(socket.id);
      console.log(`${socket.id} disconnected.`);
      if (!affectedRooms) {
        console.error(
          `No rooms will be notified of socket ${socket.id}'s disconnection`
        );
        return;
      }
      socket.leaveAll();
      affectedRooms.forEach((affectedRoom) =>
        io
          .to(affectedRoom.roomCode)
          .emit(SocketEvent.PLAYER_DISCONNECTED, socket.id)
      );
    } catch (err) {
      socket.emit("error", err.toString());
    }
  });
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

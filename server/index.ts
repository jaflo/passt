import * as http from 'http';
import socketIo from 'socket.io';
import { createConnection } from 'typeorm';
import { RoomController } from './controller/roomController';

const PORT = process.env.PORT || 3000;

const app = http.createServer();
const io = socketIo(app);

const roomController = new RoomController();
enum SocketEvent {
  CREATE_ROOM = 'createRoom',
  ROOM_CREATED = 'roomCreated',
  JOIN_ROOM = 'joinRoom',
  JOINED_SUCCESSFULLY = 'joinedSuccessfully',
  NEW_PLAYER = 'newPlayer',
  START_ROOM = 'startRoom',
  ROOM_STARTED = 'roomStarted',
  PLAY = 'play',
  MOVE_PLAYED = 'movePlayed',
  PLAYER_DISCONNECTED = 'playerDisconnected',
}

io.on('connection', socket => {
  console.log(`${socket.id} has connected!`);
  socket.on(SocketEvent.CREATE_ROOM, async ({ open }: { open: boolean }) => {
    try {
      const room = await roomController.createRoom(open);
      socket.emit(SocketEvent.ROOM_CREATED, room);
    } catch (err) {
      socket.emit('error', err.toString());
    }
  });
  socket.on(
    SocketEvent.JOIN_ROOM,
    async ({
      roomCode,
      playerName,
    }: {
      roomCode: string;
      playerName: string;
    }) => {
      try {
        const { room, player } = await roomController.joinRoom(
          roomCode,
          socket.id,
          playerName
        );
        socket.join(room.roomCode);
        socket.broadcast.to(room.roomCode).emit(SocketEvent.NEW_PLAYER, player);
        socket.emit(SocketEvent.JOINED_SUCCESSFULLY, room);
      } catch (err) {
        socket.emit('error', err.toString());
      }
    }
  );

  socket.on(SocketEvent.START_ROOM, async () => {
    try {
      const room = await roomController.startRoom(socket.id);
      io.to(room.roomCode).emit(SocketEvent.ROOM_STARTED, {
        board: room.board,
        players: room.players,
      });
    } catch (err) {
      socket.emit('error', err.toString());
    }
  });

  socket.on(SocketEvent.PLAY, async ({ cardIds }: { cardIds: number[] }) => {
    try {
      const {
        name,
        cards,
        updated,
        board,
        roomCode,
      } = await roomController.playMove(socket.id, cardIds);
      io.to(roomCode).emit(SocketEvent.MOVE_PLAYED, {
        name,
        cards,
        updated,
        board,
      });
    } catch (err) {
      socket.emit('eror', err.toString());
    }
  });

  socket.on('disconnect', async () => {
    try {
      const affectedRoom = await roomController.leaveRoom(socket.id);
      if (!affectedRoom) {
        return;
      }
      io.to(affectedRoom.roomCode).emit(
        SocketEvent.PLAYER_DISCONNECTED,
        socket.id
      );
    } catch (err) {
      socket.emit('err', err.toString());
    }
  });
});

createConnection({
  type: 'postgres',
  url: process.env['DATABASE_URL'],
}).then(() =>
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  })
);

import * as http from 'http';
import socketIo from 'socket.io';
import { createConnection } from 'typeorm';

const PORT = process.env.PORT || 3000;

const app = http.createServer();
const io = socketIo(app);

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
  socket.on(SocketEvent.CREATE_ROOM, async (data: { open: boolean }) => {});
  socket.on(
    SocketEvent.JOIN_ROOM,
    async (data: { roomCode: string; playerName: string }) => {}
  );

  socket.on(SocketEvent.START_ROOM, async () => {});

  socket.on(SocketEvent.PLAY, async data => {});

  socket.on('disconnect', async () => {});
});

createConnection({
  type: 'postgres',
  url: process.env['DATABASE_URL'],
}).then(connection =>
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  })
);

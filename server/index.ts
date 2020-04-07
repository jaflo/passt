import * as http from 'http';
import socketIo from 'socket.io';
import { createConnection } from 'typeorm';
import { RoomController } from './controller/roomController';
import { Card, Room } from './entity/room';

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
	GAME_OVER = 'gameOver',
	PLAYER_DISCONNECTED = 'playerDisconnected',
	PLAYERS_REMOVED = 'playersRemoved',
	EXCEPTION = 'exception',
}

io.on('connection', socket => {
	console.log(`${socket.id} has connected!`);
	socket.on(SocketEvent.CREATE_ROOM, async ({ open }: { open: boolean }) => {
		try {
			const room = await RoomController.createRoom(open);
			socket.emit(SocketEvent.ROOM_CREATED, room);
		} catch (err) {
			socket.emit(SocketEvent.EXCEPTION, err.toString());
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
				const { room, player } = await RoomController.joinRoom(
					roomCode,
					socket.id,
					playerName
				);
				socket.join(room.roomCode);
				socket.broadcast
					.to(room.roomCode)
					.emit(SocketEvent.NEW_PLAYER, {
						connectionId: player.connectionId,
						name: player.name,
						points: player.points,
					});
				socket.emit(SocketEvent.JOINED_SUCCESSFULLY, room);
			} catch (err) {
				socket.emit(SocketEvent.EXCEPTION, err.toString());
			}
		}
	);

	socket.on(SocketEvent.START_ROOM, async () => {
		try {
			const room = await RoomController.startRoom(socket.id);
			io.to(room.roomCode).emit(SocketEvent.ROOM_STARTED, {
				board: room.board,
				players: room.players,
			});
		} catch (err) {
			socket.emit(SocketEvent.EXCEPTION, err.toString());
		}
	});

	socket.on(SocketEvent.PLAY, async (data: { cards: Card[] }) => {
		try {
			const {
				player,
				cards: playedCards,
				updated,
				board,
				roomCode,
				isOver,
				players,
			} = await RoomController.playMove(socket.id, data.cards);
			if (isOver) {
				io.to(roomCode).emit(SocketEvent.GAME_OVER, {
					player,
					cards: playedCards,
					updated,
					board,
					players,
				});
			}
			io.to(roomCode).emit(SocketEvent.MOVE_PLAYED, {
				player,
				cards: playedCards,
				updated,
				board,
			});
		} catch (err) {
			console.error(err);
			socket.emit(SocketEvent.EXCEPTION, err.toString());
		}
	});

	socket.on('disconnect', async () => {
		// Note that this doesn't actually remove the player from the database.
		// This will just notify the room that the player disconnected.
		// By not removing them from the DB immediately, we can let players reconnect.
		try {
			const affectedRoom = await RoomController.getRoom(socket.id);
			io.to(affectedRoom.roomCode).emit(
				SocketEvent.PLAYER_DISCONNECTED,
				socket.id
			);
		} catch (err) {
			socket.emit(SocketEvent.EXCEPTION, err.toString());
		}
	});
});

// Every hour, "garbage collect" the database and let all affected rooms know.
setInterval(() => {
	RoomController.flushInactiveDisconnectedPlayers().then(affectedRooms => {
		for (const roomCode of Object.keys(affectedRooms)) {
			const removedPlayers = affectedRooms[roomCode];
			io.to(roomCode).emit(SocketEvent.PLAYERS_REMOVED, {removedPlayers});
		}
	}).then(() => RoomController.flushEmptyRooms());
}, RoomController.FLUSH_INTERVAL_MILLIS);

createConnection().then(() =>
	app.listen(PORT, () => {
		console.log(`Listening on port ${PORT}`);
	})
);

import socket from './socket.js';
import { roomCode, playerName } from './stores.js';

export function requestRoomCreation() {
	socket.emit('createRoom', { open: false });
}

export function requestJoinRoom(newPlayerName) {
	playerName.set(newPlayerName);
	socket.emit('joinRoom', {
		roomCode,
		playerName: newPlayerName,
		oldConnectionId: localStorage.getItem('old connection id'),
	});
}

export function startRoom() {
	socket.emit('startRoom');
}

export function playCards(cards) {
	socket.emit('play', {
		cards: cards,
	});
}

export function closeAndReload() {
	socket.close();
	window.location = window.location;
}

socket.on('exception', data => {
	console.error(data);
});

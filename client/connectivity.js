import socket from './socket.js';
import { state, roomCode, playerName, setPlayerName } from './stores.js';

export function requestRoomCreation() {
	socket.emit('createRoom', { open: false });
}

export function requestJoinRoom(newPlayerName) {
	setPlayerName(newPlayerName);
	socket.emit('joinRoom', {
		roomCode,
		playerName,
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

socket.on('joinedSuccessfully', () => {
	localStorage.setItem('old connection id', socket.id);
	localStorage.removeItem('new tab ' + roomCode);
});

let isJoining = false;
state.subscribe(s => (isJoining = s == 'joining'));

socket.on('exception', data => {
	console.error(data);
	if (!isJoining && data.includes('EntityNotFound')) {
		closeAndReload();
	}
});

socket.on('reconnect', () => {
	if (!isJoining) {
		requestJoinRoom(playerName);
	}
});

let refreshTimeout;

socket.on('joinedSuccessfully', () => {
	clearTimeout(refreshTimeout);
});

function retryConnect() {
	refreshTimeout = setTimeout(() => {
		if (socket.connected) {
			closeAndReload();
		} else {
			retryConnect();
		}
	}, 10000);
}

socket.on('disconnect', retryConnect);

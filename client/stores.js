import { readable } from 'svelte/store';
import socket from './socket.js';
import { cardAsString, inPlaceReplace } from './game/shared.js';

const MAX_TICKER_COUNT = 10; // limit to prevent too much memory used

export let playerName = localStorage.getItem('name') || '';

export function setPlayerName(newName) {
	playerName = newName;
}

export const roomCode =
	new URLSearchParams(window.location.search).get('room') || '';

export const connected = readable(true, function start(set) {
	function joinedSuccessfully() {
		set(true);
	}
	socket.on('joinedSuccessfully', joinedSuccessfully);

	function disconnect() {
		set(false);
	}
	socket.on('disconnect', disconnect);

	return function stop() {
		socket.off('joinedSuccessfully', joinedSuccessfully);
		socket.off('disconnect', disconnect);
	};
});

function onMultiple(events, callback) {
	for (const event of events) {
		socket.on(event, callback);
	}
}

function offMultiple(events, callback) {
	for (const event of events) {
		socket.off(event, callback);
	}
}

export const state = readable('joining', function start(set) {
	function joinedSuccessfully(data) {
		if (data.started) {
			if (data.board.length > 0) {
				set('playing');
			} else {
				set('ended');
			}
		} else {
			set('waiting');
		}
	}
	socket.on('joinedSuccessfully', joinedSuccessfully);

	function roomStarted() {
		set('playing');
	}
	socket.on('roomStarted', roomStarted);

	function gameOver() {
		set('ended');
	}
	socket.on('gameOver', gameOver);

	return function stop() {
		socket.off('joinedSuccessfully', joinedSuccessfully);
		socket.off('roomStarted', roomStarted);
		socket.off('gameOver', gameOver);
	};
});

export const cards = readable([], function start(set) {
	let cards = [];

	const events = ['joinedSuccessfully', 'roomStarted', 'movePlayed'];
	function update(data) {
		cards = inPlaceReplace(
			cards,
			data.board.map(card => {
				return {
					shape: card.shape,
					fillStyle: card.fillStyle,
					color: card.color,
					number: card.number,
					id: cardAsString(card),
				};
			})
		);
		set(cards);
	}
	onMultiple(events, update);

	return function stop() {
		offMultiple(events, update);
	};
});

export const players = readable([], function start(set) {
	let players = [];

	const events = ['joinedSuccessfully', 'roomStarted'];
	function update(data) {
		players = data.players;
		set(players);
	}
	onMultiple(events, update);

	function movePlayed(data) {
		players = players.map(player => {
			if (player.connectionId == data.player.connectionId) {
				return data.player;
			} else {
				return player;
			}
		});
		set(players);
	}
	socket.on('movePlayed', movePlayed);

	function playerDisconnected(connectionId) {
		players = players.map(player => {
			if (player.connectionId == connectionId) {
				player.connected = false;
			}
			return player;
		});
		set(players);
	}
	socket.on('playerDisconnected', playerDisconnected);

	function playersRemoved(data) {
		players = players.filter(
			player => !data.removedPlayers.includes(player.connectionId)
		);
		set(players);
	}
	socket.on('playersRemoved', playersRemoved);

	function newPlayer(player) {
		players = [
			{
				connectionId: player.connectionId,
				name: player.name,
				points: player.points,
				connected: player.connected,
			},
			...players.filter(
				// remove old player if needed
				oldPlayer => oldPlayer.connectionId != player.oldConnectionId
			),
		];
		set(players);
	}
	socket.on('newPlayer', newPlayer);

	return function stop() {
		offMultiple(events, update);
		socket.off('movePlayed', movePlayed);
		socket.off('playerDisconnected', playerDisconnected);
		socket.off('playersRemoved', playersRemoved);
		socket.off('newPlayer', newPlayer);
	};
});

export const plays = readable([], function start(set) {
	let plays = [];

	function roomStarted() {
		plays = [];
		set(plays);
	}
	socket.on('roomStarted', roomStarted);

	function movePlayed(data) {
		plays = [
			{
				cards: data.cards,
				player: data.player.name,
				valid: data.updated,
				id: Math.random(),
			},
			...plays.slice(0, MAX_TICKER_COUNT),
		];
		set(plays);
	}
	socket.on('movePlayed', movePlayed);

	return function stop() {
		socket.off('roomStarted', roomStarted);
		socket.off('movePlayed', movePlayed);
	};
});

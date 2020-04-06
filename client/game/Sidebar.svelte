<script>
	export let players = [];

	import ConnectivityIndicator from './ConnectivityIndicator.svelte';
	import { socket } from '../connectivity.js';

	socket.on('playerDisconnected', function(data) {
		players = players.filter(player => player.connectionId != data);
	});

	socket.on('newPlayer', function(data) {
		players = [
			{
				connectionId: data.connectionId,
				name: data.name,
				points: data.points,
			},
			...players,
		];
	});

	$: points = players.filter(player => player.connectionId == socket.id)[0]
		.points;
</script>

<style>
	.header {
		margin-bottom: 0.5em;
		display: flex;
		flex-direction: row;
		align-content: center;
		align-items: center;
	}

	.count {
		font-weight: bold;
		font-size: 4em;
		flex: 1;
	}

	.player {
		display: flex;
	}

	.player strong {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.player span {
		padding-left: 1em;
	}

	.connectivity-wrapper {
		float: right;
	}
</style>

<div class="header">
	<div class="count">{points}</div>
	<div class="connectivity-wrapper">
		<ConnectivityIndicator />
	</div>
</div>

{#each players as player (player.connectionId)}
	<div class="player">
		<strong>{player.name}</strong>
		<span>{player.points}</span>
	</div>
{/each}

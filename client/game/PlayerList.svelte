<script>
	export let players = [];

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
</script>

<style>
	.count {
		font-weight: bold;
		font-size: 2em;
		margin-bottom: 0.5em;
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
</style>

<div class="count">{players.length}</div>

{#each players as player}
	<div class="player">
		<strong>{player.name}</strong>
		<span>{player.points}</span>
	</div>
{/each}

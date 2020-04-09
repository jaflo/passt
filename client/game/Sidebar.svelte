<script>
	export let players = [];

	import ConnectivityIndicator from './ConnectivityIndicator.svelte';
	import { fly, fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { socket } from '../connectivity.js';

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
		transition: opacity 0.3s ease-in-out;
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

{#each players
	.filter(player => player.connected)
	.sort((a, b) => b.points - a.points) as player (player.connectionId)}
	<div class="player" animate:flip={{ duration: 300 }}>
		<strong transition:fly={{ x: -20, duration: 300 }}>
			{player.name}
		</strong>
		<span transition:fade={{ duration: 300 }}>{player.points}</span>
	</div>
{/each}

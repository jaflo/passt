<script>
	export let players;

	import { fly, fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import socket from '../socket.js';
	import { requestClearBoard, closeAndReload } from '../connectivity.js';
	import { roomCode, connected } from '../stores.js';

	$: myself = players.filter(player => player.connectionId == socket.id)[0];
	$: points = myself ? myself.points : 0;
	$: correctPlay = points > 0 ? true : false;

	$: activePlayerCount = players.filter(player => player.connected).length;
	$: wantClearCount = players.filter(player => player.wantsToClear).length;
	$: requiredForClear = Math.round(activePlayerCount / 2);

	function selectAndCopy() {
		this.select();
		const range = document.createRange();
		range.selectNodeContents(this);
		const selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
		this.setSelectionRange(0, 99999);
	}

	function redoTutorial() {
		localStorage.removeItem('tutorial complete');
		closeAndReload();
	}
</script>

<style>
	.header {
		margin-bottom: 0.5em;
		display: flex;
		align-content: center;
		align-items: center;
	}

	.count {
		font-weight: bold;
		font-size: 4em;
		flex: 1;
	}

	.players {
		flex: 1;
		overflow-y: auto;
	}

	.player {
		display: flex;
		transition: opacity 0.3s ease-in-out;
		margin-bottom: 0.2em;
	}

	.player strong {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		padding-right: 0.5em;
	}

	.player span {
		padding-left: 0.5em;
	}

	.connectivity-wrapper {
		float: right;
	}

	.more {
		padding-top: 1em;
	}

	.more a,
	.more button,
	.more input {
		width: 100%;
		display: block;
		box-sizing: border-box;
		border: 0;
		background: none;
		margin: 0.2em 0 0 0;
		padding: 0.5em 0 0 0;
		text-decoration: none;
		text-align: right;
	}

	.clear {
		background: var(--bgColor);
		width: 1em;
		height: 1em;
		border-radius: 9em 9em 0 9em;
		position: relative;
	}

	.clear:after {
		content: '';
		display: block;
		width: 0.2em;
		height: 0.15em;
		border: 0 solid var(--saturatedColor);
		border-width: 0.3em 0 0.15em 0;
	}

	.flash {
		animation: flash 0.3s linear forwards;
	}

	@keyframes flash {
		0%,
		40%,
		100% {
			opacity: 1;
		}
		20%,
		60% {
			opacity: 0;
		}
	}

	.request-clear {
		font-variant-numeric: tabular-nums lining-nums;
	}
</style>

<div class="header">
	<div
		class="count"
		class:flash={correctPlay}
		on:animationend={() => (correctPlay = false)}>
		{points}
	</div>
	{#if !$connected}
		<div class="connectivity-wrapper">
			<div class="spinner" />
		</div>
	{/if}
</div>

<div class="players">
	{#each players
		.filter(player => player.connected)
		.sort((a, b) => b.points - a.points) as player (player.connectionId)}
		<div class="player" animate:flip={{ duration: 300 }}>
			<strong transition:fly={{ x: -20, duration: 300 }}>
				{player.name}
			</strong>
			{#if player.wantsToClear}
				<div
					transition:fade={{ duration: 100 }}
					title="Wants to clear board"
					class="clear center-contents" />
			{/if}
			<span transition:fade={{ duration: 300 }}>{player.points}</span>
		</div>
	{/each}
</div>

<div class="more">
	<button on:click={requestClearBoard} class="request-clear">
		clear board
		{#if requiredForClear > 1}({wantClearCount}/{requiredForClear}){/if}
	</button>
	<button on:click={redoTutorial}>tutorial</button>
	<a href="./">leave & create new</a>
	<input
		type="text"
		value={window.location.href.split('?')[0] + '?room=' + roomCode}
		on:click={selectAndCopy} />
</div>

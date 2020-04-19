<script>
	import Board from './board/Board.svelte';
	import Sidebar from './Sidebar.svelte';
	import Ticker from './Ticker.svelte';
	import ReconnectingScreen from './ReconnectingScreen.svelte';
	import JoinPrompt from './JoinPrompt.svelte';
	import PauseScreen from './PauseScreen.svelte';
	import MiniExplainer from './tutorial/MiniExplainer.svelte';
	import socket from '../socket.js';
	import { state, players, cards, connected } from '../stores.js';

	let incorrectPlay = false;
	let explainCards = [];

	socket.on('movePlayed', data => {
		if (data.player.connectionId == socket.id && !data.updated) {
			incorrectPlay = true;
		}
	});

	function showMisplay(e) {
		explainCards = e.detail.cards;
	}
</script>

<style>
	.game {
		display: flex;
		flex-direction: column;
	}

	.ticker,
	.main {
		-webkit-user-select: none;
		user-select: none;
		background: var(--bgColor);
		color: var(--saturatedColor);
	}

	.ticker {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		overflow: hidden;
		color: var(--textColor);
	}

	.main {
		margin: 3em 0 1em 0;
		min-height: 200px;
		position: relative;
	}

	.shakeable {
		will-change: transform;
	}

	.shake {
		animation: shake 0.3s linear forwards;
	}

	@keyframes shake {
		8%,
		41% {
			transform: translateX(-2em);
		}
		25%,
		58% {
			transform: translateX(2em);
		}
		75% {
			transform: translateX(-1em);
		}
		92% {
			transform: translateX(1em);
		}
		0%,
		100% {
			transform: translateX(0);
		}
	}

	.sidebar {
		padding: 1em;
		background: var(--saturatedColor);
		color: var(--bgColor);
		flex: 1;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		z-index: 2;
		margin-bottom: env(safe-area-inset-bottom);
	}

	.sidebar.highlight {
		animation: highlight-sidebar 5s linear forwards;
	}

	@keyframes highlight-sidebar {
		0% {
			box-shadow: 0 0 0 0 var(--saturatedColor);
		}
		5%,
		20% {
			box-shadow: 0 0 0 100vmax var(--saturatedColor);
		}
		100% {
			box-shadow: 0 0 0 100vmax transparent;
		}
	}

	@media only screen and (min-width: 800px) {
		.game {
			flex-direction: row;
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			margin-top: 0;
		}

		.ticker {
			right: 260px;
		}

		.main {
			flex: 1;
			margin: 3em 0 0 0;
		}

		.sidebar {
			flex: initial;
			width: 260px;
		}
	}
</style>

<svelte:head>
	<style>
		main {
			display: none;
		}
	</style>
</svelte:head>

<div class="game">
	{#if $state == 'joining'}
		<JoinPrompt />
	{:else}
		<div class="ticker">
			<Ticker />
		</div>
		<div class="main center-contents">
			{#if !$connected}
				<ReconnectingScreen />
			{/if}
			{#if $state == 'playing'}
				{#if explainCards.length > 0}
					<MiniExplainer
						cards={explainCards}
						on:understood={() => {
							explainCards = [];
						}} />
				{/if}
				<div
					class="shakeable"
					class:shake={incorrectPlay}
					on:animationend={() => (incorrectPlay = false)}>
					<Board
						cards={$cards}
						on:misplay={showMisplay}
						disabled={!$connected || explainCards.length > 0} />
				</div>
			{:else}
				<PauseScreen redo={$state == 'ended'} />
			{/if}
		</div>
		<div class="sidebar" class:highlight={$state == 'ended'}>
			<Sidebar players={$players} />
		</div>
	{/if}
</div>

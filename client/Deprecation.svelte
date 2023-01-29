<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	let shown = true;

	function dismiss() {
		shown = false;
	}
</script>

{#if shown}
	<div class="cover" transition:fade={{ duration: 200 }} on:click={dismiss} />
	<div
		class="modal"
		in:scale={{ start: 0.8, duration: 200 }}
		out:scale|local={{ start: 1.1, duration: 200 }}
	>
		isaset is no more :(

		<p>
			The servers for multiplayer no longer run because of <a
				href="https://help.heroku.com/RSBRUH58/removal-of-heroku-free-product-plans-faq"
				target="_blank"
				rel="nofollow">pricing changes</a
			>. For a functional version, please check out Setacular!
		</p>

		<div class="buttons">
			<a href="https://set.loud.red/">Open Setacular</a>
			<button on:click={dismiss}>Dismiss</button>
		</div>
	</div>
{/if}

<style>
	.cover,
	.modal {
		position: absolute;
		z-index: 10;
	}

	.cover {
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;

		background: black;
		opacity: 0.5;
	}

	.modal {
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: calc(100% - 1em);
		max-width: 400px;
		box-sizing: border-box;

		padding: 1em;
		color: #281b14;
		background: #febb39;
		border: 4px solid #ff9866;
		border-radius: 1em;

		font-size: 20px;
		font-family: 'Inter', Arial, -apple-system, BlinkMacSystemFont,
			'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
			'Helvetica Neue', sans-serif;
		line-height: 1.3;
	}

	.buttons {
		margin-top: 1em;
		text-align: center;
	}

	.buttons a,
	button {
		--border-width: 3px;
		--border-radius: 16px;
		--extrude: 0 4px 0 rgba(0, 0, 0, 0.05);

		display: block;
		box-sizing: border-box;
		text-decoration: none;
		font: inherit;
		color: inherit;
		position: relative;
		background: linear-gradient(180deg, #fcfbfa 0%, #fbf9f8 100%);
		border: var(--border-width) solid #e8e8e8;
		box-shadow: var(--extrude);
		border-radius: var(--border-radius);
		width: 100%;
		padding: 1em;
		margin: 0;
		-webkit-appearance: none;
		outline: none;
	}

	.buttons *:not(:first-child) {
		margin-top: 10px;
	}
</style>

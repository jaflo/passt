<script>
	import TutorialBreakdown from './TutorialBreakdown.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	const simple = [
		[{}, {}, {}],
		[{}, { shape: 'square' }, { shape: 'triangle' }],
		[{}, {}, { shape: 'triangle' }],
	];

	const steps = [
		[
			{
				shape: 'circle',
				fillStyle: 'empty',
			},
			{
				shape: 'triangle',
				fillStyle: 'lined',
			},
			{
				shape: 'square',
				fillStyle: 'filled',
			},
		],
		[
			{
				shape: 'circle',
				fillStyle: 'empty',
			},
			{
				shape: 'square',
				fillStyle: 'lined',
			},
			{
				shape: 'square',
				fillStyle: 'filled',
			},
		],
		[
			{
				shape: 'circle',
				fillStyle: 'lined',
				color: 'red',
			},
			{
				shape: 'circle',
				fillStyle: 'empty',
				color: 'green',
				number: 2,
			},
			{
				shape: 'circle',
				fillStyle: 'filled',
				color: 'blue',
				number: 3,
			},
		],
	];

	function confirm() {
		dispatch('complete');
	}
</script>

<style>
	.tutorial-wrapper {
		margin: 2em 0;
	}

	.slides {
		margin: 1em 0;
	}

	.spacer {
		height: 50vh;
		margin-top: -170px;
	}

	.slide {
		margin-bottom: 2em;
		flex: 1 0 100vw;
		display: flex;
		align-items: flex-start;
	}

	.number {
		border: 0.12em solid;
		border-radius: 9em;
		width: 2em;
		height: 2em;
		line-height: 2em;
		text-align: center;
		margin-right: 1em;
	}

	.content {
		background: var(--bgColor);
		color: var(--textColor);
		padding: 1em;
		border-radius: 0.4em;
		box-sizing: border-box;
	}

	@media only screen and (max-width: 500px) {
		.spacer {
			display: none;
		}

		.slides,
		.content {
			width: 100%;
		}

		.slide {
			flex-direction: column;
		}

		.number {
			margin: 0 auto 1em auto;
		}

		.content {
			border-radius: 0;
		}
	}
</style>

<div class="tutorial-wrapper center-contents">
	<div class="spacer" />
	<div class="slides">
		{#each Array(steps.length + 1) as _, i}
			<div class="slide">
				<div class="number">{i + 1}</div>
				<div class="content">
					{#if i == 0}
						{#each simple as cards}
							<TutorialBreakdown {cards} />
						{/each}
					{:else}
						<TutorialBreakdown
							cards={steps[i - 1]}
							breakdownDepth={i + 1} />
					{/if}
				</div>
			</div>
		{/each}
	</div>
	<button class="large" on:click={confirm}>&rarr;</button>
</div>

<script>
	export let shape, fillStyle, color, number;

	import CardShape from "./CardShape.svelte";

	const countToSize = [50, 30, 30];
</script>

<style>
	.shape {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.count-2 .shape:nth-child(1) {
		transform: translate(0%, -90%) rotate(180deg);
	}
	.count-2 .shape:nth-child(2) {
		transform: translate(-100%, -10%);
	}

	.count-3 .shape:nth-child(1) {
		transform: translate(-50%, -100%);
	}
	.count-3 .shape:nth-child(2) {
		transform: translate(-110%, 0%);
	}
	.count-3 .shape:nth-child(3) {
		transform: translate(10%, 0%);
	}
</style>

<div class="count-{number}">
	{#each Array(number) as _}
		<div class="shape">
			<CardShape {shape} {fillStyle} {color} size={countToSize[number - 1]} />
		</div>
	{/each}
</div>

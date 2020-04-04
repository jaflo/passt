<script>
	export let shape, fillStyle, color, number;
	export let size = 70;

	const randomPatternId = "pattern" + Math.random();

	let remappedColor = {
		red: "#E4572E",
		blue: "#17BEBB",
		green: "#F0A202"
	}[color];

	let remappedStyle = {
		fill: {
			empty: "none",
			filled: remappedColor,
			lined: "url(#" + randomPatternId + ")"
		}[fillStyle],
		stroke: remappedColor,
		"stroke-width": 3,
		"stroke-linecap": "round",
		"vector-effect": "non-scaling-stroke"
	};

	let scale = 2 * (70 / size);
</script>

<style>
	.triangle {
		transform: translateY(10%);
	}
</style>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 70 70" width={size} height={size} class={shape}>
	<pattern id={randomPatternId} patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="scale({scale})">
		<path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke={remappedColor} stroke-width="1" />
	</pattern>

	{#if shape == 'square'}
		<rect width="48" height="48" x="11" y="11" {...remappedStyle} />
	{:else if shape == 'circle'}
		<circle cx="35" cy="35" r="30" {...remappedStyle} />
	{:else if shape == 'triangle'}
		<polygon points="32,2 62,54 2,54" {...remappedStyle} />
	{/if}
</svg>

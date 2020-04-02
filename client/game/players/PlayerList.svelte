<script>
	export let players = [];

	import PlayerEntry from "./PlayerEntry.svelte";
</script>

{#each players as player}
	<PlayerEntry name={player.name} points={player.points} />
{/each}

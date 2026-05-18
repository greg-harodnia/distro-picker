<script lang="ts">
	const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#2c3e50'];

	interface Piece {
		id: number;
		left: number;
		delay: number;
		duration: number;
		color: string;
		size: number;
		rotation: number;
	}

	let pieces: Piece[] = $state([]);

	$effect(() => {
		const p: Piece[] = [];
		for (let i = 0; i < 80; i++) {
			p.push({
				id: i,
				left: Math.random() * 100,
				delay: Math.random() * 0.5,
				duration: 1.5 + Math.random() * 2,
				color: COLORS[Math.floor(Math.random() * COLORS.length)],
				size: 6 + Math.random() * 6,
				rotation: Math.random() * 360,
			});
		}
		pieces = p;
	});
</script>

{#if pieces.length > 0}
	<div class="confetti-container">
		{#each pieces as piece (piece.id)}
			<div
				class="confetti-piece"
				style="left: {piece.left}%; animation-delay: {piece.delay}s; animation-duration: {piece.duration}s; background: {piece.color}; width: {piece.size}px; height: {piece.size * 0.6}px; --rotation: {piece.rotation}deg"
			></div>
		{/each}
	</div>
{/if}

<style>
	:global(*:has(> .confetti-container)) {
		position: relative;
		overflow: hidden;
	}

	.confetti-container {
		position: absolute;
		inset: -40px -20px;
		pointer-events: none;
		overflow: hidden;
	}

	.confetti-piece {
		position: absolute;
		top: -10px;
		border-radius: 2px;
		animation: confettiFall ease-out forwards;
		transform: rotate(var(--rotation));
	}

	@keyframes confettiFall {
		0% {
			opacity: 1;
			transform: translateY(0) rotate(0deg);
		}
		100% {
			opacity: 0;
			transform: translateY(400px) rotate(720deg);
		}
	}
</style>

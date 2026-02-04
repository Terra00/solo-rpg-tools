<script lang="ts">
	import Card from './lib/Card.svelte';
	let activeTab = $state('dice');
</script>

<div class="main-layout">
	<nav class="tabs">
		<button class:active={activeTab === 'cards'} onclick={() => (activeTab = 'cards')}>
			🃏 Card
		</button>
	</nav>

	<main class="content-area">
			<Card />
	</main>
</div>

<style>
:global(:root) {
		--bg-app: #18181b;
		--bg-card: #27272a;
		--bg-element: #3f3f46;
		--bg-hover: #52525b;
		--text-main: #f4f4f5;
		--text-muted: #a1a1aa;
		--accent: #e4e4e7;
		--border: #3f3f46;
	}

	:global(body) {
		background-color: var(--bg-app);
		color: var(--text-main);
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
		margin: 0;
	}

	main {
		padding: 40px;
		display: flex;
		justify-content: center;
	}
</style>

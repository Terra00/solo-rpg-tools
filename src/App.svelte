<script lang="ts">
	import Card from './lib/Card.svelte';
	import Dice from './lib/Dice.svelte';
	import { describeRoll } from './lib/dice';
	import type { CardRecord, RollRecord } from './lib/types';

	const TABS = [
		{ id: 'dice', label: 'Dadi', icon: '🎲', shortcut: '1' },
		{ id: 'cards', label: 'Carte', icon: '🃏', shortcut: '2' }
	] as const;
	type TabId = (typeof TABS)[number]['id'];

	let activeTab: TabId = $state('dice');

	let totalRolls = $state(0);
	let bestRoll: RollRecord | null = $state(null);
	let totalDraws = $state(0);
	let deckRemaining = $state(0);

	let statsDialog: HTMLDialogElement | undefined = $state();

	function handleDiceRoll(record: RollRecord): void {
		totalRolls += 1;
		if (!bestRoll || record.total > bestRoll.total) bestRoll = record;
	}

	function handleCardDraw(): void {
		totalDraws += 1;
	}

	function handleDeckChange(remaining: number): void {
		deckRemaining = remaining;
	}

	function switchTab(id: TabId): void {
		activeTab = id;
	}

	function handleShortcut(event: KeyboardEvent): void {
		const target = event.target as HTMLElement | null;
		if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
		if (event.key === '1') switchTab('dice');
		else if (event.key === '2') switchTab('cards');
	}

	function openStats(): void {
		statsDialog?.showModal();
	}
</script>

<svelte:window onkeydown={handleShortcut} />

<div class="container fade-in">
	<header class="page-header">
		<div>
			<h1>🎲 Solo RPG Tools</h1>
			<p class="subtitle">Strumenti per giocatori di ruolo in solitaria: dadi e carte</p>
		</div>
		<button type="button" class="stats-button" onclick={openStats}>📊 Statistiche</button>
	</header>

	<div class="tabs" role="tablist" aria-label="Strumenti">
		{#each TABS as tab (tab.id)}
			<button
				type="button"
				role="tab"
				id="tab-{tab.id}"
				aria-selected={activeTab === tab.id}
				aria-controls="panel-{tab.id}"
				class:active={activeTab === tab.id}
				onclick={() => switchTab(tab.id)}
			>
				<span aria-hidden="true">{tab.icon}</span>
				{tab.label}
				<kbd class="kbd" title="Premi {tab.shortcut} per aprire">{tab.shortcut}</kbd>
			</button>
		{/each}
	</div>

	<main class="content-area">
		<div role="tabpanel" id="panel-dice" aria-labelledby="tab-dice" hidden={activeTab !== 'dice'}>
			{#if activeTab === 'dice'}
				<Dice onRoll={handleDiceRoll} />
			{/if}
		</div>
		<div
			role="tabpanel"
			id="panel-cards"
			aria-labelledby="tab-cards"
			hidden={activeTab !== 'cards'}
		>
			{#if activeTab === 'cards'}
				<Card onDraw={handleCardDraw} onDeckChange={handleDeckChange} />
			{/if}
		</div>
	</main>

	<footer class="page-footer">
		<p>Built with Svelte &bull; TypeScript &bull; Vite</p>
	</footer>
</div>

<dialog class="stats-dialog" bind:this={statsDialog} aria-labelledby="stats-title">
	<h2 id="stats-title">Statistiche sessione</h2>
	<dl>
		<div>
			<dt>Lanci totali</dt>
			<dd>{totalRolls}</dd>
		</div>
		<div>
			<dt>Miglior lancio</dt>
			<dd>{bestRoll ? `${bestRoll.total} (${describeRoll(bestRoll)})` : '—'}</dd>
		</div>
		<div>
			<dt>Carte pescate</dt>
			<dd>{totalDraws}</dd>
		</div>
		<div>
			<dt>Carte rimaste</dt>
			<dd>{deckRemaining}</dd>
		</div>
	</dl>
	<form method="dialog">
		<button type="submit" class="stats-button">Chiudi</button>
	</form>
</dialog>

<style>
	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		text-align: left;
		padding: 2rem 0;
		margin-bottom: 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.page-header h1 {
		font-size: 2rem;
		margin: 0 0 0.5rem;
		background: linear-gradient(135deg, #e4e4e7 0%, #a1a1aa 100%);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.page-header .subtitle {
		color: var(--text-muted);
		font-size: 0.9rem;
		margin: 0;
	}

	.stats-button {
		background: var(--primary);
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.stats-button:hover {
		background: #7c3aed;
	}

	.tabs {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
		padding: 0.5rem;
		background: var(--bg-card);
		border-radius: 0.75rem;
	}

	.tabs button {
		background: transparent;
		color: var(--text-muted);
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-size: 1rem;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.tabs button:hover {
		background: var(--bg-element);
		color: var(--text-main);
	}

	.tabs button.active {
		background: var(--primary);
		color: white;
		font-weight: 500;
	}

	.kbd {
		display: inline-block;
		padding: 2px 6px;
		background: rgba(0, 0, 0, 0.25);
		border-radius: 4px;
		font-size: 0.75em;
		font-family: inherit;
	}

	.content-area {
		padding: 2.5rem 1.25rem;
		display: flex;
		justify-content: center;
		min-height: 60vh;
	}

	.content-area [role='tabpanel'] {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.content-area [role='tabpanel'][hidden] {
		display: none;
	}

	.page-footer {
		text-align: center;
		padding: 2rem;
		color: var(--text-muted);
		font-size: 0.85rem;
		border-top: 1px solid var(--border);
		margin-top: 2rem;
	}

	.stats-dialog {
		background: var(--bg-card);
		color: var(--text-main);
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		padding: 1.5rem;
		min-width: min(22rem, 90vw);
	}

	.stats-dialog::backdrop {
		background: rgba(0, 0, 0, 0.6);
	}

	.stats-dialog h2 {
		margin: 0 0 1rem;
		font-size: 1.2rem;
	}

	.stats-dialog dl {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 0 0 1.25rem;
	}

	.stats-dialog dl div {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.stats-dialog dt {
		color: var(--text-muted);
	}

	.stats-dialog dd {
		margin: 0;
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.page-header h1 {
			font-size: 1.5rem;
		}
		.tabs {
			gap: 0.5rem;
			padding: 0.25rem;
		}
		.tabs button {
			padding: 0.5rem 1rem;
			font-size: 0.9rem;
		}
		.content-area {
			padding: 1.25rem 0.625rem;
			min-height: auto;
		}
	}
</style>

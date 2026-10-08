<script lang="ts">
	import { DECK_OPTIONS, buildShuffledDeck, cardLabel, suitIcon } from './decks';
	import { formatTime } from './format';
	import { shuffle, uid } from './random';
	import type { CardRecord, DeckType, PlayableCard } from './types';

	interface Props {
		onDraw?: (card: CardRecord, remaining: number) => void;
		onDeckChange?: (remaining: number, total: number) => void;
	}

	let { onDraw, onDeckChange }: Props = $props();

	let deckType: DeckType | null = $state(null);
	let deckName = $state('Scegli un mazzo');
	let deck: PlayableCard[] = $state([]);
	let initialSize = $state(0);
	let currentCard: PlayableCard | null = $state(null);
	let history: CardRecord[] = $state([]);

	function initDeck(type: DeckType, name: string): void {
		deckType = type;
		deckName = name;
		currentCard = null;
		deck = buildShuffledDeck(type);
		initialSize = deck.length;
		onDeckChange?.(deck.length, initialSize);
	}

	function drawCard(): void {
		const card = deck.pop();
		if (!card) return;
		// Reassign to trigger Svelte 5 reactivity on mutated array
		deck = deck;
		currentCard = card;
		const record: CardRecord = {
			id: uid(),
			rank: card.rank,
			suit: card.suit,
			name: card.name,
			color: card.color,
			timestamp: Date.now()
		};
		history = [record, ...history];
		onDraw?.(record, deck.length);
		onDeckChange?.(deck.length, initialSize);
	}

	function reshuffle(): void {
		deck = shuffle(deck);
	}

	function resetAll(): void {
		deck = [];
		initialSize = 0;
		currentCard = null;
		history = [];
		deckType = null;
		deckName = 'Scegli un mazzo';
		onDeckChange?.(0, 0);
	}

	function isSelected(type: DeckType): boolean {
		return deckType === type;
	}
</script>

<div class="panel-wrapper">
	<div class="left-column">
		<div class="deck-controls" role="group" aria-label="Scelta mazzo">
			{#each DECK_OPTIONS as option (option.type)}
				<button
					type="button"
					class:active={isSelected(option.type)}
					aria-pressed={isSelected(option.type)}
					onclick={() => initDeck(option.type, option.label)}
				>
					{option.label}
				</button>
			{/each}
		</div>

		<div class="play-mat">
			<div class="deck-slot">
				{#if deck.length > 0}
					<button
						type="button"
						class="card-back"
						onclick={drawCard}
						aria-label={`Pesca una carta. Rimaste ${deck.length} su ${initialSize}`}
					>
						<span class="deck-count" aria-hidden="true">{deck.length}/{initialSize}</span>
						<span class="click-hint" aria-hidden="true">PESCA</span>
					</button>
				{:else}
					<div class="empty-slot" role="status">Vuoto</div>
				{/if}
				<p class="label">{deckName}</p>
				{#if deck.length > 1}
					<button type="button" class="btn-text" onclick={reshuffle}>Rimescola rimaste</button>
				{/if}
			</div>

			<div class="arrow" aria-hidden="true">➜</div>

			<div class="hand-slot">
				{#if currentCard}
					<div class="card-face {currentCard.color ?? 'black'}">
						<div class="corner top">
							<span>{currentCard.rank ?? ''}</span>
							<span aria-hidden="true">{suitIcon(currentCard.suit)}</span>
						</div>

						<div class="center-content">
							{#if currentCard.suit === 'major'}
								<h3 class="major-title">{currentCard.name}</h3>
								<span class="roman">{currentCard.rank}</span>
							{:else}
								<span class="big-icon" aria-hidden="true">{suitIcon(currentCard.suit)}</span>
								<span class="card-name">{currentCard.name}</span>
							{/if}
						</div>

						<div class="corner bottom" aria-hidden="true">
							<span>{currentCard.rank ?? ''}</span>
							<span>{suitIcon(currentCard.suit)}</span>
						</div>
						<span class="sr-only">{cardLabel(currentCard)}</span>
					</div>
				{:else}
					<div class="empty-placeholder">Pesca una carta…</div>
				{/if}
				<p class="label">Mano</p>
			</div>
		</div>
	</div>

	<section class="card panel-right" aria-labelledby="cards-history-title">
		<div class="card-header">
			<h3 id="cards-history-title">Storico ({history.length})</h3>
			<button type="button" class="btn-text" disabled={history.length === 0} onclick={resetAll}>
				Azzera
			</button>
		</div>

		<div class="scroll-area" aria-live="polite">
			{#each history as item (item.id)}
				<article class="history-item">
					<div class="history-top">
						<span class="roll-desc">{cardLabel(item)}</span>
						<time class="timestamp" datetime={new Date(item.timestamp).toISOString()}>
							{formatTime(item.timestamp)}
						</time>
					</div>
					<div class="history-main">
						<span class="mini-card-text {item.color ?? 'black'}" aria-hidden="true">
							{suitIcon(item.suit)}
							{item.rank ?? ''}
						</span>
					</div>
				</article>
			{:else}
				<p class="empty-state">Nessuna carta pescata</p>
			{/each}
		</div>
	</section>
</div>

<style>
	.panel-wrapper {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 2.5rem;
		width: 100%;
	}
	.left-column {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
	}
	.panel-right {
		min-width: 18.75rem;
		max-width: 18.75rem;
	}
	.deck-controls {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.625rem;
		margin-bottom: 1.25rem;
	}
	.deck-controls button {
		padding: 0.5rem 1rem;
		background: var(--bg-element);
		color: var(--text-main);
		border: 1px solid var(--border);
		cursor: pointer;
		border-radius: 0.25rem;
	}
	.deck-controls button:hover {
		background: var(--bg-hover);
	}
	.deck-controls button.active {
		background: var(--primary);
		border-color: var(--primary);
		color: white;
	}

	.play-mat {
		display: flex;
		align-items: flex-start;
		gap: 2.5rem;
	}

	.deck-slot,
	.hand-slot {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.label {
		text-align: center;
		color: var(--text-muted);
		margin-top: 0.625rem;
		font-size: 0.8rem;
		letter-spacing: 1px;
	}
	.arrow {
		font-size: 2rem;
		color: var(--text-muted);
		padding-top: 4.5rem;
	}

	.card-back {
		width: 8.75rem;
		height: 12.5rem;
		border-radius: 0.625rem;
		border: 2px solid #fff;
		cursor: pointer;
		position: relative;
		background: repeating-linear-gradient(45deg, #a93c3c, #a93c3c 10px, #7f2828 10px, #7f2828 20px);
		box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.5);
		transition: transform 0.1s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.card-back:active {
		transform: scale(0.98);
	}

	.deck-count {
		background: white;
		color: black;
		padding: 0.25rem 0.5rem;
		border-radius: 0.75rem;
		font-weight: bold;
		font-size: 0.9rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.click-hint {
		position: absolute;
		bottom: 0.625rem;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.8rem;
		letter-spacing: 1px;
	}

	.empty-slot {
		width: 8.75rem;
		height: 12.5rem;
		border: 2px dashed var(--border);
		border-radius: 0.625rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
	}

	.card-face {
		width: 8.75rem;
		height: 12.5rem;
		background: #e6e6e6;
		border-radius: 0.625rem;
		position: relative;
		padding: 0.625rem;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
		animation: flipIn 0.3s ease-out;
		border: 1px solid #ccc;
	}

	@keyframes flipIn {
		from {
			transform: rotateY(90deg);
			opacity: 0;
		}
		to {
			transform: rotateY(0);
			opacity: 1;
		}
	}

	.card-face.red {
		color: #c00;
	}
	.card-face.black {
		color: #222;
	}
	.card-face.gold {
		background: #2a2520;
		color: #d4af37;
		border: 1px solid #d4af37;
	}

	.corner {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 0.9rem;
		line-height: 1;
		font-weight: bold;
	}
	.corner.bottom {
		transform: rotate(180deg);
	}

	.center-content {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.big-icon {
		font-size: 3rem;
		line-height: 1;
	}
	.card-name {
		font-size: 0.8rem;
		margin-top: 0.3125rem;
		font-family: serif;
	}

	.major-title {
		margin: 0;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 1px;
	}
	.roman {
		font-size: 1.5rem;
		margin-top: 0.3125rem;
		font-weight: bold;
	}

	.empty-placeholder {
		width: 8.75rem;
		height: 12.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text-muted);
		font-style: italic;
		font-size: 0.9rem;
		text-align: center;
	}

	.card {
		background-color: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		padding: 1.5rem;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
	}
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.25rem;
		border-bottom: 1px solid var(--border);
		padding-bottom: 0.625rem;
	}
	h3 {
		margin: 0;
		font-weight: 600;
		font-size: 1.1rem;
		color: var(--text-main);
	}
	.btn-text {
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		font-size: 0.8rem;
		text-decoration: underline;
	}
	.btn-text:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		text-decoration: none;
	}

	.scroll-area {
		max-height: 25rem;
		overflow-y: auto;
		padding-right: 0.3125rem;
	}
	.history-item {
		background: var(--bg-app);
		padding: 0.75rem;
		border-radius: 0.5rem;
		margin-bottom: 0.5rem;
		border-left: 3px solid var(--bg-hover);
	}

	.history-top {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		font-size: 0.85rem;
		color: var(--text-muted);
		margin-bottom: 0.25rem;
	}
	.roll-desc {
		font-weight: bold;
		color: var(--text-main);
	}
	.history-main {
		display: flex;
		align-items: center;
	}

	.mini-card-text {
		font-size: 1.2rem;
		font-weight: bold;
	}
	.mini-card-text.red {
		color: #ef4444;
	}
	.mini-card-text.black {
		color: var(--text-muted);
	}
	.mini-card-text.gold {
		color: #fbbf24;
	}

	.empty-state {
		text-align: center;
		color: var(--text-muted);
		padding: 1.25rem;
		font-style: italic;
		margin: 0;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
	}

	@media (max-width: 640px) {
		.play-mat {
			gap: 1rem;
		}
		.arrow {
			display: none;
		}
	}
</style>

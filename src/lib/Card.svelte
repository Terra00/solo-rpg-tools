<script lang="ts">
	import pokerData from '../data/poker.json';
	import tarotData from '../data/arcana.json';
	type PlayableCard = {
		id: string;
		rank?: string;
		suit: string;
		name?: string;
		color?: string;
	};
	type CardRecord = {
		id: string;
		rank?: string;
		suit: string;
		name?: string;
		color?: string;
		timestamp: Date;
	};

	type DeckType = 'poker' | 'poker-no-jocker' | 'tarot-full' | 'tarot-major';

	let history: CardRecord[] = $state([]);
	let nameDeck = $state('Choose a deck');
	let deck: PlayableCard[] = $state([]);
	let currentCard: PlayableCard | null = $state(null);

	const getRawData = (type: DeckType) => {
		switch (type) {
			case 'poker':
				return pokerData;

			case 'poker-no-jocker':
				return pokerData.filter((card) => card.suit !== 'none');

			case 'tarot-full':
				return tarotData;

			case 'tarot-major':
				return tarotData.filter((card) => card.suit === 'major');

			default:
				return [];
		}
	};
	const shuffle = (array: any[]) => {
		const newArray = [...array];
		for (let i = newArray.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
		}
		return newArray;
	};

	const suitIcons: Record<string, string> = {
		hearts: '♥',
		diamonds: '♦',
		clubs: '♣',
		spades: '♠',
		none: '✷',
		cups: '🏆',
		pentacles: '🪙',
		swords: '⚔️',
		wands: '🥢',
		major: '🔮'
	};

	const initDeck = (type: DeckType, name: string) => {
		nameDeck = name;
		currentCard = null;
		const raw = getRawData(type);
		const withIds = raw.map((c) => ({ ...c, id: crypto.randomUUID() }));
		deck = shuffle(withIds);
	};

	const drawCard = () => {
		if (deck.length === 0) return;
		const card = deck.pop();
		if (card) {
			currentCard = card;
			const newRecord: CardRecord = {
				id: crypto.randomUUID(),
				rank: card.rank,
				suit: card.suit,
				name: card.name,
				color: card.color,
				timestamp: new Date()
			};

			history = [newRecord, ...history];
		}
	};

	const formatTime = (date: Date) => {
		return new Intl.DateTimeFormat('it-IT', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		}).format(date);
	};
</script>

<div class="panel-wrapper">
	<div class="deck-controls">
		<button onclick={() => initDeck('poker', 'Poker')}>Poker</button>
		<button onclick={() => initDeck('poker-no-jocker', 'No joker')}>Poker No Joker</button>
		<button onclick={() => initDeck('tarot-major', 'Major only')}>Tarot Major</button>
		<button onclick={() => initDeck('tarot-full', 'Tarot')}>Tarot Full</button>
	</div>

	<div class="play-mat">
		<div class="deck-slot">
			{#if deck.length > 0}
				<button class="card-back" onclick={drawCard}>
					<span class="deck-count">{deck.length}</span>
					<span class="click-hint">CLICK</span>
				</button>
			{:else}
				<div class="empty-slot">Empty</div>
			{/if}
			<p class="label">{nameDeck}</p>
		</div>

		<div class="arrow">➜</div>

		<div class="hand-slot">
			{#if currentCard}
				<div class="card-face {currentCard.color || 'black'}">
					<div class="corner top">
						<span>{currentCard.rank || ''}</span>
						<span>{suitIcons[currentCard.suit] || ''}</span>
					</div>

					<div class="center-content">
						{#if currentCard.suit === 'major'}
							<h3 class="major-title">{currentCard.name}</h3>
							<span class="roman">{currentCard.rank}</span>
						{:else}
							<span class="big-icon">{suitIcons[currentCard.suit]}</span>
							<span class="card-name">{currentCard.name}</span>
						{/if}
					</div>

					<div class="corner bottom">
						<span>{currentCard.rank || ''}</span>
						<span>{suitIcons[currentCard.suit] || ''}</span>
					</div>
				</div>
			{:else}
				<div class="empty-placeholder">Draw a card...</div>
			{/if}
			<p class="label">hand</p>
		</div>
		<div class="card panel-right">
			<div class="card-header">
				<h3>History ({history.length})</h3>
				<button class="btn-text" onclick={() => (history = [])}>Reset</button>
			</div>

			<div class="scroll-area">
				{#each history as item (item.id)}
					<div class="history-item">
						<div class="history-top">
							<span class="roll-desc">
								{item.name || `${item.rank} ${suitIcons[item.suit]}`}
							</span>
							<span class="timestamp">{formatTime(item.timestamp)}</span>
						</div>

						<div class="history-main">
							<span class="mini-card-text {item.color || 'black'}">
								{suitIcons[item.suit]}
								{item.rank || ''}
							</span>
						</div>
					</div>
				{:else}
					<div class="empty-state">No cards drawn</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.panel-wrapper {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 40px;
		width: 100%;
	}
	.left-column {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}
	.panel-right {
		min-width: 300px;
		max-width: 300px;
	}
	.deck-controls {
		display: flex;
		gap: 10px;
		margin-bottom: 20px;
	}
	.deck-controls button {
		padding: 8px 16px;
		background: #333;
		color: white;
		border: 1px solid #555;
		cursor: pointer;
		border-radius: 4px;
	}

	.play-mat {
		display: flex;
		align-items: center;
		gap: 40px;
	}

	.label {
		text-align: center;
		color: #888;
		margin-top: 10px;
		font-size: 0.8rem;
		letter-spacing: 1px;
	}
	.arrow {
		font-size: 2rem;
		color: #555;
	}

	.card-back {
		width: 140px;
		height: 200px;
		border-radius: 10px;
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
		padding: 4px 8px;
		border-radius: 12px;
		font-weight: bold;
		font-size: 0.9rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.click-hint {
		position: absolute;
		bottom: 10px;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.8rem;
	}

	.empty-slot {
		width: 140px;
		height: 200px;
		border: 2px dashed #444;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #555;
	}

	.card-face {
		width: 140px;
		height: 200px;
		background: #e6e6e6;
		border-radius: 10px;
		position: relative;
		padding: 10px;
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
	.card-face.gold .corner {
		border-color: #d4af37;
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
		margin-top: 5px;
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
		margin-top: 5px;
		font-weight: bold;
	}

	.empty-placeholder {
		width: 140px;
		height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #666;
		font-style: italic;
		font-size: 0.9rem;
	}

	.card {
		background-color: #27272a;
		border: 1px solid #3f3f46;
		border-radius: 12px;
		padding: 24px;
		width: 300px;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
	}
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		border-bottom: 1px solid #3f3f46;
		padding-bottom: 10px;
	}
	h3 {
		margin: 0;
		font-weight: 600;
		font-size: 1.1rem;
		color: #f4f4f5;
	}
	.btn-text {
		background: none;
		border: none;
		color: #a1a1aa;
		cursor: pointer;
		font-size: 0.8rem;
		text-decoration: underline;
	}

	.scroll-area {
		max-height: 400px;
		overflow-y: auto;
		padding-right: 5px;
	}
	.history-item {
		background: #18181b;
		padding: 12px;
		border-radius: 8px;
		margin-bottom: 8px;
		border-left: 3px solid #52525b;
	}

	.history-top {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
		color: #a1a1aa;
		margin-bottom: 4px;
	}
	.roll-desc {
		font-weight: bold;
		color: #e4e4e7;
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
		color: #a1a1aa;
	}
	.mini-card-text.gold {
		color: #fbbf24;
	}

	.empty-state {
		text-align: center;
		color: #a1a1aa;
		padding: 20px;
		font-style: italic;
	}
</style>

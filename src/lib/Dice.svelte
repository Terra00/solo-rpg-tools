<script lang="ts">
	type RollRecord = {
		id: string;
		diceCount: number;
		dieType: number;
		rolls: number[];
		modifier: number;
		total: number;
		timestamp: Date;
	};
	let diceCount = $state(1);
	let modifier = $state(0);
	let history: RollRecord[] = $state([]);

	let isCustomMode = $state(false);
	let customSides = $state(6);

	const diceTypes = [4, 6, 8, 10, 12, 20, 100];

	const rollGeneric = (count: number, sides: number) => {
		const currentRolls: number[] = [];
		let sum = 0;

		for (let i = 0; i < count; i++) {
			const val = Math.floor(Math.random() * sides) + 1;
			currentRolls.push(val);
			sum += val;
		}

		const newRecord: RollRecord = {
			id: crypto.randomUUID(),
			diceCount: count,
			dieType: sides,
			rolls: currentRolls,
			modifier: modifier,
			total: sum + modifier,
			timestamp: new Date()
		};

		history = [newRecord, ...history];
	};

	const rollQuick = (sides: number) => rollGeneric(diceCount, sides);

	const rollCustom = () => {
		rollGeneric(diceCount, customSides);
	};

	const openCustom = () => {
		isCustomMode = true;
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
	<div class="card panel-left">
		<div class="card-header">
			<h3>Quick Roll</h3>
		</div>

		<div class="control-row">
			<div class="control-group">
				<span class="label-text">N.</span>
				<div class="stepper">
					<button
						onclick={() => {
							if (diceCount > 1) diceCount--;
						}}>−</button
					>
					<div class="value-display">{diceCount}</div>
					<button onclick={() => diceCount++}>+</button>
				</div>
			</div>

			<div class="control-group">
				<span class="label-text">Modifier</span>
				<div class="stepper">
					<button onclick={() => modifier--}>−</button>
					<div class="value-display">{modifier > 0 ? '+' : ''}{modifier}</div>
					<button onclick={() => modifier++}>+</button>
				</div>
			</div>
		</div>

		<div class="dice-grid">
			{#each diceTypes as sides}
				<button class="btn-dice" onclick={() => rollQuick(sides)}>
					d{sides}
				</button>
			{/each}
		</div>

		<div class="separator"></div>

		<div class="extra-actions">
			<button class="btn-secondary" onclick={openCustom}>Custom</button>
		</div>

		{#if isCustomMode}
			<div class="custom-panel">
				<div class="custom-inputs">
					<div class="input-group">
						<label for="custom-faces">Faces</label>
						<input id="custom-faces" type="number" bind:value={customSides} min="2" />
					</div>
				</div>
				<button class="btn-primary" onclick={rollCustom}>
					Roll {diceCount}d{customSides}
				</button>
			</div>
		{/if}
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
							{#if item.diceCount > 1}
								{item.diceCount}d{item.dieType}
							{:else}
								d{item.dieType}
							{/if}
						</span>
						<span class="timestamp">{formatTime(item.timestamp)}</span>
					</div>

					<div class="history-main">
						<div class="calculation">
							{#if item.diceCount > 1}
								<span class="sub-rolls">({item.rolls.join(' + ')})</span>
							{:else}
								<span class="sub-rolls">{item.rolls[0]}</span>
							{/if}

							{#if item.modifier !== 0}
								<span class="mod-text"> {item.modifier >= 0 ? '+' : ''} {item.modifier}</span>
							{/if}
						</div>
						<div class="total-result">
							= {item.total}
						</div>
					</div>
				</div>
			{:else}
				<div class="empty-state">No roll</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.panel-wrapper {
		display: flex;
		gap: 20px;
		justify-content: center;
		align-items: flex-start;
		flex-wrap: wrap;
	}

	.card {
		background-color: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 24px;
		width: 320px;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		border-bottom: 1px solid var(--border);
		padding-bottom: 10px;
	}

	h3 {
		margin: 0;
		font-weight: 600;
		font-size: 1.1rem;
	}

	.control-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-bottom: 20px;
		gap: 10px;
	}

	.stepper {
		display: flex;
		background: var(--bg-app);
		border-radius: 6px;
		padding: 2px;
	}

	.stepper button {
		background: transparent;
		border: none;
		color: var(--text-main);
		width: 32px;
		height: 32px;
		cursor: pointer;
		font-size: 1.2rem;
	}
	.stepper button:hover {
		background: var(--bg-element);
		border-radius: 4px;
	}

	.value-display {
		width: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 1rem;
	}

	.dice-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8px;
		margin-bottom: 20px;
	}

	.btn-dice {
		background: var(--bg-element);
		border: none;
		color: var(--text-main);
		padding: 12px 0;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
	}
	.btn-dice:hover {
		background: var(--bg-hover);
		transform: translateY(-1px);
	}
	.btn-dice:active {
		transform: translateY(0);
	}

	.separator {
		height: 1px;
		background: var(--border);
		margin: 20px 0;
	}

	.extra-actions {
		display: flex;
		gap: 10px;
	}

	.btn-secondary {
		flex: 1;
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-muted);
		padding: 10px;
		border-radius: 6px;
		cursor: pointer;
	}
	.btn-secondary:hover {
		border-color: var(--text-main);
		color: var(--text-main);
	}

	.custom-panel {
		margin-top: 15px;
		background: var(--bg-app);
		padding: 15px;
		border-radius: 8px;
		animation: fadeIn 0.2s ease;
	}
	.custom-inputs {
		display: flex;
		gap: 10px;
		margin-bottom: 10px;
	}
	.input-group {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.input-group label {
		font-size: 0.75rem;
		color: var(--text-muted);
	}
	.input-group input {
		background: var(--bg-card);
		border: 1px solid var(--border);
		color: white;
		padding: 6px;
		border-radius: 4px;
		width: 100%;
		box-sizing: border-box;
	}

	.btn-primary {
		width: 100%;
		background: var(--text-main);
		color: var(--bg-app);
		border: none;
		padding: 10px;
		border-radius: 6px;
		font-weight: bold;
		cursor: pointer;
	}
	.btn-primary:hover {
		opacity: 0.9;
	}

	.scroll-area {
		max-height: 400px;
		overflow-y: auto;
		padding-right: 5px;
	}

	.history-item {
		background: var(--bg-app);
		padding: 12px;
		border-radius: 8px;
		margin-bottom: 8px;
	}

	.history-top {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
		color: var(--text-muted);
		margin-bottom: 4px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.history-main {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.sub-rolls {
		color: var(--text-muted);
		font-family: monospace;
	}
	.mod-text {
		color: var(--text-muted);
	}

	.total-result {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text-main);
	}
	.control-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
		flex: 1;
	}

	.label-text {
		font-size: 0.85rem;
		color: var(--text-muted);
		font-weight: 600;
		margin-left: 4px;
	}

	.stepper {
		display: flex;
		background: var(--bg-app);
		border-radius: 6px;
		padding: 4px;
		width: 100%;
		justify-content: space-between;
		box-sizing: border-box;
	}

	.value-display {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 1.1rem;
	}
	.btn-text {
		background: none;
		border: none;
		color: var(--text-muted);
		cursor: pointer;
		font-size: 0.8rem;
		text-decoration: underline;
	}
	.empty-state {
		text-align: center;
		color: var(--text-muted);
		padding: 20px;
		font-style: italic;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>

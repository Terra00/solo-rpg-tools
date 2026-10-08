<script lang="ts">
	import {
		DICE_TYPES,
		MAX_DICE_COUNT,
		MAX_HISTORY,
		MAX_SIDES,
		MIN_DICE_COUNT,
		MIN_SIDES,
		describeRoll,
		rollDice
	} from './dice';
	import { formatTime } from './format';
	import { clampInt } from './random';
	import type { RollRecord } from './types';

	interface Props {
		onRoll?: (record: RollRecord) => void;
	}

	let { onRoll }: Props = $props();

	let diceCount = $state(1);
	let modifier = $state(0);
	let customSides = $state(6);
	let showCustom = $state(false);
	let history: RollRecord[] = $state(loadHistory());

	function loadHistory(): RollRecord[] {
		try {
			const raw = localStorage.getItem('solo-rpg-dice-history');
			if (!raw) return [];
			const parsed = JSON.parse(raw) as RollRecord[];
			return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY) : [];
		} catch {
			return [];
		}
	}

	$effect(() => {
		try {
			localStorage.setItem('solo-rpg-dice-history', JSON.stringify(history.slice(0, MAX_HISTORY)));
		} catch {
			// storage full or unavailable: ignore, history still works in memory
		}
	});

	function pushRecord(record: RollRecord): void {
		history = [record, ...history].slice(0, MAX_HISTORY);
		onRoll?.(record);
	}

	function roll(sides: number): void {
		pushRecord(rollDice(diceCount, sides, modifier));
	}

	function rollCustom(): void {
		customSides = clampInt(customSides, MIN_SIDES, MAX_SIDES, 6);
		pushRecord(rollDice(diceCount, customSides, modifier));
	}

	function clearHistory(): void {
		history = [];
	}
</script>

<div class="panel-wrapper">
	<section class="card panel" aria-labelledby="dice-controls-title">
		<div class="card-header">
			<h3 id="dice-controls-title">Lancio rapido</h3>
		</div>

		<div class="control-row">
			<div class="control-group">
				<span class="label-text" id="dice-count-label">Numero dadi</span>
				<div class="stepper" role="group" aria-labelledby="dice-count-label">
					<button
						type="button"
						aria-label="Riduci numero dadi"
						disabled={diceCount <= MIN_DICE_COUNT}
						onclick={() => (diceCount = Math.max(MIN_DICE_COUNT, diceCount - 1))}>−</button
					>
					<output class="value-display" aria-live="polite">{diceCount}</output>
					<button
						type="button"
						aria-label="Aumenta numero dadi"
						disabled={diceCount >= MAX_DICE_COUNT}
						onclick={() => (diceCount = Math.min(MAX_DICE_COUNT, diceCount + 1))}>+</button
					>
				</div>
			</div>

			<div class="control-group">
				<span class="label-text" id="dice-mod-label">Modificatore</span>
				<div class="stepper" role="group" aria-labelledby="dice-mod-label">
					<button type="button" aria-label="Riduci modificatore" onclick={() => modifier--}
						>−</button
					>
					<output class="value-display" aria-live="polite"
						>{modifier > 0 ? `+${modifier}` : modifier}</output
					>
					<button type="button" aria-label="Aumenta modificatore" onclick={() => modifier++}
						>+</button
					>
				</div>
			</div>
		</div>

		<div class="dice-grid" role="group" aria-label="Dadi disponibili">
			{#each DICE_TYPES as sides (sides)}
				<button type="button" class="btn-dice" onclick={() => roll(sides)}>
					d{sides}
				</button>
			{/each}
		</div>

		<div class="separator"></div>

		<div class="extra-actions">
			<button
				type="button"
				class="btn-secondary"
				aria-expanded={showCustom}
				onclick={() => (showCustom = !showCustom)}
			>
				{showCustom ? 'Nascondi custom' : 'Dado custom'}
			</button>
		</div>

		{#if showCustom}
			<div class="custom-panel">
				<div class="input-group">
					<label for="custom-faces">Numero facce ({MIN_SIDES}–{MAX_SIDES})</label>
					<input
						id="custom-faces"
						type="number"
						min={MIN_SIDES}
						max={MAX_SIDES}
						bind:value={customSides}
					/>
				</div>
				<button type="button" class="btn-primary" onclick={rollCustom}>
					Lancia {diceCount}d{clampInt(customSides, MIN_SIDES, MAX_SIDES, 6)}
				</button>
			</div>
		{/if}
	</section>

	<section class="card panel" aria-labelledby="dice-history-title">
		<div class="card-header">
			<h3 id="dice-history-title">Storico ({history.length})</h3>
			<button type="button" class="btn-text" disabled={history.length === 0} onclick={clearHistory}>
				Azzera
			</button>
		</div>

		<div class="scroll-area" aria-live="polite">
			{#each history as item (item.id)}
				<article class="history-item">
					<div class="history-top">
						<span class="roll-desc">{describeRoll(item)}</span>
						<time class="timestamp" datetime={new Date(item.timestamp).toISOString()}>
							{formatTime(item.timestamp)}
						</time>
					</div>
					<div class="history-main">
						<div class="calculation">
							{#if item.diceCount > 1}
								<span class="sub-rolls">({item.rolls.join(' + ')})</span>
							{:else}
								<span class="sub-rolls">{item.rolls[0]}</span>
							{/if}
							{#if item.modifier !== 0}
								<span class="mod-text">
									{item.modifier > 0 ? `+ ${item.modifier}` : `− ${Math.abs(item.modifier)}`}
								</span>
							{/if}
						</div>
						<div class="total-result">= {item.total}</div>
					</div>
				</article>
			{:else}
				<p class="empty-state">Nessun lancio ancora. Tira un dado per iniziare.</p>
			{/each}
		</div>
	</section>
</div>

<style>
	.panel-wrapper {
		display: flex;
		gap: 1.25rem;
		justify-content: center;
		align-items: flex-start;
		flex-wrap: wrap;
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
	}

	.control-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-bottom: 1.25rem;
		gap: 0.625rem;
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		flex: 1;
	}

	.label-text {
		font-size: 0.85rem;
		color: var(--text-muted);
		font-weight: 600;
		margin-left: 0.25rem;
	}

	.stepper {
		display: flex;
		background: var(--bg-app);
		border-radius: 0.375rem;
		padding: 0.25rem;
		width: 100%;
		justify-content: space-between;
		box-sizing: border-box;
	}

	.stepper button {
		background: transparent;
		border: none;
		color: var(--text-main);
		width: 2rem;
		height: 2rem;
		cursor: pointer;
		font-size: 1.2rem;
		border-radius: 0.25rem;
	}

	.stepper button:hover:not(:disabled) {
		background: var(--bg-element);
	}

	.stepper button:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.value-display {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		font-size: 1.1rem;
	}

	.dice-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
		margin-bottom: 1.25rem;
	}

	.btn-dice {
		background: var(--bg-element);
		border: none;
		color: var(--text-main);
		padding: 0.75rem 0;
		border-radius: 0.375rem;
		cursor: pointer;
		font-weight: 500;
		transition:
			background-color 0.2s,
			transform 0.2s;
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
		margin: 1.25rem 0;
	}

	.extra-actions {
		display: flex;
		gap: 0.625rem;
	}

	.btn-secondary {
		flex: 1;
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-muted);
		padding: 0.625rem;
		border-radius: 0.375rem;
		cursor: pointer;
	}

	.btn-secondary:hover {
		border-color: var(--text-main);
		color: var(--text-main);
	}

	.custom-panel {
		margin-top: 0.9375rem;
		background: var(--bg-app);
		padding: 0.9375rem;
		border-radius: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.input-group label {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.input-group input {
		background: var(--bg-card);
		border: 1px solid var(--border);
		color: var(--text-main);
		padding: 0.375rem;
		border-radius: 0.25rem;
		width: 100%;
		box-sizing: border-box;
	}

	.btn-primary {
		width: 100%;
		background: var(--text-main);
		color: var(--bg-app);
		border: none;
		padding: 0.625rem;
		border-radius: 0.375rem;
		font-weight: bold;
		cursor: pointer;
	}

	.btn-primary:hover {
		opacity: 0.9;
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
	}

	.history-top {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
		color: var(--text-muted);
		margin-bottom: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.history-main {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.calculation {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.sub-rolls,
	.mod-text {
		color: var(--text-muted);
		font-family: ui-monospace, monospace;
	}

	.total-result {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text-main);
		white-space: nowrap;
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

	.empty-state {
		text-align: center;
		color: var(--text-muted);
		padding: 1.25rem;
		font-style: italic;
		margin: 0;
	}
</style>

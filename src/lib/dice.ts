import { clampInt, randomInt, uid } from './random';
import type { RollRecord } from './types';

export const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100] as const;
export type DiceSides = (typeof DICE_TYPES)[number];

export const MIN_DICE_COUNT = 1;
export const MAX_DICE_COUNT = 100;
export const MIN_SIDES = 2;
export const MAX_SIDES = 1000;
export const MAX_HISTORY = 100;

export function rollDice(
	count: number,
	sides: number,
	modifier = 0,
	rng: () => number = Math.random
): RollRecord {
	const safeCount = clampInt(count, MIN_DICE_COUNT, MAX_DICE_COUNT, 1);
	const safeSides = clampInt(sides, MIN_SIDES, MAX_SIDES, 6);
	const safeModifier = Number.isFinite(modifier) ? Math.trunc(modifier) : 0;

	const rolls: number[] = [];
	let sum = 0;
	for (let i = 0; i < safeCount; i++) {
		const value = randomInt(1, safeSides, rng);
		rolls.push(value);
		sum += value;
	}

	return {
		id: uid(),
		diceCount: safeCount,
		dieType: safeSides,
		rolls,
		modifier: safeModifier,
		total: sum + safeModifier,
		timestamp: Date.now()
	};
}

export function describeRoll(
	record: Pick<RollRecord, 'diceCount' | 'dieType' | 'modifier'>
): string {
	const base =
		record.diceCount > 1 ? `${record.diceCount}d${record.dieType}` : `d${record.dieType}`;
	if (record.modifier === 0) return base;
	const sign = record.modifier > 0 ? '+' : '';
	return `${base}${sign}${record.modifier}`;
}

import { describe, expect, it } from 'vitest';
import { describeRoll, rollDice } from './dice';

describe('rollDice', () => {
	it('rolls the requested count and sides', () => {
		const record = rollDice(3, 6, 2, () => 0);
		expect(record.diceCount).toBe(3);
		expect(record.dieType).toBe(6);
		expect(record.rolls).toEqual([1, 1, 1]);
		expect(record.total).toBe(5);
		expect(record.modifier).toBe(2);
	});

	it('clamps invalid input instead of crashing', () => {
		const record = rollDice(9999, 99999, Number.NaN, () => 0.5);
		expect(record.diceCount).toBeLessThanOrEqual(100);
		expect(record.dieType).toBeLessThanOrEqual(1000);
		expect(record.total).toBe(record.rolls.reduce((a, b) => a + b, 0));
	});
});

describe('describeRoll', () => {
	it('formats single and multi dice with modifier', () => {
		expect(describeRoll({ diceCount: 1, dieType: 20, modifier: 0 })).toBe('d20');
		expect(describeRoll({ diceCount: 2, dieType: 6, modifier: 3 })).toBe('2d6+3');
		expect(describeRoll({ diceCount: 2, dieType: 6, modifier: -1 })).toBe('2d6-1');
	});
});

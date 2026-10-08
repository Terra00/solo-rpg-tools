import { describe, expect, it } from 'vitest';
import { clampInt, randomInt, shuffle } from './random';

describe('randomInt', () => {
	it('returns values within range', () => {
		for (let i = 0; i < 100; i++) {
			const value = randomInt(1, 6);
			expect(value).toBeGreaterThanOrEqual(1);
			expect(value).toBeLessThanOrEqual(6);
		}
	});

	it('supports a deterministic rng', () => {
		expect(randomInt(1, 6, () => 0)).toBe(1);
		expect(randomInt(1, 6, () => 0.9999)).toBe(6);
	});
});

describe('shuffle', () => {
	it('does not mutate the input and keeps all elements', () => {
		const input = [1, 2, 3, 4, 5];
		const result = shuffle(input, () => 0.5);
		expect(result).toHaveLength(input.length);
		expect([...result].sort()).toEqual(input);
		expect(input).toEqual([1, 2, 3, 4, 5]);
	});
});

describe('clampInt', () => {
	it('clamps and falls back on non-finite values', () => {
		expect(clampInt(99, 1, 10, 1)).toBe(10);
		expect(clampInt(-5, 1, 10, 1)).toBe(1);
		expect(clampInt(Number.NaN, 1, 10, 4)).toBe(4);
		expect(clampInt(4.9, 1, 10, 1)).toBe(4);
	});
});

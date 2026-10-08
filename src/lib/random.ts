/** Small pure helpers: random numbers, ids, shuffle. Easy to unit-test. */

export function randomInt(min: number, max: number, rng: () => number = Math.random): number {
	const lo = Math.ceil(min);
	const hi = Math.floor(max);
	return Math.floor(rng() * (hi - lo + 1)) + lo;
}

export function uid(): string {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
		return crypto.randomUUID();
	}
	return `${Date.now().toString(36)}-${Math.floor(Math.random() * 2 ** 32).toString(36)}`;
}

export function shuffle<T>(input: readonly T[], rng: () => number = Math.random): T[] {
	const array = [...input];
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

export function clampInt(value: number, min: number, max: number, fallback: number): number {
	if (!Number.isFinite(value)) return fallback;
	return Math.min(max, Math.max(min, Math.trunc(value)));
}

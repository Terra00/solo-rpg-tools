import { describe, expect, it } from 'vitest';
import { buildShuffledDeck, cardLabel, getDeckCards, suitIcon } from './decks';

describe('decks', () => {
	it('builds poker decks with and without jokers', () => {
		const full = getDeckCards('poker');
		const noJoker = getDeckCards('poker-no-joker');
		expect(full.length).toBeGreaterThan(noJoker.length);
		expect(noJoker.every((card) => card.suit !== 'none')).toBe(true);
		expect(new Set(full.map((card) => card.id)).size).toBe(full.length);
	});

	it('builds tarot decks', () => {
		expect(getDeckCards('tarot-major')).toHaveLength(22);
		expect(getDeckCards('tarot-full').length).toBeGreaterThan(22);
	});

	it('shuffles without losing cards', () => {
		const deck = buildShuffledDeck('tarot-major', () => 0.5);
		expect(deck).toHaveLength(22);
	});

	it('formats labels and icons', () => {
		expect(suitIcon('hearts')).toBe('♥');
		expect(suitIcon('unknown')).toBe('');
		expect(cardLabel({ suit: 'hearts', rank: 'A', name: 'Ace of Hearts' })).toBe('Ace of Hearts');
	});
});

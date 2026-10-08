import pokerData from '../data/poker.json';
import tarotData from '../data/arcana.json';
import { shuffle, uid } from './random';
import type { DeckOption, DeckType, PlayableCard } from './types';

export const DECK_OPTIONS: DeckOption[] = [
	{ type: 'poker', label: 'Poker' },
	{ type: 'poker-no-joker', label: 'Poker senza joker' },
	{ type: 'tarot-major', label: 'Tarocchi maggiori' },
	{ type: 'tarot-full', label: 'Tarocchi completi' }
];

export const SUIT_ICONS: Record<string, string> = {
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

type RawCard = { rank?: string; suit: string; name?: string; color?: string };

function withIds(cards: RawCard[]): PlayableCard[] {
	return cards.map((card) => ({
		rank: card.rank,
		suit: card.suit,
		name: card.name,
		color: (card.color ?? 'black') as PlayableCard['color'],
		id: uid()
	}));
}

export function getDeckCards(type: DeckType): PlayableCard[] {
	switch (type) {
		case 'poker':
			return withIds(pokerData as RawCard[]);
		case 'poker-no-joker':
			return withIds((pokerData as RawCard[]).filter((card) => card.suit !== 'none'));
		case 'tarot-full':
			return withIds(tarotData as RawCard[]);
		case 'tarot-major':
			return withIds((tarotData as RawCard[]).filter((card) => card.suit === 'major'));
	}
}

export function buildShuffledDeck(type: DeckType, rng?: () => number): PlayableCard[] {
	return shuffle(getDeckCards(type), rng);
}

export function suitIcon(suit: string): string {
	return SUIT_ICONS[suit] ?? '';
}

export function cardLabel(card: Pick<PlayableCard, 'rank' | 'suit' | 'name'>): string {
	if (card.name) return card.name;
	return `${card.rank ?? ''} ${suitIcon(card.suit)}`.trim();
}

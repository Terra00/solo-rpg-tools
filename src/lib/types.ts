export interface RollRecord {
	id: string;
	diceCount: number;
	dieType: number;
	rolls: number[];
	modifier: number;
	total: number;
	timestamp: number;
}

export type CardColor = 'red' | 'black' | 'gold';

export interface PlayableCard {
	id: string;
	rank?: string;
	suit: string;
	name?: string;
	color?: CardColor;
}

export interface CardRecord extends Omit<PlayableCard, 'id'> {
	id: string;
	timestamp: number;
}

export type DeckType = 'poker' | 'poker-no-joker' | 'tarot-full' | 'tarot-major';

export interface DeckOption {
	type: DeckType;
	label: string;
}

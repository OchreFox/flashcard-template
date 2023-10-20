export interface IMemoCard {
  id: number;
  front: string;
  back: string;
}

export enum Orientation {
  Front,
  Back,
}

export interface CardState {
  cards: IMemoCard[];
  totalCards: number;
  rows: number;
  cols: number;
  setCards: (cards: IMemoCard[]) => void;
  updateCard: (card: IMemoCard) => void;
  setRows: (rows: number) => void;
  setCols: (cols: number) => void;
}

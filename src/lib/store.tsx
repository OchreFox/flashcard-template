import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { CardState, IMemoCard } from "./types";

export const initialState = {
  totalCards: 48,
};

export const initialArray = Array.from(
  Array(initialState.totalCards).keys()
).map((i) => {
  return {
    id: i,
    front: "",
    back: "",
  };
});

export const useCardStore = create<CardState>()(
  devtools(
    persist(
      (set) => ({
        totalCards: initialState.totalCards,
        rows: 8,
        cols: 6,
        cards: initialArray,
        setCards: (cards: IMemoCard[]) => set({ cards }),
        updateCard: (card: IMemoCard) =>
          set((state) => ({
            cards: state.cards.map((c) => (c.id === card.id ? card : c)),
          })),
        setRows: (rows: number) => {
          set({ rows });
          set((state) => ({ totalCards: rows * state.cols }));
        },
        setCols: (cols: number) => {
          set({ cols });
          set((state) => ({ totalCards: state.rows * cols }));
        },
      }),
      {
        name: "card-storage",
      }
    )
  )
);

// hooks/useWishlist.ts
import { create } from "zustand";

export const useWishlist = create<{
  items: string[];
  toggleItem: (id: string) => void;
}>((set) => ({
  items: [],
  toggleItem: (id) =>
    set((state) => ({
      items: state.items.includes(id)
        ? state.items.filter((x) => x !== id)
        : [...state.items, id],
    })),
}));

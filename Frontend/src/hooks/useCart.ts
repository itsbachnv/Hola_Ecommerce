// hooks/useCart.ts
import { create } from "zustand";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartState>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      const exists = state.items.find((x) => x.id === item.id);
      if (exists) {
        return {
          items: state.items.map((x) =>
            x.id === item.id ? { ...x, quantity: x.quantity + item.quantity } : x
          ),
        };
      }
      return { items: [...state.items, item] };
    }),
  removeItem: (id) => set((state) => ({ items: state.items.filter((x) => x.id !== id) })),
  updateQuantity: (id, qty) =>
    set((state) => ({
      items: state.items.map((x) => (x.id === id ? { ...x, quantity: qty } : x)),
    })),
  clearCart: () => set({ items: [] }),
}));

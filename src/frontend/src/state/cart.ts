import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../backend';

export interface CartItem {
  product: Product;
  quantity: number;
  variantId?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variantId?: number) => void;
  removeItem: (productId: bigint, variantId?: number) => void;
  updateQuantity: (productId: bigint, quantity: number, variantId?: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1, variantId) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id && item.variantId === variantId
          );

          if (existingIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += quantity;
            return { items: newItems };
          }

          return {
            items: [...state.items, { product, quantity, variantId }],
          };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.variantId === variantId
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.variantId
            ? item.product.variants.find((v) => v.variantId === BigInt(item.variantId!))?.priceInPaise || item.product.priceInPaise
            : item.product.priceInPaise;
          return total + Number(price) * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'gupta-ji-cart',
    }
  )
);

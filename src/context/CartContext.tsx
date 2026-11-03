import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../data/products';

export interface CartItem {
  id: string; // product id
  product: Product;
  quantity: number;
  notes?: string;
  addedAt: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, notes?: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  totalCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  toastMessage: string | null;
}

const CART_STORAGE_KEY = 'naqsh_e_noor_cart_v1';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse cart from localStorage', e);
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [items]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  const addToCart = useCallback((product: Product, quantity = 1, notes?: string) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === product.id);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          product, // ensure freshest data
          quantity: next[existingIdx].quantity + quantity,
          notes: notes || next[existingIdx].notes,
        };
        return next;
      }
      return [
        ...prev,
        {
          id: product.id,
          product,
          quantity: Math.max(1, quantity),
          notes,
          addedAt: Date.now(),
        },
      ];
    });
    showToast(`Added ${product.id} to your Inquiry Bag`);
  }, [showToast]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.id !== productId);
      }
      return prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
    showToast('Item removed from inquiry bag');
  }, [showToast]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback((productId: string) => {
    return items.some((item) => item.id === productId);
  }, [items]);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isInCart,
        totalCount,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        toastMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};


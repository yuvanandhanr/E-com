'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  condition: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  tradeInCredit: number;
  setTradeInCredit: (amount: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tradeInCredit, setTradeInCredit] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexus_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
      const savedCredit = localStorage.getItem('nexus_trade_in_credit');
      if (savedCredit) {
        setTradeInCredit(Number(savedCredit));
      }
    } catch (e) {
      console.error('Failed reading cart from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('nexus_cart', JSON.stringify(items));
      localStorage.setItem('nexus_trade_in_credit', String(tradeInCredit));
    } catch (e) {
      console.error('Failed saving cart to localStorage', e);
    }
  }, [items, tradeInCredit, isLoaded]);

  const addItem = (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === newItem.variantId);
      const qtyToAdd = newItem.quantity || 1;
      if (existing) {
        return prev.map((i) =>
          i.variantId === newItem.variantId
            ? { ...i, quantity: i.quantity + qtyToAdd }
            : i
        );
      }
      return [...prev, { ...newItem, quantity: qtyToAdd }];
    });
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setTradeInCredit(0);
    localStorage.removeItem('nexus_cart');
    localStorage.removeItem('nexus_trade_in_credit');
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        tradeInCredit,
        setTradeInCredit,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}


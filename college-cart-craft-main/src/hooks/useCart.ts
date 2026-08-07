import { useState, useEffect, useCallback } from "react";
import { Product } from "@/data/products";

export interface CartItem {
  id: number;
  qty: number;
}

const CART_KEY = "college-shop-cart";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((productId: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        return prev.map((item) =>
          item.id === productId ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { id: productId, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, qty: number) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, qty } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getTotal = useCallback((products: Product[]) => {
    return cart.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.id);
      return sum + (product?.price || 0) * item.qty;
    }, 0);
  }, [cart]);

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    itemCount,
  };
}

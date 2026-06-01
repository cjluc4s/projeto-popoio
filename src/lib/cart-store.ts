"use client";

import { useEffect, useState } from "react";

export interface CartItem {
  productId: string;
  name: string;
  priceCents: number;
  qty: number;
  imageUrl?: string | null;
}

const KEY = "popoio:cart:v1";

type Listener = () => void;
const listeners = new Set<Listener>();

let state: { items: CartItem[] } = { items: [] };

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { items: JSON.parse(raw) };
  } catch {}
}
function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state.items));
  listeners.forEach((l) => l());
}

load();

export const cartStore = {
  getItems: () => state.items,
  add(item: Omit<CartItem, "qty">, qty = 1) {
    const existing = state.items.find((i) => i.productId === item.productId);
    if (existing) existing.qty += qty;
    else state.items.push({ ...item, qty });
    persist();
  },
  setQty(productId: string, qty: number) {
    const item = state.items.find((i) => i.productId === productId);
    if (!item) return;
    if (qty <= 0) state.items = state.items.filter((i) => i.productId !== productId);
    else item.qty = qty;
    persist();
  },
  remove(productId: string) {
    state.items = state.items.filter((i) => i.productId !== productId);
    persist();
  },
  clear() {
    state.items = [];
    persist();
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useCart<T>(selector: (s: { items: CartItem[] }) => T): T {
  const [, force] = useState(0);
  useEffect(() => {
    const unsub = cartStore.subscribe(() => force((n) => n + 1));
    return () => {
      unsub();
    };
  }, []);
  return selector(state);
}

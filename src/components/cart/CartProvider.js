"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

// Minimal client-side cart, persisted in localStorage and synced across tabs.
// Swap for a server/database-backed cart when checkout is built.
const STORAGE_KEY = "digicon-cart";
const EMPTY = [];
const listeners = new Set();

// Cached snapshot so useSyncExternalStore gets a stable reference between reads.
let cacheRaw;
let cacheItems = EMPTY;

function getSnapshot() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return cacheItems; // storage blocked: fall back to in-memory items
  }
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      const parsed = JSON.parse(raw || "[]");
      cacheItems = Array.isArray(parsed) ? parsed : EMPTY;
    } catch {
      cacheItems = EMPTY;
    }
  }
  return cacheItems;
}

const getServerSnapshot = () => EMPTY;

function subscribe(callback) {
  listeners.add(callback);
  window.addEventListener("storage", callback); // other tabs
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function writeItems(next) {
  const raw = JSON.stringify(next);
  try {
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    /* storage unavailable: keep in memory only */
  }
  cacheRaw = raw;
  cacheItems = next;
  listeners.forEach((l) => l());
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot); // [{ id, color, qty }]

  const addItem = useCallback((id, color, qty = 1) => {
    const list = getSnapshot();
    const i = list.findIndex((it) => it.id === id && it.color === color);
    const next =
      i === -1
        ? [...list, { id, color, qty }]
        : list.map((it, j) => (j === i ? { ...it, qty: it.qty + qty } : it));
    writeItems(next);
  }, []);

  const setQty = useCallback((id, color, qty) => {
    writeItems(getSnapshot().map((it) => (it.id === id && it.color === color ? { ...it, qty: Math.max(1, qty) } : it)));
  }, []);

  const removeItem = useCallback((id, color) => {
    writeItems(getSnapshot().filter((it) => !(it.id === id && it.color === color)));
  }, []);

  const clear = useCallback(() => writeItems([]), []);

  const value = useMemo(
    () => ({ items, addItem, setQty, removeItem, clear, count: items.reduce((n, it) => n + it.qty, 0) }),
    [items, addItem, setQty, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

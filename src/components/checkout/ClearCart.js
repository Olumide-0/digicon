"use client";

import { useEffect } from "react";
import { useCart } from "../cart/CartProvider";

// Empties the cart once an order has been placed.
export default function ClearCart() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}

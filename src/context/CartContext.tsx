"use client";

// CartContext.tsx
import React, { createContext, useContext, useEffect, useReducer, useState } from "react";
import { ProductType } from "@/type/ProductType";
import {
  getProductVariants,
  getDefaultVariant,
  seedProductVariants,
  productsService,
  ApiVariant,
} from "@/services/products";

const STORAGE_KEY = "mossim_cart_v1";

export interface CartItem extends ProductType {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  variant_id: string;
  variant_sku?: string;
}

interface CartState {
  cartArray: CartItem[];
}

type CartAction =
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "REMOVE_FROM_CART"; payload: string } // variant_id
  | { type: "UPDATE_QTY"; payload: { variant_id: string; quantity: number } }
  | {
      type: "SWITCH_VARIANT";
      payload: { from_variant_id: string; to: CartItem };
    }
  | { type: "LOAD_CART"; payload: CartItem[] }
  | { type: "CLEAR_CART" };

interface CartContextProps {
  cartState: CartState;
  /** Add a fully-resolved cart line (must include variant_id) */
  addToCart: (item: CartItem) => void;
  /** Remove a cart line by variant_id */
  removeFromCart: (variantId: string) => void;
  /** Set the quantity of a cart line */
  updateQty: (variantId: string, quantity: number) => void;
  /** Swap a cart line to a different variant (merges if target already in cart) */
  switchVariant: (fromVariantId: string, to: CartItem) => void;
  /**
   * Legacy helper for components that don't know variant_id (e.g. card quick-add).
   * Resolves the default variant of `product` and adds it to the cart.
   */
  quickAdd: (product: ProductType) => void;
  /** Empty the cart (after an order is placed) */
  clearCart: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const incoming = action.payload;
      const exists = state.cartArray.find(
        (i) => i.variant_id === incoming.variant_id,
      );
      if (exists) {
        // Same variant already in cart → merge quantities
        return {
          ...state,
          cartArray: state.cartArray.map((i) =>
            i.variant_id === incoming.variant_id
              ? { ...i, quantity: i.quantity + incoming.quantity }
              : i,
          ),
        };
      }
      return { ...state, cartArray: [...state.cartArray, incoming] };
    }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cartArray: state.cartArray.filter(
          (i) => i.variant_id !== action.payload,
        ),
      };

    case "UPDATE_QTY":
      return {
        ...state,
        cartArray: state.cartArray.map((i) =>
          i.variant_id === action.payload.variant_id
            ? { ...i, quantity: Math.max(1, action.payload.quantity) }
            : i,
        ),
      };

    case "SWITCH_VARIANT": {
      const { from_variant_id, to } = action.payload;
      const targetExists = state.cartArray.some(
        (i) =>
          i.variant_id === to.variant_id && i.variant_id !== from_variant_id,
      );
      if (targetExists) {
        // Target variant already in cart → merge source qty into it, drop source
        const sourceQty =
          state.cartArray.find((i) => i.variant_id === from_variant_id)
            ?.quantity ?? 0;
        return {
          ...state,
          cartArray: state.cartArray
            .filter((i) => i.variant_id !== from_variant_id)
            .map((i) =>
              i.variant_id === to.variant_id
                ? { ...i, quantity: i.quantity + sourceQty }
                : i,
            ),
        };
      }
      return {
        ...state,
        cartArray: state.cartArray.map((i) =>
          i.variant_id === from_variant_id ? { ...to } : i,
        ),
      };
    }

    case "LOAD_CART":
      return { ...state, cartArray: action.payload };

    case "CLEAR_CART":
      return { ...state, cartArray: [] };

    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartState, dispatch] = useReducer(cartReducer, { cartArray: [] });
  const [hydrated, setHydrated] = useState(false);

  /* ── Persist cart across reloads ── */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && Array.isArray(saved.items)) {
        const variants: Record<string, ApiVariant[]> = saved.variants || {};
        Object.entries(variants).forEach(([id, list]) =>
          seedProductVariants(id, list),
        );
        const items = (saved.items as CartItem[]).filter(
          (i) => i && i.variant_id && i.quantity > 0,
        );
        if (items.length) dispatch({ type: "LOAD_CART", payload: items });
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const variants: Record<string, ApiVariant[]> = {};
      cartState.cartArray.forEach((i) => {
        const list = getProductVariants(i.id);
        if (list.length) variants[i.id] = list;
      });
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ items: cartState.cartArray, variants }),
      );
    } catch {}
  }, [cartState.cartArray, hydrated]);

  const addToCart = (item: CartItem) =>
    dispatch({ type: "ADD_TO_CART", payload: item });

  const removeFromCart = (variantId: string) =>
    dispatch({ type: "REMOVE_FROM_CART", payload: variantId });

  const updateQty = (variantId: string, quantity: number) =>
    dispatch({
      type: "UPDATE_QTY",
      payload: { variant_id: variantId, quantity },
    });

  const switchVariant = (fromVariantId: string, to: CartItem) =>
    dispatch({
      type: "SWITCH_VARIANT",
      payload: { from_variant_id: fromVariantId, to },
    });

  const clearCart = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    dispatch({ type: "CLEAR_CART" });
  };

  /** Card quick-add — resolves default variant (cache, else API) */
  const quickAdd = (product: ProductType) => {
    const variants = getProductVariants(product.id);
    if (!variants.length) {
      productsService
        .show(product.id)
        .then((p) => {
          if (p.variants?.length) addDefaultVariant(product, p.variants);
        })
        .catch((err) => console.warn("quickAdd:", err));
      return;
    }
    addDefaultVariant(product, variants);
  };

  const addDefaultVariant = (product: ProductType, variants: ApiVariant[]) => {
    const v = getDefaultVariant(variants) ?? variants[0];
    if (!v) return;

    const cartItem: CartItem = {
      ...product,
      quantity: 1,
      selectedColor: v.color?.color_name || "",
      selectedSize: v.size?.size_label || "",
      variant_id: v.id,
      variant_sku: v.sku,
      price: v.price?.current_price ?? product.price,
      originPrice: v.price?.actual_price ?? product.originPrice,
    };

    dispatch({ type: "ADD_TO_CART", payload: cartItem });
  };

  return (
    <CartContext.Provider
      value={{
        cartState,
        addToCart,
        removeFromCart,
        updateQty,
        switchVariant,
        quickAdd,
        clearCart,
      }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

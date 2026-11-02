import { useSyncExternalStore } from "react";

/*
 * Store currency symbol — always comes from the API.
 *
 * - Default symbol: GET /currencies (is_default), cached in localStorage
 *   so returning visitors don't see an empty symbol while it loads.
 * - Product / order prices carry their own symbol; pass it to money()
 *   and it wins over the default.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const STORAGE_KEY = "mossim_currency_symbol";

let symbol = "";
let started = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export function setCurrencySymbol(next?: string | null) {
  if (typeof window === "undefined" || !next || next === symbol) return;
  symbol = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {}
  emit();
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;

  try {
    symbol = localStorage.getItem(STORAGE_KEY) || symbol;
  } catch {}

  fetch(`${API_URL}/currencies`, { headers: { Accept: "application/json" } })
    .then((res) => (res.ok ? res.json() : null))
    .then((json) => {
      const list: { symbol: string; is_default: boolean }[] = json?.data ?? [];
      const def = list.find((c) => c.is_default) ?? list[0];
      setCurrencySymbol(def?.symbol);
    })
    .catch(() => {});
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
  };
}

/** "Tk" + 1200 → "Tk 1,200"; "$" + 1200 → "$1,200" */
export function formatMoney(amount: number | string, sym: string = symbol): string {
  const n = typeof amount === "number" ? amount : Number(amount);
  const value = Number.isFinite(n) ? n.toLocaleString() : String(amount);
  if (!sym) return value;
  return /[A-Za-z.]$/.test(sym) ? `${sym} ${value}` : `${sym}${value}`;
}

export function useCurrency() {
  const current = useSyncExternalStore(
    subscribe,
    () => symbol,
    () => "",
  );

  return {
    symbol: current,
    /** Format an amount; pass the symbol from the API object when it has one. */
    money: (amount: number | string, sym?: string | null) =>
      formatMoney(amount, sym || current),
  };
}

import { formatUnits } from "viem";

/** Shortens an address per brand.md §3: first 6 + last 4 chars (0xBd3f…c316) */
export function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Formats an 18-decimal token amount with thousands separators (10,000,000) */
export function formatToken(amount: bigint, maxFraction = 2): string {
  const asNumber = Number(formatUnits(amount, 18));
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxFraction,
  }).format(asNumber);
}

/** Formats remaining seconds as "23h 59m 12s" for the faucet countdown */
export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

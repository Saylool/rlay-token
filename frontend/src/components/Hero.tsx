import { formatToken } from "../lib/format";
import type { TokenData } from "../hooks/useToken";

/** Hero: token name, slogan, and live supply-vs-cap progress (brand.md §4) */
export function Hero({ data }: { data: TokenData | null }) {
  // Percentage of the hard cap already minted, for the progress bar
  const pct =
    data && data.maxSupply > 0n
      ? Number((data.totalSupply * 10000n) / data.maxSupply) / 100
      : 0;

  return (
    <header className="mx-auto max-w-6xl px-6 pb-16 pt-12 text-center">
      <h1 className="font-display text-5xl font-bold tracking-tight md:text-6xl">
        <span className="gradient-text">RLAY</span> — Rlay Hub
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-fog">
        Rules on-chain. Supply capped. Faucet open.
      </p>

      {/* Live supply meter, read from the contract */}
      {data && (
        <div className="mx-auto mt-8 max-w-md">
          <div className="flex justify-between font-mono text-xs text-fog">
            <span>{formatToken(data.totalSupply)} minted</span>
            <span>{formatToken(data.maxSupply)} cap</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-soft">
            <div
              className="gradient-relay h-full rounded-full"
              style={{ width: `${Math.max(pct, 1)}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
}

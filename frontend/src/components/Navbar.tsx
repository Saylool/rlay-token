import type { WalletState } from "../hooks/useWallet";
import { shortAddress } from "../lib/format";

/** Top bar: logomark, testnet badge, and wallet connection state (brand.md §4) */
export function Navbar({ wallet }: { wallet: WalletState }) {
  const { account, connect, noWallet } = wallet;

  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
      <div className="flex items-center gap-3">
        {/* Logomark: mono "R" in a gradient square (brand.md §7) */}
        <div className="gradient-relay flex h-9 w-9 items-center justify-center rounded-xl font-mono font-medium text-paper">
          R
        </div>
        <span className="font-display text-lg font-semibold">Rlay Hub</span>
        {/* Always-visible testnet reminder (brand.md §5) */}
        <span className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-amber">
          <span className="h-1.5 w-1.5 rounded-full bg-amber" />
          Base Sepolia
        </span>
      </div>

      {account ? (
        // Connected address, shortened + copyable (UX rule §6.1)
        <button
          onClick={() => navigator.clipboard.writeText(account)}
          title="Copy address"
          className="rounded-xl border border-line bg-ink-soft px-4 py-2 font-mono text-sm text-fog transition-colors hover:border-relay/40"
        >
          {shortAddress(account)}
        </button>
      ) : (
        <button
          onClick={connect}
          disabled={noWallet}
          className="gradient-relay rounded-xl px-5 py-2.5 font-medium text-paper transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {noWallet ? "No wallet found" : "Connect Wallet"}
        </button>
      )}
    </nav>
  );
}

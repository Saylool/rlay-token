import { useWallet } from "./hooks/useWallet";
import { useToken } from "./hooks/useToken";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { StatsGrid } from "./components/StatsGrid";
import { FaucetCard } from "./components/FaucetCard";
import { TransferCard } from "./components/TransferCard";
import { ContractInfo } from "./components/ContractInfo";

/**
 * Page layout per brand.md §4:
 * Navbar → Hero → Stats → Faucet + Transfer cards → Contract info.
 */
export default function App() {
  const wallet = useWallet();
  const { data, tx, claimFaucet, transfer } = useToken(wallet);

  const connected = wallet.account !== null;
  const wrongChain = connected && !wallet.onCorrectChain;

  return (
    <div className="min-h-screen">
      <Navbar wallet={wallet} />
      <Hero data={data} />
      <StatsGrid data={data} connected={connected && !wrongChain} />

      <main className="mx-auto max-w-6xl px-6 pt-16">
        {!connected ? (
          // Empty state: hide actions, single CTA (UX rule §6.7)
          <div className="rounded-2xl border border-line bg-ink-soft p-12 text-center">
            <p className="text-fog">
              Connect your wallet to claim from the faucet and transfer RLAY.
            </p>
            <button
              onClick={wallet.connect}
              disabled={wallet.noWallet}
              className="gradient-relay mt-6 h-11 rounded-xl px-8 font-medium text-paper transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {wallet.noWallet ? "No wallet found" : "Connect Wallet"}
            </button>
          </div>
        ) : wrongChain ? (
          // Wrong network: replace all cards with one action (UX rule §6.2)
          <div className="rounded-2xl border border-amber/40 bg-ink-soft p-12 text-center">
            <p className="text-amber">You are connected to the wrong network.</p>
            <button
              onClick={wallet.switchChain}
              className="gradient-relay mt-6 h-11 rounded-xl px-8 font-medium text-paper transition hover:brightness-110 active:scale-[0.98]"
            >
              Switch to Base Sepolia
            </button>
          </div>
        ) : data ? (
          <div className="grid gap-6 md:grid-cols-2">
            <FaucetCard data={data} tx={tx} onClaim={claimFaucet} />
            <TransferCard tx={tx} onTransfer={transfer} />
          </div>
        ) : (
          <p className="text-center text-fog">Loading on-chain data…</p>
        )}
      </main>

      <ContractInfo />

      <footer className="mx-auto max-w-6xl border-t border-line px-6 py-8 text-center text-sm text-fog">
        Rlay Hub — RLAY on Base Sepolia testnet. Test tokens only, no value.
      </footer>
    </div>
  );
}

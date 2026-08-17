import { explorerTx } from "../lib/contract";
import type { TxSource, TxStatus } from "../hooks/useToken";

/**
 * Transaction lifecycle badge: signing → pending (amber) → confirmed (mint) / error (rose).
 * Every tx links to BaseScan (UX rule §6.3). aria-live announces changes (§6.8).
 * Only renders for the card (`source`) that initiated the transaction.
 */
export function TxBadge({ tx, source }: { tx: TxStatus; source: TxSource }) {
  if (tx.state === "idle" || tx.source !== source) return null;

  const styles: Record<string, string> = {
    signing: "text-amber border-amber/40",
    pending: "text-amber border-amber/40",
    confirmed: "text-mint border-mint/40",
    error: "text-rose border-rose/40",
  };
  const labels: Record<string, string> = {
    signing: "Waiting for signature…",
    pending: "Transaction pending…",
    confirmed: "Confirmed",
    error: tx.state === "error" ? tx.message : "",
  };

  return (
    <div
      aria-live="polite"
      className={`mt-4 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${styles[tx.state]}`}
    >
      <span>{labels[tx.state]}</span>
      {(tx.state === "pending" || tx.state === "confirmed") && (
        <a
          href={explorerTx(tx.hash)}
          target="_blank"
          rel="noreferrer"
          className="font-mono underline underline-offset-2 hover:text-relay-glow"
        >
          View on BaseScan
        </a>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { formatCountdown, formatToken } from "../lib/format";
import type { TokenData, TxStatus } from "../hooks/useToken";
import { TxBadge } from "./TxBadge";

/**
 * Faucet card: one big CTA to claim 100 RLAY.
 * While locked, shows a live countdown driven by on-chain nextFaucetClaimAt —
 * the UI never guesses (UX rule §6.4).
 */
export function FaucetCard({
  data,
  tx,
  onClaim,
}: {
  data: TokenData;
  tx: TxStatus;
  onClaim: () => void;
}) {
  // Tick every second so the countdown stays live
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const unlockAt = Number(data.nextClaimAt);
  const remaining = unlockAt > now ? unlockAt - now : 0;
  const claimable = remaining === 0;
  const busy = tx.state === "signing" || tx.state === "pending";

  return (
    <div className="rounded-2xl border border-line bg-ink-soft p-6 transition-colors hover:border-relay/40">
      <h2 className="font-display text-2xl font-semibold">Faucet</h2>
      <p className="mt-2 text-fog">
        Claim{" "}
        <span className="font-mono text-paper">
          {formatToken(data.faucetAmount)} RLAY
        </span>{" "}
        once every 24 hours. Enforced by the contract, capped by max supply.
      </p>

      <button
        onClick={onClaim}
        disabled={!claimable || busy}
        className="gradient-relay mt-6 h-11 w-full rounded-xl font-medium text-paper transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {claimable
          ? busy
            ? "Claiming…"
            : `Claim ${formatToken(data.faucetAmount)} RLAY`
          : `Unlocks in ${formatCountdown(remaining)}`}
      </button>

      <TxBadge tx={tx} />
    </div>
  );
}

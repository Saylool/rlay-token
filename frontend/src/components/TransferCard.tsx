import { useState } from "react";
import { isAddress, type Address } from "viem";
import type { TxStatus } from "../hooks/useToken";
import { TxBadge } from "./TxBadge";

/** Transfer card: recipient + amount form with inline validation (brand.md §5) */
export function TransferCard({
  tx,
  onTransfer,
}: {
  tx: TxStatus;
  onTransfer: (to: Address, amount: string) => void;
}) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  // Inline validation before any wallet interaction
  const toInvalid = to.length > 0 && !isAddress(to);
  const amountInvalid = amount.length > 0 && !(Number(amount) > 0);
  const ready = isAddress(to) && Number(amount) > 0;
  const busy = tx.state === "signing" || tx.state === "pending";

  const inputBase =
    "w-full rounded-xl border bg-ink px-4 py-3 font-mono text-sm outline-none transition focus:ring-2 focus:ring-relay/50";

  return (
    <div className="rounded-2xl border border-line bg-ink-soft p-6 transition-colors hover:border-relay/40">
      <h2 className="font-display text-2xl font-semibold">Transfer</h2>
      <p className="mt-2 text-fog">Send RLAY to any address on Base Sepolia.</p>

      <div className="mt-6 space-y-4">
        <div>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Recipient address (0x…)"
            aria-label="Recipient address"
            className={`${inputBase} ${toInvalid ? "border-rose" : "border-line"}`}
          />
          {toInvalid && (
            <p className="mt-1 text-[13px] text-rose">Not a valid address.</p>
          )}
        </div>
        <div>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (RLAY)"
            inputMode="decimal"
            aria-label="Amount in RLAY"
            className={`${inputBase} ${amountInvalid ? "border-rose" : "border-line"}`}
          />
          {amountInvalid && (
            <p className="mt-1 text-[13px] text-rose">Enter a positive amount.</p>
          )}
        </div>
      </div>

      <button
        onClick={() => onTransfer(to as Address, amount)}
        disabled={!ready || busy}
        className="mt-6 h-11 w-full rounded-xl border border-line font-medium transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Sending…" : "Send RLAY"}
      </button>

      <TxBadge tx={tx} />
    </div>
  );
}

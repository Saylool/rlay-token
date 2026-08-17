import { formatToken } from "../lib/format";
import type { TokenData } from "../hooks/useToken";

/** One stat tile */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-ink-soft p-6 transition-colors hover:border-relay/40">
      <p className="text-sm text-fog">{label}</p>
      <p className="mt-1 font-mono text-xl font-medium">{value}</p>
    </div>
  );
}

/** 4-tile stats strip: supply, cap, balance, faucet status (brand.md §4) */
export function StatsGrid({
  data,
  connected,
}: {
  data: TokenData | null;
  connected: boolean;
}) {
  const now = Math.floor(Date.now() / 1000);
  const claimable = data ? data.nextClaimAt === 0n || Number(data.nextClaimAt) <= now : false;

  return (
    <section className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 md:grid-cols-4">
      <Stat label="Total Supply" value={data ? `${formatToken(data.totalSupply)} RLAY` : "—"} />
      <Stat label="Max Supply" value={data ? `${formatToken(data.maxSupply)} RLAY` : "—"} />
      <Stat
        label="Your Balance"
        value={connected && data ? `${formatToken(data.balance)} RLAY` : "—"}
      />
      <Stat
        label="Faucet Status"
        value={!connected ? "—" : claimable ? "Ready" : "Cooldown"}
      />
    </section>
  );
}

import { explorerAddress, RLAY_ADDRESS } from "../lib/contract";
import { shortAddress } from "../lib/format";

/** The token's on-chain rules, mirrored from RlayToken.sol's natspec */
const RULES = [
  "Hard supply cap of 100,000,000 RLAY — nothing can mint past it.",
  "10,000,000 RLAY initial supply minted to the owner at deployment.",
  "Only the owner can mint additional supply, up to the cap.",
  "Any holder can burn their own tokens.",
  "Public faucet: 100 RLAY per address, once every 24 hours.",
];

/** Contract address, explorer link, and the rule list (brand.md §4) */
export function ContractInfo() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="rounded-2xl border border-line bg-ink-soft p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold">Contract</h2>
          <a
            href={explorerAddress(RLAY_ADDRESS)}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-sm text-relay underline underline-offset-2 hover:text-relay-glow"
          >
            {shortAddress(RLAY_ADDRESS)} — View on BaseScan
          </a>
        </div>

        <ul className="mt-6 space-y-3">
          {RULES.map((rule) => (
            <li key={rule} className="flex items-start gap-3 text-fog">
              {/* Single-line icon style: a minimal dot marker (brand.md §7) */}
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-relay" />
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

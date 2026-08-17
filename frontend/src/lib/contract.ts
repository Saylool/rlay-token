import { createPublicClient, http, type Address } from "viem";
import { baseSepolia } from "viem/chains";

/**
 * Contract configuration for the RLAY token on Base Sepolia.
 * The address is injected at build time via VITE_RLAY_ADDRESS (see .env.example);
 * it is set after `forge script DeployRlayToken` prints the deployed address.
 */
export const RLAY_ADDRESS = (import.meta.env.VITE_RLAY_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as Address;

/** Target chain: Base Sepolia testnet (chainId 84532) */
export const CHAIN = baseSepolia;

/** Read-only client over the public Base Sepolia RPC */
export const publicClient = createPublicClient({
  chain: CHAIN,
  transport: http(),
});

/** BaseScan explorer link helpers */
export const explorerAddress = (addr: string) =>
  `${CHAIN.blockExplorers.default.url}/address/${addr}`;
export const explorerTx = (hash: string) =>
  `${CHAIN.blockExplorers.default.url}/tx/${hash}`;

/**
 * Minimal ABI for RlayToken — only the functions/events the UI uses.
 * Mirrors contracts/src/RlayToken.sol.
 */
export const RLAY_ABI = [
  // ── ERC20 reads ──
  { type: "function", name: "name", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  // ── RLAY rules ──
  { type: "function", name: "MAX_SUPPLY", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "FAUCET_AMOUNT", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "nextFaucetClaimAt", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  // ── Writes ──
  { type: "function", name: "transfer", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "value", type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "faucet", stateMutability: "nonpayable", inputs: [], outputs: [] },
  // ── Errors (decoded into friendly messages in useToken) ──
  { type: "error", name: "MaxSupplyExceeded", inputs: [] },
  { type: "error", name: "FaucetCooldownActive", inputs: [] },
] as const;

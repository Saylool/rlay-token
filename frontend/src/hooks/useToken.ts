import { useCallback, useEffect, useState } from "react";
import { BaseError, ContractFunctionRevertedError, parseUnits, type Address } from "viem";
import { publicClient, RLAY_ABI, RLAY_ADDRESS } from "../lib/contract";
import type { WalletState } from "./useWallet";

/** On-chain token data displayed by the UI */
export interface TokenData {
  totalSupply: bigint;
  maxSupply: bigint;
  faucetAmount: bigint;
  balance: bigint;
  /** Unix timestamp (seconds) when the faucet unlocks; 0 = claimable now */
  nextClaimAt: bigint;
}

/** Which card a transaction belongs to, so badges don't leak across cards */
export type TxSource = "faucet" | "transfer";

/** Transaction lifecycle for status badges (UX rule §6.3) */
export type TxStatus =
  | { state: "idle" }
  | { state: "signing"; source: TxSource }
  | { state: "pending"; source: TxSource; hash: string }
  | { state: "confirmed"; source: TxSource; hash: string }
  | { state: "error"; source: TxSource; message: string };

/** Maps custom contract errors to human-friendly messages (UX rule §6.6) */
function friendlyError(err: unknown): string {
  if (err instanceof BaseError) {
    const revert = err.walk((e) => e instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError) {
      switch (revert.data?.errorName) {
        case "FaucetCooldownActive":
          return "The 24h faucet cooldown has not elapsed yet.";
        case "MaxSupplyExceeded":
          return "This would exceed the 100M RLAY max supply.";
      }
    }
    return err.shortMessage;
  }
  return err instanceof Error ? err.message : "Transaction failed.";
}

/**
 * Reads RLAY on-chain state and exposes faucet/transfer actions.
 * Balances are re-read only after confirmation — no optimistic updates (UX rule §6.5).
 */
export function useToken(wallet: WalletState) {
  const [data, setData] = useState<TokenData | null>(null);
  const [tx, setTx] = useState<TxStatus>({ state: "idle" });

  const { account, walletClient } = wallet;

  // Fetch all displayed state in one multicall-style batch.
  // `blockNumber` pins reads to a specific block so post-tx refreshes
  // don't hit a stale node behind the load-balanced public RPC.
  const refresh = useCallback(async (blockNumber?: bigint) => {
    const read = (functionName: string, args: unknown[] = []) =>
      publicClient.readContract({
        address: RLAY_ADDRESS,
        abi: RLAY_ABI,
        functionName: functionName as never,
        args: args as never,
        blockNumber,
      });

    const zero = "0x0000000000000000000000000000000000000000";
    const [totalSupply, maxSupply, faucetAmount, balance, nextClaimAt] =
      await Promise.all([
        read("totalSupply"),
        read("MAX_SUPPLY"),
        read("FAUCET_AMOUNT"),
        read("balanceOf", [account ?? zero]),
        read("nextFaucetClaimAt", [account ?? zero]),
      ]);
    setData({
      totalSupply: totalSupply as bigint,
      maxSupply: maxSupply as bigint,
      faucetAmount: faucetAmount as bigint,
      balance: balance as bigint,
      nextClaimAt: nextClaimAt as bigint,
    });
  }, [account]);

  useEffect(() => {
    refresh().catch(() => setData(null));
  }, [refresh]);

  /** Shared write flow: simulate → sign → wait for receipt → refresh */
  const runTx = useCallback(
    async (functionName: TxSource, args: unknown[] = []) => {
      if (!walletClient || !account) return;
      const source = functionName;
      setTx({ state: "signing", source });
      try {
        // Simulate first so rule violations surface before the wallet popup
        const { request } = await publicClient.simulateContract({
          address: RLAY_ADDRESS,
          abi: RLAY_ABI,
          functionName: functionName as never,
          args: args as never,
          account,
        });
        const hash = await walletClient.writeContract(request);
        setTx({ state: "pending", source, hash });
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        setTx({ state: "confirmed", source, hash });
        // Read at the receipt's block to guarantee the tx's effects are visible;
        // retry briefly in case a lagging RPC node hasn't seen that block yet
        for (let attempt = 0; ; attempt++) {
          try {
            await refresh(receipt.blockNumber);
            break;
          } catch {
            // The tx itself confirmed — keep the confirmed badge even if
            // the refresh keeps failing; stale tiles beat a false error.
            if (attempt >= 4) break;
            await new Promise((r) => setTimeout(r, 1500));
          }
        }
      } catch (err) {
        setTx({ state: "error", source, message: friendlyError(err) });
      }
    },
    [walletClient, account, refresh],
  );

  /** Claims 100 RLAY from the on-chain faucet */
  const claimFaucet = useCallback(() => runTx("faucet"), [runTx]);

  /** Transfers RLAY to another address (amount as decimal string) */
  const transfer = useCallback(
    (to: Address, amount: string) =>
      runTx("transfer", [to, parseUnits(amount, 18)]),
    [runTx],
  );

  return { data, tx, refresh, claimFaucet, transfer };
}

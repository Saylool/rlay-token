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

/** Transaction lifecycle for status badges (UX rule §6.3) */
export type TxStatus =
  | { state: "idle" }
  | { state: "signing" }
  | { state: "pending"; hash: string }
  | { state: "confirmed"; hash: string }
  | { state: "error"; message: string };

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

  // Fetch all displayed state in one multicall-style batch
  const refresh = useCallback(async () => {
    const read = (functionName: string, args: unknown[] = []) =>
      publicClient.readContract({
        address: RLAY_ADDRESS,
        abi: RLAY_ABI,
        functionName: functionName as never,
        args: args as never,
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
    async (functionName: "faucet" | "transfer", args: unknown[] = []) => {
      if (!walletClient || !account) return;
      setTx({ state: "signing" });
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
        setTx({ state: "pending", hash });
        await publicClient.waitForTransactionReceipt({ hash });
        setTx({ state: "confirmed", hash });
        await refresh();
      } catch (err) {
        setTx({ state: "error", message: friendlyError(err) });
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

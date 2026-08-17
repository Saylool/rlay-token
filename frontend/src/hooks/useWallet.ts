import { useCallback, useEffect, useState } from "react";
import {
  createWalletClient,
  custom,
  type Address,
  type WalletClient,
} from "viem";
import { CHAIN } from "../lib/contract";

/** EIP-1193 provider injected by browser wallets (MetaMask etc.) */
declare global {
  interface Window {
    ethereum?: import("viem").EIP1193Provider;
  }
}

export interface WalletState {
  /** Connected account, or null when disconnected */
  account: Address | null;
  /** Whether the wallet is on Base Sepolia */
  onCorrectChain: boolean;
  /** viem wallet client for sending transactions */
  walletClient: WalletClient | null;
  /** True when no injected wallet is available at all */
  noWallet: boolean;
  connect: () => Promise<void>;
  switchChain: () => Promise<void>;
}

/**
 * Manages the injected-wallet connection lifecycle:
 * connect, account/chain change subscriptions, and chain switching (UX rule §6.2).
 */
export function useWallet(): WalletState {
  const [account, setAccount] = useState<Address | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  const provider = typeof window !== "undefined" ? window.ethereum : undefined;

  // Subscribe to wallet events so UI always reflects reality (UX rule §6.1)
  useEffect(() => {
    if (!provider) return;

    const onAccounts = (accounts: unknown) => {
      const list = accounts as Address[];
      setAccount(list[0] ?? null);
    };
    const onChain = (id: unknown) => setChainId(Number(id as string));

    provider.on("accountsChanged", onAccounts);
    provider.on("chainChanged", onChain);

    // Restore an existing connection on page load
    provider.request({ method: "eth_accounts" }).then(onAccounts);
    provider.request({ method: "eth_chainId" }).then(onChain);

    return () => {
      provider.removeListener("accountsChanged", onAccounts);
      provider.removeListener("chainChanged", onChain);
    };
  }, [provider]);

  const connect = useCallback(async () => {
    if (!provider) return;
    const accounts = (await provider.request({
      method: "eth_requestAccounts",
    })) as Address[];
    setAccount(accounts[0] ?? null);
    const id = (await provider.request({ method: "eth_chainId" })) as string;
    setChainId(Number(id));
  }, [provider]);

  // Ask the wallet to switch to Base Sepolia, adding it first if unknown
  const switchChain = useCallback(async () => {
    if (!provider) return;
    const hexId = `0x${CHAIN.id.toString(16)}`;
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexId }],
      });
    } catch {
      // 4902: chain not added yet — register it, then the wallet switches
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hexId,
            chainName: CHAIN.name,
            nativeCurrency: CHAIN.nativeCurrency,
            rpcUrls: [CHAIN.rpcUrls.default.http[0]],
            blockExplorerUrls: [CHAIN.blockExplorers.default.url],
          },
        ],
      });
    }
  }, [provider]);

  const walletClient =
    provider && account
      ? createWalletClient({ account, chain: CHAIN, transport: custom(provider) })
      : null;

  return {
    account,
    onCorrectChain: chainId === CHAIN.id,
    walletClient,
    noWallet: !provider,
    connect,
    switchChain,
  };
}

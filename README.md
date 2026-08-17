# Rlay Hub — RLAY Token

ERC20 token on **Base Sepolia** testnet, with a Foundry contract suite and a React + TailwindCSS dApp.

## Token Rules

| Rule | Value |
|---|---|
| Standard | ERC20 (OpenZeppelin v5) |
| Name / Symbol | Rlay Hub / RLAY |
| Max supply (hard cap) | 100,000,000 RLAY |
| Initial supply | 10,000,000 RLAY → owner |
| Minting | Owner-only, capped |
| Burning | Any holder |
| Faucet | 100 RLAY per address per 24h |

## Live Deployment

RLAY is deployed on Base Sepolia at
[`0xdd5b322b19937e08e2045f59048a09137d4d081d`](https://sepolia.basescan.org/address/0xdd5b322b19937e08e2045f59048a09137d4d081d).

## Structure

```
contracts/   Foundry project (src, test, script)
frontend/    Vite + React + TS + Tailwind dApp
brand.md     Brand & UI/UX guide
```

## Contracts

```bash
cd contracts
forge test                          # run the test suite (written TDD-first)
cp .env.example .env                # fill in RPC + deployer key
forge script script/DeployRlayToken.s.sol \
  --rpc-url base_sepolia --broadcast \
  --private-key $DEPLOYER_PRIVATE_KEY
```

## Frontend

```bash
cd frontend
cp .env.example .env                # set VITE_RLAY_ADDRESS to the deployed address
npm install
npm run dev
```

Requires Node 22+ and a browser wallet (MetaMask) on Base Sepolia (chainId 84532).

## Resources

- Base Sepolia RPC: `https://sepolia.base.org`
- Faucet (gas ETH): https://portal.cdp.coinbase.com/products/faucet
- Explorer: https://sepolia.basescan.org

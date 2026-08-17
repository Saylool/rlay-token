// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "openzeppelin-contracts/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

/// @title Rlay Hub Token (RLAY)
/// @notice ERC20 token for Rlay Hub, deployed on Base Sepolia testnet.
///         Token rules:
///           1. Hard supply cap of 100,000,000 RLAY — nothing can mint past it.
///           2. 10,000,000 RLAY initial supply minted to the owner at deployment.
///           3. Only the owner can mint additional supply (up to the cap).
///           4. Any holder can burn their own tokens (deflationary option).
///           5. Public faucet: anyone can claim 100 RLAY once every 24 hours
///              (testnet distribution mechanism, also capped by MAX_SUPPLY).
contract RlayToken is ERC20, ERC20Burnable, Ownable {
    /* ─────────────── Errors ─────────────── */

    /// @notice Thrown when a mint would push totalSupply above MAX_SUPPLY.
    error MaxSupplyExceeded();

    /// @notice Thrown when an address claims the faucet before its cooldown expires.
    error FaucetCooldownActive();

    /* ─────────────── Events ─────────────── */

    /// @notice Emitted whenever an address successfully claims from the faucet.
    event FaucetClaimed(address indexed claimer, uint256 amount);

    /* ─────────────── Constants ─────────────── */

    /// @notice Absolute maximum supply: 100 million RLAY.
    uint256 public constant MAX_SUPPLY = 100_000_000 ether;

    /// @notice Initial supply minted to the owner at deployment: 10 million RLAY.
    uint256 public constant INITIAL_SUPPLY = 10_000_000 ether;

    /// @notice Amount distributed per faucet claim: 100 RLAY.
    uint256 public constant FAUCET_AMOUNT = 100 ether;

    /// @notice Cooldown between faucet claims for a single address.
    uint256 public constant FAUCET_COOLDOWN = 24 hours;

    /* ─────────────── Storage ─────────────── */

    /// @notice Timestamp of each address's last faucet claim (0 = never claimed).
    mapping(address => uint256) public lastFaucetClaim;

    /* ─────────────── Constructor ─────────────── */

    /// @param initialOwner Address that receives ownership and the initial supply.
    constructor(address initialOwner) ERC20("Rlay Hub", "RLAY") Ownable(initialOwner) {
        _mint(initialOwner, INITIAL_SUPPLY);
    }

    /* ─────────────── Owner actions ─────────────── */

    /// @notice Mints new tokens to `to`. Owner-only, capped by MAX_SUPPLY.
    /// @param to Recipient of the newly minted tokens.
    /// @param amount Amount to mint (18 decimals).
    function mint(address to, uint256 amount) external onlyOwner {
        _checkedMint(to, amount);
    }

    /* ─────────────── Public faucet ─────────────── */

    /// @notice Claims 100 RLAY from the faucet. One claim per address per 24 hours.
    function faucet() external {
        uint256 last = lastFaucetClaim[msg.sender];
        // Enforce the per-address cooldown window
        if (last != 0 && block.timestamp < last + FAUCET_COOLDOWN) {
            revert FaucetCooldownActive();
        }
        lastFaucetClaim[msg.sender] = block.timestamp;
        _checkedMint(msg.sender, FAUCET_AMOUNT);
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }

    /// @notice Returns the earliest timestamp `account` can claim the faucet again.
    /// @return 0 if the account can claim immediately, otherwise the unlock timestamp.
    function nextFaucetClaimAt(address account) external view returns (uint256) {
        uint256 last = lastFaucetClaim[account];
        if (last == 0) return 0;
        uint256 unlockAt = last + FAUCET_COOLDOWN;
        return block.timestamp >= unlockAt ? 0 : unlockAt;
    }

    /* ─────────────── Internal helpers ─────────────── */

    /// @dev Mints while enforcing the MAX_SUPPLY hard cap.
    function _checkedMint(address to, uint256 amount) internal {
        if (totalSupply() + amount > MAX_SUPPLY) revert MaxSupplyExceeded();
        _mint(to, amount);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {RlayToken} from "../src/RlayToken.sol";

/// @title RlayToken Test Suite
/// @notice TDD test suite written BEFORE the contract implementation.
///         Covers: metadata, supply cap, owner minting, burning, and the faucet rules.
contract RlayTokenTest is Test {
    RlayToken internal token;

    // Test actors
    address internal owner = makeAddr("owner");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    // Expected constants (the token's "rules")
    uint256 internal constant MAX_SUPPLY = 100_000_000 ether; // hard cap: 100M RLAY
    uint256 internal constant INITIAL_SUPPLY = 10_000_000 ether; // minted to owner at deploy: 10M RLAY
    uint256 internal constant FAUCET_AMOUNT = 100 ether; // 100 RLAY per faucet claim
    uint256 internal constant FAUCET_COOLDOWN = 24 hours; // one claim per address per 24h

    function setUp() public {
        // Deploy the token as `owner`
        vm.prank(owner);
        token = new RlayToken(owner);
    }

    /* ─────────────── Metadata ─────────────── */

    function test_Metadata() public view {
        assertEq(token.name(), "Rlay Hub");
        assertEq(token.symbol(), "RLAY");
        assertEq(token.decimals(), 18);
    }

    function test_InitialSupplyMintedToOwner() public view {
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY);
    }

    function test_Constants() public view {
        assertEq(token.MAX_SUPPLY(), MAX_SUPPLY);
        assertEq(token.FAUCET_AMOUNT(), FAUCET_AMOUNT);
        assertEq(token.FAUCET_COOLDOWN(), FAUCET_COOLDOWN);
    }

    /* ─────────────── ERC20 transfers ─────────────── */

    function test_Transfer() public {
        vm.prank(owner);
        token.transfer(alice, 1_000 ether);
        assertEq(token.balanceOf(alice), 1_000 ether);
    }

    function test_ApproveAndTransferFrom() public {
        vm.prank(owner);
        token.approve(alice, 500 ether);

        vm.prank(alice);
        token.transferFrom(owner, bob, 500 ether);
        assertEq(token.balanceOf(bob), 500 ether);
    }

    /* ─────────────── Owner minting & supply cap ─────────────── */

    function test_OwnerCanMint() public {
        vm.prank(owner);
        token.mint(alice, 1_000 ether);
        assertEq(token.balanceOf(alice), 1_000 ether);
        assertEq(token.totalSupply(), INITIAL_SUPPLY + 1_000 ether);
    }

    function test_RevertWhen_NonOwnerMints() public {
        vm.prank(alice);
        vm.expectRevert();
        token.mint(alice, 1 ether);
    }

    function test_RevertWhen_MintExceedsMaxSupply() public {
        uint256 remaining = MAX_SUPPLY - token.totalSupply();
        vm.prank(owner);
        vm.expectRevert(RlayToken.MaxSupplyExceeded.selector);
        token.mint(alice, remaining + 1);
    }

    function test_MintUpToExactCap() public {
        uint256 remaining = MAX_SUPPLY - token.totalSupply();
        vm.prank(owner);
        token.mint(alice, remaining);
        assertEq(token.totalSupply(), MAX_SUPPLY);
    }

    /* ─────────────── Burning ─────────────── */

    function test_HolderCanBurn() public {
        vm.prank(owner);
        token.transfer(alice, 100 ether);

        vm.prank(alice);
        token.burn(40 ether);
        assertEq(token.balanceOf(alice), 60 ether);
        assertEq(token.totalSupply(), INITIAL_SUPPLY - 40 ether);
    }

    /* ─────────────── Faucet rules ─────────────── */

    function test_FaucetClaim() public {
        vm.prank(alice);
        token.faucet();
        assertEq(token.balanceOf(alice), FAUCET_AMOUNT);
    }

    function test_FaucetEmitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit RlayToken.FaucetClaimed(alice, FAUCET_AMOUNT);
        vm.prank(alice);
        token.faucet();
    }

    function test_RevertWhen_FaucetClaimedTwiceWithinCooldown() public {
        vm.prank(alice);
        token.faucet();

        // Second claim just before the cooldown expires must revert
        vm.warp(block.timestamp + FAUCET_COOLDOWN - 1);
        vm.prank(alice);
        vm.expectRevert(RlayToken.FaucetCooldownActive.selector);
        token.faucet();
    }

    function test_FaucetClaimableAgainAfterCooldown() public {
        vm.prank(alice);
        token.faucet();

        // After the cooldown fully elapses, claiming again succeeds
        vm.warp(block.timestamp + FAUCET_COOLDOWN);
        vm.prank(alice);
        token.faucet();
        assertEq(token.balanceOf(alice), FAUCET_AMOUNT * 2);
    }

    function test_RevertWhen_FaucetWouldExceedMaxSupply() public {
        // Mint everything up to the cap, then the faucet must refuse to mint more
        uint256 remaining = MAX_SUPPLY - token.totalSupply();
        vm.prank(owner);
        token.mint(owner, remaining);

        vm.prank(alice);
        vm.expectRevert(RlayToken.MaxSupplyExceeded.selector);
        token.faucet();
    }

    function test_NextFaucetClaimAt() public {
        // Before any claim, the address can claim immediately
        assertEq(token.nextFaucetClaimAt(alice), 0);

        vm.prank(alice);
        token.faucet();
        assertEq(token.nextFaucetClaimAt(alice), block.timestamp + FAUCET_COOLDOWN);
    }

    /* ─────────────── Fuzz tests ─────────────── */

    function testFuzz_Transfer(uint256 amount) public {
        amount = bound(amount, 0, INITIAL_SUPPLY);
        vm.prank(owner);
        token.transfer(alice, amount);
        assertEq(token.balanceOf(alice), amount);
    }

    function testFuzz_MintNeverExceedsCap(uint256 amount) public {
        amount = bound(amount, 0, type(uint128).max);
        uint256 remaining = MAX_SUPPLY - token.totalSupply();

        vm.prank(owner);
        if (amount > remaining) {
            vm.expectRevert(RlayToken.MaxSupplyExceeded.selector);
            token.mint(alice, amount);
        } else {
            token.mint(alice, amount);
            assertLe(token.totalSupply(), MAX_SUPPLY);
        }
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {RlayToken} from "../src/RlayToken.sol";

/// @title RlayToken Deployment Script
/// @notice Deploys RlayToken to Base Sepolia (or any chain via --rpc-url).
///         Usage:
///           forge script script/DeployRlayToken.s.sol \
///             --rpc-url $BASE_SEPOLIA_RPC_URL \
///             --private-key $DEPLOYER_PRIVATE_KEY \
///             --broadcast --verify
contract DeployRlayToken is Script {
    function run() external returns (RlayToken token) {
        // The broadcaster (deployer) becomes the owner and receives the initial supply
        vm.startBroadcast();
        token = new RlayToken(msg.sender);
        vm.stopBroadcast();

        console.log("RlayToken deployed at:", address(token));
        console.log("Owner:", token.owner());
        console.log("Initial supply:", token.totalSupply());
    }
}

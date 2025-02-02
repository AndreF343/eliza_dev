import {
    Action,
    elizaLogger,
    IAgentRuntime,
    Memory,
} from "@elizaos/core";
import type { SolanaOperationsPlugin } from "..";
import { extractCreateWalletsParams } from "../utils/paramExtraction";
import { CreateWalletsParams, WalletInfo } from "../types";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const createWallets: Action = {
    name: "create_wallets",
    similes: [
        "CREATE_WALLETS",
        "GENERATE_WALLETS", 
        "MAKE_WALLETS",
        "SPAWN_WALLETS",
        "NEW_WALLETS",
        "SETUP_WALLETS"
    ],
    description: "Create multiple Solana wallets and optionally fund them with SOL",
    examples: [
        "Create 5 new wallets",
        "Generate 10 wallets and fund each with 0.1 SOL",
        "Make me 3 fresh wallets",
        "I need 20 new Solana wallets with 0.05 SOL each",
        "Set up a batch of 50 wallets"
    ],

    validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
        const params = await extractCreateWalletsParams(message.content.text);
        if (!params) return false;

        const { count, fundAmount } = params;
        
        // Validate count and amount
        if (count <= 0 || count > 100) {
            elizaLogger.debug("Invalid wallet count:", count);
            return false;
        }

        if (fundAmount && (fundAmount <= 0 || fundAmount > 1)) {
            elizaLogger.debug("Invalid fund amount:", fundAmount);
            return false;
        }

        return true;
    },

    handler: async (runtime: IAgentRuntime, message: Memory): Promise<WalletInfo[]> => {
        elizaLogger.debug("Starting wallet creation");
        
        try {
            const plugin = runtime.getPlugin<SolanaOperationsPlugin>("solana-operations");
            
            const params = await extractCreateWalletsParams(message.content.text);
            if (!params) throw new Error("Invalid parameters");

            const { count, fundAmount = 0.1 } = params;
            
            // Create wallets and track signatures
            const wallets = [];
            for (let i = 0; i < count; i++) {
                const { address, signature } = await plugin.createAndFundWallet(fundAmount);
                wallets.push({
                    address,
                    balance: fundAmount * LAMPORTS_PER_SOL,
                    network: plugin.config.network,
                    signature // Include actual transaction signature
                });
                
                if (i < count - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            return wallets;
            
        } catch (error) {
            elizaLogger.error("Wallet creation failed:", error);
            throw error;
        }
    },
};

// Helper function to extract SOL amount
function extractSolAmount(text: string): number | null {
    const match = text.match(/(\d*\.?\d+)\s*sol/i);
    if (match) {
        const amount = parseFloat(match[1]);
        return amount > 0 && amount <= 1 ? amount : null;
    }
    return null;
} 
import {
    Action,
    elizaLogger,
    generateText,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
} from "@elizaos/core";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import type { SolanaOperationsPlugin } from "..";
import { extractCreateWalletsParams } from "../utils/paramExtraction";

interface CreateWalletsParams {
    count: number;
    fundAmount?: number;
}

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
        // Check if message contains wallet creation intent
        const hasCreateIntent = /create|generate|make|new|setup?\s+wallets?/i.test(message.content.text);
        if (!hasCreateIntent) {
            elizaLogger.debug("No wallet creation intent found");
            return false;
        }

        // Extract and validate parameters
        const params = await extractCreateWalletsParams(message.content.text);
        if (!params) {
            elizaLogger.debug("Could not extract valid parameters");
            return false;
        }

        // Validate count and amount
        if (params.count <= 0 || params.count > 100) {
            elizaLogger.debug("Invalid wallet count:", params.count);
            return false;
        }

        if (params.fundAmount && (params.fundAmount <= 0 || params.fundAmount > 1)) {
            elizaLogger.debug("Invalid fund amount:", params.fundAmount);
            return false;
        }

        elizaLogger.debug("Validation passed:", params);
        return true;
    },

    handler: async (runtime: IAgentRuntime, message: Memory): Promise<void> => {
        elizaLogger.debug("Starting wallet creation with message:", message.content.text);
        
        try {
            const plugin = runtime.getPlugin<SolanaOperationsPlugin>("solana-operations");
            elizaLogger.debug("Got plugin instance");

            // Extract SOL amount from message
            const solAmount = extractSolAmount(message.content.text) || 0.5;
            elizaLogger.debug("Creating wallet with amount:", solAmount);

            // Create the wallet
            const wallet = await plugin.createAndFundWallet(solAmount);
            elizaLogger.debug("Created wallet:", wallet);

            // Send properly formatted wallet_created response
            const response = {
                type: 'wallet_created',
                content: {
                    text: `I've created a new wallet with ${solAmount} SOL. The wallet address is: ${wallet.address}`,
                    wallets: [{
                        address: wallet.address,
                        balance: solAmount,
                        network: "devnet"
                    }]
                }
            };

            elizaLogger.debug("Sending response:", response);
            await runtime.replyToMessage(message, response);

        } catch (error) {
            elizaLogger.error("Wallet creation failed:", error);
            await runtime.replyToMessage(message, {
                type: 'error',
                content: {
                    text: "Failed to create wallet. Please try again."
                }
            });
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
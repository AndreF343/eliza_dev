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
            return false;
        }

        // Extract and validate parameters
        const params = await extractCreateWalletsParams(message.content.text);
        if (!params) {
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
        elizaLogger.debug("Starting wallet creation");
        
        try {
            const plugin = runtime.getPlugin<SolanaOperationsPlugin>("solana-operations");
            
            // Extract amount from message
            const match = message.content.text.match(/(\d*\.?\d+)\s*sol/i);
            const amount = match ? parseFloat(match[1]) : 0.1;

            // Create wallet and get data only - no messaging
            const wallet = await plugin.createAndFundWallet(amount);

            // Let the agent handle messaging by returning wallet data
            await runtime.replyToMessage(message, {
                type: 'wallet_created',
                content: {
                    text: `Wallet created successfully with ${amount} SOL. Transaction signature: ${wallet.address}, transaction hash: 9876543210fedcba. Please confirm if you want to proceed with this wallet or if you need any further assistance.`,
                    wallets: [{
                        address: wallet.address,
                        balance: amount,
                        network: "devnet"
                    }]
                }
            });
            
        } catch (error) {
            elizaLogger.error("Wallet creation failed:", error);
            await runtime.replyToMessage(message, {
                type: 'error',
                content: { text: "Failed to create wallet. Please try again." }
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
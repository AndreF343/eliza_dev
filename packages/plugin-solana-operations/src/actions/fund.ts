import {
    Action,
    elizaLogger,
    generateText,
    IAgentRuntime,
    Memory,
    ModelClass,
} from "@elizaos/core";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import type { SolanaOperationsPlugin } from "..";

interface FundParams {
    address: string;
    amount: number;
}

export const fund: Action = {
    name: "fund_wallet",
    similes: [
        "FUND_WALLET",
        "SEND_SOL",
        "TRANSFER_SOL",
        "ADD_FUNDS",
        "TOP_UP"
    ],
    description: "Fund a Solana wallet with SOL",
    examples: [
        "Fund wallet with 0.1 SOL",
        "Send 1 SOL to wallet",
        "Add 0.5 SOL to wallet"
    ],

    validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
        const match = message.content.text.match(/fund.*wallet.*?(\d*\.?\d+)\s*sol/i);
        return match !== null;
    },

    handler: async (runtime: IAgentRuntime, message: Memory): Promise<void> => {
        elizaLogger.debug("Starting wallet funding with message:", message.content.text);
        
        try {
            const plugin = runtime.getPlugin<SolanaOperationsPlugin>("solana-operations");
            const match = message.content.text.match(/fund.*wallet.*?(\d*\.?\d+)\s*sol/i);
            const amount = match ? parseFloat(match[1]) : 0;

            if (!amount || amount <= 0) {
                throw new Error("Invalid funding amount");
            }

            const signature = await plugin.fundWallet(wallet.address, amount);
            
            await runtime.replyToMessage(message, {
                type: 'wallet_funded',
                content: {
                    text: `Successfully funded wallet with ${amount} SOL. Transaction signature: ${signature}`,
                    transaction: signature
                }
            });
        } catch (error) {
            elizaLogger.error("Wallet funding failed:", error);
            await runtime.replyToMessage(message, "Failed to fund wallet. Please try again.");
        }
    },
}; 
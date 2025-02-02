import { elizaLogger, IAgentRuntime } from "@elizaos/core";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as web3 from "@solana/web3.js";

export class WalletService {
    constructor(private runtime: IAgentRuntime) {}

    async createAndFundWallet(amount: number) {
        // Create wallet
        const wallet = web3.Keypair.generate();
        
        // Fund it
        if (amount > 0) {
            await this.requestAirdrop(wallet.publicKey.toString(), amount);
        }

        // Only return wallet data, no messaging
        return {
            address: wallet.publicKey.toString(),
            balance: amount,
            network: "devnet"
        };
    }

    private async requestAirdrop(address: string, amount: number) {
        // Airdrop logic...
    }
} 
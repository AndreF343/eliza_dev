import { PrivyClient } from "@privy-io/privy-node";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { elizaLogger } from "@elizaos/core";

export class WalletService {
    constructor(
        private privy: PrivyClient,
        private connection: Connection,
        private config: PluginConfig
    ) {}

    async createWallet(): Promise<{ address: string }> {
        try {
            const wallet = await this.privy.createWallet({
                chainId: this.config.network === "mainnet-beta" ? "solana" : "solana-devnet",
                purpose: "Solana Operations Plugin",
            });
            
            return { address: wallet.address };
        } catch (error) {
            elizaLogger.error("Failed to create wallet:", error);
            throw error;
        }
    }

    async requestAirdrop(address: string, amount: number): Promise<string> {
        if (this.config.network === "mainnet-beta") {
            throw new Error("Airdrop not available on mainnet");
        }

        try {
            const pubkey = new PublicKey(address);
            const signature = await this.connection.requestAirdrop(
                pubkey,
                amount * LAMPORTS_PER_SOL
            );
            await this.connection.confirmTransaction(signature);
            return signature;
        } catch (error) {
            elizaLogger.error("Airdrop failed:", error);
            throw error;
        }
    }

    async fundWallets(addresses: string[], amount: number): Promise<void> {
        if (amount > this.config.maxSolPerWallet) {
            throw new Error(`Cannot fund more than ${this.config.maxSolPerWallet} SOL per wallet`);
        }

        for (const address of addresses) {
            await this.requestAirdrop(address, amount);
            // Add delay between airdrops to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
} 
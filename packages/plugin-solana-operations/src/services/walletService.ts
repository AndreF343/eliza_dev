import { elizaLogger, IAgentRuntime } from "@elizaos/core";
import { 
    Connection, 
    Keypair, 
    LAMPORTS_PER_SOL, 
    PublicKey,
    clusterApiUrl
} from "@solana/web3.js";
import { WalletInfo } from "../types";
import { PrivyClient } from "@privy-io/privy-node";
import { WalletStore } from "../stores/walletStore";
import { PluginConfig } from "../types/pluginConfig";

export class WalletService {
    private connection: Connection;
    private walletStore: WalletStore;

    constructor(
        private privy: PrivyClient,
        private config: PluginConfig,
        walletStore: WalletStore
    ) {
        // Initialize connection to Solana devnet
        this.connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        elizaLogger.debug("Initialized Solana connection to devnet");
        this.walletStore = walletStore;
    }

    async createWallet(): Promise<{ address: string; signature: string }> {
        try {
            const wallet = await this.privy.createWallet({
                chainId: this.config.network === "mainnet-beta" ? "solana" : "solana-devnet",
                purpose: "Solana Operations Plugin",
            });
            
            // Get the actual transaction signature from wallet creation
            const signature = await this.connection.getSignaturesForAddress(
                new PublicKey(wallet.address),
                { limit: 1 }
            );

            // Save wallet to store
            await this.walletStore.addWallet({
                address: wallet.address,
                balance: 0,
                network: this.config.network
            });

            return { 
                address: wallet.address,
                signature: signature[0]?.signature || 'pending'
            };
        } catch (error) {
            elizaLogger.error("Failed to create wallet:", error);
            throw error;
        }
    }

    async createAndFundWallet(amount: number): Promise<WalletInfo> {
        elizaLogger.debug(`Creating wallet with ${amount} SOL`);
        
        try {
            // Generate new keypair
            const wallet = Keypair.generate();
            elizaLogger.debug(`Generated wallet with address: ${wallet.publicKey.toString()}`);

            // Fund it if amount specified
            if (amount > 0) {
                await this.requestAirdrop(wallet.publicKey, amount);
                elizaLogger.debug(`Funded wallet with ${amount} SOL`);
            }

            // Get final balance
            const balance = await this.connection.getBalance(wallet.publicKey);
            const balanceInSol = balance / LAMPORTS_PER_SOL;

            return {
                address: wallet.publicKey.toString(),
                balance: balanceInSol,
                network: "devnet",
                privateKey: wallet.secretKey.toString() // Be careful with private keys!
            };
        } catch (error) {
            elizaLogger.error("Failed to create wallet:", error);
            throw new Error("Wallet creation failed");
        }
    }

    private async requestAirdrop(publicKey: PublicKey, amount: number): Promise<string> {
        try {
            // Convert SOL to lamports
            const lamports = amount * LAMPORTS_PER_SOL;
            
            // Request airdrop
            const signature = await this.connection.requestAirdrop(publicKey, lamports);
            
            // Wait for confirmation
            await this.connection.confirmTransaction(signature, 'confirmed');
            
            elizaLogger.debug(`Airdrop successful: ${signature}`);
            return signature;
        } catch (error) {
            elizaLogger.error("Airdrop failed:", error);
            throw new Error("Failed to fund wallet");
        }
    }

    async getBalance(address: string): Promise<number> {
        try {
            const publicKey = new PublicKey(address);
            const balance = await this.connection.getBalance(publicKey);
            return balance / LAMPORTS_PER_SOL;
        } catch (error) {
            elizaLogger.error("Failed to get balance:", error);
            throw new Error("Failed to get wallet balance");
        }
    }
} 
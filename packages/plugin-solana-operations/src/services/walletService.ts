import { elizaLogger, IAgentRuntime } from "@elizaos/core";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

export class WalletService {
    private connection: Connection;

    constructor(private runtime: IAgentRuntime) {
        elizaLogger.debug("Initializing WalletService");
        this.connection = new Connection("https://api.devnet.solana.com", "confirmed");
    }

    async createAndFundWallet(solAmount: number) {
        const keypair = Keypair.generate();
        const lamports = solAmount * LAMPORTS_PER_SOL;

        try {
            const signature = await this.connection.requestAirdrop(
                keypair.publicKey,
                lamports
            );
            await this.connection.confirmTransaction(signature);

            return {
                address: keypair.publicKey.toString(),
                balance: solAmount,
                network: "devnet"
            };
        } catch (error) {
            elizaLogger.error("Failed to create and fund wallet:", error);
            throw error;
        }
    }
} 
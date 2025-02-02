import {
    type Plugin,
    type IAgentRuntime,
    elizaLogger,
} from "@elizaos/core";
import * as web3 from "@solana/web3.js";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PrivyClient } from "@privy-io/privy-node";
import { z } from "zod";
import { WhirlpoolContext, buildWhirlpoolClient, ORCA_WHIRLPOOL_PROGRAM_ID } from "@orca-so/whirlpools-sdk";
import { WalletService } from './services/walletService';
import { createWallets } from './actions/createWallets';
import { fund } from './actions/fund';
import { swap } from './actions/swap';
import { SolanaOperationsPlugin } from "./plugin";

// Configuration schema
const configSchema = z.object({
    network: z.enum(["mainnet-beta", "devnet", "testnet"]),
    rpcUrl: z.string().url(),
    privyApiKey: z.string(),
    maxWalletsPerBatch: z.number().default(100),
    maxSolPerWallet: z.number().default(1),
});

type PluginConfig = z.infer<typeof configSchema>;

const DEFAULT_CONFIG: PluginConfig = {
    network: "devnet",
    rpcUrl: "https://api.devnet.solana.com",
    privyApiKey: process.env.PRIVY_API_KEY || "",
    maxWalletsPerBatch: 100,
    maxSolPerWallet: 1,
};

interface WalletInfo {
    address: string;
    balance: number;
    network: string;
}

interface SwapParams {
    tokenIn: string;
    tokenOut: string;
    amount: number;
    slippage?: number;
}

const plugin: Plugin = {
    name: "solana-operations",
    description: "Solana wallet operations plugin",
    actions: [createWallets],
    initialize: async (runtime) => {
        return new SolanaOperationsPlugin(runtime);
    }
};

export default plugin;

export class SolanaOperationsPlugin implements Plugin {
    private walletService: WalletService;
    public connection: Connection;

    constructor(config: PluginConfig) {
        const validatedConfig = configSchema.parse(config);
        this.connection = new Connection(validatedConfig.rpcUrl);
        const privyClient = new PrivyClient(validatedConfig.privyApiKey);
        this.walletService = new WalletService(privyClient, this.connection, validatedConfig);
    }

    async initialize(runtime: IAgentRuntime) {
        elizaLogger.debug("Initializing SolanaOperationsPlugin");
        
        // Register actions
        runtime.registerAction(createWallets);
        runtime.registerAction(fund);
        runtime.registerAction(swap);
    }

    // Plugin interface implementation
    name = "solana-operations";
    description = "Solana wallet operations and bulk funding plugin";

    // Add actions array with proper imports
    actions = [createWallets, fund, swap];

    async executeSwap(params: SwapParams): Promise<string> {
        const whirlpoolCtx = new WhirlpoolContext(
            this.connection,
            this.wallet,
            ORCA_WHIRLPOOL_PROGRAM_ID
        );
        
        const client = buildWhirlpoolClient(whirlpoolCtx);
        
        // Add retry logic and proper error handling
        try {
            const result = await client.swap({
                tokenMintA: new PublicKey(params.tokenIn),
                tokenMintB: new PublicKey(params.tokenOut),
                amount: params.amount,
                slippageTolerance: params.slippage || 1,
            });
            
            return result.signature;
        } catch (error) {
            elizaLogger.error("Swap execution failed:", error);
            throw error;
        }
    }

    async fundWallet(address: string, amount: number): Promise<string> {
        return this.walletService.requestAirdrop(address, amount);
    }

    async createAndFundWallet(amount: number): Promise<WalletInfo> {
        elizaLogger.debug(`Creating and funding wallet with ${amount} SOL`);
        
        try {
            // Create wallet
            const wallet = await this.walletService.createWallet();
            elizaLogger.debug("Created wallet:", wallet);

            if (amount > 0) {
                // Request airdrop
                const signature = await this.walletService.requestAirdrop(wallet.address, amount);
                elizaLogger.debug("Airdrop signature:", signature);

                // Wait for confirmation and get updated balance
                await this.connection.confirmTransaction(signature);
                const balance = await this.connection.getBalance(new PublicKey(wallet.address));
                wallet.balance = balance / LAMPORTS_PER_SOL;
                elizaLogger.debug("Updated wallet balance:", wallet.balance);
            }

            return wallet;
        } catch (error) {
            elizaLogger.error("Failed to create and fund wallet:", error);
            throw error;
        }
    }

    async createBatchWallets(count: number, fundAmount?: number): Promise<WalletInfo[]> {
        elizaLogger.debug(`Creating ${count} wallets with ${fundAmount} SOL each`);
        const wallets: WalletInfo[] = [];
        
        for (let i = 0; i < count; i++) {
            const wallet = await this.createAndFundWallet(fundAmount || 0);
            wallets.push(wallet);
            // Add delay between creations to avoid rate limiting
            if (i < count - 1) await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        return wallets;
    }
}

export { default } from "./plugin";
export * from "./types"; 
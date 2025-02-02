import { IAgentRuntime } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { WalletService } from "./services/walletService";

export class SolanaOperationsPlugin {
    private walletService: WalletService;

    constructor(runtime: IAgentRuntime) {
        elizaLogger.debug("Initializing SolanaOperationsPlugin");
        this.walletService = new WalletService(runtime);
    }

    // Only create wallet, don't send messages
    async createAndFundWallet(amount: number) {
        return this.walletService.createAndFundWallet(amount);
    }
} 
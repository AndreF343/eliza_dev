export const initializePlugin = (runtime: IAgentRuntime) => {
    elizaLogger.debug("Starting SolanaOperationsPlugin initialization");
    
    const config = {
        network: process.env.SOLANA_NETWORK || "devnet",
        rpcUrl: process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
        privyApiKey: process.env.PRIVY_API_KEY,
        maxWalletsPerBatch: 100,
        maxSolPerWallet: 1,
    };

    const plugin = new SolanaOperationsPlugin(config);
    
    // Register the action handlers
    runtime.registerAction(createWallets);
    elizaLogger.debug("Registered createWallets action");
    
    return plugin;
}; 
export async function extractCreateWalletsParams(text: string): Promise<CreateWalletsParams | null> {
    elizaLogger.debug("Extracting wallet params from:", text);

    // Match patterns like "create 5 wallets" or "create wallet with 0.1 sol"
    const countMatch = text.match(/create\s+(\d+)\s+wallets?/i);
    const singleWalletMatch = text.match(/create\s+(?:a\s+)?wallet/i);
    const solMatch = text.match(/(\d*\.?\d+)\s*sol/i);

    const count = countMatch ? parseInt(countMatch[1]) : (singleWalletMatch ? 1 : 0);
    const fundAmount = solMatch ? parseFloat(solMatch[1]) : undefined;

    if (count > 0) {
        elizaLogger.debug("Extracted params:", { count, fundAmount });
        return { count, fundAmount };
    }

    elizaLogger.debug("No valid params found");
    return null;
}

async function extractSwapParams(text: string): Promise<SwapParams | null> {
    const template = `
    Extract swap parameters from: "${text}"
    
    Return JSON with:
    - tokenIn: input token symbol
    - tokenOut: output token symbol
    - amount: amount to swap
    - slippage: slippage tolerance (optional, default 1%)
    
    Example: "Swap 1 SOL for USDC with 0.5% slippage" ->
    {
        "tokenIn": "SOL",
        "tokenOut": "USDC",
        "amount": 1,
        "slippage": 0.5
    }
    `;

    try {
        const response = await generateText(template, {
            model: ModelClass.GPT4,
            temperature: 0
        });
        return JSON.parse(response);
    } catch (error) {
        elizaLogger.error("Failed to extract swap parameters:", error);
        return null;
    }
}

async function extractFundParams(text: string): Promise<FundParams | null> {
    const template = `
    Extract funding parameters from: "${text}"
    
    Return JSON with:
    - address: wallet address to fund
    - amount: amount of SOL to send
    
    Example: "Fund wallet ABC123... with 1 SOL" ->
    {
        "address": "ABC123...",
        "amount": 1
    }
    `;

    try {
        const response = await generateText(template, {
            model: ModelClass.GPT4,
            temperature: 0
        });
        return JSON.parse(response);
    } catch (error) {
        elizaLogger.error("Failed to extract funding parameters:", error);
        return null;
    }
} 
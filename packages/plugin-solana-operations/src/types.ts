export interface WalletInfo {
    address: string;
    balance: number;
    network: string;
    privateKey?: string;
}

export interface CreateWalletsParams {
    count: number;
    fundAmount?: number;
}

export interface WalletResponse {
    type: 'wallet_created';
    content: {
        text: string;
        wallets: WalletInfo[];
    };
} 
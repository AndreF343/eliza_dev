import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WalletInfo } from '../types';

interface WalletState {
    wallets: WalletInfo[];
    addWallet: (wallet: WalletInfo) => void;
    updateBalance: (address: string, balance: number) => void;
    getWallets: () => WalletInfo[];
}

export const useWalletStore = create<WalletState>()(
    persist(
        (set, get) => ({
            wallets: [],
            addWallet: (wallet) => set((state) => ({
                wallets: [...state.wallets, wallet]
            })),
            updateBalance: (address, balance) => set((state) => ({
                wallets: state.wallets.map((w) => 
                    w.address === address ? { ...w, balance } : w
                )
            })),
            getWallets: () => get().wallets
        }),
        {
            name: 'wallet-storage'
        }
    )
); 
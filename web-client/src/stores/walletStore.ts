import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { elizaLogger } from '@/utils/logger'
import { WalletInfo } from '@/types'

interface WalletStore {
    wallets: WalletInfo[];
    addWallet: (wallet: WalletInfo) => void;
    addWallets: (wallets: WalletInfo[]) => void;
    getWallets: () => WalletInfo[];
    updateBalance: (address: string, balance: number) => void;
    clear: () => void;
}

// Create store with persistence and devtools
export const useWalletStore = create<WalletStore>()(
    devtools(
        persist(
            (set, get) => ({
                wallets: [],
                addWallet: (wallet) => {
                    elizaLogger.debug('Adding single wallet to store:', wallet);
                    set((state) => {
                        const newWallets = [...state.wallets, wallet];
                        elizaLogger.debug('Updated wallet store state:', newWallets);
                        return { wallets: newWallets };
                    });
                },
                addWallets: (newWallets) => {
                    elizaLogger.debug('Adding multiple wallets to store:', newWallets);
                    set((state) => {
                        const existingAddresses = new Set(state.wallets.map(w => w.address));
                        const uniqueNewWallets = newWallets.filter(w => !existingAddresses.has(w.address));
                        elizaLogger.debug('Filtered unique new wallets:', uniqueNewWallets);
                        const updatedWallets = [...state.wallets, ...uniqueNewWallets];
                        elizaLogger.debug('Final wallet state:', updatedWallets);
                        return { wallets: updatedWallets };
                    });
                },
                getWallets: () => get().wallets,
                updateBalance: (address, balance) => set((state) => ({
                    wallets: state.wallets.map(w => 
                        w.address === address ? { ...w, balance } : w
                    )
                })),
                clear: () => {
                    elizaLogger.debug('Clearing wallet store');
                    set({ wallets: [] });
                }
            }),
            {
                name: 'wallet-storage',
                version: 1,
                onRehydrateStorage: () => (state) => {
                    elizaLogger.debug('Rehydrated wallet store state:', state);
                }
            }
        )
    )
)

// Add a debug subscription
useWalletStore.subscribe(
    (state) => state.wallets,
    (wallets) => {
        elizaLogger.debug('Wallet store updated:', wallets);
    }
); 
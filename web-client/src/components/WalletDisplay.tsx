import { useWalletStore } from '@/stores/walletStore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { elizaLogger } from '@/utils/logger';
import { useState, useEffect } from 'react';

export function WalletDisplay() {
    const wallets = useWalletStore((state) => {
        elizaLogger.debug('WalletDisplay accessing store state:', {
            stateExists: !!state,
            walletsExist: !!state.wallets,
            walletsLength: state.wallets?.length,
            wallets: state.wallets
        });
        return state.wallets;
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Log initial store state
        const initialState = useWalletStore.getState();
        elizaLogger.debug('Initial wallet store state:', initialState);

        // Give store time to hydrate from localStorage
        const timer = setTimeout(() => {
            setIsLoading(false);
            // Log state after hydration
            const hydratedState = useWalletStore.getState();
            elizaLogger.debug('Hydrated wallet store state:', hydratedState);
        }, 100);
        
        return () => clearTimeout(timer);
    }, []);

    // Add store subscription for debugging
    useEffect(() => {
        const unsubscribe = useWalletStore.subscribe(
            (state) => elizaLogger.debug('Wallet store changed:', state)
        );
        return () => unsubscribe();
    }, []);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                </CardHeader>
                <CardContent>
                    Loading wallets...
                </CardContent>
            </Card>
        );
    }

    if (!wallets?.length) {
        elizaLogger.debug('No wallets found in store');
        return (
            <Card>
                <CardHeader>
                </CardHeader>
                <CardContent>
                    No wallets created yet
                </CardContent>
            </Card>
        );
    }

    elizaLogger.debug('Rendering wallet list:', wallets);
    return (
        <Card>
            <CardHeader>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {wallets.map((wallet) => {
                        elizaLogger.debug('Rendering wallet:', wallet);
                        return (
                            <div key={wallet.address} className="mb-4 p-4 border rounded">
                                <div className="font-mono text-sm break-all">
                                    Address: {wallet.address}
                                </div>
                                <div className="mt-2">
                                    Balance: {wallet.balance} SOL
                                </div>
                                <div className="text-sm text-gray-500">
                                    Network: {wallet.network}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
} 
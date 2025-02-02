import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletStoreProvider } from '@/stores/walletStore';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <WalletStoreProvider>
                {children}
            </WalletStoreProvider>
        </QueryClientProvider>
    );
} 
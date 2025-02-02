import { WalletDisplay } from "@/components/WalletDisplay";
import { Providers } from "@/components/providers";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Providers>
            <div className="flex h-screen">
                <div className="flex-1">
                    {children}
                </div>
                <div className="w-80 border-l border-zinc-800 bg-zinc-900">
                    <h2 className="text-xl font-bold p-4">Wallet Management</h2>
                    <WalletDisplay />
                </div>
            </div>
        </Providers>
    );
} 
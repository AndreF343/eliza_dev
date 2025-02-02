import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WalletCardProps {
    address: string;
    balance: number;
    network: string;
}

export const WalletCard = ({ address, balance, network }: WalletCardProps) => {
    return (
        <Card className="w-full max-w-sm border rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wallet</CardTitle>
                <div className="text-xs text-muted-foreground">{network}</div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Address</span>
                        <span className="text-xs font-mono">
                            {address.slice(0, 8)}...{address.slice(-8)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Balance</span>
                        <span className="text-sm font-medium">{balance} SOL</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}; 
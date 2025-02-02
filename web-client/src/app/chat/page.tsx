import ChatPanel from "@/components/ChatPanel";
import { WalletDisplay } from "@/components/WalletDisplay";
import { WalletCard } from "@/components/WalletCard";

export default function ChatPage() {
    return (
        <div className="flex h-screen bg-zinc-900 text-white">
            <div className="w-48 flex-none border-r border-zinc-800">
                <h2 className="p-4 text-xl font-bold">Conversations</h2>
                <div className="p-4">
                    <div className="text-zinc-400">Conversation 1</div>
                    <div className="text-zinc-400">Conversation 2</div>
                </div>
            </div>
            <div className="flex-1">
                <ChatPanel />
            </div>
            <div className="w-72 flex-none border-l border-zinc-800">
                <h2 className="p-4 text-xl font-bold">Wallet Management</h2>
                <WalletDisplay />
            </div>
        </div>
    );
} 
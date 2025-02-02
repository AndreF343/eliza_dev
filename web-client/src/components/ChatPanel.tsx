import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Button } from './ui/button';
import { Send } from 'lucide-react';
import type { UUID } from "@/types";
import {
    ChatBubble,
    ChatBubbleMessage,
    ChatBubbleTimestamp,
} from "@/components/ui/chat/chat-bubble";
import dayjs from "dayjs";
import { useWalletStore } from '@/stores/walletStore';
import { elizaLogger } from '@/utils/logger';

interface Message {
    text: string;
    user: string;
    createdAt: number;
}

interface WalletCreatedResponse {
    type: 'wallet_created';
    content: {
        text: string;
        wallets: Array<{
            address: string;
            balance: number;
            network: string;
        }>;
    };
}

interface TextResponse {
    type?: undefined;
    text: string;
}

type AgentResponse = WalletCreatedResponse | TextResponse;

export default function ChatPanel() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const agentId = "858c8d90-ec57-0bb3-8492-63ad6ab3bbbc";
    const { addWallets } = useWalletStore();

    const sendMessageMutation = useMutation({
        mutationFn: async ({ message }: { message: string }) => {
            const response = await apiClient.sendMessage(agentId, message);
            elizaLogger.debug('Raw API Response - Type:', response?.[0]?.type);
            elizaLogger.debug('Raw API Response - Content:', JSON.stringify(response?.[0]?.content, null, 2));
            return response;
        },
        onSuccess: (response) => {
            if (!response || !Array.isArray(response)) {
                elizaLogger.error('Invalid response format');
                return;
            }

            response.forEach(item => {
                elizaLogger.debug('Processing message - Type:', item.type);
                elizaLogger.debug('Processing message - Content:', JSON.stringify(item.content, null, 2));
                
                if (item.type === 'wallet_created' && item.content?.wallets) {
                    elizaLogger.debug('Found wallet data:', 
                        JSON.stringify(item.content.wallets, null, 2)
                    );
                    addWallets(item.content.wallets);
                    
                    const storeState = useWalletStore.getState();
                    elizaLogger.debug('Current wallet store state:', 
                        JSON.stringify(storeState.wallets, null, 2)
                    );
                }

                const text = item.content?.text || item.text || 'No response text';
                setMessages(prev => [...prev, {
                    text,
                    user: "Solana Trader",
                    createdAt: Date.now()
                }]);
            });
        },
        onError: (error) => {
            console.error('Message sending failed:', error);
            setMessages(prev => [...prev, {
                text: "Failed to send message. Please try again.",
                user: "System",
                createdAt: Date.now()
            }]);
        }
    });

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = {
            text: input.trim(),
            user: "user",
            createdAt: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        await sendMessageMutation.mutateAsync({ message: userMessage.text });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4 mx-auto max-w-3xl">
                    {messages.map((message, index) => (
                        <ChatBubble
                            key={`${message.createdAt}-${index}`}
                            variant={message.user === "user" ? "sent" : "received"}
                            className={message.user === "user" ? "ml-auto" : "mr-auto"}
                        >
                            <ChatBubbleMessage
                                variant={message.user === "user" ? "sent" : "received"}
                            >
                                {message.text}
                            </ChatBubbleMessage>
                            <ChatBubbleTimestamp>
                                {dayjs(message.createdAt).format("HH:mm")}
                            </ChatBubbleTimestamp>
                        </ChatBubble>
                    ))}
                </div>
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800">
                <div className="flex gap-2 max-w-3xl mx-auto">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-zinc-800 rounded p-2 resize-none"
                        placeholder="Type your message..."
                        rows={3}
                    />
                    <Button 
                        type="submit" 
                        disabled={!input.trim() || sendMessageMutation.isPending}
                        className="self-end"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
} 
import { Trash2 } from 'lucide-react'

interface ConversationsPanelProps {
  selectedConversation: string | null
  onSelectConversation: (id: string) => void
}

export default function ConversationsPanel({ 
  selectedConversation, 
  onSelectConversation 
}: ConversationsPanelProps) {
  // Mock conversations data
  const conversations = [
    { id: '1', title: 'Conversation 1' },
    { id: '2', title: 'Conversation 2' },
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-xl font-bold">Conversations</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`flex items-center justify-between p-4 hover:bg-zinc-800 cursor-pointer ${
              selectedConversation === conv.id ? 'bg-zinc-800' : ''
            }`}
            onClick={() => onSelectConversation(conv.id)}
          >
            <span>{conv.title}</span>
            <button className="opacity-0 hover:opacity-100 text-zinc-400 hover:text-white">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
} 
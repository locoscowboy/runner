'use client';

import { useState } from 'react';

export function ChatPanel() {
  const [messages, setMessages] = useState<any[]>([]);

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-semibold flex items-center gap-2">
          <span>💬</span>
          <span>Chat</span>
          <span className="text-xs text-muted-foreground">(335 online)</span>
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            No messages yet. Be the first to chat!
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="text-sm">
              <span className="font-semibold text-primary">{msg.username}</span>
              <span className="text-muted-foreground">: </span>
              <span>{msg.message}</span>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <input
          type="text"
          placeholder="Type message here..."
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="mt-2 text-xs text-muted-foreground">
          Chat Rules
        </div>
      </div>
    </div>
  );
}


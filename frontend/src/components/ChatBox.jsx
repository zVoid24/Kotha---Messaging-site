// src/components/ChatBox.jsx
import React, { useEffect, useRef } from 'react';
import moment from 'moment';

export default function ChatBox({ messages, currentUserId }) {
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto space-y-2 px-2">
      {messages.map((m) => {
        const isMe = m.sender === currentUserId;
        return (
          <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs break-words p-3 rounded-xl ${isMe ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              <p>{m.text}</p>
              <span className="text-xs text-gray-600 mt-1 block text-right">
                {moment(m.createdAt).format('HH:mm')}
                {isMe && <span className="ml-1">{m.seen ? '✓✓' : '✓'}</span>}
              </span>
            </div>
          </div>
        );
      })}
      {/* Dummy div to scroll into view */}
      <div ref={messagesEndRef} />
    </div>
  );
}

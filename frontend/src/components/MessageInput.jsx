// src/components/MessageInput.jsx
import React from 'react';

export default function MessageInput({ text, onChange, onSend }) {
  return (
    <div className="flex items-center">
      <input
        type="text"
        value={text}
        onChange={e => onChange(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
        onKeyDown={(e) => e.key === 'Enter' && onSend()}
      />
      <button
        onClick={onSend}
        className="ml-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-xl transition transform hover:-translate-y-0.5"
      >
        Send
      </button>
    </div>
  );
}

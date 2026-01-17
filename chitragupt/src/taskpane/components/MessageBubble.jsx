import React from 'react';
import { formatTime } from '../utils';

export default function MessageBubble({ message }) {
  const getBubbleStyles = () => {
    if (message.sender === 'user') {
      return 'bg-[#2d2d2d] text-white';
    }
    if (message.isError) {
      return 'bg-red-900/20 text-red-300 border border-red-800';
    }
    return 'bg-[#252525] text-gray-200';
  };

  return (
    <div
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] rounded-lg px-4 py-2.5 ${getBubbleStyles()}`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.text}
        </p>
        <p className="text-xs mt-1 text-gray-500">
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}


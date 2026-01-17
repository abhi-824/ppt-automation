import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-[#252525] rounded-lg px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>
    </div>
  );
}


import React from 'react';

export default function StreamingMessage({ message }) {
  if (!message) return null;

  return (
    <div className="flex justify-start">
      <div className="bg-[#252525] text-gray-200 rounded-lg px-4 py-2.5 max-w-[85%]">
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message}
          <span className="inline-block w-0.5 h-4 bg-blue-500 ml-1 animate-pulse"></span>
        </p>
      </div>
    </div>
  );
}


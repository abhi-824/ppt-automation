import React from 'react';
import { Send, AtSign } from 'lucide-react';

export default function ChatInput({ 
  inputValue, 
  setInputValue, 
  handleSend, 
  handleKeyPress, 
  isStreaming 
}) {
  return (
    <>
      {/* Add context button */}
      <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 mb-3 transition-colors">
        <AtSign className="w-4 h-4" />
        <span>Add context</span>
      </button>

      {/* Input Area */}
      <div className="flex gap-2 items-end mb-3">
        <div className="flex-1 bg-[#252525] rounded-lg border border-[#3a3a3a] focus-within:border-[#4a4a4a] transition-all">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isStreaming}
            className="w-full px-3 py-2.5 bg-transparent text-white placeholder-gray-500 resize-none outline-none text-sm disabled:opacity-50"
            rows="1"
            style={{
              minHeight: '40px',
              maxHeight: '120px',
              overflow: 'auto'
            }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isStreaming}
          className="bg-[#2d2d2d] hover:bg-[#3a3a3a] disabled:bg-[#252525] disabled:cursor-not-allowed text-white p-2.5 rounded-lg transition-colors duration-200"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}


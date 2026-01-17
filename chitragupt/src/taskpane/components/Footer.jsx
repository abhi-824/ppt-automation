import React from 'react';
import ChatInput from './ChatInput';
import AgentSelector from './AgentSelector';

export default function Footer({ 
  inputValue, 
  setInputValue, 
  handleSend, 
  handleKeyPress, 
  isStreaming,
  selectedAgent,
  setSelectedAgent
}) {
  return (
    <div className="border-t border-[#2a2a2a] bg-[#1a1a1a]">
      <div className="px-4 py-4">
        <ChatInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSend={handleSend}
          handleKeyPress={handleKeyPress}
          isStreaming={isStreaming}
        />

        <AgentSelector 
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
        />

        {/* Bottom bar */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <button className="hover:text-gray-400 transition-colors">
            Past chats →
          </button>
          <div className="flex items-center gap-3">
            <button className="hover:text-gray-400 transition-colors flex items-center gap-1">
              <span className="text-lg">⊙</span>
              Deckable Tab
            </button>
            <button className="hover:text-gray-400 transition-colors">
              🔔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


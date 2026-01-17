import React, { useState } from 'react';
import Header from './Header';
import MessageList from './MessageList';
import Footer from './Footer';
import { useChat } from './hooks/useChat';

export default function PowerPointChatAddin() {
  const [selectedAgent, setSelectedAgent] = useState('Agent #1');
  
  const {
    messages,
    inputValue,
    setInputValue,
    isStreaming,
    currentStreamingMessage,
    toolCalls,
    handleSend
  } = useChat();

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] text-white">
      <Header />
      
      <MessageList 
        messages={messages}
        toolCalls={toolCalls}
        currentStreamingMessage={currentStreamingMessage}
        isStreaming={isStreaming}
      />

      <Footer 
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSend={handleSend}
        handleKeyPress={handleKeyPress}
        isStreaming={isStreaming}
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
      />
    </div>
  );
}

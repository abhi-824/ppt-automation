import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import ToolCallsDisplay from './ToolCallsDisplay';
import StreamingMessage from './StreamingMessage';
import TypingIndicator from './TypingIndicator';

export default function MessageList({ 
  messages, 
  toolCalls, 
  currentStreamingMessage, 
  isStreaming 
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, toolCalls, currentStreamingMessage]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.length === 1 && (
        <div className="flex flex-col items-center justify-center h-full pb-20">
          <p className="text-base text-gray-500">Plan, search, build anything</p>
        </div>
      )}

      {messages.length > 1 && messages.slice(1).map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      <ToolCallsDisplay toolCalls={toolCalls} />

      <StreamingMessage message={currentStreamingMessage} />

      {isStreaming && !currentStreamingMessage && toolCalls.length === 0 && (
        <TypingIndicator />
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}


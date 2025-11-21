import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';

export default function PowerPointChatAddin() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your PowerPoint assistant. How can I help you today?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage = {
        id: messages.length + 2,
        text: "I've received your message. In a full implementation, I would help you with PowerPoint tasks like creating slides, formatting content, and more.",
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">PowerPoint Assistant</h1>
              <p className="text-xs text-slate-500">AI-powered presentation help</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.text}
              </p>
              <p
                className={`text-xs mt-1.5 ${
                  message.sender === 'user'
                    ? 'text-blue-100'
                    : 'text-slate-400'
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-800 border border-slate-200 shadow-sm rounded-2xl px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-4 py-3 bg-transparent text-slate-800 placeholder-slate-400 resize-none outline-none text-sm"
                rows="1"
                style={{
                  minHeight: '44px',
                  maxHeight: '120px',
                  overflow: 'auto'
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
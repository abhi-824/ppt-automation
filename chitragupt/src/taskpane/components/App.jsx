import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Plus, Cloud, Clock, MoreHorizontal, X, AtSign, ChevronDown, Image, Upload } from 'lucide-react';
import { 
  getCurrentSlideAsBase64, 
  replacePresentationInPowerPoint,
  sendChatMessage,
  formatTime, 
  uint8ToBase64
} from '../utils';

export default function PowerPointChatAddin() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your PowerPoint assistant. How can I help you today?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const xRef = useRef(1);

  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const [toolCalls, setToolCalls] = useState([]);
  const messagesEndRef = useRef(null);
  const eventSourceRef = useRef(null);
  const [selectedAgent, setSelectedAgent] = useState('Agent #1');


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, toolCalls, currentStreamingMessage]);

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const promptToSend = inputValue;
    setInputValue('');
    setIsStreaming(true);
    setCurrentStreamingMessage('');
    setToolCalls([]);

    try {
      const slideBase64 = uint8ToBase64(await getCurrentSlideAsBase64());

      console.log('Connecting to orchestrator...', {
        url: 'https://localhost:8080/chat',
        prompt: promptToSend,
        x: xRef.current
      });

      
      await sendChatMessage(promptToSend, slideBase64, handleSSEEvent, xRef.current);
      xRef.current++;
      console.log('x', xRef.current);
      
    } catch (error) {
      console.error('Error connecting to chat API:', error);
      const errorMessage = {
        id: Date.now(),
        text: `Error: ${error.message}. Make sure the orchestrator is running on https://localhost:8080`,
        sender: 'assistant',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsStreaming(false);
    }
  };

  const handleSSEEvent = (event) => {
    switch (event.type) {
      case 'start':
        console.log('Stream started:', event.prompt);
        break;

      case 'tool-call':
        console.log('=== TOOL CALL DEBUG ===');
        console.log('Tool:', event.tool);
        console.log('Args (raw):', event.args);
        console.log('Args (stringified):', JSON.stringify(event.args, null, 2));
        console.log('Args type:', typeof event.args);
        console.log('=====================');
  
        setToolCalls(prev => [...prev, {
          id: Date.now(),
          tool: event.tool,
          args: event.args,
          status: 'running'
        }]);
        break;

      case 'tool-result':
        console.log('=== TOOL RESULT DEBUG ===');
        console.log('Tool:', event.tool);
        console.log('Success:', event.success);
        console.log('Result (raw):', event.result);
        console.log('Result (stringified):', JSON.stringify(event.result, null, 2));
        console.log('========================');
  
        setToolCalls(prev => prev.map(tool => 
          tool.tool === event.tool && tool.status === 'running'
            ? { ...tool, status: event.success ? 'success' : 'failed', result: event.result }
            : tool
        ));
        console.log(event.tool)
        replacePresentationInPowerPoint();
        break;

      case 'token':
        setCurrentStreamingMessage(prev => prev + event.content);
        break;

      case 'done':
        if (currentStreamingMessage || event.response) {
          const finalMessage = {
            id: Date.now(),
            text: currentStreamingMessage || event.response || 'Task completed.',
            sender: 'assistant',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, finalMessage]);
        }
        setCurrentStreamingMessage('');
        setToolCalls([]);
        setIsStreaming(false);
        break;

      case 'error':
        console.log('=== ERROR DEBUG ===');
        console.log('Tool:', event.tool);
        console.log('Error message:', event.error);
        console.log('Full event:', JSON.stringify(event, null, 2));
        console.log('==================');
  
        const errorMessage = {
          id: Date.now(),
          text: `Error: ${event.error}`,
          sender: 'assistant',
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
        setCurrentStreamingMessage('');
        setToolCalls([]);
        setIsStreaming(false);
        break;

      default:
        console.log('Unknown event type:', event);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] text-white">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#2a2a2a]">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-medium text-white">New chat</h1>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-[#2a2a2a] rounded transition-colors">
                <Plus className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-1.5 hover:bg-[#2a2a2a] rounded transition-colors">
                <Cloud className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-1.5 hover:bg-[#2a2a2a] rounded transition-colors">
                <Clock className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-1.5 hover:bg-[#2a2a2a] rounded transition-colors">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-1.5 hover:bg-[#2a2a2a] rounded transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 1 && (
          <div className="flex flex-col items-center justify-center h-full pb-20">
            {/* Placeholder text */}
            <p className="text-base text-gray-500">Plan, search, build anything</p>
          </div>
        )}

        {messages.length > 1 && messages.slice(1).map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2.5 ${
                message.sender === 'user'
                  ? 'bg-[#2d2d2d] text-white'
                  : message.isError
                  ? 'bg-red-900/20 text-red-300 border border-red-800'
                  : 'bg-[#252525] text-gray-200'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.text}
              </p>
              <p className="text-xs mt-1 text-gray-500">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {/* Tool Calls Display */}
        {toolCalls.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-[#252525] rounded-lg px-4 py-2.5 max-w-[85%]">
              <div className="space-y-2">
                {toolCalls.map((tool) => (
                  <div key={tool.id} className="flex items-start gap-2">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-300">{tool.tool}</p>
                      {tool.result && (
                        <p className="text-xs text-gray-500 mt-0.5">{tool.result}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Streaming Message */}
        {currentStreamingMessage && (
          <div className="flex justify-start">
            <div className="bg-[#252525] text-gray-200 rounded-lg px-4 py-2.5 max-w-[85%]">
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {currentStreamingMessage}
                <span className="inline-block w-0.5 h-4 bg-blue-500 ml-1 animate-pulse"></span>
              </p>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isStreaming && !currentStreamingMessage && toolCalls.length === 0 && (
          <div className="flex justify-start">
            <div className="bg-[#252525] rounded-lg px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className="border-t border-[#2a2a2a] bg-[#1a1a1a]">
        <div className="px-4 py-4">
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

          {/* Agent selector */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-xs">∞</span>
              </div>
              <button className="flex items-center gap-1 text-sm text-gray-300 hover:text-white transition-colors">
                <span>{selectedAgent}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <span className="text-sm text-gray-500">Auto</span>
            <div className="ml-auto flex items-center gap-2">
              <button className="p-1.5 hover:bg-[#2a2a2a] rounded transition-colors">
                <Image className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-1.5 hover:bg-[#2a2a2a] rounded transition-colors">
                <Upload className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

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
    </div>
  );

}
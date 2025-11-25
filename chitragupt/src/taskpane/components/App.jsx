import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Wrench, CheckCircle, XCircle, Download, RefreshCw, Eye } from 'lucide-react';
/* global PowerPoint */


const ORCHESTRATOR_URL = 'https://localhost:8080';
const PPT_API_URL = 'http://localhost:8000';

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
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const [toolCalls, setToolCalls] = useState([]);
  const messagesEndRef = useRef(null);
  const eventSourceRef = useRef(null);

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

  const deleteAllSlides = async () => {
    await PowerPoint.run(async (context) => {
      let slides = context.presentation.slides.load("items/id");
      await context.sync();
      slides.items.forEach(slide => slide.delete());
      await context.sync();
    });
  };
  const insertSlidesFromBase64 = async (pptBase64) => {
    await PowerPoint.run(async (context) => {
      context.presentation.insertSlidesFromBase64(pptBase64, {
        formatting: "UseDestinationTheme",
        targetSlideId: null
      });
      await context.sync();
    });
  };
  

  const replacePresentationInPowerPoint = async () => {
    try {
      const response = await fetch(`${ORCHESTRATOR_URL}/ppt/preview`, {
        mode: 'cors',
        credentials: 'omit',
      });
      const data = await response.json();
  
      if (data.status === "ok" && data.base64) {
        // Step 1: Delete all slides
        await deleteAllSlides();
  
        // Step 2: Insert new slides from base64
        await insertSlidesFromBase64(data.base64);
  
        console.log("PPT replaced successfully using Office-JS API");
      }
    } catch (e) {
      console.error("Error replacing PPT:", e);
    }
  };
  

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
      console.log('Connecting to orchestrator...', {
        url: 'https://localhost:8080/chat',
        prompt: promptToSend
      });

      // Use fetch with streaming instead of EventSource since we need POST
      const response = await fetch('https://localhost:8080/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptToSend }),
        mode: 'cors',
        credentials: 'omit'
      });

      console.log('Response received:', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const event = JSON.parse(data);
              handleSSEEvent(event);
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }

    } catch (error) {
      console.error('Error connecting to chat API:', error);
      const errorMessage = {
        id: Date.now(),
        text: `Error: ${error.message}. Make sure the orchestrator is running on http://localhost:8080`,
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
        setToolCalls(prev => [...prev, {
          id: Date.now(),
          tool: event.tool,
          args: event.args,
          status: 'running'
        }]);
        break;

      case 'tool-result':
        setToolCalls(prev => prev.map(tool => 
          tool.tool === event.tool && tool.status === 'running'
            ? { ...tool, status: event.success ? 'success' : 'failed', result: event.result }
            : tool
        ));
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
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-slate-800">PowerPoint Assistant</h1>
              <p className="text-xs text-slate-500">AI-powered presentation help</p>
            </div>
            {isStreaming && (
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                Processing
              </div>
            )}
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
                  : message.isError
                  ? 'bg-red-50 text-red-800 border border-red-200'
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
                    : message.isError
                    ? 'text-red-400'
                    : 'text-slate-400'
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {/* Tool Calls Display */}
        {toolCalls.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl px-4 py-3 max-w-[85%]">
              <div className="space-y-2">
                {toolCalls.map((tool) => (
                  <div key={tool.id} className="flex items-start gap-2">
                    {tool.status === 'running' && (
                      <Wrench className="w-4 h-4 text-blue-600 animate-pulse mt-0.5" />
                    )}
                    {tool.status === 'success' && (
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    )}
                    {tool.status === 'failed' && (
                      <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-700">{tool.tool}</p>
                      {tool.result && (
                        <p className="text-xs text-slate-500 mt-0.5">{tool.result}</p>
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
            <div className="bg-white text-slate-800 border border-slate-200 shadow-sm rounded-2xl px-4 py-3 max-w-[85%]">
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {currentStreamingMessage}
                <span className="inline-block w-0.5 h-4 bg-blue-600 ml-1 animate-pulse"></span>
              </p>
            </div>
          </div>
        )}

        {/* Typing indicator when streaming started but no content yet */}
        {isStreaming && !currentStreamingMessage && toolCalls.length === 0 && (
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
                disabled={isStreaming}
                className="w-full px-4 py-3 bg-transparent text-slate-800 placeholder-slate-400 resize-none outline-none text-sm disabled:opacity-50"
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
              disabled={!inputValue.trim() || isStreaming}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            {isStreaming ? 'Processing your request...' : 'Press Enter to send, Shift+Enter for new line'}
          </p>
        </div>
      </div>
    </div>
  );
}
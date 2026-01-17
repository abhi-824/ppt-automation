import { useState, useRef, useEffect } from 'react';
import { 
  getCurrentSlideAsBase64, 
  replacePresentationInPowerPoint,
  sendChatMessage,
  uint8ToBase64
} from '../../utils';

export function useChat() {
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
  const eventSourceRef = useRef(null);

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

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
        console.log(event.tool);
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

  return {
    messages,
    inputValue,
    setInputValue,
    isStreaming,
    currentStreamingMessage,
    toolCalls,
    handleSend
  };
}


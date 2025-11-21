import asyncio
import json
import os
from typing import Any, Dict, List, Optional
from anthropic import Anthropic
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# Configuration - Choose your provider
PROVIDER = "openai"  # Options: "anthropic", "openai"
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "your-api-key-here")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "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")

# Model selection
ANTHROPIC_MODEL = "claude-sonnet-4-20250514"
OPENAI_MODEL = "gpt-4.1"

# MCP Server configuration
MCP_SERVER_COMMAND = "node"
MCP_SERVER_ARGS = ["./my-mcp-server/src/index.js"]  # Update this path

class MCPToolChat:
    def __init__(self, provider: str = "anthropic"):
        self.provider = provider
        self.session: ClientSession | None = None
        self.tools: List[Dict[str, Any]] = []
        self.conversation_history: List[Dict] = []
        
        # Initialize AI client
        if provider == "anthropic":
            self.client = Anthropic(api_key=ANTHROPIC_API_KEY)
        elif provider == "openai":
            from openai import OpenAI
            self.client = OpenAI(api_key=OPENAI_API_KEY)
        else:
            raise ValueError(f"Unknown provider: {provider}")
    
    async def connect_to_mcp(self):
        """Connect to MCP server and load tools"""
        print("Connecting to MCP server...")
        
        server_params = StdioServerParameters(
            command=MCP_SERVER_COMMAND,
            args=MCP_SERVER_ARGS,
            env=None
        )
        
        stdio_transport = await stdio_client(server_params)
        self.session = ClientSession(*stdio_transport)
        await self.session.__aenter__()
        
        # Get available tools
        response = await self.session.list_tools()
        
        # Convert MCP tools to provider format
        if self.provider == "anthropic":
            self.tools = self._convert_tools_anthropic(response.tools)
        else:  # openai
            self.tools = self._convert_tools_openai(response.tools)
        
        print(f"✓ Connected! Found {len(self.tools)} tools:")
        for tool in response.tools:
            print(f"  • {tool.name}: {tool.description}")
    
    def _convert_tools_anthropic(self, mcp_tools) -> List[Dict]:
        """Convert MCP tools to Anthropic format"""
        return [
            {
                "name": tool.name,
                "description": tool.description or "",
                "input_schema": tool.inputSchema
            }
            for tool in mcp_tools
        ]
    
    def _convert_tools_openai(self, mcp_tools) -> List[Dict]:
        """Convert MCP tools to OpenAI format"""
        return [
            {
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": tool.description or "",
                    "parameters": tool.inputSchema
                }
            }
            for tool in mcp_tools
        ]
    
    async def call_mcp_tool(self, tool_name: str, arguments: Dict[str, Any]) -> str:
        """Execute a tool via MCP"""
        if not self.session:
            raise RuntimeError("MCP session not initialized")
        
        print(f"  🔧 Executing: {tool_name}")
        print(f"     Args: {json.dumps(arguments, indent=6)}")
        
        result = await self.session.call_tool(tool_name, arguments)
        
        # Extract text content
        content = []
        for item in result.content:
            if hasattr(item, 'text'):
                content.append(item.text)
        
        result_text = "\n".join(content)
        print(f"     Result: {result_text[:150]}...")
        return result_text
    
    async def chat_anthropic(self, user_message: str) -> str:
        """Chat using Anthropic Claude with MCP tools"""
        # Add user message to history
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })
        
        # Call Claude with tools
        response = self.client.messages.create(
            model=ANTHROPIC_MODEL,
            max_tokens=4096,
            tools=self.tools,
            messages=self.conversation_history
        )
        
        # Process response and handle tool calls
        while response.stop_reason == "tool_use":
            # Extract assistant's response
            assistant_content = []
            tool_results = []
            
            for block in response.content:
                if block.type == "text":
                    assistant_content.append(block)
                elif block.type == "tool_use":
                    print(f"\n🤖 Claude wants to use: {block.name}")
                    
                    # Execute the tool via MCP
                    tool_result = await self.call_mcp_tool(block.name, block.input)
                    
                    # Add tool result
                    assistant_content.append(block)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": tool_result
                    })
            
            # Add assistant message with tool use
            self.conversation_history.append({
                "role": "assistant",
                "content": assistant_content
            })
            
            # Add tool results
            self.conversation_history.append({
                "role": "user",
                "content": tool_results
            })
            
            # Continue conversation
            response = self.client.messages.create(
                model=ANTHROPIC_MODEL,
                max_tokens=4096,
                tools=self.tools,
                messages=self.conversation_history
            )
        
        # Extract final text response
        final_response = ""
        for block in response.content:
            if block.type == "text":
                final_response += block.text
        
        # Add to history
        self.conversation_history.append({
            "role": "assistant",
            "content": response.content
        })
        
        return final_response
    
    async def chat_openai(self, user_message: str) -> str:
        """Chat using OpenAI with MCP tools"""
        # Add user message
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })
        
        # Call OpenAI with tools
        response = self.client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=self.conversation_history,
            tools=self.tools,
            tool_choice="auto"
        )
        
        message = response.choices[0].message
        
        # Handle tool calls
        while message.tool_calls:
            # Add assistant message
            self.conversation_history.append({
                "role": "assistant",
                "content": message.content,
                "tool_calls": message.tool_calls
            })
            
            # Execute each tool
            for tool_call in message.tool_calls:
                print(f"\n🤖 GPT wants to use: {tool_call.function.name}")
                
                arguments = json.loads(tool_call.function.arguments)
                tool_result = await self.call_mcp_tool(
                    tool_call.function.name,
                    arguments
                )
                
                # Add tool result
                self.conversation_history.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": tool_result
                })
            
            # Get next response
            response = self.client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=self.conversation_history,
                tools=self.tools,
                tool_choice="auto"
            )
            message = response.choices[0].message
        
        # Add final response
        self.conversation_history.append({
            "role": "assistant",
            "content": message.content
        })
        
        return message.content or ""
    
    async def chat(self, user_message: str) -> str:
        """Main chat method that routes to the correct provider"""
        if self.provider == "anthropic":
            return await self.chat_anthropic(user_message)
        else:  # openai
            return await self.chat_openai(user_message)
    
    def reset_conversation(self):
        """Clear conversation history"""
        self.conversation_history = []
        print("🔄 Conversation reset")
    
    async def close(self):
        """Close MCP session"""
        if self.session:
            await self.session.__aexit__(None, None, None)

async def main():
    """Main chat loop"""
    # Choose provider
    print("Select AI Provider:")
    print("1. Anthropic (Claude)")
    print("2. OpenAI (GPT)")
    choice = input("Enter choice (1 or 2, default=1): ").strip() or "1"
    
    provider = "anthropic" if choice == "1" else "openai"
    
    chat = MCPToolChat(provider=provider)
    
    try:
        await chat.connect_to_mcp()
        
        print("\n" + "="*70)
        print(f"🤖 {provider.upper()} + MCP PowerPoint Automation")
        print("="*70)
        print("\nCommands:")
        print("  • Type your request naturally")
        print("  • 'reset' - Clear conversation history")
        print("  • 'quit' - Exit")
        print("="*70 + "\n")
        
        while True:
            user_input = input("\n💬 You: ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                break
            
            if user_input.lower() == 'reset':
                chat.reset_conversation()
                continue
            
            try:
                response = await chat.chat(user_input)
                print(f"\n🤖 Assistant: {response}")
                
            except Exception as e:
                print(f"\n❌ Error: {e}")
                import traceback
                traceback.print_exc()
    
    finally:
        await chat.close()
        print("\n👋 Goodbye!")

if __name__ == "__main__":
    asyncio.run(main())
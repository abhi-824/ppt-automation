import React from 'react';

export default function ToolCallsDisplay({ toolCalls }) {
  if (!toolCalls || toolCalls.length === 0) return null;

  return (
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
  );
}


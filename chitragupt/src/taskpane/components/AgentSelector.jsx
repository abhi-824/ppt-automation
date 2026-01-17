import React from 'react';
import { ChevronDown, Image, Upload } from 'lucide-react';

export default function AgentSelector({ selectedAgent, setSelectedAgent }) {
  return (
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
  );
}


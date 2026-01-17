import React from 'react';
import { Plus, Cloud, Clock, MoreHorizontal, X } from 'lucide-react';

export default function Header() {
  return (
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
  );
}


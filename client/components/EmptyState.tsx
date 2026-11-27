import React from 'react';
import { MessageSquarePlus, Users, Settings } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#0B0C10]">
      <div className="mb-6 opacity-20">
        <MessageSquarePlus size={120} color="#10B981" strokeWidth={1} />
      </div>
      
      <h2 className="text-3xl font-bold text-[#F3F4F6] mb-2">
        Welcome to UQZERA
      </h2>
      
      <p className="text-[#9CA3AF] text-sm mb-12 max-w-md">
        Select a conversation from the sidebar or start a new one to get started.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
        <button className="group flex flex-col items-center p-6 border border-[#2D313A] rounded-xl hover:border-[#10B981] hover:bg-[#1F222A] transition-all duration-200 focus:ring-2 focus:ring-[#10B981] outline-none">
          <MessageSquarePlus className="mb-3 text-[#10B981]" size={24} />
          <span className="text-[#F3F4F6] font-medium">Start new chat</span>
        </button>
        
        <button className="group flex flex-col items-center p-6 border border-[#2D313A] rounded-xl hover:border-[#10B981] hover:bg-[#1F222A] transition-all duration-200 focus:ring-2 focus:ring-[#10B981] outline-none">
          <Users className="mb-3 text-[#10B981]" size={24} />
          <span className="text-[#F3F4F6] font-medium">Browse contacts</span>
        </button>
        
        <button className="group flex flex-col items-center p-6 border border-[#2D313A] rounded-xl hover:border-[#10B981] hover:bg-[#1F222A] transition-all duration-200 focus:ring-2 focus:ring-[#10B981] outline-none">
          <Settings className="mb-3 text-[#10B981]" size={24} />
          <span className="text-[#F3F4F6] font-medium">View settings</span>
        </button>
      </div>
      
      <div className="mt-auto w-full max-w-2xl pb-4">
         <div className="relative">
            <input 
              disabled 
              type="text" 
              placeholder="Select a chat to start messaging..." 
              className="w-full bg-[#1F222A] border border-[#2D313A] rounded-full py-4 px-6 text-[#9CA3AF] opacity-50 cursor-not-allowed"
            />
         </div>
      </div>
    </div>
  );
}

import React from 'react';
import { MessageCirclePlus, AlignLeft } from 'lucide-react';

interface HeaderProps {
  onNewChat: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewChat }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-40 flex items-center justify-between px-6">
      {/* Tombol Menu Sidebar */}
      <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 active:bg-gray-200 hover:text-gray-700 transition-all duration-200">
        <AlignLeft size={24} strokeWidth={2} />
      </button>

      {/* Tombol New Chat (Message Circle Plus) */}
      <button 
        onClick={onNewChat}
        className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200"
      >
        <MessageCirclePlus size={24} strokeWidth={2} />
      </button>
    </header>
  );
};

export default Header;
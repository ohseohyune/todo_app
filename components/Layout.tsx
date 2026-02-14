
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: '🏠', label: '홈' },
    { id: 'friends', icon: '👥', label: '친구' },
    { id: 'input', icon: '➕', label: '퀘스트' },
    { id: 'shop', icon: '🎁', label: '상점' }, // 추가
    { id: 'league', icon: '🏆', label: '리그' },
    { id: 'profile', icon: '👤', label: '상태' },
  ];

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#2D4F1E] border-x border-[#1E3614] overflow-hidden relative shadow-2xl">
      <main className="flex-1 overflow-y-auto pb-24 p-4 bg-[#2D4F1E] circuit-bg">
        {children}
      </main>

      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-[#E5E4E2] flex justify-around items-center py-3 px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === tab.id ? 'scale-110 text-[#2D4F1E]' : 'text-[#3D2B1F44]'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-tight">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;

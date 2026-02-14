
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
    { id: 'shop', icon: '🎁', label: '상점' },
    { id: 'league', icon: '🏆', label: '리그' },
    { id: 'profile', icon: '👤', label: '상태' },
  ];

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-[#2D4F1E] border-x border-[#1E3614] overflow-hidden shadow-2xl relative">
      {/* 메인 영역: flex-1과 overflow-y-auto를 통해 내부에서만 스크롤 발생 */}
      <main className="flex-1 overflow-y-auto scroll-container p-4 bg-[#2D4F1E] circuit-bg relative z-10">
        {children}
      </main>

      {/* 하단 네비게이션: flex-shrink-0으로 고정된 크기 유지, absolute 제거 */}
      <nav className="flex-shrink-0 bg-white border-t-2 border-[#E5E4E2] flex justify-around items-center py-3 px-1 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 ${
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

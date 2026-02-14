
import React, { useState } from 'react';
import { Friend } from '../types';

interface FriendsScreenProps {
  friends: Friend[];
  onAddFriend: (idOrPhone: string) => void;
  onCheerFriend: (id: string) => void;
}

const FriendsScreen: React.FC<FriendsScreenProps> = ({ friends, onAddFriend, onCheerFriend }) => {
  const [searchInput, setSearchInput] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onAddFriend(searchInput.trim());
      setSearchInput('');
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn h-full">
      {/* 1. 친구 추가 섹션 */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-2 border-[#1E3614] relative overflow-hidden">
        <h2 className="text-2xl font-black text-[#3D2B1F] mb-1">친구 찾기</h2>
        <p className="text-xs font-bold text-[#3D2B1F66] mb-4 uppercase tracking-widest">Connect with Cohorts</p>
        
        <form onSubmit={handleAdd} className="flex gap-2">
          <input 
            type="text" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ID 또는 전화번호 입력"
            className="flex-1 bg-[#F4F2F0] p-3 rounded-xl border-2 border-transparent focus:border-[#2D4F1E] outline-none text-sm font-bold text-[#3D2B1F]"
          />
          <button 
            type="submit"
            className="bg-[#2D4F1E] text-white px-4 rounded-xl font-black text-sm shadow-[0_2px_0_#1E3614] active:translate-y-0.5 active:shadow-none"
          >
            추가
          </button>
        </form>
      </div>

      {/* 2. 친구 리스트 섹션 */}
      <section className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-3 ml-2">
          <h3 className="text-lg font-black text-white uppercase tracking-tight">FRIENDS COHORT</h3>
          <span className="text-[9px] font-bold text-white/40 mono uppercase tracking-widest">Active nodes</span>
        </div>

        <div className="flex flex-col gap-3">
          {friends.length > 0 ? (
            friends.map((friend) => (
              <div key={friend.id} className="bg-white p-4 rounded-3xl border-2 border-white/10 shadow-sm flex items-center gap-4 group hover:border-[#2D4F1E] transition-all">
                {/* 친구 아바타 및 레벨 */}
                <div className="relative">
                  <div className="w-12 h-12 bg-[#F4F2F0] rounded-2xl flex items-center justify-center text-2xl border-2 border-white group-hover:bg-[#2D4F1E11] transition-colors">
                    {friend.avatar}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-[#2D4F1E] text-white text-[8px] font-black px-1 rounded-full border border-white">
                    v{friend.level}
                  </div>
                </div>

                {/* 친구 정보 */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-[#3D2B1F] text-sm">{friend.nickname}</h4>
                    <span className="text-[9px] font-bold text-orange-500 flex items-center gap-0.5">
                      🔥 {friend.streakCount}
                    </span>
                  </div>
                  
                  {/* 친구의 현재 상태 */}
                  <div className="mt-1 flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full led-blink"></div>
                      <p className="text-[10px] font-bold text-[#2D4F1E] truncate max-w-[150px]">
                        {friend.currentTaskTitle || '시스템 대기 중...'}
                      </p>
                    </div>
                    <p className="text-[8px] font-bold text-[#3D2B1F33] uppercase mt-0.5 ml-3">
                      {friend.lastActive} 활성
                    </p>
                  </div>
                </div>

                {/* 응원 버튼 (Nudge) */}
                <button 
                  onClick={() => onCheerFriend(friend.id)}
                  disabled={friend.cheeredToday}
                  className={`w-10 h-10 rounded-full flex flex-col items-center justify-center transition-all border shadow-sm ${
                    friend.cheeredToday 
                    ? 'bg-[#2D4F1E11] border-[#2D4F1E44] text-[#2D4F1E44] cursor-default' 
                    : 'bg-[#3D2B1F08] border-[#3D2B1F11] hover:bg-[#2D4F1E11] active:scale-90 text-[#3D2B1F]'
                  }`}
                >
                  <span className="text-sm">{friend.cheeredToday ? '✨' : '🙌'}</span>
                  {!friend.cheeredToday && <span className="text-[6px] font-black">+2XP</span>}
                </button>
              </div>
            ))
          ) : (
            <div className="bg-white/5 border-2 border-dashed border-white/10 p-10 rounded-[2.5rem] text-center">
              <p className="text-white/40 font-bold text-sm">추가된 친구가 없습니다.</p>
              <p className="text-white/20 text-[10px] uppercase font-black tracking-widest mt-2">No nodes found in local network</p>
            </div>
          )}
        </div>
      </section>

      {/* 친구들의 성공 통계 (동기부여 섹션) */}
      <div className="bg-[#3D2B1F] p-4 rounded-2xl border-2 border-[#1E3614] flex items-center justify-between shadow-xl">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Cohort Impact</span>
          <p className="text-xs text-white font-bold">내 코호트는 오늘 총 <span className="text-green-400">12개</span>의 퀘스트를 달성했습니다!</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-black text-[#A7C957]">Live</span>
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default FriendsScreen;

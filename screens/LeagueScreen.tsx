
import React from 'react';
import { User, LeagueTier } from '../types';

interface LeagueScreenProps {
  user: User;
}

const LeagueScreen: React.FC<LeagueScreenProps> = ({ user }) => {
  const dummyRankings = [
    { name: '태스크히어로', xp: 3200, avatar: '🥷' },
    { name: '듀오마스터', xp: 2950, avatar: '🦉' },
    { name: '열공맨', xp: 2800, avatar: '👑' },
    { name: `${user.nickname} (나)`, xp: user.totalXP, avatar: '⚡', isUser: true },
    { name: '꾸준함이답', xp: 2100, avatar: '🐢' },
    { name: '할일봇', xp: 1800, avatar: '🤖' },
    { name: '얼리버드', xp: 1500, avatar: '🐦' },
  ].sort((a, b) => b.xp - a.xp);

  const getTierName = (tier: LeagueTier) => {
    switch (tier) {
      case LeagueTier.BRONZE: return '브론즈';
      case LeagueTier.SILVER: return '실버';
      case LeagueTier.GOLD: return '골드';
      case LeagueTier.DIAMOND: return '다이아몬드';
      default: return tier;
    }
  };

  const getTierColor = (tier: LeagueTier) => {
    switch (tier) {
      case LeagueTier.BRONZE: return 'text-orange-300';
      case LeagueTier.SILVER: return 'text-gray-300';
      case LeagueTier.GOLD: return 'text-yellow-400';
      case LeagueTier.DIAMOND: return 'text-blue-300';
      default: return 'text-white';
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn h-full">
      <div className="text-center py-4">
        <div className="text-5xl mb-2">🏆</div>
        <h2 className={`text-3xl font-black uppercase tracking-widest ${getTierColor(user.leagueTier)}`}>
          {getTierName(user.leagueTier)} 리그
        </h2>
        <p className="text-white/60 font-bold mt-1">종료까지 2일 남음 • 상위 3명 승급!</p>
      </div>

      <div className="bg-white rounded-3xl border-2 border-white/10 overflow-hidden shadow-sm flex-1 mb-4">
        <div className="bg-gray-50 p-3 border-b border-gray-100 flex text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <span className="w-10 text-center">순위</span>
          <span className="flex-1 ml-4">라이벌</span>
          <span className="w-20 text-right">주간 XP</span>
        </div>
        <div className="flex flex-col">
          {dummyRankings.map((player, idx) => (
            <div 
              key={player.name} 
              className={`flex items-center p-4 border-b border-gray-50 last:border-0 ${player.isUser ? 'bg-[#2D4F1E11]' : ''}`}
            >
              <div className={`w-10 text-center font-black text-lg ${idx < 3 ? 'text-yellow-500' : 'text-gray-400'}`}>
                {idx + 1}
              </div>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl border-2 border-gray-100 shadow-sm">
                {player.avatar}
              </div>
              <div className="flex-1 ml-4 font-black text-[#3D2B1F] text-sm">
                {player.name}
              </div>
              <div className="w-20 text-right font-black text-gray-400 text-sm">
                {player.xp}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-[#3D2B1F] p-4 rounded-2xl border-2 border-[#1E3614] flex items-center gap-3">
        <span className="text-2xl">⚡</span>
        <p className="text-xs text-white/80 font-bold leading-relaxed">
          현재 <span className="text-white font-black">승급권</span>에 있습니다! 조금만 더 힘내서 다이아몬드 리그로 올라가세요.
        </p>
      </div>
    </div>
  );
};

export default LeagueScreen;

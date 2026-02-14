
import React, { useState } from 'react';
import { User, Badge } from '../types';
import { ALL_BADGES } from '../App.tsx';

interface ProfileScreenProps {
  user: User;
  onUpdateProfile: (nickname: string, avatar: string) => void;
  onAddFeedback: (reflection: string) => Promise<void>;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onUpdateProfile, onAddFeedback }) => {
  const [reflection, setReflection] = useState('');

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 bg-white rounded-[2.5rem] border-4 border-[#1E3614] flex items-center justify-center text-5xl shadow-xl">
          {user.avatar}
        </div>
        <h2 className="text-2xl font-black text-white mt-4">{user.nickname}</h2>
        <div className="flex gap-2 mt-2">
          <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black text-white/60">Lv. {user.level}</span>
          <span className="px-3 py-1 bg-orange-500/20 rounded-full text-[10px] font-black text-orange-400">🔥 {user.streakCount}D</span>
        </div>
      </div>

      {/* 업적 섹션 */}
      <section>
        <h3 className="text-lg font-black text-white mb-3 ml-2 uppercase tracking-tight">Achievements</h3>
        <div className="grid grid-cols-2 gap-3">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = user.unlockedBadges.includes(badge.id);
            return (
              <div key={badge.id} className={`p-4 rounded-3xl border-2 transition-all ${isUnlocked ? 'bg-white border-white shadow-lg' : 'bg-white/5 border-white/10 opacity-30'}`}>
                <div className="text-3xl mb-1">{isUnlocked ? badge.emoji : '🔒'}</div>
                <p className="text-[11px] font-black text-[#3D2B1F] leading-tight">{badge.title}</p>
                <p className="text-[8px] font-bold text-gray-400 mt-1">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI 자가 성찰 */}
      <section className="bg-white p-6 rounded-[2.5rem] border-2 border-[#1E3614]">
        <h4 className="text-sm font-black text-[#3D2B1F] mb-3">오늘의 시스템 성찰 🤖</h4>
        <textarea 
          value={reflection} 
          onChange={(e) => setReflection(e.target.value)}
          placeholder="오늘의 몰입은 어땠나요?"
          className="w-full h-24 p-4 bg-[#F4F2F0] rounded-2xl text-sm font-bold outline-none resize-none"
        />
        <button 
          onClick={() => { onAddFeedback(reflection); setReflection(''); }}
          className="w-full mt-4 py-3 bg-[#2D4F1E] text-white rounded-2xl font-black"
        >
          AI 피드백 받기 ✨
        </button>
      </section>

      {/* 피드백 기록 */}
      <div className="flex flex-col gap-3">
        {user.feedbackHistory.map(entry => (
          <div key={entry.id} className="bg-[#3D2B1F] p-5 rounded-3xl border-2 border-[#1E3614]">
            <p className="text-[11px] text-white/80 italic mb-2">"{entry.userReflection}"</p>
            <div className="flex gap-2 text-xs font-bold text-green-400">
              <span>🤖</span>
              <p>{entry.aiAdvice}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileScreen;

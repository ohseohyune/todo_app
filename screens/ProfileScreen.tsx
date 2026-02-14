
import React, { useState, useRef } from 'react';
import { User, Badge } from '../types';
import { ALL_BADGES } from '../App.tsx';

interface ProfileScreenProps {
  user: User;
  onUpdateProfile: (nickname: string, avatar: string) => void;
  onAddFeedback: (reflection: string) => Promise<void>;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onUpdateProfile, onAddFeedback }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editNickname, setEditNickname] = useState(user.nickname);
  const [editAvatar, setEditAvatar] = useState(user.avatar);
  const [reflection, setReflection] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = () => {
    onUpdateProfile(editNickname, editAvatar);
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitFeedback = async () => {
    if (!reflection.trim()) return;
    setIsSubmittingFeedback(true);
    await onAddFeedback(reflection);
    setReflection('');
    setIsSubmittingFeedback(false);
  };

  const stats = [
    { label: '완료한 단계', value: user.totalCompletedTasks, emoji: '✅' },
    { label: '총 집중 시간', value: `${user.totalFocusMinutes || 0}m`, emoji: '⏳' },
    { label: '최고 스트릭', value: `${user.maxStreak}d`, emoji: '🔥' },
    { label: '저장된 에너지', value: `${user.totalXP} XP`, emoji: '⭐' },
  ];

  const commonEmojis = ['👨‍🚀', '👩‍🎨', '🧠', '🦉', '🌿', '🌱', '🦊', '🐻', '🌈', '⚡'];

  return (
    <div className="flex flex-col gap-6 pb-20 animate-fadeIn">
      {/* 1. Header & Profile Card */}
      <div className="relative bg-white rounded-[2.5rem] p-6 shadow-xl border-4 border-[#1E3614]">
        {isEditing ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div 
                className="w-24 h-24 bg-gray-100 rounded-[2.5rem] border-4 border-dashed border-gray-300 flex items-center justify-center text-5xl overflow-hidden cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {editAvatar.length > 2 ? <img src={editAvatar} className="w-full h-full object-cover" alt="avatar" /> : editAvatar}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-black">EDIT</span>
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {commonEmojis.map(emoji => (
                <button 
                  key={emoji} 
                  onClick={() => setEditAvatar(emoji)}
                  className={`text-2xl p-2 rounded-xl transition-all ${editAvatar === emoji ? 'bg-[#2D4F1E] scale-110' : 'bg-gray-50'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <input 
              type="text" 
              value={editNickname}
              onChange={(e) => setEditNickname(e.target.value)}
              className="w-full p-3 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-[#2D4F1E] outline-none text-center font-black text-xl text-[#3D2B1F]"
              placeholder="닉네임 입력"
            />

            <div className="flex gap-2 w-full mt-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-500 rounded-2xl font-black text-sm"
              >
                취소
              </button>
              <button 
                onClick={handleSaveProfile}
                className="flex-1 py-3 bg-[#2D4F1E] text-white rounded-2xl font-black text-sm shadow-[0_4px_0_#1E3614]"
              >
                저장하기
              </button>
            </div>
          </div>
        ) : (
          <>
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute top-4 right-4 w-10 h-10 bg-[#F4F2F0] rounded-full flex items-center justify-center text-xl shadow-inner active:scale-95"
            >
              ⚙️
            </button>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-[#F4F2F0] rounded-[2.5rem] border-4 border-[#1E3614] flex items-center justify-center text-5xl overflow-hidden shadow-inner">
                {user.avatar.length > 2 ? <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" /> : user.avatar}
              </div>
              <h2 className="text-2xl font-black text-[#3D2B1F] mt-4 tracking-tight">{user.nickname}</h2>
              <div className="flex gap-2 mt-2">
                <span className="px-3 py-1 bg-[#2D4F1E] text-white rounded-full text-[10px] font-black uppercase tracking-wider">Level {user.level}</span>
                <span className="px-3 py-1 bg-orange-500/10 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-wider">🔥 {user.streakCount}D Streak</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              {stats.map(stat => (
                <div key={stat.label} className="bg-[#F4F2F0] p-4 rounded-3xl border-2 border-transparent hover:border-[#2D4F1E55] transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{stat.emoji}</span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <p className="text-xl font-black text-[#3D2B1F]">{stat.value}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 2. AI Learning Loop: Feedback & Reflection */}
      <section className="bg-[#3D2B1F] p-6 rounded-[2.5rem] border-2 border-[#1E3614] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="text-7xl">🧠</span>
        </div>
        
        <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
          성찰과 피드백 <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full">AI LOOP</span>
        </h3>
        <p className="text-white/40 text-xs font-bold mb-4 leading-relaxed">
          오늘의 몰입 경험을 짧게 기록해보세요.<br/>AI가 당신의 활동 패턴을 분석해 조언을 드립니다.
        </p>

        <textarea 
          value={reflection} 
          onChange={(e) => setReflection(e.target.value)}
          placeholder="예: 오늘은 첫 단계를 시작하기가 평소보다 어려웠어. 하지만 한 번 시작하니 30분은 거뜬했지!"
          className="w-full h-32 p-4 bg-white/5 border-2 border-white/10 rounded-3xl text-white text-sm font-bold outline-none focus:border-white/40 resize-none transition-all placeholder:text-white/20"
        />
        
        <button 
          onClick={submitFeedback}
          disabled={isSubmittingFeedback || !reflection.trim()}
          className={`w-full mt-4 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 ${
            isSubmittingFeedback || !reflection.trim()
            ? 'bg-white/10 text-white/20'
            : 'bg-white text-[#3D2B1F] shadow-[0_4px_0_#A7C957]'
          }`}
        >
          {isSubmittingFeedback ? (
            <span className="animate-spin text-2xl">⏳</span>
          ) : (
            <>오늘의 나 성찰하기 ✨</>
          )}
        </button>

        {/* Feedback History List */}
        <div className="mt-8 flex flex-col gap-4">
          {user.feedbackHistory.length > 0 && (
            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1 ml-1">최근 러닝 기록</div>
          )}
          {user.feedbackHistory.map((entry, idx) => (
            <div key={entry.id} className="bg-white/5 border border-white/10 rounded-3xl p-5 animate-slideUp">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-white/40">{entry.date}</span>
                <span className="text-[10px] font-black text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full uppercase">Insight #{user.feedbackHistory.length - idx}</span>
              </div>
              <p className="text-xs text-white/70 italic leading-relaxed mb-4 border-l-2 border-white/10 pl-3">
                "{entry.userReflection}"
              </p>
              <div className="bg-white/10 p-4 rounded-2xl flex gap-3">
                <span className="text-xl">🤖</span>
                <p className="text-xs font-bold text-white leading-relaxed">{entry.aiAdvice}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Achievements Section */}
      <section>
        <div className="flex justify-between items-center mb-4 ml-2">
          <h3 className="text-lg font-black text-white uppercase tracking-tight">Achievements</h3>
          <span className="text-[9px] font-bold text-white/40 uppercase mono">{user.unlockedBadges.length} / {ALL_BADGES.length} UNLOCKED</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = user.unlockedBadges.includes(badge.id);
            return (
              <div 
                key={badge.id} 
                className={`p-5 rounded-[2rem] border-2 transition-all relative overflow-hidden group ${
                  isUnlocked 
                  ? 'bg-white border-white shadow-xl scale-100' 
                  : 'bg-white/5 border-white/10 opacity-30 grayscale'
                }`}
              >
                <div className="text-4xl mb-2 transition-transform group-hover:scale-110">{isUnlocked ? badge.emoji : '🔒'}</div>
                <p className={`text-xs font-black leading-tight ${isUnlocked ? 'text-[#3D2B1F]' : 'text-white'}`}>{badge.title}</p>
                <p className={`text-[8px] font-bold mt-1 leading-tight ${isUnlocked ? 'text-gray-400' : 'text-white/20'}`}>{badge.description}</p>
                {isUnlocked && <div className="absolute -right-2 -bottom-2 text-4xl opacity-5 pointer-events-none">{badge.emoji}</div>}
              </div>
            );
          })}
        </div>
      </section>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.5s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </div>
  );
};

export default ProfileScreen;

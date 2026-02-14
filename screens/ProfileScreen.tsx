
import React, { useState } from 'react';
import { User, FeedbackEntry } from '../types';

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

  const stats = [
    { label: '완료한 스텝 ✅', value: '42', color: 'text-[#2D4F1E]' },
    { label: '최장 연속 가동 🔥', value: `${user.streakCount}일`, color: 'text-[#2D4F1E]' },
    { label: '받은 에너지 🙌', value: `${user.receivedCheers}`, color: 'text-[#3D2B1F]' },
    { label: '저장된 에너지 🔋', value: user.totalXP.toLocaleString(), color: 'text-[#3D2B1F]' },
  ];

  const handleSaveProfile = () => {
    onUpdateProfile(editNickname, editAvatar);
    setIsEditing(false);
  };

  const handleSubmitFeedback = async () => {
    if (!reflection.trim()) return;
    setIsSubmittingFeedback(true);
    await onAddFeedback(reflection);
    setReflection('');
    setIsSubmittingFeedback(false);
  };

  return (
    <div className="flex flex-col gap-8 animate-fadeIn pb-10">
      {/* 프로필 상단 섹션 */}
      <div className="flex flex-col items-center">
        {isEditing ? (
          <div className="bg-white p-6 rounded-[2.5rem] border-2 border-white/20 shadow-xl w-full max-w-sm flex flex-col gap-4">
            <h3 className="text-xl font-black text-[#3D2B1F] text-center">프로필 편집</h3>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-[#3D2B1F44] uppercase tracking-widest ml-1">아바타 (이모지)</label>
              <input 
                type="text" 
                value={editAvatar}
                onChange={(e) => setEditAvatar(e.target.value)}
                className="p-3 bg-[#F4F2F0] rounded-xl outline-none text-2xl text-center"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-[#3D2B1F44] uppercase tracking-widest ml-1">닉네임</label>
              <input 
                type="text" 
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                className="p-3 bg-[#F4F2F0] rounded-xl outline-none font-bold text-[#3D2B1F]"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 rounded-xl font-bold text-gray-400"
              >
                취소
              </button>
              <button 
                onClick={handleSaveProfile}
                className="flex-1 py-2 bg-[#2D4F1E] text-white rounded-xl font-black"
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative group">
              <div className="w-24 h-24 bg-white rounded-[2.5rem] border-4 border-[#1E3614] shadow-lg flex items-center justify-center text-5xl relative overflow-hidden transition-transform group-hover:scale-105">
                {user.avatar}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white w-7 h-7 rounded-full border-4 border-[#2D4F1E] shadow-sm flex items-center justify-center text-[10px] text-[#2D4F1E] font-black">
                v{user.level}
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute -top-1 -right-1 bg-[#3D2B1F] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✏️
              </button>
            </div>
            <h2 className="text-2xl font-black text-white mt-4 tracking-tight">{user.nickname}</h2>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-1">시스템 아키텍트</p>
          </>
        )}
      </div>

      {/* 통계 섹션 */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-5 rounded-3xl border-2 border-white/10 flex flex-col group hover:border-[#2D4F1E] transition-all active:scale-95 shadow-lg">
            <span className={`text-2xl font-black ${stat.color} mb-1 tracking-tighter`}>{stat.value}</span>
            <span className="text-[10px] font-black text-[#3D2B1F44] uppercase tracking-tighter">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* AI 자가 피드백 섹션 */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center ml-2">
          <h3 className="text-lg font-black text-white uppercase tracking-tight">System Reflection</h3>
          <span className="text-[9px] font-bold text-white/40 mono uppercase tracking-widest">Self-Feedback Loop</span>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-[#1E3614] shadow-xl">
          <h4 className="text-sm font-black text-[#3D2B1F] mb-3">오늘의 시스템 가동은 어땠나요?</h4>
          <textarea 
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="예: 오늘 계획했던 퀘스트를 대부분 완료해서 뿌듯해요. 하지만 오후에는 조금 집중력이 떨어졌어요."
            className="w-full h-24 p-4 bg-[#F4F2F0] rounded-2xl outline-none text-sm font-bold text-[#3D2B1F] placeholder:text-gray-300 resize-none"
          />
          <button 
            onClick={handleSubmitFeedback}
            disabled={isSubmittingFeedback || !reflection.trim()}
            className={`w-full mt-4 py-3 rounded-2xl font-black text-white transition-all border-b-4 ${
              isSubmittingFeedback || !reflection.trim() 
              ? 'bg-gray-300 border-gray-400 cursor-not-allowed' 
              : 'bg-[#2D4F1E] border-[#1E3614] hover:brightness-110 active:translate-y-1 active:shadow-none'
            }`}
          >
            {isSubmittingFeedback ? '분석 중...' : 'AI 인사이트 받기 ✨'}
          </button>
        </div>

        {/* 피드백 히스토리 */}
        <div className="flex flex-col gap-3 mt-2">
          {user.feedbackHistory.map((entry) => (
            <div key={entry.id} className="bg-[#3D2B1F] p-5 rounded-3xl border-2 border-[#1E3614] shadow-lg animate-slideDown">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-white/40 mono uppercase tracking-widest">{entry.date}</span>
                <span className="text-[10px] font-black text-green-400 mono uppercase">Ref: Log_OK</span>
              </div>
              <div className="flex flex-col gap-4">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <p className="text-[11px] text-white/80 italic">"{entry.userReflection}"</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl">🤖</span>
                  <div className="flex-1">
                    <p className="text-xs text-green-400 font-bold leading-relaxed">
                      {entry.aiAdvice}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {user.feedbackHistory.length === 0 && (
            <div className="text-center p-6 border-2 border-dashed border-white/10 rounded-3xl">
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest">기록된 피드백이 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* 시스템 로그 요약 */}
      <div className="bg-[#3D2B1F] p-6 rounded-[2.5rem] border-2 border-[#1E3614] relative overflow-hidden shadow-xl mt-4">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="text-7xl text-white font-black">{"{ }"}</span>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full led-blink"></div>
            <h4 className="font-black text-green-400 text-[10px] uppercase tracking-[0.3em]">Core_System.log</h4>
          </div>
          <p className="text-[10px] text-white/60 leading-relaxed font-bold">
            [안내] 완벽한 계획보다는 지속 가능한 엔진 가동이 중요합니다. <br/>
            [상태] 현재 피로도 외란 감지기 가동 중. <br/>
            [메시지] 오늘도 작은 스텝으로 시스템 오차를 줄여보세요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;

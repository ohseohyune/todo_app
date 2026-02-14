
import React, { useState, useRef } from 'react';
import { User, MacroTask, MicroTask, DailyQuest, Friend } from '../types';

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

  const stats = [
    { label: '완료한 퀘스트 ✅', value: user.totalCompletedTasks.toString(), color: 'text-[#2D4F1E]' },
    { label: '현재 스트릭 🔥', value: `${user.streakCount}일`, color: 'text-[#2D4F1E]' },
    { label: '최고 스트릭 🏆', value: `${user.maxStreak || user.streakCount}일`, color: 'text-[#3D2B1F]' },
    { label: '누적 에너지 🔋', value: user.totalXP.toLocaleString(), color: 'text-[#3D2B1F]' },
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

  const handleResetData = () => {
    if (window.confirm("정말로 모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // 데이터 백업 (파일 다운로드)
  const handleExportData = () => {
    const data = localStorage.getItem('quest_todo_data_v2');
    if (!data) {
      alert("백업할 데이터가 없습니다.");
      return;
    }
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quest_todo_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 데이터 복구 (파일 업로드)
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        JSON.parse(content); // 유효한 JSON인지 검증
        localStorage.setItem('quest_todo_data_v2', content);
        alert("데이터 복구가 완료되었습니다. 앱을 재시작합니다.");
        window.location.reload();
      } catch (err) {
        alert("유효하지 않은 백업 파일입니다.");
      }
    };
    reader.readAsText(file);
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
              <button onClick={() => setIsEditing(false)} className="flex-1 py-2 rounded-xl font-bold text-gray-400">취소</button>
              <button onClick={handleSaveProfile} className="flex-1 py-2 bg-[#2D4F1E] text-white rounded-xl font-black">저장</button>
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
          <div key={stat.label} className="bg-white p-5 rounded-3xl border-2 border-white/10 flex flex-col active:scale-95 shadow-lg">
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
            placeholder="예: 오늘 계획했던 퀘스트를 대부분 완료해서 뿌듯해요."
            className="w-full h-24 p-4 bg-[#F4F2F0] rounded-2xl outline-none text-sm font-bold text-[#3D2B1F] resize-none"
          />
          <button 
            onClick={handleSubmitFeedback}
            disabled={isSubmittingFeedback || !reflection.trim()}
            className="w-full mt-4 py-3 rounded-2xl font-black text-white bg-[#2D4F1E] border-b-4 border-[#1E3614] disabled:bg-gray-300 disabled:border-gray-400"
          >
            {isSubmittingFeedback ? '분석 중...' : 'AI 인사이트 받기 ✨'}
          </button>
        </div>

        {/* 피드백 히스토리 */}
        <div className="flex flex-col gap-3 mt-2">
          {user.feedbackHistory.map((entry) => (
            <div key={entry.id} className="bg-[#3D2B1F] p-5 rounded-3xl border-2 border-[#1E3614] shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-white/40 mono uppercase tracking-widest">{entry.date}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 mb-3">
                <p className="text-[11px] text-white/80 italic">"{entry.userReflection}"</p>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">🤖</span>
                <p className="text-xs text-green-400 font-bold leading-relaxed">{entry.aiAdvice}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 데이터 관리 섹션 */}
      <section className="bg-white/10 p-6 rounded-[2.5rem] border-2 border-white/10 mt-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">데이터 금고</h3>
          <span className="flex items-center gap-1">
             <span className="w-2 h-2 bg-green-500 rounded-full led-blink"></span>
             <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Local Active</span>
          </span>
        </div>
        
        <p className="text-[11px] text-white/60 font-bold mb-4 leading-relaxed">
          모든 데이터는 브라우저에 자동 저장됩니다. 기기를 옮기거나 브라우저를 초기화할 계획이라면 백업 파일을 만드세요.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleExportData}
            className="bg-white text-[#2D4F1E] py-3 rounded-xl font-black text-xs border-b-4 border-gray-200 active:translate-y-1 active:border-b-0 transition-all"
          >
            💾 데이터 내보내기
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#3D2B1F] text-white py-3 rounded-xl font-black text-xs border-b-4 border-[#1E3614] active:translate-y-1 active:border-b-0 transition-all"
          >
            📂 데이터 가져오기
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportData} 
            accept=".json" 
            className="hidden" 
          />
        </div>

        <button 
          onClick={handleResetData}
          className="w-full mt-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-red-400 transition-colors"
        >
          [!] Reset System Data
        </button>
      </section>
    </div>
  );
};

export default ProfileScreen;

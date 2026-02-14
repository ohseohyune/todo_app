
import React, { useState, useEffect } from 'react';
import { User, MicroTask, DailyQuest, TaskStatus } from '../types';

interface HomeScreenProps {
  user: User;
  microTasks: MicroTask[];
  dailyQuests: DailyQuest[];
  onStartQuest: (task: MicroTask) => void;
  onMoveTask: (id: string, direction: 'up' | 'down') => void;
  cheerNotification?: string | null;
  onClearNotification?: () => void;
  onGoToTab?: (tab: string) => void;
  onResetQuests?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ user, microTasks, dailyQuests, onStartQuest, onMoveTask, cheerNotification, onClearNotification, onGoToTab, onResetQuests }) => {
  const [resetConfirmMode, setResetConfirmMode] = useState(false);

  useEffect(() => {
    let timer: any;
    if (resetConfirmMode) {
      timer = setTimeout(() => setResetConfirmMode(false), 2000);
    }
    return () => clearTimeout(timer);
  }, [resetConfirmMode]);

  const handleResetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!resetConfirmMode) {
      setResetConfirmMode(true);
    } else {
      if (onResetQuests) {
        onResetQuests();
        setResetConfirmMode(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      {cheerNotification && (
        <div className="bg-[#3D2B1F] p-4 rounded-3xl border-2 border-[#A7C957] shadow-lg flex items-center justify-between">
          <p className="text-xs font-black text-white">{cheerNotification}</p>
          <button onClick={onClearNotification} className="text-white text-xl px-2">×</button>
        </div>
      )}

      {/* 상태 대시보드 */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-2 border-[#1E3614]">
        <div className="flex items-center gap-4 mb-3">
          <div className="text-4xl">{user.avatar}</div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-[#3D2B1F]">{user.nickname}</h2>
            <p className="text-[10px] font-bold text-[#2D4F1E] uppercase">LV {user.level} • {user.streakCount}D STREAK</p>
          </div>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#A7C957]" style={{ width: `${(user.totalXP % 1000) / 10}%` }}></div>
        </div>
      </div>

      {/* 데일리 퀘스트 & 리셋 버튼 */}
      <section className="bg-white/10 p-5 rounded-[2.5rem] border-2 border-white/10 relative">
        <div className="flex justify-between items-center mb-4 relative z-50">
          <h3 className="text-xs font-black text-white uppercase tracking-widest">Daily Quests</h3>
          <button 
            type="button"
            onClick={handleResetClick}
            className={`text-[9px] font-black px-4 py-2 rounded-full transition-all duration-200 border-2 shadow-[0_4px_0_#1E3614] active:translate-y-1 active:shadow-none pointer-events-auto z-[100] ${
              resetConfirmMode ? 'bg-red-500 border-white text-white scale-110' : 'bg-[#A7C957] border-[#1E3614] text-[#1E3614]'
            }`}
          >
            {resetConfirmMode ? "⚠️ 진짜 삭제?" : "🔄 퀘스트 리셋"}
          </button>
        </div>
        <div className="space-y-3">
          {dailyQuests.map(q => (
            <div key={q.id} className={`flex items-center gap-3 p-3 rounded-2xl ${q.completed ? 'bg-green-500/20' : 'bg-white/5'}`}>
              <div className="flex-1">
                <p className={`text-[11px] font-bold ${q.completed ? 'text-green-400 line-through' : 'text-white'}`}>{q.title}</p>
                <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${(q.currentValue / q.targetValue) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 액티브 퀘스트 리스트 */}
      <section>
        <div className="flex justify-between items-center mb-3 ml-2">
          <h3 className="text-lg font-black text-white uppercase tracking-tight">Active Quests</h3>
        </div>
        <div className="flex flex-col gap-2">
          {microTasks.length > 0 ? microTasks.map((task) => (
            <div key={task.id} className={`flex items-center gap-4 p-4 rounded-3xl transition-all ${task.status === TaskStatus.DONE ? 'opacity-40 bg-white/10' : 'bg-white'}`}>
              <div className="flex-1">
                <p className={`text-sm font-black ${task.status === TaskStatus.DONE ? 'line-through text-white' : 'text-[#3D2B1F]'}`}>{task.title}</p>
                <span className="text-[9px] font-bold text-[#2D4F1E] opacity-60 uppercase">{task.durationEstMin}분 예상</span>
              </div>
              {task.status === TaskStatus.TODO && (
                <button onClick={() => onStartQuest(task)} className="bg-[#2D4F1E] text-white px-5 py-2 rounded-2xl font-black text-xs shadow-[0_3px_0_#1E3614] active:translate-y-1 active:shadow-none">시작</button>
              )}
              {task.status === TaskStatus.DONE && <div className="text-xl">✅</div>}
            </div>
          )) : (
            <div className="p-10 border-4 border-dashed border-white/5 rounded-[2.5rem] text-center text-white/20 font-black">
              새로운 목표를 추가하세요!
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;

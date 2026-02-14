
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
  const reflectionQuest = dailyQuests.find(q => q.id === 'q3');
  const isReflectionDone = reflectionQuest?.completed;

  // 2단계 리셋 확인 상태
  const [resetConfirmMode, setResetConfirmMode] = useState(false);

  useEffect(() => {
    let timer: any;
    if (resetConfirmMode) {
      // 3초 후 확인 모드 자동 해제
      timer = setTimeout(() => setResetConfirmMode(false), 3000);
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
        <div className="bg-[#3D2B1F] p-4 rounded-3xl border-2 border-[#A7C957] shadow-lg flex items-center justify-between animate-bounce-short">
          <p className="text-xs font-black text-white">{cheerNotification}</p>
          <button onClick={onClearNotification} className="text-white/40 text-xl px-2">×</button>
        </div>
      )}

      {/* 상태 대시보드 */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-2 border-[#1E3614]">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl">🌿🤖</div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-[#3D2B1F]">{user.nickname}</h2>
            <div className="flex gap-2">
              <p className="text-[10px] font-bold text-[#2D4F1E] uppercase">LV {user.level} • {user.streakCount}D STREAK</p>
              {user.recentAccuracyRatio !== 1.0 && (
                <p className={`text-[10px] font-bold uppercase ${user.recentAccuracyRatio! > 1.1 ? 'text-red-500' : 'text-blue-500'}`}>
                   • {Math.round(user.recentAccuracyRatio! * 100)}% SPEED
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500" style={{ width: `${(user.totalXP % 1000) / 10}%` }}></div>
        </div>
      </div>

      {/* 데일리 퀘스트 섹션 (강화된 리셋 버튼) */}
      <section className="bg-white/10 p-5 rounded-[2.5rem] border-2 border-white/10 relative">
        <div className="flex justify-between items-center mb-4 relative z-[60]">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Daily Quests</h3>
          </div>
          <button 
            type="button"
            onClick={handleResetClick}
            className={`text-[10px] font-black px-4 py-2 rounded-full transition-all duration-300 shadow-[0_4px_0_#1E3614] active:translate-y-1 active:shadow-none pointer-events-auto cursor-pointer ${
              resetConfirmMode 
              ? 'bg-red-500 text-white animate-pulse scale-110' 
              : 'bg-[#A7C957] text-[#1E3614]'
            }`}
          >
            {resetConfirmMode ? "⚠️ 진짜 리셋?" : "🔄 퀘스트 리셋"}
          </button>
        </div>
        <div className="space-y-3 relative z-10">
          {dailyQuests.map(q => (
            <div key={q.id} className={`flex items-center gap-3 p-3 rounded-2xl ${q.completed ? 'bg-green-500/20' : 'bg-white/5'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${q.completed ? 'bg-green-500 text-white' : 'bg-white/10 text-white/40'}`}>
                {q.completed ? '✓' : ''}
              </div>
              <div className="flex-1">
                <p className={`text-[11px] font-bold ${q.completed ? 'text-green-400 line-through' : 'text-white'}`}>{q.title}</p>
                <div className="h-1.5 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${q.completed ? 'bg-green-500' : 'bg-white/30'}`} 
                    style={{ width: `${(q.currentValue / q.targetValue) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-[10px] font-black text-white/40">{q.currentValue}/{q.targetValue}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 성찰 알림 */}
      {!isReflectionDone && (
        <button 
          onClick={() => onGoToTab?.('profile')}
          className="bg-[#3D2B1F] p-6 rounded-[2.5rem] border-2 border-[#A7C957] text-left shadow-lg group active:scale-95 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl group-hover:rotate-12 transition-transform">🧠</div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-white">오늘의 나를 돌아볼 시간입니다</h4>
              <p className="text-[10px] font-bold text-white/40 mt-1">성찰을 기록하고 AI 코치의 분석을 받아보세요 ✨</p>
            </div>
            <div className="text-[#A7C957] text-xl">→</div>
          </div>
        </button>
      )}

      {/* 퀘스트 리스트 */}
      <section>
        <div className="flex justify-between items-center mb-3 ml-2">
          <h3 className="text-lg font-black text-white uppercase tracking-tight">Active Quests</h3>
          <span className="text-[9px] font-bold text-white/40 uppercase">Learn from your speed</span>
        </div>
        <div className="flex flex-col gap-2">
          {microTasks.length > 0 ? microTasks.map((task, idx) => (
            <div key={task.id} className={`flex items-center gap-4 p-4 rounded-3xl transition-all ${task.status === TaskStatus.DONE ? 'opacity-50 bg-white/10' : 'bg-white shadow-md'}`}>
              <div className="flex-1">
                <p className={`text-sm font-black ${task.status === TaskStatus.DONE ? 'line-through text-white/60' : 'text-[#3D2B1F]'}`}>{task.title}</p>
                <div className="flex gap-2 mt-1">
                   <span className="text-[9px] font-bold text-green-600 opacity-60 uppercase">예상: {task.durationEstMin}분</span>
                   {task.status === TaskStatus.DONE && task.actualDurationMin && (
                     <span className={`text-[9px] font-black uppercase ${task.actualDurationMin > task.durationEstMin ? 'text-orange-500' : 'text-blue-500'}`}>
                       실제: {task.actualDurationMin}분 ({Math.round((task.actualDurationMin/task.durationEstMin)*100)}%)
                     </span>
                   )}
                </div>
              </div>
              {task.status === TaskStatus.TODO && (
                <button onClick={() => onStartQuest(task)} className="bg-[#2D4F1E] text-white px-5 py-2 rounded-2xl font-black text-xs shadow-[0_3px_0_#1E3614] active:translate-y-1 active:shadow-none transition-all">시작</button>
              )}
              {task.status === TaskStatus.DONE && <div className="text-xl">✅</div>}
            </div>
          )) : (
            <div className="p-10 border-4 border-dashed border-white/10 rounded-[2.5rem] text-center text-white/40 font-black">
              새로운 퀘스트를 추가하세요!
            </div>
          )}
        </div>
      </section>

      {/* 오늘의 정원 */}
      <section className="bg-white/10 p-5 rounded-[2.5rem] border-2 border-white/10">
        <h3 className="text-xs font-black text-white uppercase mb-4">마음의 정원 ({user.garden.length}/12)</h3>
        <div className="grid grid-cols-4 gap-3 bg-[#1E361444] p-4 rounded-3xl">
          {Array(12).fill(null).map((_, i) => {
            const plant = user.garden.find(p => p.position === i);
            return (
              <div key={i} className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center text-2xl">
                {plant ? plant.type : <span className="opacity-10 text-sm">🕳️</span>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;

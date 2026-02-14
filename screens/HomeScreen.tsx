
import React from 'react';
import { User, MicroTask, DailyQuest, TaskStatus } from '../types';

interface HomeScreenProps {
  user: User;
  microTasks: MicroTask[];
  dailyQuests: DailyQuest[];
  onStartQuest: (task: MicroTask) => void;
  onMoveTask: (id: string, direction: 'up' | 'down') => void;
  cheerNotification?: string | null;
  onClearNotification?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ user, microTasks, dailyQuests, onStartQuest, onMoveTask, cheerNotification, onClearNotification }) => {
  const nextTask = microTasks.find(t => t.status === TaskStatus.TODO);

  return (
    <div className="flex flex-col gap-6 pb-10">
      {cheerNotification && (
        <div className="bg-[#3D2B1F] p-4 rounded-3xl border-2 border-[#A7C957] shadow-lg flex items-center justify-between animate-bounce-short">
          <p className="text-xs font-black text-white">{cheerNotification}</p>
          <button onClick={onClearNotification} className="text-white/40 text-xl">×</button>
        </div>
      )}

      {/* 상태 대시보드 */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-2 border-[#1E3614]">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl">🌿🤖</div>
          <div>
            <h2 className="text-xl font-black text-[#3D2B1F]">{user.nickname}</h2>
            <p className="text-[10px] font-bold text-[#2D4F1E] uppercase">LEVEL {user.level} • STREAK {user.streakCount}D</p>
          </div>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500" style={{ width: `${(user.totalXP % 1000) / 10}%` }}></div>
        </div>
      </div>

      {/* 퀘스트 리스트 + 순서 변경 */}
      <section>
        <div className="flex justify-between items-center mb-3 ml-2">
          <h3 className="text-lg font-black text-white uppercase tracking-tight">Quest List</h3>
          <span className="text-[9px] font-bold text-white/40 uppercase">Reorder Active</span>
        </div>
        <div className="flex flex-col gap-2">
          {microTasks.length > 0 ? microTasks.map((task, idx) => (
            <div key={task.id} className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${task.status === TaskStatus.DONE ? 'opacity-40 bg-white/5' : 'bg-white shadow-md'}`}>
              <div className="flex flex-col gap-1">
                <button onClick={() => onMoveTask(task.id, 'up')} className="text-[10px] opacity-30 hover:opacity-100">▲</button>
                <button onClick={() => onMoveTask(task.id, 'down')} className="text-[10px] opacity-30 hover:opacity-100">▼</button>
              </div>
              <div className="flex-1">
                <p className={`text-sm font-black ${task.status === TaskStatus.DONE ? 'line-through text-white/60' : 'text-[#3D2B1F]'}`}>{task.title}</p>
                <span className="text-[9px] font-bold text-green-600 opacity-60">{task.durationEstMin}m • {task.category}</span>
              </div>
              {task.status === TaskStatus.TODO && (
                <button onClick={() => onStartQuest(task)} className="bg-[#2D4F1E] text-white px-3 py-1 rounded-xl font-black text-[10px]">시작</button>
              )}
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

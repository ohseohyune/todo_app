
import React from 'react';
import { User, MicroTask, DailyQuest, TaskStatus } from '../types';

interface HomeScreenProps {
  user: User;
  microTasks: MicroTask[];
  dailyQuests: DailyQuest[];
  onStartQuest: (task: MicroTask) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ user, microTasks, dailyQuests, onStartQuest }) => {
  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* 유저 상태 */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-[#1E3614]">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl">{user.avatar}</div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-[#3D2B1F]">{user.nickname}</h2>
            <div className="flex gap-2 text-[10px] font-bold text-[#2D4F1E] uppercase">
              <span>LV {user.level}</span>
              <span>🔥 {user.streakCount}일 스트릭</span>
            </div>
          </div>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          <div className="h-full bg-[#A7C957] transition-all duration-1000" style={{ width: `${(user.totalXP % 1000) / 10}%` }}></div>
        </div>
        {user.recentAccuracyRatio !== 1 && (
          <p className="mt-3 text-[9px] font-black text-gray-400 text-center uppercase tracking-widest">
            집중 효율 지표: {Math.round(user.recentAccuracyRatio * 100)}% 📊
          </p>
        )}
      </div>

      {/* 데일리 퀘스트 */}
      <section className="bg-white/10 p-5 rounded-[2rem] border-2 border-white/10">
        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">Daily Quests</h3>
        <div className="space-y-3">
          {dailyQuests.map(q => (
            <div key={q.id} className={`p-3 rounded-2xl flex items-center gap-3 ${q.completed ? 'bg-green-500/20' : 'bg-white/5'}`}>
              <div className="flex-1">
                <p className={`text-[11px] font-bold ${q.completed ? 'text-green-400 line-through' : 'text-white'}`}>{q.title}</p>
                <div className="h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${(q.currentValue / q.targetValue) * 100}%` }} />
                </div>
              </div>
              {q.completed && <span className="text-lg">✅</span>}
            </div>
          ))}
        </div>
      </section>

      {/* 퀘스트 목록 */}
      <section>
        <h3 className="text-lg font-black text-white uppercase tracking-tight mb-3 ml-2">Active Quests</h3>
        <div className="flex flex-col gap-3">
          {microTasks.filter(t => t.status !== TaskStatus.DONE).map((task) => (
            <div key={task.id} className="bg-white p-5 rounded-[2rem] shadow-lg flex items-center gap-4">
              <div className="flex-1">
                <h4 className="font-black text-[#3D2B1F] text-sm">{task.title}</h4>
                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">예상 몰입 시간: {task.durationEstMin}분</p>
              </div>
              <button onClick={() => onStartQuest(task)} className="bg-[#2D4F1E] text-white px-6 py-2.5 rounded-2xl font-black text-xs shadow-[0_4px_0_#1E3614] active:translate-y-1 active:shadow-none">시작</button>
            </div>
          ))}
          
          {/* 완료된 항목 */}
          {microTasks.filter(t => t.status === TaskStatus.DONE).map((task) => (
            <div key={task.id} className="bg-white/10 p-4 rounded-2xl flex items-center gap-4 opacity-50">
              <div className="flex-1">
                <p className="text-sm font-bold text-white line-through">{task.title}</p>
                <p className="text-[9px] font-black text-green-400 uppercase">실제 {task.actualDurationMin}분 소요</p>
              </div>
              <div className="text-xl">✅</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;

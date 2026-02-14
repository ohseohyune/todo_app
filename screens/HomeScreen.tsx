
import React, { useState } from 'react';
import { User, MicroTask, DailyQuest, TaskStatus } from '../types';

interface HomeScreenProps {
  user: User;
  microTasks: MicroTask[];
  dailyQuests: DailyQuest[];
  onStartQuest: (task: MicroTask) => void;
  cheerNotification?: string | null;
  onClearNotification?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
  user, 
  microTasks, 
  dailyQuests, 
  onStartQuest, 
  cheerNotification,
  onClearNotification 
}) => {
  const xpInLevel = user.totalXP % 1000;
  const progressPercent = (xpInLevel / 1000) * 100;

  const droidEmoji = user.streakCount > 0 ? '🌿🤖' : '🧘‍♂️🤖';
  
  const getMindfulMessage = () => {
    const messages = [
      "결과라는 부담은 잠시 내려놓고, 지금 이 순간의 호흡에 집중해 보세요. 숨을 크게 들이마시고, 진짜 중요한 것 하나만 천천히 시작해볼까요?",
      "완벽하지 않아도 괜찮아요. 거창한 목표보다는 오늘 내딛는 한 걸음이 더 소중합니다. 힘을 빼고 편안하게 움직여보세요.",
      "무엇이 정말 중요한지 생각하며 깊게 숨을 쉬어보세요. 결과는 과정 끝에 자연스럽게 따라오는 선물일 뿐입니다.",
      "지금 이 과정 자체가 당신의 성장입니다. 조급함이 찾아오면 잠시 눈을 감고 호흡을 고른 뒤, 가장 작은 것부터 챙겨봐요."
    ];
    return messages[user.streakCount % messages.length];
  };

  const nextTask = microTasks.find(t => t.status === TaskStatus.TODO);

  // 정원 그리드 생성 (3x4)
  const gardenGrid = Array(12).fill(null);
  user.garden.forEach(plant => {
    if (plant.position < 12) {
      gardenGrid[plant.position] = plant;
    }
  });

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-10">
      {/* 응원 알림 배너 */}
      {cheerNotification && (
        <div className="bg-[#3D2B1F] p-4 rounded-3xl border-2 border-[#A7C957] shadow-lg animate-bounce-short flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">🙌</span>
            <p className="text-xs font-black text-white leading-tight">{cheerNotification}</p>
          </div>
          <button onClick={onClearNotification} className="text-white/40 hover:text-white transition-colors">
            <span className="text-xl">×</span>
          </button>
        </div>
      )}

      {/* 1. 상단 캐릭터 섹션 */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-2 border-[#1E3614] relative overflow-hidden">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-1 drop-shadow-sm">{droidEmoji}</div>
            <div className="w-2 h-2 bg-[#2D4F1E] rounded-full led-blink shadow-[0_0_8px_rgba(45,79,30,0.6)]"></div>
          </div>
          <div className="flex-1 pt-1 pr-4">
            <div className="bg-[#F4F2F0] p-4 rounded-3xl rounded-tl-none border border-[#3D2B1F11] relative">
              <p className="text-sm font-bold text-[#3D2B1F] leading-relaxed">
                {getMindfulMessage()}
              </p>
              <div className="absolute -left-2 top-0 w-0 h-0 border-t-[8px] border-t-[#F4F2F0] border-l-[8px] border-l-transparent"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#2D4F1E08] p-3 rounded-2xl border-2 border-[#2D4F1E11] flex flex-col items-center">
            <span className="text-xl mb-1">🔥</span>
            <span className="text-sm font-black text-[#2D4F1E] leading-none">{user.streakCount}일</span>
            <span className="text-[9px] font-bold text-[#2D4F1E44] uppercase mt-1 italic">Process</span>
          </div>
          <div className="bg-[#3D2B1F08] p-3 rounded-2xl border-2 border-[#3D2B1F11] flex flex-col items-center">
            <span className="text-xl mb-1">⭐</span>
            <span className="text-sm font-black text-[#3D2B1F] leading-none">{user.totalXP}</span>
            <span className="text-[9px] font-bold text-[#3D2B1F44] uppercase mt-1 italic">Energy</span>
          </div>
          <div className="bg-[#2D4F1E08] p-3 rounded-2xl border-2 border-[#2D4F1E11] flex flex-col items-center">
            <span className="text-xl mb-1">🧘</span>
            <span className="text-sm font-black text-[#2D4F1E] leading-none">{progressPercent.toFixed(0)}%</span>
            <span className="text-[9px] font-bold text-[#2D4F1E44] uppercase mt-1 italic">Balance</span>
          </div>
        </div>
      </div>

      {/* 마음의 정원 섹션 */}
      <section className="bg-white/10 p-5 rounded-[2.5rem] border-2 border-white/10 overflow-hidden">
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">마음의 정원</h3>
          <div className="flex gap-1">
            <span className="text-[8px] font-bold text-white/60">🌳업무</span>
            <span className="text-[8px] font-bold text-white/60">🌸공부</span>
            <span className="text-[8px] font-bold text-white/60">🌵건강</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 bg-[#1E361444] p-4 rounded-3xl border border-white/5 shadow-inner">
          {gardenGrid.map((item, i) => (
            <div key={i} className="aspect-square bg-[#F4F2F008] rounded-2xl border border-white/5 flex flex-col items-center justify-center relative group transition-all hover:bg-white/10">
              {item ? (
                <>
                  <span className="text-2xl transition-transform group-hover:scale-125 z-10">{item.type}</span>
                  <div className="absolute -bottom-1 text-[6px] font-black text-white/30 uppercase tracking-tighter hidden group-hover:block">
                    {item.category}
                  </div>
                </>
              ) : (
                <span className="text-[10px] opacity-10">🕳️</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-center text-white/30 font-bold mt-4 uppercase tracking-widest">
          카테고리별 활동이 각기 다른 생명을 피워냅니다
        </p>
      </section>

      {/* 2. CONTROL OBJECTIVES */}
      <section>
        <div className="flex justify-between items-center mb-3 ml-2">
          <h3 className="text-lg font-black text-white uppercase tracking-tight">Today's Presence</h3>
          <span className="text-[9px] font-bold text-white/40 mono uppercase tracking-widest">Continuous Journey</span>
        </div>
        
        <div className="flex flex-col gap-2">
          {dailyQuests.map((quest) => (
            <div key={quest.id} className="bg-white p-3 rounded-2xl border-2 border-white/10 flex items-center gap-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${quest.completed ? 'bg-[#2D4F1E11] text-[#2D4F1E]' : 'bg-[#3D2B1F11] text-[#3D2B1F]'}`}>
                {quest.completed ? '✨' : '🌱'}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <p className={`font-bold text-xs ${quest.completed ? 'text-[#3D2B1F44]' : 'text-[#3D2B1F]'}`}>
                    {quest.title}
                  </p>
                  <span className="text-[10px] font-black text-[#2D4F1E]">+{quest.xpReward}</span>
                </div>
                <div className="h-1.5 bg-[#F4F2F0] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${quest.completed ? 'bg-[#2D4F1E]' : 'bg-[#2D4F1E77]'}`} 
                    style={{ width: `${(quest.currentValue / quest.targetValue) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}

          {microTasks.length > 0 && (
            <div className="mt-2 space-y-2">
              <div className="h-px bg-white/10 my-2 mx-4"></div>
              {microTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`flex items-center gap-3 p-2 px-4 rounded-xl transition-all ${
                    task.status === TaskStatus.DONE ? 'opacity-40 bg-white/10' : 'bg-white'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${
                    task.status === TaskStatus.DONE 
                    ? 'border-[#2D4F1E] text-[#2D4F1E] bg-[#2D4F1E11]' 
                    : 'border-[#3D2B1F22] text-[#3D2B1F]'
                  }`}>
                    {task.status === TaskStatus.DONE ? '✓' : task.orderIndex + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold ${task.status === TaskStatus.DONE ? 'text-white/60 line-through' : 'text-[#3D2B1F]'}`}>
                      {task.title}
                    </span>
                    {task.category && task.status !== TaskStatus.DONE && (
                      <span className="text-[8px] font-black text-[#2D4F1E] opacity-40 uppercase tracking-tighter">
                        {task.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. 오늘의 추천 미션 */}
      <section>
        <div className="flex justify-between items-center mb-3 ml-2">
          <h3 className="text-lg font-black text-white">진정한 몰입</h3>
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Focus Point</span>
        </div>
        
        {nextTask ? (
          <div className="bg-white p-6 rounded-[2.5rem] border-2 border-white/10 border-b-4 border-b-[#1E3614] relative overflow-hidden shadow-2xl">
            <div className="absolute -bottom-4 -right-4 text-9xl opacity-[0.03] rotate-12 pointer-events-none">🌿</div>

            <div className="flex gap-2 mb-4">
              <span className="bg-[#2D4F1E11] text-[#2D4F1E] text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tight">
                {nextTask.durationEstMin}분의 여정
              </span>
              <span className="bg-[#3D2B1F11] text-[#3D2B1F] text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tight">
                난이도 {nextTask.difficulty}
              </span>
            </div>

            <div className="mb-6">
              <h4 className="text-2xl font-black text-[#3D2B1F] mb-2 leading-tight">
                {nextTask.title}
              </h4>
              <p className="text-sm font-bold text-[#3D2B1F66] leading-relaxed italic">
                {nextTask.nextHint || "과정의 즐거움을 느껴보세요. 당신은 잘 해내고 있습니다."}
              </p>
            </div>

            <button 
              onClick={() => onStartQuest(nextTask)}
              className="w-full bg-[#2D4F1E] hover:bg-[#1E3614] text-white py-4 rounded-2xl font-black text-xl shadow-[0_4px_0_#1E3614] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              몰입 시작하기 ✨
            </button>
            <p className="text-[10px] text-center text-[#3D2B1F44] font-bold mt-4 uppercase tracking-[0.2em]">
              Enjoy the path to your goals
            </p>
          </div>
        ) : (
          <div className="bg-white/10 p-10 rounded-[2.5rem] border-4 border-dashed border-white/20 text-center">
            <div className="text-5xl mb-4 opacity-20">🍃</div>
            <p className="text-white/60 font-black">대기 중인 미션이 없어요.</p>
            <p className="text-xs text-white/30 mt-2 font-bold uppercase tracking-widest italic">Take a deep breath and rest</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomeScreen;

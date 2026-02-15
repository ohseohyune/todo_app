
import React, { useState, useEffect } from 'react';
import { MicroTask } from '../types';

interface QuestPlayScreenProps {
  quest: MicroTask;
  onComplete: (id: string, actualMin: number) => void;
  onTooHard: () => void;
}

const QuestPlayScreen: React.FC<QuestPlayScreenProps> = ({ quest, onComplete, onTooHard }) => {
  const [accumulatedMs, setAccumulatedMs] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const total = accumulatedMs + (now - startTime);
        setDisplaySeconds(Math.floor(total / 1000));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime, accumulatedMs]);

  const toggleTimer = () => {
    if (!isActive) {
      setStartTime(Date.now());
    } else {
      setAccumulatedMs(prev => prev + (Date.now() - (startTime || 0)));
      setStartTime(null);
    }
    setIsActive(!isActive);
  };

  const handleFinish = () => {
    const finalMs = accumulatedMs + (startTime ? (Date.now() - startTime) : 0);
    const finalMin = Math.max(1, Math.round(finalMs / 60000));
    setIsFinishing(true);
    setTimeout(() => onComplete(quest.id, finalMin), 2000);
  };

  return (
    <div className={`flex flex-col min-h-full py-6 transition-all duration-1000 ${isActive ? 'bg-[#1E3614]' : ''}`}>
      <div className="px-4 text-left mb-8">
        <span className="text-[10px] font-black bg-white/10 text-white/60 px-3 py-1 rounded-full uppercase tracking-widest">Focus Session</span>
        <h2 className="text-2xl font-black text-white mt-4 leading-tight">{quest.title}</h2>
        <p className="text-white/40 text-[10px] font-bold mt-2 uppercase tracking-tight">목표: {quest.durationEstMin}분</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-10">
        {isFinishing ? (
          <div className="bg-white p-10 rounded-[3rem] text-center shadow-2xl animate-bounce">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-black text-[#3D2B1F]">몰입 완료!</h3>
            <p className="text-sm font-bold text-green-600 mt-2">데이터 분석 중...</p>
          </div>
        ) : (
          <div className={`w-72 h-72 rounded-[5rem] flex flex-col items-center justify-center transition-all duration-1000 shadow-2xl ${isActive ? 'bg-white scale-105' : 'bg-white/90 shadow-none'}`}>
            <span className="text-6xl font-black text-[#3D2B1F] mono tracking-tighter">
              {Math.floor(displaySeconds / 60)}:{(displaySeconds % 60).toString().padStart(2, '0')}
            </span>
            <span className="mt-2 text-[10px] font-black text-[#2D4F1E] uppercase tracking-widest animate-pulse">
              {isActive ? '몰입 중...' : '준비 완료'}
            </span>
          </div>
        )}

        <div className="w-full max-w-sm bg-white p-6 rounded-[2.5rem] shadow-xl text-left border-4 border-[#1E3614]">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">성공 기준</h4>
          <p className="text-sm font-bold text-[#3D2B1F]">{quest.successCriteria}</p>
          <div className="mt-4 pt-4 border-t border-dashed border-gray-100 text-[10px] text-green-600 font-bold">
            💡 AI 조언: "{quest.nextHint}"
          </div>
        </div>
      </div>

      {!isFinishing && (
        <div className="mt-8 flex flex-col gap-3 px-2">
          <button onClick={toggleTimer} className={`py-4 rounded-2xl font-black text-lg transition-all ${isActive ? 'bg-white/10 text-white' : 'bg-[#3D2B1F] text-white shadow-[0_4px_0_#1E3614]'}`}>
            {isActive ? '일시 정지' : '몰입 시작 🚀'}
          </button>
          <button onClick={handleFinish} className="py-4 rounded-2xl font-black text-xl bg-white text-[#2D4F1E] shadow-[0_4px_0_#E5E4E2] active:translate-y-1 active:shadow-none">
            완료했습니다!
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestPlayScreen;

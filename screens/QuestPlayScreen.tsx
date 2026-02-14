
import React, { useState, useEffect } from 'react';
import { MicroTask } from '../types';

interface QuestPlayScreenProps {
  quest: MicroTask;
  onComplete: () => void;
  onTooHard: () => void;
}

const QuestPlayScreen: React.FC<QuestPlayScreenProps> = ({ quest, onComplete, onTooHard }) => {
  const [timeLeft, setTimeLeft] = useState(quest.durationEstMin * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full text-center py-6 animate-fadeIn">
      <div className="mb-10 text-left px-4">
        <span className="bg-white/10 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">
          Focus Process
        </span>
        <h2 className="text-3xl font-black text-white mt-3 leading-tight tracking-tight">
          {quest.title}
        </h2>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center gap-8">
        <div className="relative w-64 h-64 flex items-center justify-center rounded-[4rem] bg-white border-4 border-[#1E3614] shadow-2xl overflow-hidden">
          <div className="flex flex-col items-center z-10">
            <span className="text-6xl font-black text-[#3D2B1F] mono tracking-tighter">
              {formatTime(timeLeft)}
            </span>
            <div className={`mt-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'bg-[#2D4F1E11] text-[#2D4F1E] led-blink' : 'bg-[#F4F2F0] text-[#3D2B1F44]'}`}>
              {isActive ? '가동 중...' : '대기 중'}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-[#F4F2F0]">
            <div 
              className="h-full bg-[#2D4F1E] transition-all duration-1000" 
              style={{ width: `${(timeLeft / (quest.durationEstMin * 60)) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-[#E5E4E2] w-full max-w-sm shadow-sm text-left">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-[#2D4F1E] rounded-full"></div>
            <h3 className="text-xs font-black text-[#3D2B1F44] uppercase tracking-widest">달성 가이드</h3>
          </div>
          <p className="text-[#3D2B1F] font-bold leading-relaxed text-base">
            {quest.successCriteria}
          </p>
          <div className="mt-5 pt-4 border-t-2 border-dashed border-[#F4F2F0] flex items-start gap-3">
            <span className="text-2xl">🤖</span>
            <p className="text-sm text-[#2D4F1E] font-bold leading-tight italic">
              "{quest.nextHint}"
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-3">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`py-4 rounded-2xl font-black text-lg transition-all border-b-4 ${
            isActive 
            ? 'bg-white/10 text-white border-white/20' 
            : 'bg-[#3D2B1F] text-white border-[#1E3614]'
          }`}
        >
          {isActive ? '잠시 멈추기' : '시작하기 ✨'}
        </button>

        <button
          onClick={onComplete}
          className="bg-white text-[#2D4F1E] py-4 rounded-2xl font-black text-xl border-b-4 border-gray-200 shadow-xl hover:brightness-110 active:translate-y-1 active:shadow-none transition-all"
        >
          완료했습니다!
        </button>

        <button
          onClick={onTooHard}
          className="text-white/40 font-bold text-[11px] mt-2 uppercase tracking-widest hover:text-white transition-colors"
        >
          [!] 너무 어려워요 - 퀘스트 재조정
        </button>
      </div>
    </div>
  );
};

export default QuestPlayScreen;

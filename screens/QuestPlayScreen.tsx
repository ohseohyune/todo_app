
import React, { useState, useEffect, useRef } from 'react';
import { MicroTask } from '../types';

interface QuestPlayScreenProps {
  quest: MicroTask;
  onComplete: (actualMin: number) => void;
  onTooHard: () => void;
}

const QuestPlayScreen: React.FC<QuestPlayScreenProps> = ({ quest, onComplete, onTooHard }) => {
  const [accumulatedMs, setAccumulatedMs] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quest.durationEstMin * 60);

  const [isActive, setIsActive] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [completionSummary, setCompletionSummary] = useState<string | null>(null);

  useEffect(() => {
    setAccumulatedMs(0);
    setStartTime(null);
    setDisplaySeconds(0);
    setTimeLeft(quest.durationEstMin * 60);
    setIsActive(false);
    setShowConfetti(false);
    setIsFinishing(false);
    setCompletionSummary(null);
  }, [quest.id, quest.durationEstMin]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && startTime !== null) {
      interval = setInterval(() => {
        const now = Date.now();
        const currentSessionElapsed = now - startTime;
        const totalElapsed = accumulatedMs + currentSessionElapsed;
        
        const elapsedSec = Math.floor(totalElapsed / 1000);
        setDisplaySeconds(elapsedSec);
        setTimeLeft(Math.max(0, (quest.durationEstMin * 60) - elapsedSec));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime, accumulatedMs, quest.durationEstMin]);

  const handleStart = () => {
    if (!isActive) {
      setStartTime(Date.now());
    } else {
      if (startTime !== null) {
        setAccumulatedMs(prev => prev + (Date.now() - startTime));
      }
      setStartTime(null);
    }
    setIsActive(!isActive);
  };

  const handleComplete = () => {
    if (isFinishing) return;
    
    const finalTotalMs = accumulatedMs + (startTime ? (Date.now() - startTime) : 0);
    const actualMin = Math.max(1, Math.round(finalTotalMs / 60000));

    if ('vibrate' in navigator) {
      navigator.vibrate([100, 30, 100]);
    }

    setIsFinishing(true);
    setShowConfetti(true);
    
    // 완료 문구 생성
    let summary = `${actualMin}분 동안 몰입하셨습니다!`;
    if (actualMin > quest.durationEstMin) {
      summary = `목표보다 ${actualMin - quest.durationEstMin}분 더 깊게 몰입하셨네요! 대단해요.`;
    } else if (actualMin < quest.durationEstMin) {
      summary = `목표보다 빠르게 ${actualMin}분 만에 완료하셨네요! 효율 최고입니다.`;
    }
    setCompletionSummary(summary);
    
    setTimeout(() => {
      onComplete(actualMin);
    }, 2500);
  };

  return (
    <div className={`flex flex-col min-h-full text-center py-4 transition-colors duration-1000 ${isActive ? 'bg-[#1E3614]' : ''}`}>
      <div className="mb-6 text-left px-4">
        <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/20 text-white/60">
          Focus Mode
        </span>
        <h2 className="text-2xl font-black mt-3 leading-tight tracking-tight text-white">
          {quest.title}
        </h2>
        <div className="mt-1 text-[10px] text-white/40 font-bold">
          목표 시간: {quest.durationEstMin}분 • 현재 경과: {Math.floor(displaySeconds / 60)}분 {displaySeconds % 60}초
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center gap-6 relative py-4">
        {showConfetti && (
          <div className="absolute inset-0 z-50 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="absolute text-2xl animate-float-up" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 1.5}s`, top: '100%' }}>
                {['✨', '🌸', '🌿', '⭐', '🍀'][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        )}

        {isFinishing && completionSummary ? (
          <div className="z-50 bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-[#A7C957] animate-bounceIn mx-4">
            <div className="text-5xl mb-4">🎖️</div>
            <h3 className="text-xl font-black text-[#3D2B1F] leading-tight">몰입 기록</h3>
            <p className="mt-2 text-sm font-bold text-[#2D4F1E]">{completionSummary}</p>
          </div>
        ) : (
          <div className={`relative flex-shrink-0 w-64 h-64 flex items-center justify-center rounded-[4rem] border-4 border-[#1E3614] shadow-2xl transition-all duration-1000 ${isActive ? 'bg-white scale-105' : 'bg-white/90'}`}>
            <div className="z-10 text-center">
              <span className="text-6xl font-black text-[#3D2B1F] mono tracking-tighter">
                {Math.floor(displaySeconds / 60)}:{(displaySeconds % 60).toString().padStart(2, '0')}
              </span>
              <div className="mt-2 text-[10px] font-black text-[#2D4F1E] uppercase tracking-widest animate-pulse">
                {isActive ? '몰입 중...' : '준비 완료'}
              </div>
            </div>
          </div>
        )}

        <div className="p-6 rounded-[2.5rem] bg-white w-full max-w-sm shadow-xl text-left">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">성공 기준</h3>
          <p className="text-[#3D2B1F] font-bold text-sm leading-relaxed">{quest.successCriteria}</p>
          <div className="mt-4 pt-3 border-t border-dashed border-gray-100 text-[10px] text-green-600 font-bold">
            💡 AI 팁: "{quest.nextHint}"
          </div>
        </div>
      </div>

      <div className="mt-8 mb-6 flex flex-col gap-3 px-2">
        {!isFinishing && (
          <>
            <button 
              onClick={handleStart} 
              className={`py-4 rounded-2xl font-black text-lg transition-all ${isActive ? 'bg-white/20 text-white' : 'bg-[#3D2B1F] text-white shadow-[0_4px_0_#1E3614]'}`}
            >
              {isActive ? '잠시 멈춤' : '몰입 시작 🚀'}
            </button>
            <button 
              onClick={handleComplete} 
              className="py-4 rounded-2xl font-black text-xl shadow-xl transition-all bg-white text-[#2D4F1E] active:translate-y-1"
            >
              완료했습니다!
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) rotate(0); opacity: 1; }
          100% { transform: translateY(-500px) rotate(720deg); opacity: 0; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .animate-float-up { animation: float-up 2s ease-out forwards; }
        .animate-bounceIn { animation: bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      `}</style>
    </div>
  );
};

export default QuestPlayScreen;

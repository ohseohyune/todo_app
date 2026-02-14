
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
  const [showConfetti, setShowConfetti] = useState(false);
  const [ambience, setAmbience] = useState<'none' | 'rain' | 'forest' | 'white'>('none');

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

  const handleComplete = () => {
    setShowConfetti(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const ambienceIcons = {
    none: '🔇',
    rain: '🌧️',
    forest: '🌲',
    white: '💨'
  };

  return (
    <div className={`flex flex-col h-full text-center py-6 animate-fadeIn transition-colors duration-1000 ${isActive ? 'bg-[#1E3614]' : ''}`}>
      {/* 앰비언스 셀렉터 */}
      <div className="absolute top-4 right-4 flex gap-2">
        {(Object.keys(ambienceIcons) as Array<keyof typeof ambienceIcons>).map(type => (
          <button 
            key={type}
            onClick={() => setAmbience(type)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all border ${ambience === type ? 'bg-white border-white scale-110 shadow-lg' : 'bg-white/10 border-white/10 text-white/40'}`}
          >
            {ambienceIcons[type]}
          </button>
        ))}
      </div>

      <div className="mb-10 text-left px-4">
        <span className={`transition-all duration-1000 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${isActive ? 'bg-white/20 text-white border-white/40' : 'bg-white/10 text-white border-white/20'}`}>
          Focus Process
        </span>
        <h2 className={`text-3xl font-black mt-3 leading-tight tracking-tight transition-colors duration-1000 ${isActive ? 'text-white' : 'text-white'}`}>
          {quest.title}
        </h2>
        {quest.category && (
          <span className="text-[10px] font-bold text-green-400 mt-2 block uppercase tracking-tighter">
            Category: {quest.category}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center items-center gap-8 relative">
        {/* 꽃가루 애니메이션 (단순 구현) */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="absolute text-2xl animate-float-up"
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  animationDelay: `${Math.random() * 2}s`,
                  top: '100%'
                }}
              >
                {['✨', '🌸', '🌿', '⭐', '🍀'][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        )}

        <div className={`relative w-64 h-64 flex items-center justify-center rounded-[4rem] border-4 border-[#1E3614] shadow-2xl overflow-hidden transition-all duration-1000 ${isActive ? 'bg-[#F4F2F0] scale-105' : 'bg-white'}`}>
          <div className="flex flex-col items-center z-10">
            <span className="text-6xl font-black text-[#3D2B1F] mono tracking-tighter">
              {formatTime(timeLeft)}
            </span>
            <div className={`mt-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'bg-[#2D4F1E22] text-[#2D4F1E] led-blink' : 'bg-[#F4F2F0] text-[#3D2B1F44]'}`}>
              {isActive ? `${ambience !== 'none' ? ambience.toUpperCase() : 'DEEP'} FLOW` : 'READY'}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-[#F4F2F0]">
            <div 
              className="h-full bg-[#2D4F1E] transition-all duration-1000" 
              style={{ width: `${(timeLeft / (quest.durationEstMin * 60)) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className={`p-6 rounded-[2.5rem] border-2 w-full max-w-sm shadow-sm text-left transition-all duration-1000 ${isActive ? 'bg-white/95 border-transparent' : 'bg-white border-[#E5E4E2]'}`}>
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
            ? 'bg-white/20 text-white border-white/30' 
            : 'bg-[#3D2B1F] text-white border-[#1E3614]'
          }`}
        >
          {isActive ? '집중 중단' : '몰입 시작 🚀'}
        </button>

        <button
          onClick={handleComplete}
          disabled={showConfetti}
          className={`py-4 rounded-2xl font-black text-xl border-b-4 shadow-xl transition-all ${
            showConfetti 
            ? 'bg-green-500 text-white border-green-700' 
            : 'bg-white text-[#2D4F1E] border-gray-200 hover:brightness-110 active:translate-y-1 active:shadow-none'
          }`}
        >
          {showConfetti ? '축하합니다! ✨' : '완료했습니다!'}
        </button>

        <button
          onClick={onTooHard}
          className="text-white/40 font-bold text-[11px] mt-2 uppercase tracking-widest hover:text-white transition-colors"
        >
          [!] 너무 어려워요 - AI 재분해 요청
        </button>
      </div>

      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) rotate(0); opacity: 1; }
          100% { transform: translateY(-500px) rotate(360deg); opacity: 0; }
        }
        .animate-float-up {
          animation: float-up 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default QuestPlayScreen;

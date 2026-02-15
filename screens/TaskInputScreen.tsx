
import React, { useState } from 'react';
import { User, MicroTask, TaskStatus } from '../types';
import { decomposeTask } from '../services/geminiService';

interface TaskInputScreenProps {
  onCreate: (title: string, category: string, tasks: Partial<MicroTask>[]) => void;
  user: User;
}

type ScreenState = 'input' | 'generating' | 'refining';

const TaskInputScreen: React.FC<TaskInputScreenProps> = ({ onCreate, user }) => {
  const [state, setState] = useState<ScreenState>('input');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('일반');
  const [energyMode, setEnergyMode] = useState<'Low' | 'Normal'>('Normal');
  const [categories, setCategories] = useState(['업무', '공부', '집안일', '건강', '일반']);
  
  const [generatedTasks, setGeneratedTasks] = useState<Partial<MicroTask>[]>([]);
  const [refinementInput, setRefinementInput] = useState('');

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setState('generating');
    const tasks = await decomposeTask(title, category, { 
      level: user.level, 
      streak: user.streakCount,
      energyMode 
    });
    
    if (tasks && tasks.length > 0) {
      setGeneratedTasks(tasks);
      setState('refining');
    } else {
      alert("AI 설계 중 오류가 발생했습니다.");
      setState('input');
    }
  };

  const handleRefine = async (feedback: string) => {
    setState('generating');
    const tasks = await decomposeTask(
      title, 
      category, 
      { level: user.level, streak: user.streakCount, energyMode },
      feedback,
      generatedTasks
    );
    setGeneratedTasks(tasks || generatedTasks);
    setState('refining');
    setRefinementInput('');
  };

  if (state === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-pulse">
        <div className="text-8xl mb-6">🔮</div>
        <h2 className="text-2xl font-black text-white">{energyMode === 'Low' ? '가벼운 퀘스트로 나누는 중...' : '심층 몰입 퀘스트 설계 중...'}</h2>
        <p className="text-white/40 text-xs mt-4 font-bold uppercase tracking-widest">Deep Work Optimization</p>
      </div>
    );
  }

  if (state === 'refining') {
    return (
      <div className="flex flex-col h-full gap-4 pb-4">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-2xl font-black text-white">퀘스트 청사진</h2>
          <span className="text-[10px] font-black text-white/40 uppercase bg-white/5 px-3 py-1 rounded-full">{energyMode} Focus Level</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scroll-container">
          {generatedTasks.map((task, idx) => (
            <div key={task.id || idx} className="bg-white p-4 rounded-3xl border-2 border-[#1E3614] shadow-lg">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="font-black text-[#3D2B1F] text-sm">{idx + 1}. {task.title}</h4>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">목표: {task.successCriteria?.substring(0, 40)}...</p>
                </div>
                <span className="ml-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[11px] font-black shrink-0">{task.durationEstMin}분</span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 bg-[#3D2B1F] rounded-[2.5rem] border-2 border-[#1E3614] shadow-2xl flex flex-col gap-3">
          <input 
            value={refinementInput} 
            onChange={(e) => setRefinementInput(e.target.value)}
            placeholder="예: 더 길게 묶어줘, 30분 단위로 맞춰줘"
            className="w-full p-3 bg-white/5 border border-white/10 rounded-2xl text-white text-xs outline-none focus:border-white/40"
          />
          <div className="flex gap-2">
            <button onClick={() => handleRefine("조금 더 짧게 나눠줘")} className="flex-1 bg-white/10 py-3 rounded-xl text-white text-[10px] font-black uppercase">더 짧게</button>
            <button onClick={() => handleRefine("더 묵직하게 합쳐줘")} className="flex-1 bg-white/10 py-3 rounded-xl text-white text-[10px] font-black uppercase">더 길게</button>
          </div>
          <button 
            onClick={() => onCreate(title, category, generatedTasks)}
            className="w-full bg-[#A7C957] text-[#1E3614] py-4 rounded-2xl font-black text-xl shadow-[0_4px_0_#6A994E] active:translate-y-1 active:shadow-none"
          >
            미션 수락 🚀
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full py-6">
      <h2 className="text-3xl font-black text-white mb-2">오늘의 도전</h2>
      <p className="text-white/60 mb-8 font-bold">AI가 당신의 몰입 세션을 설계해 드립니다.</p>

      <form onSubmit={handleInitialSubmit} className="flex flex-col gap-8 flex-1">
        <div className="space-y-6">
          <label className="block">
            <span className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">목표 입력</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 프로젝트 보고서 초안 완성하기"
              className="mt-2 w-full p-4 rounded-2xl border-2 border-[#1E3614] bg-white text-lg font-bold outline-none text-[#3D2B1F] placeholder:text-[#3D2B1F44]"
              required
            />
          </label>

          {/* 에너지 모드 선택기 */}
          <div>
            <span className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">현재 내 집중력 상태</span>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setEnergyMode('Low')}
                className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                  energyMode === 'Low' ? 'bg-orange-500 border-white text-white' : 'bg-white/5 border-white/10 text-white/40'
                }`}
              >
                <span className="text-xl">🪫</span>
                <span className="text-[10px] font-black uppercase">Low (15~30분 단위)</span>
              </button>
              <button
                type="button"
                onClick={() => setEnergyMode('Normal')}
                className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                  energyMode === 'Normal' ? 'bg-[#A7C957] border-white text-[#1E3614]' : 'bg-white/5 border-white/10 text-white/40'
                }`}
              >
                <span className="text-xl">🔋</span>
                <span className="text-[10px] font-black uppercase">Normal (30~60분 단위)</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl font-bold text-xs border-2 ${
                  category === cat ? 'bg-white text-[#2D4F1E] border-white' : 'bg-white/5 border-white/10 text-white/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="mt-auto bg-[#A7C957] text-[#1E3614] py-4 rounded-2xl font-black text-xl shadow-[0_4px_0_#6A994E] active:translate-y-1 active:shadow-none"
        >
          AI 퀘스트 설계 ✨
        </button>
      </form>
    </div>
  );
};

export default TaskInputScreen;

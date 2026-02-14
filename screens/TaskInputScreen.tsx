
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
  const [categories, setCategories] = useState(['업무', '공부', '집안일', '건강', '일반']);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  
  const [generatedTasks, setGeneratedTasks] = useState<Partial<MicroTask>[]>([]);
  const [refinementInput, setRefinementInput] = useState('');

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setState('generating');
    const tasks = await decomposeTask(title, category, { level: user.level, streak: user.streakCount });
    
    if (tasks && tasks.length > 0) {
      setGeneratedTasks(tasks);
      setState('refining');
    } else {
      alert("AI 분해에 실패했습니다. 다시 시도해주세요.");
      setState('input');
    }
  };

  const handleRefine = async (feedback: string) => {
    setState('generating');
    const tasks = await decomposeTask(
      title, 
      category, 
      { level: user.level, streak: user.streakCount },
      feedback,
      generatedTasks
    );
    
    if (tasks && tasks.length > 0) {
      setGeneratedTasks(tasks);
      setState('refining');
      setRefinementInput('');
    } else {
      alert("재분해에 실패했습니다.");
      setState('refining');
    }
  };

  const handleFinalize = () => {
    onCreate(title, category, generatedTasks);
  };

  if (state === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-6xl mb-6 animate-bounce">🪄</div>
        <h2 className="text-2xl font-black text-white">마이크로 퀘스트 설계 중...</h2>
        <div className="mt-6 bg-white/10 p-5 rounded-[2rem] border border-white/20 max-w-xs">
          <p className="text-green-400 text-[10px] font-black uppercase tracking-widest mb-2">Cognitive Load Minimizer</p>
          <p className="text-white/80 text-sm font-bold leading-relaxed">
            사용자의 레벨과 상태를 분석하여<br/>가장 시작하기 쉬운 첫 단계를 찾고 있습니다.
          </p>
        </div>
      </div>
    );
  }

  if (state === 'refining') {
    return (
      <div className="flex flex-col h-full gap-4 pb-4 animate-fadeIn">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h2 className="text-2xl font-black text-white leading-tight">설계된 퀘스트</h2>
            <p className="text-white/60 text-xs font-bold mt-1">이대로 시작할까요, 아니면 더 다듬을까요?</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-white/40 uppercase">Total Steps</span>
            <p className="text-white font-black">{generatedTasks.length}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scroll-container">
          {generatedTasks.map((task, idx) => (
            <div key={task.id || idx} className="bg-white p-4 rounded-3xl shadow-lg border-2 border-[#1E3614] relative group">
              <div className="absolute -left-2 -top-2 w-6 h-6 bg-[#2D4F1E] text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white">
                {idx + 1}
              </div>
              <div className="flex justify-between items-start">
                <h4 className="font-black text-[#3D2B1F] text-sm leading-tight pr-4">{task.title}</h4>
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg whitespace-nowrap">
                  {task.durationEstMin}분
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-bold mt-2 leading-tight">🎯 {task.successCriteria}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3 bg-[#3D2B1F] p-5 rounded-[2.5rem] border-2 border-[#1E3614] shadow-2xl">
          <div className="flex gap-2">
            <input 
              type="text"
              value={refinementInput}
              onChange={(e) => setRefinementInput(e.target.value)}
              placeholder="예: 더 잘게 나눠줘, 첫 단계가 너무 어려워"
              className="flex-1 bg-white/10 p-3 rounded-2xl text-white text-xs font-bold outline-none border border-white/10 focus:border-white/40"
            />
            <button 
              onClick={() => handleRefine(refinementInput || "더 자세하게 나눠줘")}
              className="bg-white/10 text-white px-4 rounded-2xl font-black text-xs hover:bg-white/20 transition-all"
            >
              수정 요청
            </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['더 쉽게', '더 잘게', '3단계만 더'].map(btn => (
              <button 
                key={btn}
                onClick={() => handleRefine(btn)}
                className="whitespace-nowrap px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white/60 hover:text-white transition-all"
              >
                {btn}
              </button>
            ))}
          </div>

          <button 
            onClick={handleFinalize}
            className="w-full bg-[#A7C957] text-[#1E3614] py-4 rounded-2xl font-black text-xl shadow-[0_4px_0_#6A994E] active:translate-y-1 active:shadow-none transition-all"
          >
            이대로 시작하기 🚀
          </button>
          
          <button 
            onClick={() => setState('input')}
            className="w-full text-white/40 font-bold text-xs"
          >
            처음부터 다시 작성
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-6 flex flex-col h-full animate-fadeIn">
      <h2 className="text-3xl font-black text-white mb-2 tracking-tight">새로운 퀘스트</h2>
      <p className="text-white/60 mb-8 font-bold">오늘 우리가 정복할 목표는 무엇인가요?</p>

      <form onSubmit={handleInitialSubmit} className="flex flex-col gap-8 flex-1">
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-black text-white/40 uppercase tracking-widest ml-1">달성하고 싶은 목표</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 보고서 10페이지 작성하기"
              className="mt-2 w-full p-4 rounded-2xl border-2 border-[#1E3614] focus:border-white outline-none text-lg font-bold shadow-inner bg-white text-gray-900 placeholder:text-gray-300"
              required
            />
          </label>

          <div>
            <div className="flex justify-between items-center ml-1">
              <span className="text-sm font-black text-white/40 uppercase tracking-widest">카테고리</span>
              <button 
                type="button" 
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="text-xs font-black text-white/60 hover:text-white transition-colors"
              >
                {showAddCategory ? '취소' : '+ 추가'}
              </button>
            </div>

            {showAddCategory && (
              <div className="mt-2 flex gap-2 animate-fadeIn">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="새 카테고리명"
                  className="flex-1 p-3 rounded-xl border-2 border-white/10 bg-white text-gray-900 outline-none text-sm font-bold"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="bg-[#3D2B1F] text-white px-4 rounded-xl font-bold text-sm shadow-[0_2px_0_#1E3614] active:translate-y-0.5 active:shadow-none transition-all"
                >
                  추가
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 ${
                    category === cat 
                    ? 'bg-white text-[#2D4F1E] border-white shadow-[0_2px_0_#1E3614]' 
                    : 'bg-white/10 text-white/40 border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-auto bg-[#2D4F1E] text-white py-4 rounded-2xl font-black text-xl shadow-[0_4px_0_#1E3614] border-2 border-white/20 active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest"
        >
          AI 설계 시작 ✨
        </button>
      </form>
    </div>
  );

  function handleAddCategory() {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      const trimmed = newCategoryName.trim();
      setCategories([...categories, trimmed]);
      setCategory(trimmed);
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  }
};

export default TaskInputScreen;

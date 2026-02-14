
import React, { useState } from 'react';
import { User } from '../types';

interface TaskInputScreenProps {
  onCreate: (title: string, category: string) => Promise<boolean>;
  user: User;
}

const TaskInputScreen: React.FC<TaskInputScreenProps> = ({ onCreate, user }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('일반');
  const [categories, setCategories] = useState(['업무', '공부', '집안일', '건강', '일반']);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setIsGenerating(true);
    const success = await onCreate(title, category);
    // 실패한 경우 로딩 상태를 해제하여 다시 시도할 수 있게 함
    if (!success) {
      setIsGenerating(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      const trimmed = newCategoryName.trim();
      setCategories([...categories, trimmed]);
      setCategory(trimmed);
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-pulse">
        <div className="text-6xl mb-6">🪄</div>
        <h2 className="text-2xl font-black text-white">마이크로 퀘스트 생성 중...</h2>
        <div className="mt-4 bg-[#1E3614] p-4 rounded-2xl border border-white/10">
          <p className="text-green-400 text-xs font-black uppercase tracking-widest mb-1">Adaptive Difficulty Active</p>
          <p className="text-white/80 leading-relaxed font-bold text-sm">
            레벨 {user.level} 숙련도와 {user.streakCount}일 스트릭을 분석하여<br/>당신에게 딱 맞는 시간을 계산하고 있습니다.
          </p>
        </div>
        <div className="mt-10 flex gap-2">
          <div className="w-3 h-3 bg-white/40 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce delay-75"></div>
          <div className="w-3 h-3 bg-white/80 rounded-full animate-bounce delay-150"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-6 flex flex-col h-full">
      <h2 className="text-3xl font-black text-white mb-2 tracking-tight">새로운 퀘스트</h2>
      <p className="text-white/60 mb-8 font-bold">오늘 우리가 정복할 목표는 무엇인가요?</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8 flex-1">
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
          AI로 분해하기 ✨
        </button>
      </form>
    </div>
  );
};

export default TaskInputScreen;

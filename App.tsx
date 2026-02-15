
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout.tsx';
import { User, MacroTask, MicroTask, TaskStatus, LeagueTier, DailyQuest, FeedbackEntry, Badge } from './types.ts';
import { getAIAdvice, decomposeTask } from './services/geminiService.ts';

// Screens
import HomeScreen from './screens/HomeScreen.tsx';
import TaskInputScreen from './screens/TaskInputScreen.tsx';
import QuestPlayScreen from './screens/QuestPlayScreen.tsx';
import LeagueScreen from './screens/LeagueScreen.tsx';
import ProfileScreen from './screens/ProfileScreen.tsx';
import ShopScreen from './screens/ShopScreen.tsx';

const STORAGE_KEY = 'quest_todo_app_data_v1';

const INITIAL_DAILY_QUESTS: DailyQuest[] = [
  { id: 'q1', title: '몰입 퀘스트 1개 완료', targetValue: 1, currentValue: 0, completed: false, xpReward: 50 },
  { id: 'q2', title: '오늘 100 XP 획득', targetValue: 100, currentValue: 0, completed: false, xpReward: 75 },
  { id: 'q3', title: '오늘의 성찰 남기기', targetValue: 1, currentValue: 0, completed: false, xpReward: 40 },
];

// Added ALL_BADGES export to fix import error in ProfileScreen.tsx
export const ALL_BADGES: Badge[] = [
  { id: 'b1', title: '몰입의 시작', emoji: '🌱', description: '첫 번째 퀘스트를 완료했습니다.' },
  { id: 'b2', title: '스트릭 3일', emoji: '🔥', description: '3일 연속으로 몰입에 성공했습니다.' },
  { id: 'b3', title: '집중의 달인', emoji: '🧘', description: '총 집중 시간 300분을 돌파했습니다.' },
  { id: 'b4', title: '리그 승급자', emoji: '🥇', description: '상위 리그로 승급했습니다.' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentQuest, setCurrentQuest] = useState<MicroTask | null>(null);

  const [user, setUser] = useState<User>({
    id: '1', nickname: '퀘스트마스터', avatar: '👨‍🚀',
    streakCount: 0, maxStreak: 0, lastActiveDate: null,
    level: 1, totalXP: 0, totalFocusMinutes: 0,
    leagueTier: LeagueTier.BRONZE, feedbackHistory: [],
    totalCompletedTasks: 0, inventory: { streakFreeze: 0 },
    unlockedBadges: [], recentAccuracyRatio: 1.0
  });

  const [macroTasks, setMacroTasks] = useState<MacroTask[]>([]);
  const [microTasks, setMicroTasks] = useState<MicroTask[]>([]);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(INITIAL_DAILY_QUESTS);

  // 데이터 로드
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed.user);
      setMacroTasks(parsed.macroTasks || []);
      setMicroTasks(parsed.microTasks || []);
      setDailyQuests(parsed.dailyQuests || INITIAL_DAILY_QUESTS);
    }
    setIsLoaded(true);
  }, []);

  // 데이터 저장
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, macroTasks, microTasks, dailyQuests }));
    }
  }, [user, macroTasks, microTasks, dailyQuests, isLoaded]);

  const handleCreateTask = (title: string, category: string, tasks: Partial<MicroTask>[]) => {
    const macroId = Math.random().toString(36).substr(2, 9);
    const newMacro: MacroTask = { id: macroId, title, category, createdAt: new Date().toISOString(), status: TaskStatus.TODO };
    const newMicros = tasks.map(t => ({ ...t, macroTaskId: macroId, status: TaskStatus.TODO })) as MicroTask[];
    setMacroTasks(prev => [...prev, newMacro]);
    setMicroTasks(prev => [...prev, ...newMicros]);
    setActiveTab('home');
  };

  const handleTaskComplete = (id: string, actualMin: number) => {
    const task = microTasks.find(t => t.id === id);
    if (!task) return;

    // 학습 알고리즘: 실제 소요 시간 비율 업데이트
    const ratio = actualMin / task.durationEstMin;
    const newRatio = ((user.recentAccuracyRatio * 4) + ratio) / 5;

    const updatedTasks = microTasks.map(t => 
      t.id === id ? { ...t, status: TaskStatus.DONE, actualDurationMin: actualMin } : t
    );
    setMicroTasks(updatedTasks);

    const gainedXP = task.xpReward;
    setUser(prev => ({
      ...prev,
      totalXP: prev.totalXP + gainedXP,
      totalCompletedTasks: prev.totalCompletedTasks + 1,
      totalFocusMinutes: prev.totalFocusMinutes + actualMin,
      recentAccuracyRatio: newRatio,
      level: Math.floor((prev.totalXP + gainedXP) / 1000) + 1
    }));

    // 데일리 퀘스트 업데이트
    setDailyQuests(prev => prev.map(q => {
      if (q.id === 'q1') return { ...q, currentValue: q.currentValue + 1, completed: true };
      if (q.id === 'q2') {
        const newVal = q.currentValue + gainedXP;
        return { ...q, currentValue: newVal, completed: newVal >= q.targetValue };
      }
      return q;
    }));

    setActiveTab('home');
    setCurrentQuest(null);
  };

  const handleStartQuest = (task: MicroTask) => {
    setCurrentQuest(task);
    setActiveTab('play');
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'home' && <HomeScreen user={user} microTasks={microTasks} dailyQuests={dailyQuests} onStartQuest={handleStartQuest} />}
      {activeTab === 'input' && <TaskInputScreen onCreate={handleCreateTask} user={user} />}
      {activeTab === 'play' && currentQuest && <QuestPlayScreen quest={currentQuest} onComplete={handleTaskComplete} onTooHard={() => setActiveTab('input')} />}
      {activeTab === 'league' && <LeagueScreen user={user} />}
      {activeTab === 'profile' && <ProfileScreen user={user} onUpdateProfile={(n, a) => setUser(p => ({ ...p, nickname: n, avatar: a }))} onAddFeedback={async (r) => {
        const advice = await getAIAdvice(r, user);
        setUser(p => ({ ...p, feedbackHistory: [{ id: Date.now().toString(), date: new Date().toLocaleDateString(), userReflection: r, aiAdvice: advice }, ...p.feedbackHistory] }));
        setDailyQuests(prev => prev.map(q => q.id === 'q3' ? { ...q, completed: true, currentValue: 1 } : q));
      }} />}
      {activeTab === 'shop' && <ShopScreen user={user} onBuyItem={(type, cost) => {
        if (user.totalXP < cost) return false;
        setUser(p => ({ ...p, totalXP: p.totalXP - cost, inventory: { ...p.inventory, streakFreeze: p.inventory.streakFreeze + (type === 'freeze' ? 1 : 0) } }));
        return true;
      }} />}
    </Layout>
  );
};

export default App;

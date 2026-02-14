
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout.tsx';
import { User, MacroTask, MicroTask, TaskStatus, LeagueTier, DailyQuest, FeedbackEntry, GardenPlant, Badge } from './types.ts';
import { getAIAdvice, decomposeTask } from './services/geminiService.ts';

// Screens
import HomeScreen from './screens/HomeScreen.tsx';
import TaskInputScreen from './screens/TaskInputScreen.tsx';
import QuestPlayScreen from './screens/QuestPlayScreen.tsx';
import LeagueScreen from './screens/LeagueScreen.tsx';
import ProfileScreen from './screens/ProfileScreen.tsx';
import ShopScreen from './screens/ShopScreen.tsx';

const STORAGE_KEY = 'quest_todo_data_v6';

export const ALL_BADGES: Badge[] = [
  { id: 'first_step', title: '첫 걸음', emoji: '👣', description: '첫 번째 마이크로 퀘스트 완료' },
  { id: 'streak_3', title: '작심삼일 격파', emoji: '🔥', description: '3일 연속 스트릭 달성' },
  { id: 'night_owl', title: '밤의 지배자', emoji: '🦉', description: '자정 이후에 퀘스트 완료' },
  { id: 'garden_master', title: '정원사', emoji: '👩‍🌾', description: '정원에 식물 5개 심기' },
];

const INITIAL_DAILY_QUESTS: DailyQuest[] = [
  { id: 'q1', title: '마이크로 퀘스트 1개 완료', targetValue: 1, currentValue: 0, completed: false, xpReward: 50 },
  { id: 'q2', title: '경험치 100 XP 획득', targetValue: 100, currentValue: 0, completed: false, xpReward: 75 },
  { id: 'q3', title: '오늘의 성찰 기록하기', targetValue: 1, currentValue: 0, completed: false, xpReward: 40 },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [cheerNotification, setCheerNotification] = useState<string | null>(null);
  const [levelUpModal, setLevelUpModal] = useState<{level: number} | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [user, setUser] = useState<User>({
    id: '1',
    nickname: '퀘스트마스터',
    avatar: '👨‍🚀',
    streakCount: 0,
    maxStreak: 0,
    lastActiveDate: null,
    level: 1,
    totalXP: 0,
    totalFocusMinutes: 0,
    leagueTier: LeagueTier.BRONZE,
    feedbackHistory: [],
    totalCompletedTasks: 0,
    inventory: { streakFreeze: 0 },
    garden: [],
    unlockedBadges: [],
    recentAccuracyRatio: 1.0
  });

  const [macroTasks, setMacroTasks] = useState<MacroTask[]>([]);
  const [microTasks, setMicroTasks] = useState<MicroTask[]>([]);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(INITIAL_DAILY_QUESTS);
  const [currentQuest, setCurrentQuest] = useState<MicroTask | null>(null);

  const checkDailyReset = useCallback((savedUser: User, savedQuests: DailyQuest[]) => {
    const now = new Date();
    const todayStr = now.toDateString();
    if (!savedUser.lastActiveDate) return { updatedUser: savedUser, updatedQuests: savedQuests };
    const lastDate = new Date(savedUser.lastActiveDate);
    const lastDateStr = lastDate.toDateString();

    let updatedUser = { ...savedUser };
    let updatedQuests = [...savedQuests];

    if (todayStr !== lastDateStr) {
      updatedQuests = INITIAL_DAILY_QUESTS.map(q => ({ ...q }));
    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastDateStr !== todayStr && lastDateStr !== yesterdayStr) {
      if (updatedUser.inventory.streakFreeze > 0) {
        updatedUser.inventory.streakFreeze -= 1;
        setCheerNotification("스트릭 프리즈 사용! ❄️");
      } else {
        updatedUser.streakCount = 0;
        setCheerNotification("다시 시작해봐요! 💪");
      }
    }
    return { updatedUser, updatedQuests };
  }, []);

  const handleManualReset = () => {
    // 즉각적인 강제 초기화
    setDailyQuests(INITIAL_DAILY_QUESTS.map(q => ({ ...q })));
    setMicroTasks([]);
    setMacroTasks([]);
    setCurrentQuest(null);
    setCheerNotification("모든 퀘스트가 초기화되었습니다 🔄");
    localStorage.removeItem(STORAGE_KEY);
    setActiveTab('home');
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let loadedUser = parsed.user || user;
        let loadedQuests = parsed.dailyQuests || dailyQuests;
        const { updatedUser, updatedQuests } = checkDailyReset(loadedUser, loadedQuests);
        setUser(updatedUser);
        setDailyQuests(updatedQuests);
        if (parsed.macroTasks) setMacroTasks(parsed.macroTasks);
        if (parsed.microTasks) setMicroTasks(parsed.microTasks);
      } catch (e) {
        console.error("Data load failed.");
      }
    }
    setIsLoaded(true);
  }, [checkDailyReset]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        user, macroTasks, microTasks, dailyQuests
      }));
    }
  }, [user, macroTasks, microTasks, dailyQuests, isLoaded]);

  useEffect(() => {
    if (activeTab === 'play' && !currentQuest) {
      setActiveTab('home');
    }
  }, [activeTab, currentQuest]);

  const handleCreateMacroTask = (title: string, category: string, tasks: Partial<MicroTask>[]) => {
    const macroId = Math.random().toString(36).substr(2, 9);
    const newMacro: MacroTask = { id: macroId, title, category, createdAt: new Date().toISOString(), status: TaskStatus.TODO };
    const newMicros = tasks.map(t => ({ ...t, macroTaskId: macroId, category: category, status: TaskStatus.TODO })) as MicroTask[];
    setMacroTasks(prev => [...prev, newMacro]);
    setMicroTasks(prev => [...prev, ...newMicros]);
    setActiveTab('home');
  };

  const handleStartQuest = (task: MicroTask) => {
    setCurrentQuest(task);
    setActiveTab('play');
  };

  const updateQuestProgress = (questId: string, value: number) => {
    setDailyQuests(prev => prev.map(q => {
      if (q.id === questId) {
        const newValue = Math.min(q.targetValue, q.currentValue + value);
        return { ...q, currentValue: newValue, completed: newValue >= q.targetValue };
      }
      return q;
    }));
  };

  const handleTaskComplete = (microTaskId: string, actualMin: number) => {
    const taskIndex = microTasks.findIndex(t => t.id === microTaskId);
    if (taskIndex === -1) return;
    const completedTask = microTasks[taskIndex];
    const gainedXP = completedTask.xpReward;
    const updatedMicroTasks = [...microTasks];
    updatedMicroTasks[taskIndex] = { ...completedTask, status: TaskStatus.DONE, actualDurationMin: actualMin };
    setMicroTasks(updatedMicroTasks);
    const now = new Date();
    const isNewDay = !user.lastActiveDate || new Date(user.lastActiveDate).toDateString() !== now.toDateString();
    let newStreak = user.streakCount + (isNewDay ? 1 : 0);
    const newTotalXP = user.totalXP + gainedXP;
    const newLevel = Math.floor(newTotalXP / 1000) + 1;
    if (newLevel > user.level) setLevelUpModal({ level: newLevel });
    const updatedUser = { ...user, totalXP: newTotalXP, level: newLevel, streakCount: newStreak, lastActiveDate: now.toISOString(), totalCompletedTasks: user.totalCompletedTasks + 1 };
    setUser(updatedUser);
    updateQuestProgress('q1', 1);
    updateQuestProgress('q2', gainedXP);
    const nextTask = updatedMicroTasks.find(t => t.status === TaskStatus.TODO);
    setCurrentQuest(nextTask || null);
  };

  const handleBuyItem = (itemType: string, cost: number) => {
    if (user.totalXP < cost) return false;
    setUser(prev => {
      const newUser = { ...prev, totalXP: prev.totalXP - cost };
      if (itemType === 'freeze') {
        newUser.inventory = { ...prev.inventory, streakFreeze: prev.inventory.streakFreeze + 1 };
      }
      return newUser;
    });
    return true;
  };

  // Fixed Fix: Implemented handleAddFeedback to connect ProfileScreen with AI advice and update quest state
  const handleAddFeedback = async (reflection: string) => {
    const advice = await getAIAdvice(reflection, user);
    const newEntry: FeedbackEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString(),
      userReflection: reflection,
      aiAdvice: advice
    };
    setUser(prev => ({
      ...prev,
      feedbackHistory: [newEntry, ...prev.feedbackHistory]
    }));
    updateQuestProgress('q3', 1);
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {levelUpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-8">
          <div className="bg-white rounded-[3rem] p-10 text-center shadow-2xl">
            <h2 className="text-4xl font-black text-[#3D2B1F] mb-6 tracking-tight text-center">LEVEL UP! 🎊</h2>
            <p className="text-[#2D4F1E] font-black text-xl mb-6">레벨 {levelUpModal.level} 달성!</p>
            <button onClick={() => setLevelUpModal(null)} className="w-full bg-[#3D2B1F] text-white py-4 rounded-2xl font-black">계속하기</button>
          </div>
        </div>
      )}
      {(() => {
        switch (activeTab) {
          case 'home': return <HomeScreen user={user} microTasks={microTasks} dailyQuests={dailyQuests} onStartQuest={handleStartQuest} onMoveTask={()=>{}} cheerNotification={cheerNotification} onClearNotification={() => setCheerNotification(null)} onGoToTab={setActiveTab} onResetQuests={handleManualReset} />;
          case 'input': return <TaskInputScreen onCreate={handleCreateMacroTask} user={user} />;
          case 'play': return currentQuest ? <QuestPlayScreen quest={currentQuest} onComplete={(min) => handleTaskComplete(currentQuest.id, min)} onTooHard={() => {}} /> : null;
          case 'league': return <LeagueScreen user={user} />;
          case 'profile': return <ProfileScreen user={user} onUpdateProfile={(n, a) => setUser(prev => ({ ...prev, nickname: n, avatar: a }))} onAddFeedback={handleAddFeedback} />;
          case 'shop': return <ShopScreen user={user} onBuyItem={handleBuyItem} />;
          default: return null;
        }
      })()}
    </Layout>
  );
};

export default App;

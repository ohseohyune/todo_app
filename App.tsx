
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import { User, MacroTask, MicroTask, TaskStatus, LeagueTier, DailyQuest, Friend, FeedbackEntry, GardenPlant, Badge } from './types.ts';
import { getAIAdvice, decomposeTask } from './services/geminiService.ts';

// Screens
import HomeScreen from './screens/HomeScreen.tsx';
import TaskInputScreen from './screens/TaskInputScreen.tsx';
import QuestPlayScreen from './screens/QuestPlayScreen.tsx';
import LeagueScreen from './screens/LeagueScreen.tsx';
import ProfileScreen from './screens/ProfileScreen.tsx';
import FriendsScreen from './screens/FriendsScreen.tsx';
import ShopScreen from './screens/ShopScreen.tsx';

const STORAGE_KEY = 'quest_todo_data_v6';

export const ALL_BADGES: Badge[] = [
  { id: 'first_step', title: '첫 걸음', emoji: '👣', description: '첫 번째 마이크로 퀘스트 완료' },
  { id: 'streak_3', title: '작심삼일 격파', emoji: '🔥', description: '3일 연속 스트릭 달성' },
  { id: 'night_owl', title: '밤의 지배자', emoji: '🦉', description: '자정 이후에 퀘스트 완료' },
  { id: 'garden_master', title: '정원사', emoji: '👩‍🌾', description: '정원에 식물 5개 심기' },
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
    receivedCheers: 0,
    totalCompletedTasks: 0,
    inventory: { streakFreeze: 0 },
    garden: [],
    unlockedBadges: [],
    recentAccuracyRatio: 1.0
  });

  const [friends, setFriends] = useState<Friend[]>([]);
  const [macroTasks, setMacroTasks] = useState<MacroTask[]>([]);
  const [microTasks, setMicroTasks] = useState<MicroTask[]>([]);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([
    { id: 'q1', title: '마이크로 퀘스트 1개 완료', targetValue: 1, currentValue: 0, completed: false, xpReward: 50 },
    { id: 'q2', title: '경험치 100 XP 획득', targetValue: 100, currentValue: 0, completed: false, xpReward: 75 },
    { id: 'q3', title: '오늘의 성찰 기록하기', targetValue: 1, currentValue: 0, completed: false, xpReward: 40 },
  ]);

  const [currentQuest, setCurrentQuest] = useState<MicroTask | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.user) setUser(parsed.user);
        if (parsed.friends) setFriends(parsed.friends);
        if (parsed.macroTasks) setMacroTasks(parsed.macroTasks);
        if (parsed.microTasks) setMicroTasks(parsed.microTasks);
        if (parsed.dailyQuests) setDailyQuests(parsed.dailyQuests);
      } catch (e) {
        console.error("Data load failed.");
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        user, friends, macroTasks, microTasks, dailyQuests
      }));
    }
  }, [user, friends, macroTasks, microTasks, dailyQuests, isLoaded]);

  const checkAchievements = (updatedUser: User) => {
    const newBadges = [...updatedUser.unlockedBadges];
    let changed = false;
    if (!newBadges.includes('first_step') && updatedUser.totalCompletedTasks >= 1) { newBadges.push('first_step'); changed = true; }
    if (!newBadges.includes('streak_3') && updatedUser.streakCount >= 3) { newBadges.push('streak_3'); changed = true; }
    if (!newBadges.includes('garden_master') && updatedUser.garden.length >= 5) { newBadges.push('garden_master'); changed = true; }
    if (changed) {
      setUser(prev => ({ ...prev, unlockedBadges: newBadges }));
      setCheerNotification("새로운 업적 달성! 프로필을 확인하세요 🏆");
    }
  };

  const handleCreateMacroTask = (title: string, category: string, tasks: Partial<MicroTask>[]) => {
    const macroId = Math.random().toString(36).substr(2, 9);
    const newMacro: MacroTask = {
      id: macroId,
      title,
      category,
      createdAt: new Date().toISOString(),
      status: TaskStatus.TODO
    };

    const newMicros = tasks.map(t => ({
      ...t,
      macroTaskId: macroId,
      category: category,
      status: TaskStatus.TODO
    })) as MicroTask[];

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

  const handleAddFeedback = async (reflection: string) => {
    const advice = await getAIAdvice(reflection, user);
    const xpReward = 40; // q3 xpReward
    
    setUser(prev => {
      const updated = {
        ...prev,
        totalXP: prev.totalXP + xpReward,
        feedbackHistory: [
          { 
            id: Math.random().toString(36).substr(2, 9), 
            date: new Date().toLocaleDateString(), 
            userReflection: reflection, 
            aiAdvice: advice 
          }, 
          ...prev.feedbackHistory
        ]
      };
      return updated;
    });

    updateQuestProgress('q3', 1);
    // XP 획득 퀘스트도 연동
    updateQuestProgress('q2', xpReward);
  };

  const handleTaskComplete = (microTaskId: string, actualMin: number) => {
    const taskIndex = microTasks.findIndex(t => t.id === microTaskId);
    if (taskIndex === -1) return;

    const completedTask = microTasks[taskIndex];
    const gainedXP = completedTask.xpReward;

    const updatedMicroTasks = [...microTasks];
    updatedMicroTasks[taskIndex] = { 
      ...completedTask, 
      status: TaskStatus.DONE,
      actualDurationMin: actualMin 
    };
    setMicroTasks(updatedMicroTasks);

    const completedOnes = updatedMicroTasks.filter(t => t.status === TaskStatus.DONE && t.actualDurationMin);
    const last5 = completedOnes.slice(-5);
    const totalRatio = last5.reduce((acc, t) => acc + (t.actualDurationMin! / t.durationEstMin), 0);
    const avgRatio = last5.length > 0 ? totalRatio / last5.length : 1.0;

    const now = new Date();
    const isNewDay = !user.lastActiveDate || new Date(user.lastActiveDate).toDateString() !== now.toDateString();
    let newStreak = user.streakCount;
    if (isNewDay) newStreak += 1;

    const oldLevel = user.level;
    const newTotalXP = user.totalXP + gainedXP;
    const newLevel = Math.floor(newTotalXP / 1000) + 1;
    if (newLevel > oldLevel) setLevelUpModal({ level: newLevel });

    let newGarden = [...user.garden];
    if (Math.random() > 0.3 && newGarden.length < 12) {
      const plants = ['🌸', '🌿', '🌳', '🌻', '🌵', '🍄', '🍀'];
      newGarden.push({
        id: Math.random().toString(),
        type: plants[Math.floor(Math.random() * plants.length)],
        category: completedTask.category,
        position: Math.floor(Math.random() * 12),
        grownAt: now.toISOString()
      });
    }

    const updatedUser = { 
      ...user, 
      totalXP: newTotalXP,
      level: newLevel,
      totalFocusMinutes: (user.totalFocusMinutes || 0) + actualMin,
      totalCompletedTasks: user.totalCompletedTasks + 1,
      streakCount: newStreak,
      maxStreak: Math.max(user.maxStreak, newStreak),
      lastActiveDate: now.toISOString(),
      garden: newGarden,
      recentAccuracyRatio: avgRatio
    };
    
    setUser(updatedUser);
    checkAchievements(updatedUser);

    updateQuestProgress('q1', 1);
    updateQuestProgress('q2', gainedXP);

    const nextTask = updatedMicroTasks.find(t => t.status === TaskStatus.TODO);
    if (nextTask) {
        setCurrentQuest(nextTask);
    } else {
      setCurrentQuest(null);
      setActiveTab('home');
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {levelUpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-8 animate-fadeIn">
          <div className="bg-white rounded-[3rem] p-10 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 inset-x-0 h-2 bg-[#A7C957] animate-pulse"></div>
            <div className="text-7xl mb-6">🎊</div>
            <h2 className="text-4xl font-black text-[#3D2B1F] mb-2 tracking-tight">LEVEL UP!</h2>
            <p className="text-[#2D4F1E] font-black text-xl mb-6">축하합니다! 레벨 {levelUpModal.level}이 되었습니다.</p>
            <button onClick={() => setLevelUpModal(null)} className="w-full bg-[#3D2B1F] text-white py-4 rounded-2xl font-black text-xl shadow-[0_4px_0_#1E3614]">계속해서 몰입하기 🔥</button>
          </div>
        </div>
      )}

      {(() => {
        switch (activeTab) {
          case 'home': return <HomeScreen user={user} microTasks={microTasks} dailyQuests={dailyQuests} onStartQuest={handleStartQuest} onMoveTask={()=>{}} cheerNotification={cheerNotification} onClearNotification={() => setCheerNotification(null)} onGoToTab={setActiveTab} />;
          case 'input': return <TaskInputScreen onCreate={handleCreateMacroTask} user={user} />;
          case 'play': return currentQuest ? <QuestPlayScreen quest={currentQuest} onComplete={(min) => handleTaskComplete(currentQuest.id, min)} onTooHard={() => {}} /> : (setActiveTab('home'), null);
          case 'friends': return <FriendsScreen friends={friends} onAddFriend={()=>{}} onCheerFriend={()=>{}} />;
          case 'shop': return <ShopScreen user={user} onBuyItem={() => true} />;
          case 'league': return <LeagueScreen user={user} />;
          case 'profile': return <ProfileScreen user={user} onUpdateProfile={()=>{}} onAddFeedback={handleAddFeedback} />;
          default: return null;
        }
      })()}
    </Layout>
  );
};

export default App;

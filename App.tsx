
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import { User, MacroTask, MicroTask, TaskStatus, LeagueTier, DailyQuest, Friend, FeedbackEntry, GardenPlant, Badge } from './types.ts';
import { decomposeTask, getAIAdvice } from './services/geminiService.ts';

// Screens
import HomeScreen from './screens/HomeScreen.tsx';
import TaskInputScreen from './screens/TaskInputScreen.tsx';
import QuestPlayScreen from './screens/QuestPlayScreen.tsx';
import LeagueScreen from './screens/LeagueScreen.tsx';
import ProfileScreen from './screens/ProfileScreen.tsx';
import FriendsScreen from './screens/FriendsScreen.tsx';
import ShopScreen from './screens/ShopScreen.tsx';

const STORAGE_KEY = 'quest_todo_data_v3';

export const ALL_BADGES: Badge[] = [
  { id: 'first_step', title: '첫 걸음', emoji: '👣', description: '첫 번째 마이크로 퀘스트 완료' },
  { id: 'streak_3', title: '작심삼일 격파', emoji: '🔥', description: '3일 연속 스트릭 달성' },
  { id: 'night_owl', title: '밤의 지배자', emoji: '🦉', description: '자정 이후에 퀘스트 완료' },
  { id: 'garden_master', title: '정원사', emoji: '👩‍🌾', description: '정원에 식물 5개 심기' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [cheerNotification, setCheerNotification] = useState<string | null>(null);
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
    leagueTier: LeagueTier.BRONZE,
    feedbackHistory: [],
    receivedCheers: 0,
    totalCompletedTasks: 0,
    inventory: { streakFreeze: 0 },
    garden: [],
    unlockedBadges: []
  });

  const [friends, setFriends] = useState<Friend[]>([]);
  const [macroTasks, setMacroTasks] = useState<MacroTask[]>([]);
  const [microTasks, setMicroTasks] = useState<MicroTask[]>([]);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([
    { id: 'q1', title: '마이크로 퀘스트 1개 완료', targetValue: 1, currentValue: 0, completed: false, xpReward: 50 },
    { id: 'q2', title: '경험치 100 XP 획득', targetValue: 100, currentValue: 0, completed: false, xpReward: 75 },
    { id: 'q3', title: '친구 응원하기', targetValue: 1, currentValue: 0, completed: false, xpReward: 30 },
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

  // 업적 체크 로직
  const checkAchievements = (updatedUser: User) => {
    const newBadges = [...updatedUser.unlockedBadges];
    let changed = false;

    if (!newBadges.includes('first_step') && updatedUser.totalCompletedTasks >= 1) {
      newBadges.push('first_step');
      changed = true;
    }
    if (!newBadges.includes('streak_3') && updatedUser.streakCount >= 3) {
      newBadges.push('streak_3');
      changed = true;
    }
    if (!newBadges.includes('garden_master') && updatedUser.garden.length >= 5) {
      newBadges.push('garden_master');
      changed = true;
    }

    if (changed) {
      setUser(prev => ({ ...prev, unlockedBadges: newBadges }));
      setCheerNotification("새로운 업적을 달성했습니다! 프로필을 확인하세요. 🏆");
    }
  };

  const handleTaskComplete = (microTaskId: string) => {
    const taskIndex = microTasks.findIndex(t => t.id === microTaskId);
    if (taskIndex === -1) return;

    const completedTask = microTasks[taskIndex];
    const gainedXP = completedTask.xpReward;

    const updatedMicroTasks = [...microTasks];
    updatedMicroTasks[taskIndex] = { ...completedTask, status: TaskStatus.DONE };
    setMicroTasks(updatedMicroTasks);

    const now = new Date();
    const isNewDay = !user.lastActiveDate || new Date(user.lastActiveDate).toDateString() !== now.toDateString();
    
    let newStreak = user.streakCount;
    if (isNewDay) newStreak += 1;

    let newGarden = [...user.garden];
    if (Math.random() > 0.4 && newGarden.length < 12) {
      const plantEmoji = completedTask.category === '업무' ? '🌳' : completedTask.category === '공부' ? '🌸' : '🌿';
      newGarden.push({
        id: Math.random().toString(),
        type: plantEmoji,
        category: completedTask.category,
        position: Math.floor(Math.random() * 12),
        grownAt: now.toISOString()
      });
    }

    const updatedUser = { 
      ...user, 
      totalXP: user.totalXP + gainedXP,
      totalCompletedTasks: user.totalCompletedTasks + 1,
      streakCount: newStreak,
      maxStreak: Math.max(user.maxStreak, newStreak),
      lastActiveDate: now.toISOString(),
      garden: newGarden
    };
    
    setUser(updatedUser);
    checkAchievements(updatedUser);

    setDailyQuests(prev => prev.map(q => {
      if (q.id === 'q1') return { ...q, currentValue: Math.min(q.targetValue, q.currentValue + 1), completed: q.currentValue + 1 >= q.targetValue };
      if (q.id === 'q2') return { ...q, currentValue: Math.min(q.targetValue, q.currentValue + gainedXP), completed: q.currentValue + gainedXP >= q.targetValue };
      return q;
    }));

    const nextTask = updatedMicroTasks.find(t => t.status === TaskStatus.TODO);
    if (nextTask) setCurrentQuest(nextTask);
    else {
      setCurrentQuest(null);
      setActiveTab('home');
    }
  };

  const moveTask = (id: string, direction: 'up' | 'down') => {
    const index = microTasks.findIndex(t => t.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === microTasks.length - 1) return;

    const newTasks = [...microTasks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newTasks[index], newTasks[swapIndex]] = [newTasks[swapIndex], newTasks[index]];
    setMicroTasks(newTasks);
  };

  const handleCreateMacroTask = async (title: string, category: string): Promise<boolean> => {
    const micros = await decomposeTask(title, category, { level: user.level, streak: user.streakCount });
    if (micros.length === 0) {
      alert("AI 할당량 초과! 1분 뒤 시도하세요.");
      return false;
    }
    const newMacro: MacroTask = { id: Math.random().toString(36).substr(2, 9), title, category, createdAt: new Date().toISOString(), status: TaskStatus.TODO };
    setMacroTasks(prev => [...prev, newMacro]);
    const fullMicros = micros.map(m => ({ ...m, macroTaskId: newMacro.id, category, status: TaskStatus.TODO } as MicroTask));
    setMicroTasks(prev => [...prev, ...fullMicros]);
    if (!currentQuest && fullMicros.length > 0) {
      setCurrentQuest(fullMicros[0]);
      setActiveTab('play');
    } else setActiveTab('home');
    return true;
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {(() => {
        switch (activeTab) {
          case 'home': return <HomeScreen user={user} microTasks={microTasks} dailyQuests={dailyQuests} onStartQuest={setCurrentQuest} onMoveTask={moveTask} cheerNotification={cheerNotification} onClearNotification={() => setCheerNotification(null)} />;
          case 'friends': return <FriendsScreen friends={friends} onAddFriend={(input) => setFriends([{ id: Math.random().toString(), nickname: input, level: 1, streakCount: 0, avatar: '🌱', lastActive: '방금 전', cheeredToday: false }, ...friends])} onCheerFriend={(id) => { setFriends(friends.map(f => f.id === id ? { ...f, cheeredToday: true } : f)); setUser(prev => ({ ...prev, totalXP: prev.totalXP + 2 })); }} />;
          case 'input': return <TaskInputScreen onCreate={handleCreateMacroTask} user={user} />;
          case 'shop': return <ShopScreen user={user} onBuyItem={(type, cost) => { if (user.totalXP >= cost) { setUser(prev => ({ ...prev, totalXP: prev.totalXP - cost, inventory: { ...prev.inventory, streakFreeze: prev.inventory.streakFreeze + (type === 'freeze' ? 1 : 0) } })); return true; } return false; }} />;
          case 'play': return currentQuest ? <QuestPlayScreen quest={currentQuest} onComplete={() => handleTaskComplete(currentQuest.id)} onTooHard={() => alert("AI가 난이도를 조정 중...")} /> : <HomeScreen user={user} microTasks={microTasks} dailyQuests={dailyQuests} onStartQuest={setCurrentQuest} onMoveTask={moveTask} />;
          case 'league': return <LeagueScreen user={user} />;
          case 'profile': return <ProfileScreen user={user} onUpdateProfile={(n, a) => setUser(prev => ({ ...prev, nickname: n, avatar: a }))} onAddFeedback={async (r) => { const advice = await getAIAdvice(r, user); setUser(prev => ({ ...prev, feedbackHistory: [{ id: Math.random().toString(36).substr(2, 9), date: new Date().toLocaleDateString(), userReflection: r, aiAdvice: advice }, ...prev.feedbackHistory] })); }} />;
          default: return null;
        }
      })()}
    </Layout>
  );
};

export default App;

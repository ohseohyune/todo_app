
import React, { useState, useEffect, useCallback } from 'react';
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
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(INITIAL_DAILY_QUESTS);
  const [currentQuest, setCurrentQuest] = useState<MicroTask | null>(null);

  // 일일 리셋 로직
  const checkDailyReset = useCallback((savedUser: User, savedQuests: DailyQuest[]) => {
    const now = new Date();
    const todayStr = now.toDateString();
    
    if (!savedUser.lastActiveDate) return { updatedUser: savedUser, updatedQuests: savedQuests };

    const lastDate = new Date(savedUser.lastActiveDate);
    const lastDateStr = lastDate.toDateString();

    let updatedUser = { ...savedUser };
    let updatedQuests = [...savedQuests];

    // 날짜가 바뀌었으면 데일리 퀘스트 리셋
    if (todayStr !== lastDateStr) {
      updatedQuests = INITIAL_DAILY_QUESTS.map(q => ({ ...q }));
    }

    // 스트릭 유지 여부 판단
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastDateStr !== todayStr && lastDateStr !== yesterdayStr) {
      if (updatedUser.inventory.streakFreeze > 0) {
        updatedUser.inventory.streakFreeze -= 1;
        setCheerNotification("스트릭 프리즈를 사용하여 연속 기록을 지켰습니다! ❄️");
      } else {
        updatedUser.streakCount = 0;
        setCheerNotification("스트릭이 끊겼습니다. 오늘부터 다시 시작해봐요! 💪");
      }
    }

    return { updatedUser, updatedQuests };
  }, []);

  const handleManualReset = () => {
    const confirmed = window.confirm("진행 중인 모든 할 일과 오늘의 퀘스트 진행도를 초기화하시겠습니까?");
    if (confirmed) {
      // 1. 모든 상태를 순차적으로 확실히 초기화
      setDailyQuests(INITIAL_DAILY_QUESTS.map(q => ({ ...q })));
      setMicroTasks([]);
      setMacroTasks([]);
      setCurrentQuest(null);
      
      // 2. 알림 메시지 표시
      setCheerNotification("초기화 완료! 새로운 하루를 계획해보세요. 🔄");
      
      // 3. 홈 화면으로 강제 이동
      setActiveTab('home');
      
      // 4. 로컬 스토리지 데이터 동기화를 위해 로그 출력
      console.log("System manually reset by user.");
    }
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
        if (parsed.friends) setFriends(parsed.friends);
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
        user, friends, macroTasks, microTasks, dailyQuests
      }));
    }
  }, [user, friends, macroTasks, microTasks, dailyQuests, isLoaded]);

  useEffect(() => {
    if (activeTab === 'play' && !currentQuest) {
      setActiveTab('home');
    }
  }, [activeTab, currentQuest]);

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
    const xpReward = 40; 
    
    setUser(prev => {
      const updated = {
        ...prev,
        totalXP: prev.totalXP + xpReward,
        lastActiveDate: new Date().toISOString(),
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
          case 'home': return <HomeScreen user={user} microTasks={microTasks} dailyQuests={dailyQuests} onStartQuest={handleStartQuest} onMoveTask={()=>{}} cheerNotification={cheerNotification} onClearNotification={() => setCheerNotification(null)} onGoToTab={setActiveTab} onResetQuests={handleManualReset} />;
          case 'input': return <TaskInputScreen onCreate={handleCreateMacroTask} user={user} />;
          case 'play': return currentQuest ? <QuestPlayScreen quest={currentQuest} onComplete={(min) => handleTaskComplete(currentQuest.id, min)} onTooHard={() => {}} /> : null;
          case 'friends': return <FriendsScreen friends={friends} onAddFriend={()=>{}} onCheerFriend={()=>{}} />;
          case 'shop': return <ShopScreen user={user} onBuyItem={handleBuyItem} />;
          case 'league': return <LeagueScreen user={user} />;
          case 'profile': return <ProfileScreen user={user} onUpdateProfile={(n, a) => setUser(prev => ({ ...prev, nickname: n, avatar: a }))} onAddFeedback={handleAddFeedback} />;
          default: return null;
        }
      })()}
    </Layout>
  );
};

export default App;


import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import { User, MacroTask, MicroTask, TaskStatus, LeagueTier, DailyQuest, Friend, FeedbackEntry, GardenPlant } from './types.ts';
import { decomposeTask, getAIAdvice } from './services/geminiService.ts';

// Screens
import HomeScreen from './screens/HomeScreen.tsx';
import TaskInputScreen from './screens/TaskInputScreen.tsx';
import QuestPlayScreen from './screens/QuestPlayScreen.tsx';
import LeagueScreen from './screens/LeagueScreen.tsx';
import ProfileScreen from './screens/ProfileScreen.tsx';
import FriendsScreen from './screens/FriendsScreen.tsx';
import ShopScreen from './screens/ShopScreen.tsx';

const STORAGE_KEY = 'quest_todo_data_v2';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [cheerNotification, setCheerNotification] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // State
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
    garden: []
  });

  const [friends, setFriends] = useState<Friend[]>([
    { id: 'f1', nickname: '알파고', level: 24, streakCount: 15, currentTaskTitle: '머신러닝 논문 읽기', avatar: '🤖', lastActive: '방금 전', cheeredToday: false },
    { id: 'f2', nickname: '김열정', level: 8, streakCount: 3, currentTaskTitle: '아침 조깅 5km', avatar: '🏃', lastActive: '10분 전', cheeredToday: false },
    { id: 'f3', nickname: '도서관장', level: 19, streakCount: 42, currentTaskTitle: '고전 인문학 필사', avatar: '📚', lastActive: '1시간 전', cheeredToday: false },
  ]);

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
        setUser(parsed.user);
        setFriends(parsed.friends);
        setMacroTasks(parsed.macroTasks);
        setMicroTasks(parsed.microTasks);
        setDailyQuests(parsed.dailyQuests);
      } catch (e) {
        console.error("저장된 데이터를 불러오는 데 실패했습니다.");
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

  useEffect(() => {
    const newLevel = Math.floor(user.totalXP / 1000) + 1;
    if (newLevel > user.level) {
      setUser(prev => ({ ...prev, level: newLevel }));
    }
  }, [user.totalXP]);

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
    if (isNewDay) {
      newStreak += 1;
    }

    let newGarden = [...user.garden];
    if (Math.random() > 0.4 && newGarden.length < 12) {
      let plantEmoji = '🌿';
      const category = completedTask.category || '일반';
      
      if (category === '업무') plantEmoji = '🌳';
      else if (category === '공부') plantEmoji = '🌸';
      else if (category === '건강') plantEmoji = '🌵';
      else if (category === '집안일') plantEmoji = '🌻';

      newGarden.push({
        id: Math.random().toString(),
        type: plantEmoji,
        category: category,
        position: Math.floor(Math.random() * 12),
        grownAt: now.toISOString()
      });
    }

    setUser(prev => ({ 
      ...prev, 
      totalXP: prev.totalXP + gainedXP,
      totalCompletedTasks: prev.totalCompletedTasks + 1,
      streakCount: newStreak,
      maxStreak: Math.max(prev.maxStreak, newStreak),
      lastActiveDate: now.toISOString(),
      garden: newGarden
    }));

    setDailyQuests(prev => prev.map(q => {
      if (q.id === 'q1') return { ...q, currentValue: Math.min(q.targetValue, q.currentValue + 1), completed: q.currentValue + 1 >= q.targetValue };
      if (q.id === 'q2') return { ...q, currentValue: Math.min(q.targetValue, q.currentValue + gainedXP), completed: q.currentValue + gainedXP >= q.targetValue };
      return q;
    }));

    const nextTask = updatedMicroTasks.find(t => t.status === TaskStatus.TODO);
    if (nextTask) {
      setCurrentQuest(nextTask);
    } else {
      setCurrentQuest(null);
      setActiveTab('home');
    }
  };

  const handleCheerFriend = (friendId: string) => {
    const friendIndex = friends.findIndex(f => f.id === friendId);
    if (friendIndex !== -1 && !friends[friendIndex].cheeredToday) {
      const updatedFriends = [...friends];
      updatedFriends[friendIndex] = { ...friends[friendIndex], cheeredToday: true };
      setFriends(updatedFriends);
      setUser(prev => ({ ...prev, totalXP: prev.totalXP + 2 }));
      
      setDailyQuests(prev => prev.map(q => 
        q.id === 'q3' ? { ...q, currentValue: 1, completed: true } : q
      ));
    }
  };

  const handleBuyItem = (itemType: string, cost: number) => {
    if (user.totalXP >= cost) {
      setUser(prev => ({
        ...prev,
        totalXP: prev.totalXP - cost,
        inventory: {
          ...prev.inventory,
          streakFreeze: prev.inventory.streakFreeze + (itemType === 'freeze' ? 1 : 0)
        }
      }));
      return true;
    }
    return false;
  };

  const handleCreateMacroTask = async (title: string, category: string): Promise<boolean> => {
    // 사용자의 레벨과 스트릭 정보를 넘겨서 시간을 더 스마트하게 계산하게 합니다.
    const micros = await decomposeTask(title, category, { 
      level: user.level, 
      streak: user.streakCount 
    });

    if (micros.length === 0) {
      // AI 분해에 실패했을 때 처리
      alert("현재 AI가 너무 바쁘네요! 😭 (할당량 초과)\n잠시 후(약 1분 뒤) 다시 시도해 주세요.");
      return false; // 실패 반환
    }

    const newMacro: MacroTask = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      category,
      createdAt: new Date().toISOString(),
      status: TaskStatus.TODO
    };
    setMacroTasks(prev => [...prev, newMacro]);
    
    const fullMicros = micros.map(m => ({ 
      ...m, 
      macroTaskId: newMacro.id, 
      category: category,
      status: TaskStatus.TODO 
    } as MicroTask));
    setMicroTasks(prev => [...prev, ...fullMicros]);
    
    if (!currentQuest && fullMicros.length > 0) {
      setCurrentQuest(fullMicros[0]);
      setActiveTab('play');
    } else {
      setActiveTab('home');
    }
    return true; // 성공 반환
  };

  const handleUpdateProfile = (nickname: string, avatar: string) => {
    setUser(prev => ({ ...prev, nickname, avatar }));
  };

  const handleAddFeedback = async (reflection: string) => {
    const advice = await getAIAdvice(reflection, {
      level: user.level,
      streakCount: user.streakCount,
      totalXP: user.totalXP
    });
    
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
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen 
            user={user} 
            microTasks={microTasks}
            dailyQuests={dailyQuests}
            onStartQuest={(quest) => {
              setCurrentQuest(quest);
              setActiveTab('play');
            }}
            cheerNotification={cheerNotification}
            onClearNotification={() => setCheerNotification(null)}
          />
        );
      case 'friends':
        return (
          <FriendsScreen 
            friends={friends} 
            onAddFriend={(input) => {
              const newFriend: Friend = {
                id: Math.random().toString(),
                nickname: input,
                level: 1,
                streakCount: 0,
                avatar: '🌱',
                lastActive: '방금 전',
                cheeredToday: false
              };
              setFriends([newFriend, ...friends]);
            }}
            onCheerFriend={handleCheerFriend}
          />
        );
      case 'input':
        return <TaskInputScreen onCreate={handleCreateMacroTask} user={user} />;
      case 'shop':
        return <ShopScreen user={user} onBuyItem={handleBuyItem} />;
      case 'play':
        return currentQuest ? (
          <QuestPlayScreen 
            quest={currentQuest} 
            onComplete={() => handleTaskComplete(currentQuest.id)}
            onTooHard={() => alert("AI가 난이도를 조정 중입니다... (현재 데모 버전)")}
          />
        ) : <HomeScreen user={user} microTasks={microTasks} dailyQuests={dailyQuests} onStartQuest={setCurrentQuest} />;
      case 'league':
        return <LeagueScreen user={user} />;
      case 'profile':
        return (
          <ProfileScreen 
            user={user} 
            onUpdateProfile={handleUpdateProfile}
            onAddFeedback={handleAddFeedback}
          />
        );
      default:
        return <HomeScreen user={user} microTasks={microTasks} dailyQuests={dailyQuests} onStartQuest={setCurrentQuest} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderScreen()}
    </Layout>
  );
};

export default App;

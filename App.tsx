
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { User, MacroTask, MicroTask, TaskStatus, LeagueTier, DailyQuest, Friend, FeedbackEntry, GardenPlant } from './types';
import { decomposeTask, getAIAdvice } from './services/geminiService';

// Screens
import HomeScreen from './screens/HomeScreen';
import TaskInputScreen from './screens/TaskInputScreen';
import QuestPlayScreen from './screens/QuestPlayScreen';
import LeagueScreen from './screens/LeagueScreen';
import ProfileScreen from './screens/ProfileScreen';
import FriendsScreen from './screens/FriendsScreen';
import ShopScreen from './screens/ShopScreen';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [cheerNotification, setCheerNotification] = useState<string | null>(null);

  const [user, setUser] = useState<User>({
    id: '1',
    nickname: '퀘스트마스터',
    avatar: '👨‍🚀',
    streakCount: 5,
    lastActiveDate: new Date().toISOString(),
    level: 12,
    totalXP: 2450,
    leagueTier: LeagueTier.GOLD,
    feedbackHistory: [],
    receivedCheers: 24,
    inventory: {
      streakFreeze: 1
    },
    garden: [
      { id: 'p1', type: '🌸', position: 2, grownAt: new Date().toISOString() },
      { id: 'p2', type: '🌿', position: 5, grownAt: new Date().toISOString() },
    ]
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
    { id: 'q3', title: '스트릭 유지하기', targetValue: 1, currentValue: 1, completed: true, xpReward: 30 },
  ]);

  const [currentQuest, setCurrentQuest] = useState<MicroTask | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCheerNotification("알파고님이 당신을 응원하며 에너지를 보냈습니다! +5 XP 🔋");
      setUser(prev => ({ ...prev, totalXP: prev.totalXP + 5, receivedCheers: prev.receivedCheers + 1 }));
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  const handleTaskComplete = (microTaskId: string) => {
    const updated = microTasks.map(t => t.id === microTaskId ? { ...t, status: TaskStatus.DONE } : t);
    setMicroTasks(updated);
    
    const completedTask = microTasks.find(t => t.id === microTaskId);
    if (completedTask) {
      const gainedXP = completedTask.xpReward;
      
      // 정원 성장 로직: 일정 확률 또는 일정 완료 횟수마다 식물 추가
      const shouldGrowPlant = Math.random() > 0.7; // 30% 확률로 정원에 새 생명
      let newGarden = [...user.garden];
      if (shouldGrowPlant && newGarden.length < 12) {
        const plantTypes = ['🌸', '🌿', '🌳', '🌻', '🌵', '🍀', '🌲'];
        const newPlant: GardenPlant = {
          id: Math.random().toString(),
          type: plantTypes[Math.floor(Math.random() * plantTypes.length)],
          position: Math.floor(Math.random() * 12),
          grownAt: new Date().toISOString()
        };
        newGarden.push(newPlant);
      }

      setUser(prev => ({ 
        ...prev, 
        totalXP: prev.totalXP + gainedXP,
        garden: newGarden
      }));

      setDailyQuests(prev => prev.map(q => {
        if (q.id === 'q1') return { ...q, currentValue: Math.min(q.targetValue, q.currentValue + 1), completed: q.currentValue + 1 >= q.targetValue };
        if (q.id === 'q2') return { ...q, currentValue: Math.min(q.targetValue, q.currentValue + gainedXP), completed: q.currentValue + gainedXP >= q.targetValue };
        return q;
      }));
    }

    const nextTask = updated.find(t => t.status === TaskStatus.TODO);
    if (nextTask) {
      setCurrentQuest(nextTask);
    } else {
      setCurrentQuest(null);
      setActiveTab('home');
    }
  };

  const handleCheerFriend = (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    if (friend && !friend.cheeredToday) {
      setFriends(prev => prev.map(f => f.id === friendId ? { ...f, cheeredToday: true } : f));
      setUser(prev => ({ ...prev, totalXP: prev.totalXP + 2 }));
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

  const handleCreateMacroTask = async (title: string, category: string) => {
    const newMacro: MacroTask = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      category,
      createdAt: new Date().toISOString(),
      status: TaskStatus.TODO
    };
    setMacroTasks(prev => [...prev, newMacro]);

    const micros = await decomposeTask(title, category);
    const fullMicros = micros.map(m => ({ ...m, macroTaskId: newMacro.id } as MicroTask));
    setMicroTasks(prev => [...prev, ...fullMicros]);
    
    if (!currentQuest && fullMicros.length > 0) {
      setCurrentQuest(fullMicros[0]);
      setActiveTab('play');
    } else {
      setActiveTab('home');
    }
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
            onAddFriend={(id) => {
              const newFriend: Friend = {
                id: Math.random().toString(),
                nickname: `탐험가_${id.slice(-4)}`,
                level: 1,
                streakCount: 0,
                avatar: '✨',
                lastActive: '방금 전',
                cheeredToday: false
              };
              setFriends([newFriend, ...friends]);
            }}
            onCheerFriend={handleCheerFriend}
          />
        );
      case 'input':
        return <TaskInputScreen onCreate={handleCreateMacroTask} />;
      case 'shop':
        return <ShopScreen user={user} onBuyItem={handleBuyItem} />;
      case 'play':
        return currentQuest ? (
          <QuestPlayScreen 
            quest={currentQuest} 
            onComplete={() => handleTaskComplete(currentQuest.id)}
            onTooHard={() => {
              alert("AI가 난이도를 조정 중입니다... 퀘스트를 더 작게 쪼개는 중!");
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <span className="text-6xl mb-4">💤</span>
            <h2 className="text-2xl font-bold text-white">진행 중인 퀘스트가 없어요!</h2>
            <p className="text-white/60 mt-2">홈에서 할 일을 선택하거나 새로운 퀘스트를 만들어 보세요.</p>
            <button 
              onClick={() => setActiveTab('input')}
              className="mt-6 bg-white text-[#2D4F1E] px-8 py-3 rounded-2xl font-black shadow-[0_4px_0_#d1d0ce] active:shadow-none active:translate-y-1"
            >
              새 퀘스트 만들기
            </button>
          </div>
        );
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
    <Layout activeTab={activeTab} onTabChange={(tab) => {
      setActiveTab(tab);
    }}>
      {renderScreen()}
    </Layout>
  );
};

export default App;

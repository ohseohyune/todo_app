
export enum TaskStatus {
  TODO = 'todo',
  DOING = 'doing',
  DONE = 'done'
}

export enum LeagueTier {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
  DIAMOND = 'Diamond'
}

export interface Badge {
  id: string;
  title: string;
  emoji: string;
  description: string;
  unlockedAt?: string;
}

export interface FeedbackEntry {
  id: string;
  date: string;
  userReflection: string;
  aiAdvice: string;
}

export interface GardenPlant {
  id: string;
  type: string; // 🌸, 🌿, 🌳, 🌻, 🌵
  category?: string;
  position: number;
  grownAt: string;
}

export interface User {
  id: string;
  nickname: string;
  avatar: string; // Emoji or Image URL
  streakCount: number;
  maxStreak: number;
  lastActiveDate: string | null;
  level: number;
  totalXP: number;
  totalFocusMinutes: number;
  leagueTier: LeagueTier;
  feedbackHistory: FeedbackEntry[];
  totalCompletedTasks: number;
  inventory: {
    streakFreeze: number;
  };
  garden: GardenPlant[];
  unlockedBadges: string[];
  // 새 필드: 시간 예측 정확도 (최근 완료 태스크들의 실제/예상 비율 평균)
  recentAccuracyRatio?: number; 
}

// Fixed Error: Added missing Friend interface required by FriendsScreen.tsx
export interface Friend {
  id: string;
  nickname: string;
  avatar: string;
  level: number;
  streakCount: number;
  currentTaskTitle?: string;
  cheeredToday: boolean;
}

export interface MacroTask {
  id: string;
  title: string;
  category: string;
  deadline?: string;
  createdAt: string;
  status: TaskStatus;
}

export interface MicroTask {
  id: string;
  macroTaskId: string;
  title: string;
  category?: string;
  orderIndex: number;
  durationEstMin: number;
  actualDurationMin?: number; // 새 필드: 실제 걸린 시간
  difficulty: number;
  frictionScore: number;
  xpReward: number;
  successCriteria: string;
  nextHint: string;
  status: TaskStatus;
}

export interface DailyQuest {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  completed: boolean;
  xpReward: number;
}


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

export interface FeedbackEntry {
  id: string;
  date: string;
  userReflection: string;
  aiAdvice: string;
}

export interface GardenPlant {
  id: string;
  type: string; // 🌸, 🌿, 🌳, 🌻, 🌵
  position: number;
  grownAt: string;
}

export interface User {
  id: string;
  nickname: string;
  avatar: string;
  streakCount: number;
  lastActiveDate: string | null;
  level: number;
  totalXP: number;
  leagueTier: LeagueTier;
  feedbackHistory: FeedbackEntry[];
  receivedCheers: number;
  inventory: {
    streakFreeze: number;
  };
  garden: GardenPlant[]; // 추가: 정원에 자라난 식물들
}

export interface Friend {
  id: string;
  nickname: string;
  level: number;
  streakCount: number;
  currentTaskTitle?: string;
  avatar: string;
  lastActive: string;
  cheeredToday?: boolean;
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
  orderIndex: number;
  durationEstMin: number;
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

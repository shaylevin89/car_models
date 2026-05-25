export type DifficultyTier = 1 | 2 | 3;

export interface CarBrand {
  name: string;
  logoSlug: string;
  models: string[];
  tier: DifficultyTier;
}

export interface Question {
  brand: CarBrand;
  correctModel: string;
  options: string[]; // 4 options, one is correctModel
}

export type GamePhase = 'start' | 'playing' | 'gameover';

export interface GameState {
  phase: GamePhase;
  score: number;
  currentQuestion: Question | null;
  timeRemaining: number; // in seconds
  lastAnswerCorrect: boolean | null; // null = no answer yet, true = correct, false = wrong/timeout
}

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'SET_QUESTION'; question: Question }
  | { type: 'ANSWER'; selectedModel: string }
  | { type: 'TIMEOUT' }
  | { type: 'TICK' }
  | { type: 'GAME_OVER' }
  | { type: 'RESET' };

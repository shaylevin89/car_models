export type DifficultyTier = 1 | 2 | 3;

export type Subject = 'cars' | 'countries';

export interface CarBrand {
  name: string;
  logoSlug: string;
  models: string[];
  tier: DifficultyTier;
}

export interface Country {
  name: string;
  capital: string;
  otherCities: string[];
  tier: DifficultyTier;
}

interface BaseQuestion {
  correctAnswer: string;
  options: string[]; // 4 options, one is correctAnswer
}

export interface CarsQuestion extends BaseQuestion {
  subject: 'cars';
  brand: CarBrand;
}

export interface CountriesQuestion extends BaseQuestion {
  subject: 'countries';
  country: Country;
}

export type Question = CarsQuestion | CountriesQuestion;

export type GamePhase = 'home' | 'start' | 'playing' | 'gameover';

export interface GameState {
  phase: GamePhase;
  subject: Subject | null;
  score: number;
  currentQuestion: Question | null;
  timeRemaining: number; // in seconds
  lastAnswerCorrect: boolean | null; // null = no answer yet, true = correct, false = wrong/timeout
  // Brand names (cars) or country names (countries) used in the most recent
  // questions, oldest first. Capped at RECENT_QUESTIONS_WINDOW to prevent
  // back-to-back repeats during a session.
  recentKeys: string[];
}

export type GameAction =
  | { type: 'GO_HOME' }
  | { type: 'SELECT_SUBJECT'; subject: Subject }
  | { type: 'START_GAME' }
  | { type: 'SET_QUESTION'; question: Question }
  | { type: 'ANSWER'; selectedAnswer: string }
  | { type: 'TIMEOUT' }
  | { type: 'TICK' }
  | { type: 'GAME_OVER' }
  | { type: 'RESET' };

import { describe, it, expect } from 'vitest';
import {
  gameReducer,
  initialGameState,
  QUESTION_TIME_SECONDS,
  RECENT_QUESTIONS_WINDOW,
} from '../../src/hooks/useGameState';
import { GameState, Question } from '../../src/types/game';

const mockCarsQuestion: Question = {
  subject: 'cars',
  brand: {
    name: 'Toyota',
    logoSlug: 'toyota',
    models: ['Corolla', 'Camry', 'RAV4'],
    tier: 1,
  },
  correctAnswer: 'Corolla',
  options: ['Corolla', 'Civic', 'Golf', 'Altima'],
};

const mockCountriesQuestion: Question = {
  subject: 'countries',
  country: {
    name: 'France',
    capital: 'Paris',
    tier: 1,
  },
  correctAnswer: 'Paris',
  options: ['Paris', 'Berlin', 'Rome', 'Madrid'],
};

describe('gameReducer', () => {
  it('initial state is home phase with score 0 and no subject', () => {
    expect(initialGameState.phase).toBe('home');
    expect(initialGameState.score).toBe(0);
    expect(initialGameState.subject).toBeNull();
    expect(initialGameState.currentQuestion).toBeNull();
  });

  it('SELECT_SUBJECT transitions from home to start phase and stores subject', () => {
    const state = gameReducer(initialGameState, { type: 'SELECT_SUBJECT', subject: 'cars' });
    expect(state.phase).toBe('start');
    expect(state.subject).toBe('cars');
    expect(state.score).toBe(0);
  });

  it('SELECT_SUBJECT supports countries subject', () => {
    const state = gameReducer(initialGameState, { type: 'SELECT_SUBJECT', subject: 'countries' });
    expect(state.phase).toBe('start');
    expect(state.subject).toBe('countries');
  });

  it('GO_HOME returns to home phase and clears subject', () => {
    const gameover: GameState = {
      ...initialGameState,
      phase: 'gameover',
      subject: 'cars',
      score: 12,
    };
    const state = gameReducer(gameover, { type: 'GO_HOME' });
    expect(state.phase).toBe('home');
    expect(state.subject).toBeNull();
    expect(state.score).toBe(0);
  });

  it('START_GAME transitions to playing phase', () => {
    const start: GameState = { ...initialGameState, phase: 'start', subject: 'cars' };
    const state = gameReducer(start, { type: 'START_GAME' });
    expect(state.phase).toBe('playing');
    expect(state.subject).toBe('cars');
    expect(state.score).toBe(0);
    expect(state.timeRemaining).toBe(QUESTION_TIME_SECONDS);
  });

  it('SET_QUESTION sets the current question and resets timer', () => {
    const playing: GameState = { ...initialGameState, phase: 'playing', subject: 'cars' };
    const state = gameReducer(playing, { type: 'SET_QUESTION', question: mockCarsQuestion });
    expect(state.currentQuestion).toBe(mockCarsQuestion);
    expect(state.timeRemaining).toBe(QUESTION_TIME_SECONDS);
    expect(state.lastAnswerCorrect).toBeNull();
  });

  it('correct ANSWER increments score (cars)', () => {
    const playing: GameState = {
      ...initialGameState,
      phase: 'playing',
      subject: 'cars',
      currentQuestion: mockCarsQuestion,
      score: 3,
    };
    const state = gameReducer(playing, { type: 'ANSWER', selectedAnswer: 'Corolla' });
    expect(state.score).toBe(4);
    expect(state.lastAnswerCorrect).toBe(true);
  });

  it('correct ANSWER increments score (countries)', () => {
    const playing: GameState = {
      ...initialGameState,
      phase: 'playing',
      subject: 'countries',
      currentQuestion: mockCountriesQuestion,
      score: 2,
    };
    const state = gameReducer(playing, { type: 'ANSWER', selectedAnswer: 'Paris' });
    expect(state.score).toBe(3);
    expect(state.lastAnswerCorrect).toBe(true);
  });

  it('wrong ANSWER keeps phase playing for red flash feedback', () => {
    const playing: GameState = {
      ...initialGameState,
      phase: 'playing',
      subject: 'cars',
      currentQuestion: mockCarsQuestion,
      score: 3,
    };
    const state = gameReducer(playing, { type: 'ANSWER', selectedAnswer: 'Civic' });
    expect(state.phase).toBe('playing'); // stays playing for 500ms red flash
    expect(state.score).toBe(3); // score unchanged
    expect(state.lastAnswerCorrect).toBe(false);
  });

  it('TIMEOUT keeps phase playing for red flash feedback', () => {
    const playing: GameState = {
      ...initialGameState,
      phase: 'playing',
      subject: 'cars',
      currentQuestion: mockCarsQuestion,
      score: 5,
    };
    const state = gameReducer(playing, { type: 'TIMEOUT' });
    expect(state.phase).toBe('playing'); // stays playing for 500ms red flash
    expect(state.score).toBe(5);
    expect(state.lastAnswerCorrect).toBe(false);
  });

  it('GAME_OVER transitions to gameover phase', () => {
    const playing: GameState = {
      ...initialGameState,
      phase: 'playing',
      subject: 'cars',
      currentQuestion: mockCarsQuestion,
      score: 3,
      lastAnswerCorrect: false,
    };
    const state = gameReducer(playing, { type: 'GAME_OVER' });
    expect(state.phase).toBe('gameover');
    expect(state.subject).toBe('cars'); // subject preserved
    expect(state.score).toBe(3); // score preserved
  });

  it('TICK decrements timeRemaining by 1', () => {
    const playing: GameState = {
      ...initialGameState,
      phase: 'playing',
      timeRemaining: 7,
    };
    const state = gameReducer(playing, { type: 'TICK' });
    expect(state.timeRemaining).toBe(6);
  });

  it('TICK at 0 does not go negative', () => {
    const playing: GameState = {
      ...initialGameState,
      phase: 'playing',
      timeRemaining: 0,
    };
    const state = gameReducer(playing, { type: 'TICK' });
    expect(state.timeRemaining).toBe(0);
  });

  it('RESET returns to the start phase of the current subject (Play Again)', () => {
    const gameover: GameState = {
      ...initialGameState,
      phase: 'gameover',
      subject: 'countries',
      score: 15,
    };
    const state = gameReducer(gameover, { type: 'RESET' });
    expect(state.phase).toBe('start');
    expect(state.subject).toBe('countries'); // current subject preserved
    expect(state.score).toBe(0);
    expect(state.currentQuestion).toBeNull();
    expect(state.recentKeys).toEqual([]);
  });

  describe('recentKeys tracking', () => {
    it('initial state has an empty recentKeys list', () => {
      expect(initialGameState.recentKeys).toEqual([]);
    });

    it('SET_QUESTION appends the question key (brand name for cars)', () => {
      const playing: GameState = { ...initialGameState, phase: 'playing', subject: 'cars' };
      const state = gameReducer(playing, { type: 'SET_QUESTION', question: mockCarsQuestion });
      expect(state.recentKeys).toEqual(['Toyota']);
    });

    it('SET_QUESTION appends the question key (country name for countries)', () => {
      const playing: GameState = { ...initialGameState, phase: 'playing', subject: 'countries' };
      const state = gameReducer(playing, { type: 'SET_QUESTION', question: mockCountriesQuestion });
      expect(state.recentKeys).toEqual(['France']);
    });

    it('caps recentKeys at RECENT_QUESTIONS_WINDOW, evicting the oldest', () => {
      let state: GameState = { ...initialGameState, phase: 'playing', subject: 'cars' };
      const brands = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      for (const name of brands) {
        const question: Question = {
          subject: 'cars',
          brand: { name, logoSlug: name.toLowerCase(), models: [`${name}-1`], tier: 1 },
          correctAnswer: `${name}-1`,
          options: [`${name}-1`, 'x', 'y', 'z'],
        };
        state = gameReducer(state, { type: 'SET_QUESTION', question });
      }
      expect(state.recentKeys).toHaveLength(RECENT_QUESTIONS_WINDOW);
      // The oldest two ('A', 'B') have been evicted; the last 5 remain in order.
      expect(state.recentKeys).toEqual(['C', 'D', 'E', 'F', 'G']);
    });

    it('START_GAME clears recentKeys', () => {
      const dirty: GameState = {
        ...initialGameState,
        phase: 'start',
        subject: 'cars',
        recentKeys: ['Toyota', 'BMW'],
      };
      const state = gameReducer(dirty, { type: 'START_GAME' });
      expect(state.recentKeys).toEqual([]);
    });

    it('RESET clears recentKeys', () => {
      const dirty: GameState = {
        ...initialGameState,
        phase: 'gameover',
        subject: 'cars',
        recentKeys: ['Toyota', 'BMW'],
      };
      const state = gameReducer(dirty, { type: 'RESET' });
      expect(state.recentKeys).toEqual([]);
    });
  });
});

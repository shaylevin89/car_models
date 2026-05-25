import { describe, it, expect } from 'vitest';
import { gameReducer, initialGameState, QUESTION_TIME_SECONDS } from '../../src/hooks/useGameState';
import { GameState, Question } from '../../src/types/game';

const mockQuestion: Question = {
  brand: {
    name: 'Toyota',
    logoSlug: 'toyota',
    models: ['Corolla', 'Camry', 'RAV4'],
    tier: 1,
  },
  correctModel: 'Corolla',
  options: ['Corolla', 'Civic', 'Golf', 'Altima'],
};

describe('gameReducer', () => {
  it('initial state is start phase with score 0', () => {
    expect(initialGameState.phase).toBe('start');
    expect(initialGameState.score).toBe(0);
    expect(initialGameState.currentQuestion).toBeNull();
  });

  it('START_GAME transitions to playing phase', () => {
    const state = gameReducer(initialGameState, { type: 'START_GAME' });
    expect(state.phase).toBe('playing');
    expect(state.score).toBe(0);
    expect(state.timeRemaining).toBe(QUESTION_TIME_SECONDS);
  });

  it('SET_QUESTION sets the current question and resets timer', () => {
    const playing: GameState = { ...initialGameState, phase: 'playing' };
    const state = gameReducer(playing, { type: 'SET_QUESTION', question: mockQuestion });
    expect(state.currentQuestion).toBe(mockQuestion);
    expect(state.timeRemaining).toBe(QUESTION_TIME_SECONDS);
    expect(state.lastAnswerCorrect).toBeNull();
  });

  it('correct ANSWER increments score', () => {
    const playing: GameState = {
      ...initialGameState,
      phase: 'playing',
      currentQuestion: mockQuestion,
      score: 3,
    };
    const state = gameReducer(playing, { type: 'ANSWER', selectedModel: 'Corolla' });
    expect(state.score).toBe(4);
    expect(state.lastAnswerCorrect).toBe(true);
  });

  it('wrong ANSWER keeps phase playing for red flash feedback', () => {
    const playing: GameState = {
      ...initialGameState,
      phase: 'playing',
      currentQuestion: mockQuestion,
      score: 3,
    };
    const state = gameReducer(playing, { type: 'ANSWER', selectedModel: 'Civic' });
    expect(state.phase).toBe('playing'); // stays playing for 500ms red flash
    expect(state.score).toBe(3); // score unchanged
    expect(state.lastAnswerCorrect).toBe(false);
  });

  it('TIMEOUT keeps phase playing for red flash feedback', () => {
    const playing: GameState = {
      ...initialGameState,
      phase: 'playing',
      currentQuestion: mockQuestion,
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
      currentQuestion: mockQuestion,
      score: 3,
      lastAnswerCorrect: false,
    };
    const state = gameReducer(playing, { type: 'GAME_OVER' });
    expect(state.phase).toBe('gameover');
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

  it('RESET returns to initial state', () => {
    const gameover: GameState = {
      ...initialGameState,
      phase: 'gameover',
      score: 15,
    };
    const state = gameReducer(gameover, { type: 'RESET' });
    expect(state).toEqual(initialGameState);
  });
});

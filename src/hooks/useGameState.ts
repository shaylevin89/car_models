import { useReducer, useCallback, useEffect, useRef } from 'react';
import { GameState, GameAction } from '../types/game';
import { generateQuestion } from '../utils/questionGenerator';

export const QUESTION_TIME_SECONDS = 10;

export const initialGameState: GameState = {
  phase: 'start',
  score: 0,
  currentQuestion: null,
  timeRemaining: QUESTION_TIME_SECONDS,
  lastAnswerCorrect: null,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        phase: 'playing',
        score: 0,
        timeRemaining: QUESTION_TIME_SECONDS,
        lastAnswerCorrect: null,
        currentQuestion: null,
      };

    case 'SET_QUESTION':
      return {
        ...state,
        currentQuestion: action.question,
        timeRemaining: QUESTION_TIME_SECONDS,
        lastAnswerCorrect: null,
      };

    case 'ANSWER': {
      if (!state.currentQuestion) return state;
      const isCorrect = action.selectedModel === state.currentQuestion.correctModel;
      if (isCorrect) {
        return {
          ...state,
          score: state.score + 1,
          lastAnswerCorrect: true,
        };
      }
      // Wrong answer: keep phase 'playing' so red flash feedback is visible.
      // A useEffect will dispatch GAME_OVER after 500ms.
      return {
        ...state,
        lastAnswerCorrect: false,
      };
    }

    case 'TIMEOUT':
      // Keep phase 'playing' so red flash feedback is visible.
      // A useEffect will dispatch GAME_OVER after 500ms.
      return {
        ...state,
        lastAnswerCorrect: false,
      };

    case 'GAME_OVER':
      return {
        ...state,
        phase: 'gameover',
      };

    case 'TICK':
      return {
        ...state,
        timeRemaining: Math.max(0, state.timeRemaining - 1),
      };

    case 'RESET':
      return initialGameState;

    default:
      return state;
  }
}

/**
 * Loads the next question. Accepts score as a parameter to
 * avoid stale closure bugs — the caller passes state.score
 * at call time.
 */
function loadNextQuestion(score: number, dispatch: React.Dispatch<GameAction>) {
  const question = generateQuestion(score);
  dispatch({ type: 'SET_QUESTION', question });
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
  }, []);

  const handleAnswer = useCallback((selectedModel: string) => {
    clearTimer();
    dispatch({ type: 'ANSWER', selectedModel });
  }, [clearTimer]);

  const resetGame = useCallback(() => {
    clearTimer();
    dispatch({ type: 'RESET' });
  }, [clearTimer]);

  // Start timer when playing and question is set
  useEffect(() => {
    if (state.phase === 'playing' && state.currentQuestion && state.lastAnswerCorrect === null) {
      clearTimer();
      timerRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    }
    return clearTimer;
  }, [state.phase, state.currentQuestion, state.lastAnswerCorrect, clearTimer]);

  // Handle timeout
  useEffect(() => {
    if (state.phase === 'playing' && state.timeRemaining === 0) {
      clearTimer();
      dispatch({ type: 'TIMEOUT' });
    }
  }, [state.timeRemaining, state.phase, clearTimer]);

  // Load first question when game starts
  useEffect(() => {
    if (state.phase === 'playing' && state.currentQuestion === null) {
      loadNextQuestion(state.score, dispatch);
    }
  }, [state.phase, state.currentQuestion, state.score]);

  // Load next question after correct answer feedback
  useEffect(() => {
    if (state.lastAnswerCorrect === true) {
      const timeout = setTimeout(() => {
        // Pass state.score directly to avoid stale closure
        loadNextQuestion(state.score, dispatch);
      }, 500); // 500ms feedback delay
      return () => clearTimeout(timeout);
    }
  }, [state.lastAnswerCorrect, state.score]);

  // Transition to game over after wrong answer/timeout feedback
  useEffect(() => {
    if (state.lastAnswerCorrect === false) {
      const timeout = setTimeout(() => {
        dispatch({ type: 'GAME_OVER' });
      }, 500); // 500ms red flash feedback delay, mirrors the correct-answer green flash
      return () => clearTimeout(timeout);
    }
  }, [state.lastAnswerCorrect]);

  return { state, startGame, handleAnswer, resetGame };
}

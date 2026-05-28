import { useReducer, useCallback, useEffect, useRef } from 'react';
import { GameState, GameAction, Subject } from '../types/game';
import { generateQuestion, getQuestionKey } from '../utils/questionGenerator';

export const QUESTION_TIME_SECONDS = 10;
export const RECENT_QUESTIONS_WINDOW = 5;

export const initialGameState: GameState = {
  phase: 'home',
  subject: null,
  score: 0,
  currentQuestion: null,
  timeRemaining: QUESTION_TIME_SECONDS,
  lastAnswerCorrect: null,
  recentKeys: [],
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'GO_HOME':
      return initialGameState;

    case 'SELECT_SUBJECT':
      return {
        ...initialGameState,
        phase: 'start',
        subject: action.subject,
      };

    case 'START_GAME':
      return {
        ...state,
        phase: 'playing',
        score: 0,
        timeRemaining: QUESTION_TIME_SECONDS,
        lastAnswerCorrect: null,
        currentQuestion: null,
        recentKeys: [],
      };

    case 'SET_QUESTION': {
      const key = getQuestionKey(action.question);
      const nextRecent = [...state.recentKeys, key].slice(-RECENT_QUESTIONS_WINDOW);
      return {
        ...state,
        currentQuestion: action.question,
        timeRemaining: QUESTION_TIME_SECONDS,
        lastAnswerCorrect: null,
        recentKeys: nextRecent,
      };
    }

    case 'ANSWER': {
      if (!state.currentQuestion) return state;
      const isCorrect = action.selectedAnswer === state.currentQuestion.correctAnswer;
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
      // Restarts the current subject's intro screen (Play Again).
      // Use GO_HOME to leave the subject entirely.
      return {
        ...initialGameState,
        phase: 'start',
        subject: state.subject,
      };

    default:
      return state;
  }
}

/**
 * Loads the next question. Accepts score and subject as parameters to
 * avoid stale closure bugs — the caller passes them at call time.
 * `recentKeys` excludes recently-asked brands/countries so the same item
 * doesn't repeat back-to-back.
 */
function loadNextQuestion(
  subject: Subject,
  score: number,
  recentKeys: string[],
  dispatch: React.Dispatch<GameAction>,
) {
  const question = generateQuestion(subject, score, recentKeys);
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

  const goHome = useCallback(() => {
    clearTimer();
    dispatch({ type: 'GO_HOME' });
  }, [clearTimer]);

  const selectSubject = useCallback((subject: Subject) => {
    dispatch({ type: 'SELECT_SUBJECT', subject });
  }, []);

  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
  }, []);

  const handleAnswer = useCallback((selectedAnswer: string) => {
    clearTimer();
    dispatch({ type: 'ANSWER', selectedAnswer });
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
    if (state.phase === 'playing' && state.currentQuestion === null && state.subject) {
      loadNextQuestion(state.subject, state.score, state.recentKeys, dispatch);
    }
  }, [state.phase, state.currentQuestion, state.score, state.subject, state.recentKeys]);

  // Load next question after correct answer feedback
  useEffect(() => {
    if (state.lastAnswerCorrect === true && state.subject) {
      const subject = state.subject;
      const recentKeys = state.recentKeys;
      const timeout = setTimeout(() => {
        // Pass state.score and subject directly to avoid stale closure
        loadNextQuestion(subject, state.score, recentKeys, dispatch);
      }, 500); // 500ms feedback delay
      return () => clearTimeout(timeout);
    }
  }, [state.lastAnswerCorrect, state.score, state.subject, state.recentKeys]);

  // Transition to game over after wrong answer/timeout feedback
  useEffect(() => {
    if (state.lastAnswerCorrect === false) {
      const timeout = setTimeout(() => {
        dispatch({ type: 'GAME_OVER' });
      }, 500); // 500ms red flash feedback delay, mirrors the correct-answer green flash
      return () => clearTimeout(timeout);
    }
  }, [state.lastAnswerCorrect]);

  return { state, goHome, selectSubject, startGame, handleAnswer, resetGame };
}

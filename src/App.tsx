import React from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import { useGameState } from './hooks/useGameState';
import './App.css';

const App: React.FC = () => {
  const { state, startGame, handleAnswer, resetGame } = useGameState();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        }}
      >
        {state.phase === 'start' && <StartScreen onStart={startGame} />}
        {state.phase === 'playing' && (
          <GameScreen state={state} onAnswer={handleAnswer} />
        )}
        {state.phase === 'gameover' && (
          <GameOverScreen score={state.score} onPlayAgain={resetGame} />
        )}
      </Box>
    </ThemeProvider>
  );
};

export default App;

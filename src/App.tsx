import React from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import { useDirectionalTheme } from './theme';
import { rtlCache, ltrCache } from './rtlCache';
import { LanguageProvider, useLanguage } from './i18n';
import LanguageToggleBar from './components/LanguageToggleBar';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import { useGameState } from './hooks/useGameState';
import './App.css';

const ThemedApp: React.FC = () => {
  const { locale } = useLanguage();
  const theme = useDirectionalTheme(locale);
  const cache = locale === 'he' ? rtlCache : ltrCache;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </CacheProvider>
  );
};

const AppContent: React.FC = () => {
  const { state, startGame, handleAnswer, resetGame } = useGameState();
  const { locale } = useLanguage();

  return (
    <Box
      dir={locale === 'he' ? 'rtl' : 'ltr'}
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      <LanguageToggleBar />
      {state.phase === 'start' && <StartScreen onStart={startGame} />}
      {state.phase === 'playing' && (
        <GameScreen state={state} onAnswer={handleAnswer} />
      )}
      {state.phase === 'gameover' && (
        <GameOverScreen score={state.score} onPlayAgain={resetGame} />
      )}
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemedApp />
    </LanguageProvider>
  );
};

export default App;

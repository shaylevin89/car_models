import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { QUESTION_TIME_SECONDS } from '../hooks/useGameState';
import { useLanguage } from '../i18n';

interface TimerBarProps {
  timeRemaining: number;
}

const TimerBar: React.FC<TimerBarProps> = ({ timeRemaining }) => {
  const { t } = useLanguage();
  const progress = (timeRemaining / QUESTION_TIME_SECONDS) * 100;

  const getColor = (): 'primary' | 'warning' | 'error' => {
    if (timeRemaining <= 3) return 'error';
    if (timeRemaining <= 5) return 'warning';
    return 'primary';
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
        <Typography variant="body2" color="text.secondary">
          {t('game.time')}
        </Typography>
        <Typography
          variant="h6"
          color={timeRemaining <= 3 ? 'error.main' : 'text.primary'}
          data-testid="timer-display"
        >
          {timeRemaining}s
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        color={getColor()}
        sx={{
          height: 8,
          borderRadius: 4,
          '& .MuiLinearProgress-bar': {
            transition: 'transform 1s linear',
          },
        }}
        data-testid="timer-bar"
      />
    </Box>
  );
};

export default TimerBar;

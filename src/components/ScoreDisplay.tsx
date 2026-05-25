import React from 'react';
import { Chip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useLanguage } from '../i18n';

interface ScoreDisplayProps {
  score: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  const { t } = useLanguage();

  return (
    <Chip
      icon={<EmojiEventsIcon />}
      label={t('game.score', { score })}
      color="secondary"
      variant="outlined"
      sx={{ fontSize: '1.1rem', py: 2.5, px: 1 }}
      data-testid="score-display"
    />
  );
};

export default ScoreDisplay;

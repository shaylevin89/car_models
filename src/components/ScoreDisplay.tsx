import React from 'react';
import { Chip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

interface ScoreDisplayProps {
  score: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  return (
    <Chip
      icon={<EmojiEventsIcon />}
      label={`Score: ${score}`}
      color="secondary"
      variant="outlined"
      sx={{ fontSize: '1.1rem', py: 2.5, px: 1 }}
      data-testid="score-display"
    />
  );
};

export default ScoreDisplay;

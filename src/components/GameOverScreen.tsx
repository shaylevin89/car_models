import React from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

interface GameOverScreenProps {
  score: number;
  onPlayAgain: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onPlayAgain }) => {
  const getMessage = (): { title: string; subtitle: string } => {
    if (score === 0) return { title: 'Better luck next time!', subtitle: 'בפעם הבאה יהיה יותר טוב!' };
    if (score < 5) return { title: 'Nice try!', subtitle: 'התחלה טובה!' };
    if (score < 10) return { title: 'Great job!', subtitle: '!כל הכבוד' };
    if (score < 20) return { title: 'Amazing!', subtitle: '!מדהים' };
    return { title: 'Car Expert!', subtitle: '!מומחה רכב' };
  };

  const { title, subtitle } = getMessage();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      p={3}
    >
      <Card sx={{ maxWidth: 500, width: '100%', textAlign: 'center', p: 3 }}>
        <CardContent>
          {score >= 5 ? (
            <EmojiEventsIcon sx={{ fontSize: 80, color: 'secondary.main', mb: 2 }} />
          ) : (
            <SentimentVeryDissatisfiedIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          )}
          <Typography variant="h4" color="error" gutterBottom>
            Game Over
          </Typography>
          <Typography variant="h1" color="primary" gutterBottom data-testid="final-score">
            {score}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {score === 1 ? 'point' : 'points'}
          </Typography>
          <Typography variant="h4" sx={{ mt: 2 }} color="text.primary">
            {title}
          </Typography>
          <Box dir="rtl">
            <Typography variant="h6" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onPlayAgain}
            sx={{ mt: 4, px: 6, py: 1.5, fontSize: '1.3rem' }}
            data-testid="play-again-button"
          >
            Play Again
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GameOverScreen;

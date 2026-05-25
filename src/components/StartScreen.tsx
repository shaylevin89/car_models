import React from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { useLanguage } from '../i18n';
import { getBestScore } from '../utils/bestScore';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const { t } = useLanguage();
  const bestScore = getBestScore();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="calc(100vh - 64px)"
      p={3}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          p: 3,
        }}
      >
        <CardContent>
          <DirectionsCarIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h1" gutterBottom color="primary">
            {t('app.title')}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('start.subtitle')}
          </Typography>
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body1" color="text.secondary">
              {t('start.instruction1')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('start.instruction2')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('start.timer_note')}
            </Typography>
          </Box>
          {bestScore > 0 && (
            <Typography
              variant="h6"
              color="secondary"
              sx={{ mb: 2 }}
              data-testid="best-score-display"
            >
              {t('start.best_score', { score: bestScore })}
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onStart}
            sx={{ mt: 2, px: 6, py: 1.5, fontSize: '1.3rem' }}
            data-testid="start-button"
          >
            {t('start.button')}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StartScreen;

import React from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PublicIcon from '@mui/icons-material/Public';
import FlagIcon from '@mui/icons-material/Flag';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLanguage } from '../i18n';
import { getBestScore } from '../utils/bestScore';
import { Subject } from '../types/game';

interface StartScreenProps {
  subject: Subject;
  onStart: () => void;
  onBack?: () => void;
}

const SUBJECT_ICONS: Record<Subject, React.ReactNode> = {
  cars: <DirectionsCarIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />,
  countries: <PublicIcon sx={{ fontSize: 80, color: 'secondary.main', mb: 2 }} />,
  flags: <FlagIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />,
  soccer: <SportsSoccerIcon sx={{ fontSize: 80, color: 'secondary.main', mb: 2 }} />,
};

const StartScreen: React.FC<StartScreenProps> = ({ subject, onStart, onBack }) => {
  const { t } = useLanguage();
  const bestScore = getBestScore(subject);

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
          {SUBJECT_ICONS[subject]}
          <Typography variant="h1" gutterBottom color="primary">
            {t(`start.title.${subject}`)}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t(`start.subtitle.${subject}`)}
          </Typography>
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body1" color="text.secondary">
              {t(`start.instruction1.${subject}`)}
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
          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={onStart}
              sx={{ px: 6, py: 1.5, fontSize: '1.3rem' }}
              data-testid="start-button"
            >
              {t('start.button')}
            </Button>
            {onBack && (
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                onClick={onBack}
                startIcon={<ArrowBackIcon />}
                sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
                data-testid="back-home-button"
              >
                {t('home.back')}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StartScreen;

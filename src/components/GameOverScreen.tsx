import React, { useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, Typography, Snackbar } from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ShareIcon from '@mui/icons-material/Share';
import { useLanguage } from '../i18n';
import { getBestScore, setBestScoreIfHigher } from '../utils/bestScore';

interface GameOverScreenProps {
  score: number;
  onPlayAgain: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onPlayAgain }) => {
  const { t } = useLanguage();
  const [showCopied, setShowCopied] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    const previousBest = getBestScore();
    const updatedBest = setBestScoreIfHigher(score);
    setBestScore(updatedBest);
    setIsNewBest(score > previousBest && score > 0);
  }, [score]);

  const getMessage = (): string => {
    if (score === 0) return t('gameover.msg_0');
    if (score < 5) return t('gameover.msg_low');
    if (score < 10) return t('gameover.msg_mid');
    if (score < 20) return t('gameover.msg_high');
    return t('gameover.msg_expert');
  };

  const handleShare = async () => {
    const message = `אני הצלחתי ${score} דגמים.. כמה אתה מצליח?`;
    try {
      await navigator.clipboard.writeText(message);
      setShowCopied(true);
    } catch {
      // Fallback: some mobile browsers block clipboard without user gesture focus
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="calc(100vh - 64px)"
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
            {t('gameover.title')}
          </Typography>
          <Typography variant="h1" color="primary" gutterBottom data-testid="final-score">
            {score}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {score === 1 ? t('gameover.points_one') : t('gameover.points_other')}
          </Typography>
          {isNewBest && (
            <Typography
              variant="h5"
              color="secondary"
              sx={{ mt: 1, fontWeight: 700 }}
              data-testid="new-best-indicator"
            >
              {t('gameover.new_best')}
            </Typography>
          )}
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }} data-testid="best-score-gameover">
            {t('gameover.best_score', { score: bestScore })}
          </Typography>
          <Typography variant="h4" sx={{ mt: 2 }} color="text.primary">
            {getMessage()}
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={onPlayAgain}
              sx={{ px: 6, py: 1.5, fontSize: '1.3rem' }}
              data-testid="play-again-button"
            >
              {t('gameover.play_again')}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              onClick={handleShare}
              startIcon={<ShareIcon />}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
              data-testid="share-button"
            >
              {t('gameover.share')}
            </Button>
          </Box>
        </CardContent>
      </Card>
      <Snackbar
        open={showCopied}
        autoHideDuration={2000}
        onClose={() => setShowCopied(false)}
        message={t('gameover.copied')}
        data-testid="copied-snackbar"
      />
    </Box>
  );
};

export default GameOverScreen;

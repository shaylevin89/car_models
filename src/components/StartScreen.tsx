import React from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
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
            Car Trivia
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Match the car brand to its model!
          </Typography>
          <Box dir="rtl" sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body1" color="text.secondary">
              תראו את הלוגו של היצרן ובחרו את הדגם הנכון.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              תשובה נכונה = נקודה. תשובה שגויה או שנגמר הזמן = סוף המשחק!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              יש לכם 10 שניות לכל שאלה.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onStart}
            sx={{ mt: 2, px: 6, py: 1.5, fontSize: '1.3rem' }}
            data-testid="start-button"
          >
            Start Game
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StartScreen;

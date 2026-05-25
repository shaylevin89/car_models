import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import QuestionCard from './QuestionCard';
import AnswerOptions from './AnswerOptions';
import TimerBar from './TimerBar';
import ScoreDisplay from './ScoreDisplay';
import { GameState } from '../types/game';

interface GameScreenProps {
  state: GameState;
  onAnswer: (model: string) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ state, onAnswer }) => {
  const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);

  const handleAnswer = (model: string) => {
    setSelectedModel(model);
    onAnswer(model);
  };

  // Reset selected model when a new question loads
  React.useEffect(() => {
    setSelectedModel(undefined);
  }, [state.currentQuestion]);

  if (!state.currentQuestion) return null;

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        pt={3}
        pb={3}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          mb={2}
        >
          <ScoreDisplay score={state.score} />
        </Box>
        <Box width="100%" mb={2}>
          <TimerBar timeRemaining={state.timeRemaining} />
        </Box>
        <QuestionCard brand={state.currentQuestion.brand} />
        <AnswerOptions
          options={state.currentQuestion.options}
          onAnswer={handleAnswer}
          disabled={state.lastAnswerCorrect !== null}
          correctModel={state.currentQuestion.correctModel}
          lastAnswerCorrect={state.lastAnswerCorrect}
          selectedModel={selectedModel}
        />
      </Box>
    </Container>
  );
};

export default GameScreen;

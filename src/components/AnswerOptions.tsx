import React from 'react';
import { Box, Button } from '@mui/material';

interface AnswerOptionsProps {
  options: string[];
  onAnswer: (model: string) => void;
  disabled: boolean;
  correctModel?: string;
  lastAnswerCorrect: boolean | null;
  selectedModel?: string;
}

const AnswerOptions: React.FC<AnswerOptionsProps> = ({
  options,
  onAnswer,
  disabled,
  correctModel,
  lastAnswerCorrect,
  selectedModel,
}) => {
  const getButtonColor = (option: string): 'primary' | 'success' | 'error' => {
    if (lastAnswerCorrect === null) return 'primary';
    if (option === correctModel) return 'success';
    if (option === selectedModel && !lastAnswerCorrect) return 'error';
    return 'primary';
  };

  const getButtonVariant = (option: string): 'contained' | 'outlined' => {
    if (lastAnswerCorrect === null) return 'outlined';
    if (option === correctModel) return 'contained';
    if (option === selectedModel && !lastAnswerCorrect) return 'contained';
    return 'outlined';
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 2,
        maxWidth: 500,
        mx: 'auto',
      }}
    >
      {options.map((option, index) => (
        <Button
          key={`${index}-${option}`}
          variant={getButtonVariant(option)}
          color={getButtonColor(option)}
          onClick={() => !disabled && onAnswer(option)}
          data-testid={`answer-option-${option}`}
          sx={{
            py: 2,
            fontSize: '1rem',
            fontWeight: 500,
            pointerEvents: disabled ? 'none' : 'auto',
            opacity: disabled && lastAnswerCorrect !== null && getButtonColor(option) === 'primary' ? 0.5 : 1,
          }}
        >
          {option}
        </Button>
      ))}
    </Box>
  );
};

export default AnswerOptions;

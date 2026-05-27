import React from 'react';
import { Box, Button } from '@mui/material';

interface AnswerOptionsProps {
  options: string[];
  onAnswer: (answer: string) => void;
  disabled: boolean;
  correctAnswer?: string;
  lastAnswerCorrect: boolean | null;
  selectedAnswer?: string;
  /**
   * Optional formatter to localize the visible label of each option.
   * The canonical English value is still passed to `onAnswer` and embedded
   * in `data-testid`, so test selectors and comparison logic stay stable.
   */
  formatOption?: (option: string) => string;
}

const AnswerOptions: React.FC<AnswerOptionsProps> = ({
  options,
  onAnswer,
  disabled,
  correctAnswer,
  lastAnswerCorrect,
  selectedAnswer,
  formatOption,
}) => {
  const getButtonColor = (option: string): 'primary' | 'success' | 'error' => {
    if (lastAnswerCorrect === null) return 'primary';
    if (option === correctAnswer) return 'success';
    if (option === selectedAnswer && !lastAnswerCorrect) return 'error';
    return 'primary';
  };

  const getButtonVariant = (option: string): 'contained' | 'outlined' => {
    if (lastAnswerCorrect === null) return 'outlined';
    if (option === correctAnswer) return 'contained';
    if (option === selectedAnswer && !lastAnswerCorrect) return 'contained';
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
          {formatOption ? formatOption(option) : option}
        </Button>
      ))}
    </Box>
  );
};

export default AnswerOptions;

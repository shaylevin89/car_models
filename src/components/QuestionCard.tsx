import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import { Question } from '../types/game';
import { getLogoUrl } from '../data/carData';
import { useLanguage, localizeCountryName } from '../i18n';

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const { t, locale } = useLanguage();
  const [logoError, setLogoError] = useState(false);

  // Canonical English name — used as the test key and to reset logo errors.
  const canonicalName =
    question.subject === 'cars' ? question.brand.name : question.country.name;

  // Displayed (possibly localized) name. Cars stay in their canonical form
  // because brand names are not translated; country names use the i18n map.
  const displayName =
    question.subject === 'cars'
      ? question.brand.name
      : localizeCountryName(question.country.name, locale);

  useEffect(() => {
    setLogoError(false);
  }, [canonicalName]);

  return (
    <Card sx={{ textAlign: 'center', p: 2, mb: 3 }}>
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {t(`game.question.${question.subject}`)}
        </Typography>
        <Box
          sx={{
            width: 150,
            height: 150,
            mx: 'auto',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {question.subject === 'cars' ? (
            !logoError ? (
              <img
                src={getLogoUrl(question.brand.logoSlug)}
                alt={`${question.brand.name} logo`}
                onError={() => setLogoError(true)}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
                data-testid="brand-logo"
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.default',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h4" color="primary">
                  {question.brand.name}
                </Typography>
              </Box>
            )
          ) : (
            <PublicIcon
              sx={{ fontSize: 120, color: 'secondary.main' }}
              data-testid="country-icon"
            />
          )}
        </Box>
        <Typography
          variant="h2"
          color="primary"
          data-testid={question.subject === 'cars' ? 'brand-name' : 'country-name'}
          data-canonical-name={canonicalName}
        >
          {displayName}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;

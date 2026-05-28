import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import { Question } from '../types/game';
import { getLogoUrl } from '../data/carData';
import { getFlagUrl } from '../data/flagData';
import { useLanguage, localizeCountryName } from '../i18n';

interface QuestionCardProps {
  question: Question;
}

function canonicalNameFor(question: Question): string {
  switch (question.subject) {
    case 'cars':
      return question.brand.name;
    case 'countries':
      return question.country.name;
    case 'flags':
      return question.flag.name;
  }
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const { t, locale } = useLanguage();
  const [imageError, setImageError] = useState(false);

  const canonicalName = canonicalNameFor(question);

  // Reset image error state whenever the question changes.
  useEffect(() => {
    setImageError(false);
  }, [canonicalName]);

  // The flag itself is the prompt, so the country name is intentionally
  // hidden until the answer is selected — the user must identify it.
  const showNameCaption = question.subject !== 'flags';

  // Displayed (possibly localized) name. Cars stay in their canonical form
  // because brand names are not translated; country names use the i18n map.
  const displayName =
    question.subject === 'cars'
      ? question.brand.name
      : question.subject === 'countries'
        ? localizeCountryName(question.country.name, locale)
        : localizeCountryName(question.flag.name, locale);

  const testIdForImage =
    question.subject === 'cars' ? 'brand-logo' : 'flag-image';
  const testIdForName =
    question.subject === 'cars' ? 'brand-name' : 'country-name';

  return (
    <Card sx={{ textAlign: 'center', p: 2, mb: 3 }}>
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {t(`game.question.${question.subject}`)}
        </Typography>
        <Box
          sx={{
            width: 200,
            height: 150,
            mx: 'auto',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {question.subject === 'cars' ? (
            !imageError ? (
              <img
                src={getLogoUrl(question.brand.logoSlug)}
                alt={`${question.brand.name} logo`}
                onError={() => setImageError(true)}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
                data-testid={testIdForImage}
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
          ) : question.subject === 'flags' ? (
            !imageError ? (
              <img
                src={getFlagUrl(question.flag.countryCode)}
                alt="flag"
                onError={() => setImageError(true)}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                }}
                data-testid={testIdForImage}
                data-country-code={question.flag.countryCode}
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
                  {question.flag.countryCode.toUpperCase()}
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
        {showNameCaption && (
          <Typography
            variant="h2"
            color="primary"
            data-testid={testIdForName}
            data-canonical-name={canonicalName}
          >
            {displayName}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionCard;

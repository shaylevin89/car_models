import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { CarBrand } from '../types/game';
import { getLogoUrl } from '../data/carData';
import { useLanguage } from '../i18n';

interface QuestionCardProps {
  brand: CarBrand;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ brand }) => {
  const { t } = useLanguage();
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setLogoError(false);
  }, [brand.name]);

  return (
    <Card sx={{ textAlign: 'center', p: 2, mb: 3 }}>
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {t('game.question')}
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
          {!logoError ? (
            <img
              src={getLogoUrl(brand.logoSlug)}
              alt={`${brand.name} logo`}
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
                {brand.name}
              </Typography>
            </Box>
          )}
        </Box>
        <Typography variant="h2" color="primary" data-testid="brand-name">
          {brand.name}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;

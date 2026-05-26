import React from 'react';
import { Box, Card, CardActionArea, CardContent, Container, Typography } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PublicIcon from '@mui/icons-material/Public';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import { useLanguage } from '../i18n';
import { Subject } from '../types/game';

interface HomeScreenProps {
  onSelectSubject: (subject: Subject) => void;
}

interface SubjectCardConfig {
  id: Subject;
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
}

const subjects: SubjectCardConfig[] = [
  {
    id: 'cars',
    icon: <DirectionsCarIcon sx={{ fontSize: 56, color: 'primary.main' }} />,
    titleKey: 'home.subject.cars.title',
    descriptionKey: 'home.subject.cars.description',
  },
  {
    id: 'countries',
    icon: <PublicIcon sx={{ fontSize: 56, color: 'secondary.main' }} />,
    titleKey: 'home.subject.countries.title',
    descriptionKey: 'home.subject.countries.description',
  },
];

const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectSubject }) => {
  const { t } = useLanguage();

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        minHeight="calc(100vh - 64px)"
        py={4}
        px={2}
      >
        <EmojiObjectsIcon sx={{ fontSize: 72, color: 'primary.main', mb: 2 }} />
        <Typography variant="h1" color="primary" align="center" gutterBottom data-testid="home-title">
          {t('home.title')}
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" gutterBottom>
          {t('home.header')}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ maxWidth: 600, mt: 1, mb: 4 }}
          data-testid="home-instructions"
        >
          {t('home.instructions')}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 3,
            width: '100%',
            maxWidth: 700,
          }}
        >
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              sx={{ position: 'relative' }}
              data-testid={`subject-card-${subject.id}`}
            >
              <CardActionArea
                onClick={() => onSelectSubject(subject.id)}
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>{subject.icon}</Box>
                  <Typography variant="h5" color="text.primary" gutterBottom>
                    {t(subject.titleKey)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t(subject.descriptionKey)}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default HomeScreen;

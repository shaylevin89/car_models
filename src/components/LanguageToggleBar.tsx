import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useLanguage } from '../i18n';

const LanguageToggleBar: React.FC = () => {
  const { locale, setLocale, t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (newLocale: 'he' | 'en') => {
    setLocale(newLocale);
    handleClose();
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ background: 'transparent' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
          {t('app.title')}
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="language menu"
          onClick={handleOpen}
          data-testid="language-menu-button"
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem
            onClick={() => handleSelect('he')}
            selected={locale === 'he'}
            data-testid="lang-option-he"
          >
            {t('lang.hebrew')}
          </MenuItem>
          <MenuItem
            onClick={() => handleSelect('en')}
            selected={locale === 'en'}
            data-testid="lang-option-en"
          >
            {t('lang.english')}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default LanguageToggleBar;

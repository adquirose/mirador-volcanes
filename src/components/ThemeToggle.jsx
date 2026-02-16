import React from 'react';
import { 
  IconButton, 
  Tooltip, 
  Box 
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon 
} from '@mui/icons-material';
import { useTheme } from '../theme/useTheme';

const ThemeToggle = ({ 
  position = 'fixed', 
  top = 16, 
  right = 16,
  size = 'medium',
  ...props 
}) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Box
      sx={{
        position: position,
        top: top,
        right: right,
        zIndex: (theme) => theme.zIndex.fab,
      }}
      {...props}
    >
      <Tooltip 
        title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        placement="left"
      >
        <IconButton
          onClick={toggleTheme}
          size={size}
          sx={{
            backgroundColor: (theme) => theme.palette.background.paper,
            color: (theme) => theme.palette.text.primary,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            '&:hover': {
              backgroundColor: (theme) => theme.palette.action.hover,
            },
            transition: 'all 0.3s ease',
          }}
        >
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ThemeToggle;
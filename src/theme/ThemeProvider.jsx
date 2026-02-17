import React, { useState, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { darkTheme, lightTheme } from './themes';
import { ThemeContext } from './ThemeContext';

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(lightTheme);

  const toggleTheme = useCallback(() => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    setCurrentTheme(newMode ? darkTheme : lightTheme);
  }, [isDarkMode]);

  const setThemeMode = useCallback((mode) => {
    const isDark = mode === 'dark';
    setIsDarkMode(isDark);
    setCurrentTheme(isDark ? darkTheme : lightTheme);
  }, []);

  const themeContextValue = {
    isDarkMode,
    currentTheme,
    toggleTheme,
    setThemeMode,
    themeName: isDarkMode ? 'dark' : 'light',
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <MuiThemeProvider theme={currentTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
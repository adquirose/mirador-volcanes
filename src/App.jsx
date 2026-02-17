import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import KrpanoTour from './components/KrpanoTour';
import AdminApp from './components/AdminApp';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff',
      light: '#f5f5f5',
      dark: '#e0e0e0',
    },
    secondary: {
      main: '#646cff',
      light: '#8a96ff',
      dark: '#4054b2',
    },
    background: {
      default: '#000000',
      paper: '#121212',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
    },
    error: {
      main: '#f44336',
      light: '#ffcdd2',
    },
  },
  typography: {
    fontFamily: 'Arial, Helvetica, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '16px',
          color: '#FFFFFF',
          backgroundColor: '#000000',
        },
        '#root': {
          width: '100%',
          height: '100%',
          margin: 0,
          padding: 0,
        },
        html: {
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
        },
        '*': {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
        },
      },
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box 
            sx={{
              width: '100vw',
              height: '100vh',
              margin: 0,
              padding: 0,
              overflow: 'hidden',
            }}
          >
            <Routes>
              {/* Ruta principal - Tour Virtual */}
              <Route path="/" element={<KrpanoTour />} />
              
              {/* Ruta de administración */}
              <Route path="/admin" element={<AdminApp />} />
              
              {/* Ruta por defecto */}
              <Route path="*" element={<KrpanoTour />} />
            </Routes>
          </Box>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App

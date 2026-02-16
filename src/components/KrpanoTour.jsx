import { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Backdrop 
} from '@mui/material';
import { styled, useTheme as useMuiTheme } from '@mui/material/styles';
import Navigation from './Navigation';

const KrpanoContainer = styled(Box)(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  margin: 0,
  padding: 0,
  overflow: 'hidden',
  backgroundColor: theme.palette.background.default,
  position: 'relative',
}));

const KrpanoViewer = styled(Box)({
  width: '100%',
  height: '100%',
  outline: 'none',
  border: 'none',
  '& > *': {
    boxSizing: 'border-box',
  },
});

const ErrorContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.default,
  textAlign: 'center',
}));

const LoadingBackdrop = styled(Backdrop)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  color: theme.palette.primary.main,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  flexDirection: 'column',
}));

function KrpanoTour() {
  const panoRef = useRef(null);
  const scriptLoadedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const muiTheme = useMuiTheme();

  useEffect(() => {
    const loadKrpanoScript = () => {
      return new Promise((resolve, reject) => {
        // Si el script ya está cargado, resolver inmediatamente
        if (scriptLoadedRef.current && window.embedpano) {
          resolve();
          return;
        }

        // Crear y cargar el script de krpano
        const script = document.createElement('script');
        script.src = '/krpano/tour.js';
        script.async = true;
        
        script.onload = () => {
          scriptLoadedRef.current = true;
          resolve();
        };
        
        script.onerror = () => {
          reject(new Error('Failed to load krpano script'));
        };
        
        document.head.appendChild(script);
      });
    };

    const initKrpano = () => {
      console.log('Initializing krpano...');
      console.log('panoRef.current:', panoRef.current);
      console.log('window.embedpano:', window.embedpano);
      
      if (!panoRef.current) {
        console.error('No target element found');
        setError('No target element found');
        return;
      }

      if (!window.embedpano) {
        console.error('embedpano function not available');
        setError('embedpano function not available');
        return;
      }

      try {
        // Configuración del tour krpano usando el ID del elemento
        window.embedpano({
          swf: "/krpano/tour.swf",
          xml: "/krpano/tour.xml", 
          target: "krpano-viewer", // Usar el ID en lugar del ref
          html5: "prefer",
          passQueryParameters: true,
          mobilescale: 1.0,
          onready: (krpano) => {
            console.log('Krpano tour loaded successfully', krpano);
            setIsLoading(false);
          },
          onerror: (errorMsg) => {
            console.error('Krpano error:', errorMsg);
            setError(errorMsg);
            setIsLoading(false);
          }
        });
      } catch (err) {
        console.error('Error during embedpano call:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    const setupTour = async () => {
      try {
        await loadKrpanoScript();
        // Asegurar que el DOM esté completamente listo
        // Usar requestAnimationFrame para mejor timing del DOM
        const setupWithRAF = () => {
          requestAnimationFrame(() => {
            if (panoRef.current) {
              initKrpano();
            } else {
              // Intentar una vez más después de un breve delay
              setTimeout(() => {
                if (panoRef.current) {
                  initKrpano();
                } else {
                  console.error('Target element not ready after timeout');
                  setError('Target element not ready');
                }
              }, 100);
            }
          });
        };
        
        setupWithRAF();
      } catch (error) {
        console.error('Error loading krpano:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    setupTour();

    // Cleanup function
    return () => {
      if (window.removepano) {
        window.removepano("krpano-viewer");
      }
    };
  }, []);

  if (error) {
    return (
      <KrpanoContainer>
        <Navigation />
        <ErrorContainer>
          <Alert 
            severity="error" 
            sx={{ 
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              color: muiTheme.palette.text.primary,
              border: `1px solid rgba(255, 0, 0, 0.3)`,
              '& .MuiAlert-icon': {
                color: muiTheme.palette.text.primary
              }
            }}
          >
            <Typography variant="h6" component="div" sx={{ mb: 1 }}>
              ERROR
            </Typography>
            <Typography variant="body1">
              {error}
            </Typography>
          </Alert>
        </ErrorContainer>
      </KrpanoContainer>
    );
  }

  return (
    <KrpanoContainer>
      <KrpanoViewer 
        ref={panoRef}
        id="krpano-viewer"
        sx={{ 
          display: isLoading ? 'none' : 'block',
          '@media only screen and (min-device-width: 800px)': {
            overflow: 'hidden',
          },
          '@media screen and (max-width: 768px)': {
            WebkitOverflowScrolling: 'touch',
          }
        }}
      >
        <noscript>
          <ErrorContainer>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ color: muiTheme.palette.text.primary }}
            >
              ERROR:<br/><br/>Javascript not activated<br/><br/>
            </Typography>
          </ErrorContainer>
        </noscript>
      </KrpanoViewer>
      
      <Navigation />
      
      <LoadingBackdrop open={isLoading}>
        <CircularProgress 
          color="inherit" 
          size={60}
          sx={{ mb: 2 }}
        />
        <Typography 
          variant="h6" 
          component="div"
          sx={{ 
            color: 'inherit',
            fontFamily: muiTheme.typography.fontFamily
          }}
        >
          Cargando tour virtual...
        </Typography>
      </LoadingBackdrop>
    </KrpanoContainer>
  );
}

export default KrpanoTour;
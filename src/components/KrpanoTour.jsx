import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Backdrop,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Divider,
  IconButton,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { styled, useTheme as useMuiTheme } from '@mui/material/styles';
import { db } from '../firestore';
import { collection, getDocs } from 'firebase/firestore';
import Navigation from './Navigation';

// Variables globales para prevenir múltiples instancias
let isKrpanoInitializing = false;
let krpanoInstanceActive = false;

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
  const krpanoRef = useRef(null);
  const krpanoInitialized = useRef(false);
  const krpanoId = useRef('krpano-' + Date.now());
  const [status, setStatus] = useState('Iniciando...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLote, setSelectedLote] = useState(null);
  const [lotes, setLotes] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const muiTheme = useMuiTheme();

  // Cargar lotes desde Firestore
  const cargarLotes = useCallback(async () => {
    try {
      console.log('📦 Cargando lotes desde Firestore...');
      const lotesRef = collection(db, 'proyectos', 'mirador-volcanes', 'lotes');
      const snapshot = await getDocs(lotesRef);
      const lotesData = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.krpano?.scene_master) {
          lotesData.push({
            id: doc.id,
            numero: parseInt(doc.id.replace('lote', '')),
            firestoreId: doc.id,
            ...data
          });
        }
      });
      
      console.log('✅ Lotes cargados:', lotesData.length);
      setLotes(lotesData);
      return lotesData;
    } catch (error) {
      console.error('❌ Error cargando lotes:', error);
      return [];
    }
  }, []);

  // Función para recrear spots dinámicos
  const recreateSpots = useCallback((krpano, lotesData) => {
    if (!krpano || !lotesData || lotesData.length === 0) {
      console.log('❌ recreateSpots: Datos faltantes', { krpano: !!krpano, lotesData: lotesData?.length });
      return;
    }
    
    console.log('🔍 recreateSpots iniciado con', lotesData.length, 'lotes');
    
    // Verificar si ya hay spots dinámicos
    const firstLote = lotesData[0];
    if (firstLote) {
      const numero = firstLote.numero;
      const testSpotName = `spot_${numero}`;
      
      // Si el primer spot ya existe, no recrear
      const exists = krpano.get(`hotspot[${testSpotName}].name`);
      if (exists) {
        console.log('✅ Los spots ya existen');
        setStatus('¡Spots ya presentes!');
        return;
      }
    }
    
    console.log('🔄 Creando spots...');
    setStatus(`Creando ${lotesData.length} spots...`);
    
    let created = 0;
    lotesData.forEach((lote) => {
      const hs = lote.krpano?.scene_master;
      if (hs && hs.ath !== undefined && hs.atv !== undefined) {
        const numero = lote.numero;
        const estado = (lote.estado || 'disponible').toLowerCase();
        const spotName = `spot_${numero}`;
        
        // Seleccionar estilo según estado
        let estilo = 'hs_pro_disponible'; // Por defecto disponible
        if (estado === 'vendido') estilo = 'hs_pro_vendido';
        else if (estado === 'reservado') estilo = 'hs_pro_reservado';
        
        try {
          console.log(`🎯 Creando spot: ${spotName} con estilo ${estilo} (estado: ${estado}) en (${hs.ath}, ${hs.atv})`);
          
          // Crear el hotspot y cargar estilo predefinido
          krpano.call(`addhotspot(${spotName})`);
          krpano.call(`set(hotspot[${spotName}].ath, ${hs.ath})`);
          krpano.call(`set(hotspot[${spotName}].atv, ${hs.atv})`);
          krpano.call(`hotspot[${spotName}].loadstyle(${estilo})`);
          krpano.call(`set(hotspot[${spotName}].html, ${numero})`);
          
          // Agregar evento onclick
          krpano.call(`set(hotspot[${spotName}].onclick, js(handleSpotClick('${lote.id}')))`);
          
          created++;
          console.log(`✅ Spot creado: ${spotName}`);
        } catch (e) {
          console.error(`❌ Error creando spot ${spotName}:`, e);
        }
      }
    });
    
    setStatus(`¡${created} spots creados!`);
    console.log(`🎉 Total spots creados: ${created}`);
  }, []);

  // Función global para manejar clicks en spots
  const handleSpotClick = useCallback((loteId) => {
    console.log('🎯 Click en spot:', loteId);
    const lote = lotes.find(l => l.id === loteId || l.firestoreId === loteId);
    if (lote) {
      console.log('📄 Lote encontrado:', lote);
      setSelectedLote(lote);
    } else {
      console.warn('⚠️ Lote no encontrado:', loteId);
    }
  }, [lotes]);

  // Función para cerrar la card
  const cerrarLote = useCallback(() => {
    setSelectedLote(null);
  }, []);

  // Determinar color del estado
  const getEstadoColor = useCallback((estado) => {
    switch(estado?.toLowerCase()) {
      case 'disponible': return 'success';
      case 'vendido': return 'error';  
      case 'reservado': return 'warning';
      default: return 'default';
    }
  }, []);

  // Configurar función global para manejo de clicks
  useEffect(() => {
    console.log('🔧 Configurando handleSpotClick, lotes disponibles:', lotes.length);
    
    window.handleSpotClick = handleSpotClick;
    window.getLotes = () => lotes;

    return () => {
      delete window.handleSpotClick;
      delete window.getLotes;
    };
  }, [handleSpotClick, lotes]);

  // Cargar lotes al montar
  useEffect(() => {
    cargarLotes();
  }, [cargarLotes]);

  // Crear spots cuando lleguen los lotes
  useEffect(() => {
    if (window.krpano && lotes.length > 0) {
      console.log('✨ Lotes cargados, creando spots...');
      setTimeout(() => {
        recreateSpots(window.krpano, lotes);
      }, 100);
    }
  }, [lotes, recreateSpots]);

  // Función para inicializar Krpano
  const initializeKrpano = useCallback(() => {
    if (window.isKrpanoInitializing || window.krpanoInstanceActive) {
      console.log('⚠️ Krpano ya está inicializándose o activo');
      return;
    }
    
    if (window.embedpano) {
      window.isKrpanoInitializing = true;
      setIsLoading(true);
      setStatus('Cargando panorama...');
      
      try {
        console.log('🚀 Iniciando Krpano...');
        
        window.embedpano({
          xml: '/krpano/tour.xml',
          target: krpanoId.current,
          html5: 'only',
          passQueryParameters: false,
          mobilescale: 1.0,
          consolelog: false,
          onready: function(krpano_interface) {
            console.log('✅ Krpano listo');
            
            window.krpano = krpano_interface;
            window.krpanoInstanceActive = true;
            window.isKrpanoInitializing = false;
            krpanoRef.current = krpano_interface;
            
            setIsLoading(false);
            setError(null);
            setStatus('¡Panorama cargado! Preparando spots...');
            
            // Crear spots si ya tenemos los datos
            setTimeout(() => {
              if (lotes && lotes.length > 0) {
                console.log('🎯 Creando spots con datos ya disponibles...');
                recreateSpots(krpano_interface, lotes);
              } else {
                console.log('⏳ Esperando datos de lotes...');
                setStatus('Esperando datos de lotes...');
              }
            }, 1000);
          },
          onerror: function(error) {
            console.error('❌ Error en Krpano:', error);
            window.isKrpanoInitializing = false;
            setError(error);
            setIsLoading(false);
            setStatus('Error cargando el panorama');
          }
        });
        
      } catch (error) { 
        console.error('❌ Error inicializando Krpano:', error);
        window.isKrpanoInitializing = false;
        setError(error.message);
        setIsLoading(false);
      }
    } else {
      console.log('⏳ embedpano no disponible aún');
      setTimeout(initializeKrpano, 500);
    }
  }, [lotes, recreateSpots]);

  // Variables ref para el script
  const scriptLoadedRef = useRef(false);

  // Verificar e inicializar cuando se monte el componente
  useEffect(() => {
    if (window.krpanoInstanceActive) {
      console.log('♻️ Krpano ya está activo');
      setIsLoading(false);
      setStatus('Panorama ya cargado');
      return;
    }
    
    // Cargar script de Krpano si no está cargado
    if (!scriptLoadedRef.current && !window.embedpano) {
      console.log('📂 Cargando script de Krpano...');
      const script = document.createElement('script');
      script.src = '/krpano/tour.js';
      script.async = true;
      
      script.onload = () => {
        console.log('✅ Script de Krpano cargado');
        scriptLoadedRef.current = true;
        setTimeout(initializeKrpano, 100);
      };
      
      script.onerror = () => {
        console.error('❌ Error cargando script de Krpano');
        setError('Error cargando tour.js');
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
      
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    } else {
      // Script ya está cargado
      setTimeout(initializeKrpano, 100);
    }
  }, [initializeKrpano]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (window.krpano && window.krpanoInstanceActive) {
        try {
          console.log('🧹 Limpiando instancia de Krpano...');
          window.krpano.call('unloadtour()');
          delete window.krpano;
          window.krpanoInstanceActive = false;
          window.isKrpanoInitializing = false;
        } catch (e) {
          console.error('Error en cleanup:', e);
        }
      }
    };
  }, []);

  // Renderizar
  return (
    <KrpanoContainer>
      <Navigation onDrawerChange={setDrawerOpen} />
      
      {/* Logo centrado en la parte superior - visible tanto en móvil como desktop */}
      <Box
        component="img"
        src="/loteo-v5.png"
        alt="Logo"
        sx={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'auto',
          height: { xs: 80, md: 100 },
          zIndex: 1000,
          cursor: 'pointer',
          transition: 'all 0.3s ease-in-out',
          opacity: drawerOpen ? 0 : 1,
          visibility: drawerOpen ? 'hidden' : 'visible',
          '&:hover': {
            transform: 'translateX(-50%) scale(1.05)',
          }
        }}
      />
      
      {/* Contenedor del panorama */}
      <KrpanoViewer 
        id={krpanoId.current}
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
      
      {/* Loading Backdrop */}
      <LoadingBackdrop open={isLoading}>
        <CircularProgress 
          size={60} 
          sx={{ 
            color: muiTheme.palette.primary.main,
            mb: 2
          }} 
        />
        <Typography 
          variant="h6" 
          sx={{ 
            color: muiTheme.palette.text.primary,
            textAlign: 'center'
          }}
        >
          {status}
        </Typography>
      </LoadingBackdrop>

      {/* Error Display */}
      {error && (
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
      )}

      {/* Card para mostrar información del lote */}
      {selectedLote && (
        <Paper
          elevation={24}
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            maxWidth: '600px',
            width: '90%',
            borderRadius: 4,
            backgroundColor: '#ffffff',
            border: '2px solid #e0e7ff',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 3,
            borderBottom: '1px solid #e0e0e0'
          }}>
              <Typography variant="h5" component="h2" sx={{ 
                fontWeight: 600,
                color: '#212121'
              }}>
                {selectedLote.nombre}
              </Typography>
              <IconButton 
                onClick={cerrarLote}
                sx={{ 
                  color: '#212121',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <CardContent sx={{ p: 3 }}>
              {/* Estado */}
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon color="action" />
                <Typography variant="body2" sx={{ color: '#424242' }}>
                  Estado:
                </Typography>
                <Chip 
                  label={selectedLote.estado?.toUpperCase() || 'SIN ESTADO'}
                  color={getEstadoColor(selectedLote.estado)}
                  size="small"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Superficies */}
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Paper 
                    elevation={6}
                    sx={{ 
                      p: 2.5,
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: 2,
                      textAlign: 'center',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 1, fontWeight: 500 }}>
                      Superficie Total
                    </Typography>
                    <Typography variant="h6" fontWeight="700" sx={{ color: '#1e293b' }}>
                      {selectedLote.superficie} m²
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={6}>
                  <Paper 
                    elevation={6}
                    sx={{ 
                      p: 2.5,
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: 2,
                      textAlign: 'center',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 1, fontWeight: 500 }}>
                      Superficie Útil
                    </Typography>
                    <Typography variant="h6" fontWeight="700" sx={{ color: '#1e293b' }}>
                      {selectedLote.superficieUtil} m²
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>

            {/* Botón cerrar */}
            <CardActions sx={{ p: 3, pt: 2, justifyContent: 'center' }}>
              <Button 
                onClick={cerrarLote}
                variant="outlined" 
                color="primary" 
                size="medium"
              >
                Cerrar
              </Button>
            </CardActions>
        </Paper>
      )}
    </KrpanoContainer>
  );
}

export default KrpanoTour;
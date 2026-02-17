import React from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Chip,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';

const TestPanel = styled(Card)(() => ({
  position: 'absolute',
  top: 20,
  right: 20,
  minWidth: 300,
  zIndex: 1000,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
}));

const KrpanoTestControls = () => {
  const [lotes, setLotes] = React.useState([]);
  const [currentScene, setCurrentScene] = React.useState('scene_master');

  React.useEffect(() => {
    // Verificar si las funciones están disponibles
    const interval = setInterval(() => {
      if (window.krpanoTourFunctions) {
        const lotesData = window.krpanoTourFunctions.obtenerLotes();
        setLotes(lotesData);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const actualizarEstado = (numeroLote, nuevoEstado) => {
    if (window.krpanoTourFunctions) {
      window.krpanoTourFunctions.actualizarEstadoLote(numeroLote, nuevoEstado);
      
      // Actualizar estado local
      setTimeout(() => {
        const lotesActualizados = window.krpanoTourFunctions.obtenerLotes();
        setLotes(lotesActualizados);
      }, 500);
    }
  };

  const cambiarEscena = (escena) => {
    if (window.krpanoTourFunctions) {
      window.krpanoTourFunctions.cambiarEscena(escena);
      setCurrentScene(escena);
    }
  };

  const recargarHotspots = () => {
    if (window.krpanoTourFunctions) {
      window.krpanoTourFunctions.recargarHotspots();
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'disponible': return 'success';
      case 'reservado': return 'info'; 
      case 'vendido': return 'error';
      default: return 'default';
    }
  };

  return (
    <TestPanel>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🎮 Controles de Prueba
        </Typography>
        
        <Typography variant="subtitle2" gutterBottom>
          Escena: {currentScene}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Button 
            size="small" 
            sx={{ mr: 1, mb: 1 }}
            variant={currentScene === 'scene_master' ? 'contained' : 'outlined'}
            onClick={() => cambiarEscena('scene_master')}
          >
            Master
          </Button>
          <Button 
            size="small" 
            sx={{ mr: 1, mb: 1 }}
            variant={currentScene === 'scene_aerial' ? 'contained' : 'outlined'}
            onClick={() => cambiarEscena('scene_aerial')}
          >
            Aérea
          </Button>
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Lotes: {lotes.length}
        </Typography>
        
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {lotes.slice(0, 6).map(lote => (
            <Grid item xs={4} key={lote.numero}>
              <Card variant="outlined" sx={{ p: 1 }}>
                <Typography variant="caption" display="block">
                  Lote {lote.numero}
                </Typography>
                <Chip 
                  label={lote.estado} 
                  color={getEstadoColor(lote.estado)}
                  size="small"
                  sx={{ fontSize: 10 }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="subtitle2" gutterBottom>
          Acciones de Prueba:
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button 
            size="small" 
            variant="outlined"
            onClick={() => actualizarEstado(1, 'reservado')}
          >
            Lote 1 → Reservado
          </Button>
          
          <Button 
            size="small" 
            variant="outlined"
            onClick={() => actualizarEstado(2, 'vendido')}
          >
            Lote 2 → Vendido
          </Button>
          
          <Button 
            size="small" 
            variant="outlined"
            onClick={() => actualizarEstado(3, 'disponible')}
          >
            Lote 3 → Disponible
          </Button>
          
          <Button 
            size="small" 
            variant="contained"
            color="secondary"
            onClick={recargarHotspots}
          >
            🔄 Recargar Spots
          </Button>
        </Box>
        
        <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.7 }}>
          Haz click en los lotes del tour para ver información
        </Typography>
      </CardContent>
    </TestPanel>
  );
};

export default KrpanoTestControls;
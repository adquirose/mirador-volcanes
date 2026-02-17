import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Container,
  Tooltip,
  useMediaQuery,
  useTheme,
  IconButton
} from '@mui/material'
import { Logout, Map } from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import LotesAdmin from './LotesAdmin'

function AdminDashboard() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleLogout = () => {
    if (window.confirm('¿Está seguro que desea cerrar sesión?')) {
      logout()
    }
  }

  const handleGoToTour = () => {
    navigate('/')
  }

  return (
    <Box sx={{ 
      bgcolor: '#f5f5f5', 
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      {/* Header */}
      <Box sx={{
        backgroundColor: '#ffffff',
        color: '#000000',
        padding: isMobile ? '8px 12px' : '8px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: isMobile ? '56px' : '60px',
        boxSizing: 'border-box',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        borderBottom: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/logorivera.png" 
            alt="Logo Rivera" 
            style={{ 
              height: isMobile ? '32px' : '40px'
            }} 
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0.5 : 1 }}>
          {!isMobile && (
            <Typography variant="body2" sx={{ mr: 2, color: '#666666' }}>
              {user?.email}
            </Typography>
          )}
          
          <Tooltip title="Ver Tour">
            {isMobile ? (
              <IconButton
                sx={{ color: '#000000' }}
                onClick={handleGoToTour}
                size="small"
              >
                <Map />
              </IconButton>
            ) : (
              <Button
                sx={{ color: '#1976d2', '&:hover': { backgroundColor: '#f5f5f5' } }}
                startIcon={<Map />}
                onClick={handleGoToTour}
              >
                Tour
              </Button>
            )}
          </Tooltip>
          
          <Tooltip title="Cerrar Sesión">
            {isMobile ? (
              <IconButton
                sx={{ color: '#000000' }}
                onClick={handleLogout}
                size="small"
              >
                <Logout />
              </IconButton>
            ) : (
              <Button
                sx={{ color: '#1976d2', '&:hover': { backgroundColor: '#f5f5f5' } }}
                startIcon={<Logout />}
                onClick={handleLogout}
              >
                Salir
              </Button>
            )}
          </Tooltip>
        </Box>
      </Box>

      {/* Contenido */}
      <Box sx={{ 
        height: '100vh',
        pt: isMobile ? '56px' : '60px', // Espacio ajustado para header responsive
        overflow: 'auto',
        width: '100%',
        bgcolor: 'background.default'
      }}>
        <Container 
          maxWidth="xl" 
          sx={{ 
            py: isMobile ? 2 : 3,
            px: isMobile ? 2 : 3
          }}
        >
          <LotesAdmin />
        </Container>
      </Box>
    </Box>
  )
}

export default AdminDashboard
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Container,
  Tooltip,
  useMediaQuery,
  useTheme,
  IconButton,
  Tabs,
  Tab,
  Paper
} from '@mui/material'
import { Logout, Map, Landscape, ContactMail } from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import LotesAdmin from './LotesAdmin'
import ContactosAdmin from './ContactosAdmin'

function AdminDashboard() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [currentTab, setCurrentTab] = useState(0)

  // Configurar estilos de administración - versión simple
  useEffect(() => {
    document.body.classList.add('admin-panel');
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.getElementById('root').style.height = 'auto';
    
    return () => {
      document.body.classList.remove('admin-panel');
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.getElementById('root').style.height = '100%';
    };
  }, []);

  const handleLogout = () => {
    if (window.confirm('¿Está seguro que desea cerrar sesión?')) {
      logout()
    }
  }

  const handleGoToTour = () => {
    navigate('/')
  }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
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
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/loteo-v5.png" 
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

      {/* Pestañas */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: '#e0e0e0',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 } }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            sx={{ 
              minHeight: '56px',
              '& .MuiTab-root': {
                color: '#666666',
                fontWeight: 500,
                fontSize: isMobile ? '0.85rem' : '0.95rem',
                textTransform: 'none',
                minHeight: '56px',
                '&.Mui-selected': {
                  color: '#1976d2',
                  fontWeight: 600
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#1976d2',
                height: '3px'
              }
            }}
          >
            <Tab 
              icon={<Landscape />} 
              label={isMobile ? 'Lotes' : 'Gestión de Lotes'}
              iconPosition="start"
              sx={{ 
                minWidth: isMobile ? 'auto' : '180px',
                px: isMobile ? 1 : 2
              }}
            />
            <Tab 
              icon={<ContactMail />} 
              label={isMobile ? 'Contactos' : 'Gestión de Contactos'}
              iconPosition="start"
              sx={{ 
                minWidth: isMobile ? 'auto' : '200px',
                px: isMobile ? 1 : 2
              }}
            />
          </Tabs>
        </Container>
      </Box>

      {/* Contenido */}
      <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, md: 3 } }}>
        <Paper sx={{ 
          p: isMobile ? 2 : 3, 
          minHeight: '60vh',
          maxHeight: 'calc(100vh - 200px)',
          overflow: 'auto'
        }}>
          {currentTab === 0 && <LotesAdmin />}
          {currentTab === 1 && <ContactosAdmin />}
        </Paper>
      </Container>
    </Box>
  )
}

export default AdminDashboard
import { useAuth } from '../hooks/useAuth'
import LoginPage from './LoginPage'
import AdminDashboard from './AdminDashboard'
import {
  CircularProgress,
  Box,
  Typography
} from '@mui/material'

function AdminApp() {
  const { user, isAuthenticated, loading } = useAuth()

  // Mostrar loader mientras se verifica la autenticación
  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5'
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Verificando autenticación...
        </Typography>
      </Box>
    )
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginPage />
  }

  // Si está autenticado, mostrar dashboard
  return <AdminDashboard />
}

export default AdminApp
import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Backdrop
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { Edit, Save, Cancel, Refresh } from '@mui/icons-material'
import { updateDoc, doc, collection, getDocs } from 'firebase/firestore'
import { db } from '../firestore'

// Configuración local
const ESTADOS_LOTES = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'reservado', label: 'Reservado' },
  { value: 'vendido', label: 'Vendido' }
]

// Función para obtener configuración de estado
const getEstadoConfig = (estado) => {
  const configs = {
    disponible: { 
      color: 'default',
      sx: { 
        backgroundColor: '#ffffff', 
        color: '#000000', 
        border: '1px solid #e0e0e0' 
      }
    },
    reservado: { 
      color: 'primary',
      sx: { 
        backgroundColor: '#1976d2', 
        color: '#ffffff' 
      }
    },
    vendido: { 
      color: 'error',
      sx: { 
        backgroundColor: '#f44336', 
        color: '#ffffff' 
      }
    }
  }
  return configs[estado] || { 
    color: 'default',
    sx: { 
      backgroundColor: '#f5f5f5', 
      color: '#000000' 
    }
  }
}

function LotesAdmin() {
  const [lotes, setLotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingLote, setEditingLote] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Cargar lotes desde Firestore
  const loadLotes = async () => {
    try {
      setLoading(true)
      const lotesRef = collection(db, 'proyectos/mirador-volcanes/lotes')
      const snapshot = await getDocs(lotesRef)
      const lotesData = []
      
      snapshot.forEach((doc) => {
        const data = doc.data()
        lotesData.push({
          id: doc.id,
          docId: doc.id,
          numero: parseInt(doc.id.replace('lote', '')) || 0,
          ...data
        })
      })
      
      // Ordenar por número
      lotesData.sort((a, b) => a.numero - b.numero)
      setLotes(lotesData)
      console.log(`📦 Cargados ${lotesData.length} lotes`)
    } catch (error) {
      console.error('Error cargando lotes:', error)
      setMessage({ type: 'error', text: 'Error al cargar los lotes' })
    } finally {
      setLoading(false)
    }
  }

  // Efecto para cargar datos al montar
  useEffect(() => {
    loadLotes()
  }, [])

  // Función para generar título del lote
  const getLoteTitle = (lote) => {
    return lote.nombre || `Lote ${lote.numero || lote.id}`
  }

  // Función para iniciar edición
  const handleEdit = (lote) => {
    setEditingLote(lote.id)
    setEditForm({
      nombre: lote.nombre || '',
      estado: lote.estado || 'disponible',
      superficie: lote.superficie || '',
      superficieUtil: lote.superficieUtil || '',
      precio: lote.precio || '',
      observaciones: lote.observaciones || ''
    })
  }

  // Función para cancelar edición
  const handleCancel = () => {
    setEditingLote(null)
    setEditForm({})
  }

  // Función para guardar cambios
  const handleSave = async (loteId) => {
    try {
      setSaving(true)
      
      // Actualizar en Firestore
      const docRef = doc(db, 'proyectos/mirador-volcanes/lotes', loteId)
      await updateDoc(docRef, {
        ...editForm,
        superficie: parseFloat(editForm.superficie) || 0,
        superficieUtil: parseFloat(editForm.superficieUtil) || 0,
        precio: parseFloat(editForm.precio) || 0,
        fechaModificacion: new Date().toISOString()
      })
      
      // Actualizar estado local
      setLotes(prev => prev.map(lote => 
        lote.id === loteId 
          ? { ...lote, ...editForm }
          : lote
      ))
      
      setEditingLote(null)
      setEditForm({})
      setMessage({ type: 'success', text: `Lote ${loteId} actualizado exitosamente` })
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      
    } catch (error) {
      console.error('Error guardando lote:', error)
      setMessage({ type: 'error', text: 'Error al guardar los cambios' })
    } finally {
      setSaving(false)
    }
  }

  // Función para manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Filtrar lotes según búsqueda
  const filteredLotes = lotes.filter(lote => {
    const searchLower = searchTerm.toLowerCase()
    return (
      lote.id.toLowerCase().includes(searchLower) ||
      lote.nombre?.toLowerCase().includes(searchLower) ||
      lote.estado?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Gestión de Lotes
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={loadLotes}
          disabled={loading}
          sx={{ minWidth: 'auto', p: 1 }}
        >
          <Refresh />
        </Button>
      </Box>

      {/* Mensajes */}
      {message.text && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 2 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      {/* Búsqueda */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 2,
          backgroundColor: 'background.paper',
          color: 'text.primary'
        }}
      >
        <TextField
          fullWidth
          label="Buscar lotes..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por ID, nombre o estado"
        />
      </Paper>

      {/* Vista móvil - Cards */}
      {isMobile ? (
        <Box>
          {filteredLotes.map((lote) => (
            <Card 
              key={lote.id} 
              sx={{ 
                mb: 2,
                backgroundColor: 'background.paper',
                color: 'text.primary'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6">
                    {getLoteTitle(lote)}
                  </Typography>
                  <Chip
                    label={lote.estado?.toUpperCase() || 'SIN ESTADO'}
                    color={getEstadoConfig(lote.estado).color}
                    sx={getEstadoConfig(lote.estado).sx}
                    size="small"
                  />
                </Box>
                
                {editingLote === lote.id ? (
                  // Formulario de edición móvil
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      value={editForm.nombre}
                      onChange={(e) => handleFormChange('nombre', e.target.value)}
                      margin="normal"
                      size="small"
                    />
                    
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel>Estado</InputLabel>
                      <Select
                        value={editForm.estado}
                        onChange={(e) => handleFormChange('estado', e.target.value)}
                        label="Estado"
                      >
                        {ESTADOS_LOTES.map((estado) => (
                          <MenuItem key={estado.value} value={estado.value}>
                            {estado.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <TextField
                      fullWidth
                      label="Superficie (m²)"
                      type="number"
                      value={editForm.superficie}
                      onChange={(e) => handleFormChange('superficie', e.target.value)}
                      margin="normal"
                      size="small"
                    />
                    
                    <TextField
                      fullWidth
                      label="Superficie Útil (m²)"
                      type="number"
                      value={editForm.superficieUtil}
                      onChange={(e) => handleFormChange('superficieUtil', e.target.value)}
                      margin="normal"
                      size="small"
                    />
                    
                    <TextField
                      fullWidth
                      label="Precio"
                      type="number"
                      value={editForm.precio}
                      onChange={(e) => handleFormChange('precio', e.target.value)}
                      margin="normal"
                      size="small"
                    />
                    
                    <TextField
                      fullWidth
                      label="Observaciones"
                      multiline
                      rows={2}
                      value={editForm.observaciones}
                      onChange={(e) => handleFormChange('observaciones', e.target.value)}
                      margin="normal"
                      size="small"
                    />
                    
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<Save />}
                        onClick={() => handleSave(lote.id)}
                        disabled={saving}
                      >
                        Guardar
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                      >
                        Cancelar
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  // Vista normal móvil
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Superficie:</strong> {lote.superficie ? `${lote.superficie} m²` : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Superficie Útil:</strong> {lote.superficieUtil ? `${lote.superficieUtil} m²` : 'N/A'}
                    </Typography>
                    {lote.precio !== undefined && lote.precio !== null && lote.precio !== '' && lote.precio !== 0 && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Precio:</strong> ${lote.precio?.toLocaleString()}
                      </Typography>
                    )}
                    {lote.observaciones && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        <strong>Observaciones:</strong> {lote.observaciones}
                      </Typography>
                    )}
                    
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleEdit(lote)}
                      sx={{ mt: 2 }}
                    >
                      Editar
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        // Vista desktop - Tabla
        <TableContainer 
          component={Paper} 
          sx={{ 
            backgroundColor: 'background.paper',
            '& .MuiTable-root': {
              backgroundColor: 'background.paper'
            }
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Nombre</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell><strong>Superficie (m²)</strong></TableCell>
                <TableCell><strong>Superficie Útil (m²)</strong></TableCell>
                <TableCell><strong>Precio</strong></TableCell>
                <TableCell><strong>Observaciones</strong></TableCell>
                <TableCell><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLotes.map((lote) => (
                <TableRow key={lote.id}>
                  <TableCell>{lote.id}</TableCell>
                  <TableCell>
                    {editingLote === lote.id ? (
                      <TextField
                        size="small"
                        value={editForm.nombre}
                        onChange={(e) => handleFormChange('nombre', e.target.value)}
                        fullWidth
                      />
                    ) : (
                      getLoteTitle(lote)
                    )}
                  </TableCell>
                  <TableCell>
                    {editingLote === lote.id ? (
                      <FormControl size="small" fullWidth>
                        <Select
                          value={editForm.estado}
                          onChange={(e) => handleFormChange('estado', e.target.value)}
                        >
                          {ESTADOS_LOTES.map((estado) => (
                            <MenuItem key={estado.value} value={estado.value}>
                              {estado.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        label={lote.estado?.toUpperCase() || 'SIN ESTADO'}
                        color={getEstadoConfig(lote.estado).color}
                        sx={getEstadoConfig(lote.estado).sx}
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {editingLote === lote.id ? (
                      <TextField
                        size="small"
                        type="number"
                        value={editForm.superficie}
                        onChange={(e) => handleFormChange('superficie', e.target.value)}
                      />
                    ) : (
                      lote.superficie || 'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    {editingLote === lote.id ? (
                      <TextField
                        size="small"
                        type="number"
                        value={editForm.superficieUtil}
                        onChange={(e) => handleFormChange('superficieUtil', e.target.value)}
                      />
                    ) : (
                      lote.superficieUtil || 'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    {editingLote === lote.id ? (
                      <TextField
                        size="small"
                        type="number"
                        value={editForm.precio}
                        onChange={(e) => handleFormChange('precio', e.target.value)}
                      />
                    ) : (
                      lote.precio ? `$${lote.precio.toLocaleString()}` : 'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    {editingLote === lote.id ? (
                      <TextField
                        size="small"
                        multiline
                        value={editForm.observaciones}
                        onChange={(e) => handleFormChange('observaciones', e.target.value)}
                        fullWidth
                      />
                    ) : (
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lote.observaciones || '-'}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingLote === lote.id ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Guardar">
                          <IconButton
                            color="primary"
                            onClick={() => handleSave(lote.id)}
                            disabled={saving}
                          >
                            <Save />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancelar">
                          <IconButton
                            color="secondary"
                            onClick={handleCancel}
                          >
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Tooltip title="Editar">
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(lote)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Backdrop para operaciones de guardado */}
      <Backdrop
        sx={{ color: 'primary.contrastText', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={saving}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2 }}>Guardando cambios...</Typography>
        </Box>
      </Backdrop>

      {/* Resumen */}
      <Paper sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Resumen
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Total de lotes
            </Typography>
            <Typography variant="h6">
              {lotes.length}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Disponibles
            </Typography>
            <Typography variant="h6" color="success.main">
              {lotes.filter(l => l.estado === 'disponible').length}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Reservados
            </Typography>
            <Typography variant="h6" color="warning.main">
              {lotes.filter(l => l.estado === 'reservado').length}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Vendidos
            </Typography>
            <Typography variant="h6" color="error.main">
              {lotes.filter(l => l.estado === 'vendido').length}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

export default LotesAdmin
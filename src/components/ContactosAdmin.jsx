import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Visibility as ViewIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const ContactosAdmin = () => {
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContacto, setSelectedContacto] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Cargar contactos en tiempo real
  useEffect(() => {
    const q = query(
      collection(db, 'contactos'),
      orderBy('fechaEnvio', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const contactosData = [];
      querySnapshot.forEach((doc) => {
        contactosData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setContactos(contactosData);
      setLoading(false);
    }, (error) => {
      console.error('Error al cargar contactos:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Marcar como procesado
  const marcarComoProcesado = async (contactoId) => {
    try {
      await updateDoc(doc(db, 'contactos', contactoId), {
        procesado: true,
        fechaProcesado: new Date()
      });
    } catch (error) {
      console.error('Error al marcar como procesado:', error);
    }
  };

  // Abrir WhatsApp
  const abrirWhatsApp = (contacto) => {
    const mensaje = encodeURIComponent(
      `Hola ${contacto.nombre}, te escribo desde Loteo Los Volcanes en respuesta a tu consulta: "${contacto.asunto}"`
    );
    const telefono = contacto.telefono.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${telefono}?text=${mensaje}`;
    window.open(whatsappUrl, '_blank');
  };

  // Formatear fecha
  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'Sin fecha';
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return fecha.toLocaleString('es-CL');
  };

  return (
    <Box>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 3, 
          fontWeight: 700,
          color: '#1a1a1a',
          fontSize: { xs: '1.8rem', md: '2.125rem' }
        }}
      >
        Gestión de Contactos
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : contactos.length === 0 ? (
        <Alert severity="info">
          No hay contactos registrados aún.
        </Alert>
      ) : (
        <>
          <Alert severity="info" sx={{ mb: 3 }}>
            Total de contactos: {contactos.length} | 
            Pendientes: {contactos.filter(c => !c.procesado).length}
          </Alert>

          <TableContainer 
            component={Paper}
            sx={{
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <Table sx={{ backgroundColor: '#ffffff' }}>
              <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Teléfono</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Asunto</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#2c3e50' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contactos.map((contacto) => (
                  <TableRow 
                    key={contacto.id}
                    sx={{ 
                      backgroundColor: contacto.procesado ? '#f8f9fa' : '#ffffff',
                      '&:hover': { backgroundColor: '#e3f2fd' },
                      '& .MuiTableCell-root': {
                        color: '#2c3e50',
                        borderBottom: '1px solid #e0e0e0'
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#2c3e50', fontSize: '0.875rem' }}>
                        {formatearFecha(contacto.fechaEnvio)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, color: '#1a1a1a' }}>{contacto.nombre}</TableCell>
                    <TableCell sx={{ color: '#1976d2' }}>{contacto.email}</TableCell>
                    <TableCell sx={{ color: '#2c3e50' }}>{contacto.telefono}</TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 200, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#2c3e50'
                        }}
                      >
                        {contacto.asunto}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={contacto.procesado ? <CheckIcon /> : <TimeIcon />}
                        label={contacto.procesado ? 'Procesado' : 'Pendiente'}
                        color={contacto.procesado ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            sx={{ 
                              color: '#1976d2',
                              '&:hover': { backgroundColor: '#e3f2fd' }
                            }}
                            onClick={() => {
                              setSelectedContacto(contacto);
                              setDialogOpen(true);
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Contactar por WhatsApp">
                          <IconButton
                            size="small"
                            sx={{
                              color: '#25d366',
                              '&:hover': { 
                                backgroundColor: '#e8f5e8',
                                color: '#1b5e20' 
                              }
                            }}
                            onClick={() => abrirWhatsApp(contacto)}
                          >
                            <WhatsAppIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Enviar email">
                          <IconButton
                            size="small"
                            sx={{
                              color: '#d32f2f',
                              '&:hover': { 
                                backgroundColor: '#ffebee',
                                color: '#b71c1c' 
                              }
                            }}
                            onClick={() => window.open(`mailto:${contacto.email}`, '_blank')}
                          >
                            <EmailIcon />
                          </IconButton>
                        </Tooltip>
                        {!contacto.procesado && (
                          <Tooltip title="Marcar como procesado">
                            <IconButton
                              size="small"
                              sx={{
                                color: '#ed6c02',
                                '&:hover': { 
                                  backgroundColor: '#fff3e0',
                                  color: '#e65100' 
                                }
                              }}
                              onClick={() => marcarComoProcesado(contacto.id)}
                            >
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Dialog de detalles */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedContacto && (
          <>
            <DialogTitle>
              Detalles del Contacto
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Nombre"
                    value={selectedContacto.nombre}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Email"
                    value={selectedContacto.email}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Teléfono"
                    value={selectedContacto.telefono}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Fecha de Envío"
                    value={formatearFecha(selectedContacto.fechaEnvio)}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Asunto"
                    value={selectedContacto.asunto}
                    fullWidth
                    multiline
                    rows={4}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Chip
                    icon={selectedContacto.procesado ? <CheckIcon /> : <TimeIcon />}
                    label={selectedContacto.procesado ? 'Procesado' : 'Pendiente'}
                    color={selectedContacto.procesado ? 'success' : 'warning'}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>
                Cerrar
              </Button>
              <Button 
                variant="contained" 
                sx={{
                  backgroundColor: '#25d366',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#1b5e20'
                  }
                }}
                startIcon={<WhatsAppIcon />}
                onClick={() => {
                  abrirWhatsApp(selectedContacto);
                  setDialogOpen(false);
                }}
              >
                Contactar por WhatsApp
              </Button>
              {!selectedContacto.procesado && (
                <Button
                  variant="contained"
                  startIcon={<CheckIcon />}
                  onClick={() => {
                    marcarComoProcesado(selectedContacto.id);
                    setDialogOpen(false);
                  }}
                >
                  Marcar como Procesado
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ContactosAdmin;
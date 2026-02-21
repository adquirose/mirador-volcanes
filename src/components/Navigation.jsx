import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Fab,
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Modal,
  Paper,
  IconButton,
  alpha,
  Zoom,
  Slide,
  TextField,
  Button,
  Grid,
  Skeleton,
  useMediaQuery
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Description as ProjectIcon,
  PhotoLibrary as GalleryIcon,
  LocationOn as LocationIcon,
  ContactMail as ContactIcon,
  AdminPanelSettings as AdminIcon,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../hooks/useAuth';
import MapboxMap from './MapboxMap';

const Navigation = ({ onDrawerChange }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [drawerOpen, setDrawerOpen] = useState(isDesktop);
  const [modalOpen, setModalOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentContent, setCurrentContent] = useState(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const fabRef = useRef(null);

  // Estado del formulario de contacto
  const [contactForm, setContactForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    asunto: ''
  });

  // Estado para errores de validación
  const [formErrors, setFormErrors] = useState({
    nombre: '',
    telefono: '',
    email: '',
    asunto: ''
  });

  // Comunicar cambios en el estado del drawer
  useEffect(() => {
    if (onDrawerChange) {
      onDrawerChange(drawerOpen);
    }
  }, [drawerOpen, onDrawerChange]);

  // Manejar aria-hidden para el root cuando hay modales abiertos
  useEffect(() => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      if (modalOpen || galleryModalOpen || contactModalOpen) {
        rootElement.setAttribute('aria-hidden', 'true');
      } else {
        rootElement.removeAttribute('aria-hidden');
      }
    }
    
    // Cleanup
    return () => {
      if (rootElement) {
        rootElement.removeAttribute('aria-hidden');
      }
    };
  }, [modalOpen, galleryModalOpen, contactModalOpen]);

  // Cerrar drawer cuando se abre modal de contacto
  useEffect(() => {
    if (contactModalOpen && drawerOpen) {
      setDrawerOpen(false);
    }
  }, [contactModalOpen, drawerOpen]);

  // Cerrar drawer cuando se abre modal de galería
  useEffect(() => {
    if (galleryModalOpen && drawerOpen) {
      setDrawerOpen(false);
    }
  }, [galleryModalOpen, drawerOpen]);

  // Cerrar drawer cuando se abre modal principal
  useEffect(() => {
    if (modalOpen && drawerOpen) {
      setDrawerOpen(false);
    }
  }, [modalOpen, drawerOpen]);

  // Funciones de validación
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? '' : 'Email inválido';
  };

  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const phoneRegex = /^(\+56)?[0-9]{8,9}$/;
    return phoneRegex.test(cleanPhone) ? '' : 'Teléfono debe tener formato válido (+56 9 XXXX XXXX)';
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'email':
        return validateEmail(value);
      case 'telefono':
        return validatePhone(value);
      case 'nombre':
        return value.trim().length < 2 ? 'Nombre debe tener al menos 2 caracteres' : '';
      case 'asunto':
        return value.trim().length < 3 ? 'Asunto debe tener al menos 3 caracteres' : '';
      default:
        return '';
    }
  };

  // Array de imágenes de la galería
  const galleryImages = Array.from({ length: 12 }, (_, i) => `/galeria/${i + 1}.jpg`);

  const navItems = [
    { label: 'PROYECTO', id: 'proyecto', icon: <ProjectIcon /> },
    { label: 'GALERIA', id: 'galeria', icon: <GalleryIcon /> },
    { label: 'UBICACION', id: 'ubicacion', icon: <LocationIcon /> }, 
    { label: 'CONTACTO', id: 'contacto', icon: <ContactIcon /> },
    { label: 'WHATSAPP', id: 'whatsapp', icon: <WhatsAppIcon /> },
    ...(isAuthenticated ? [{ label: 'ADMIN', id: 'admin', icon: <AdminIcon /> }] : [])
  ];

  const content = {
    proyecto: {
      title: 'PROYECTO',
      text: 'Ubicado en uno de los sectores más atractivos de Panguipulli, Lote Los Volcanes es un loteo exclusivo de sólo 10 sitios de ~5.000 m², con vistas privilegiadas a los volcanes Villarrica y Choshuenco. La primera línea de sitios se integra a bosque nativo y borde de lago, mientras que la segunda línea se encuentra en una pradera de suave pendiente con inigualables vistas panorámicas. El entorno es ideal para quienes buscan un espacio de tranquilidad y privacidad junto al lago, a sólo 10 minutos del pueblo. El loteo contempla urbanización soterrada y un amplio sector de playa común con 80 mt de frente de lago, muelle, bajada pavimentada, bajada de lancha, estacionamientos y bodegas para equipos náuticos. Lote Los Volcanes ofrece una excelente conectividad por camino Etchegaray, ruta de muy bajo tránsito, con acceso por camino privado y portón exclusivo que refuerzan un entorno seguro, silencioso y verdaderamente único para vivir o descansar junto al lago.'
    },
    galeria: {
      title: 'GALERÍA',
      text: 'Galería de imágenes del proyecto Lote Los Volcanes. Aquí podrás ver fotografías de los sitios, las vistas panorámicas, el entorno natural y las instalaciones comunes del loteo.'
    },
    ubicacion: {
      title: 'UBICACIÓN',
      text: 'Lote Los Volcanes se encuentra estratégicamente ubicado en Panguipulli, Región de Los Ríos, Chile. Con fácil acceso por camino Etchegaray y a solo 10 minutos del centro del pueblo, ofrece la perfecta combinación entre tranquilidad y conectividad.'
    },
    contacto: {
      title: 'CONTACTO',
      text: 'Para más información sobre Lote Los Volcanes, no dudes en contactarnos. Nuestro equipo está disponible para resolver todas tus consultas sobre este exclusivo proyecto inmobiliario.'
    }
  };

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavClick = (itemId) => {
    console.log(`Navegando a: ${itemId}`);
    
    if (itemId === 'admin') {
      navigate('/admin');
      setDrawerOpen(false);
      return;
    }
    
    if (itemId === 'whatsapp') {
      const message = encodeURIComponent('Hola, me interesa conocer más sobre Lote Los Volcanes');
      const whatsappUrl = `https://wa.me/56982521849?text=${message}`;
      window.open(whatsappUrl, '_blank');
      setDrawerOpen(false);
      return;
    }
    
    if (itemId === 'galeria') {
      // Cerrar drawer antes de abrir modal
      setDrawerOpen(false);
      // Usar setTimeout para asegurar que el drawer se cierre completamente
      setTimeout(() => {
        setGalleryModalOpen(true);
        setCurrentImageIndex(0);
      }, 150);
    } else if (itemId === 'contacto') {
      // Cerrar drawer antes de abrir modal
      setDrawerOpen(false);
      // Usar setTimeout para asegurar que el drawer se cierre completamente
      setTimeout(() => {
        setContactModalOpen(true);
      }, 150);
    } else {
      // Cerrar drawer antes de abrir modal
      setDrawerOpen(false);
      // Usar setTimeout para asegurar que el drawer se cierre completamente
      setTimeout(() => {
        setCurrentContent(content[itemId]);
        setModalOpen(true);
      }, 150);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentContent(null);
  };

  const handleCloseGallery = () => {
    setGalleryModalOpen(false);
    setCurrentImageIndex(0);
  };

  const handleCloseContact = () => {
    setContactModalOpen(false);
    setContactForm({
      nombre: '',
      telefono: '',
      email: '',
      asunto: ''
    });
    setFormErrors({
      nombre: '',
      telefono: '',
      email: '',
      asunto: ''
    });
  };

  const handleContactFormChange = (field) => (event) => {
    const value = event.target.value;
    
    // Formatear RUT mientras se escribe
    let formattedValue = value;
    if (field === 'rut') {
      formattedValue = formatRut(value);
    }

    setContactForm(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Solo validar campos que no sean RUT en tiempo real, o RUT si está más completo
    if (field !== 'rut' || (field === 'rut' && formattedValue.replace(/[^0-9kK]/g, '').length >= 7)) {
      const error = validateField(field, formattedValue);
      setFormErrors(prev => ({
        ...prev,
        [field]: error
      }));
    } else if (field === 'rut') {
      // Limpiar error de RUT mientras se está escribiendo
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFieldBlur = (field) => (event) => {
    const value = event.target.value;
    const error = validateField(field, value);
    setFormErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const formatRut = (value) => {
    // Limpiar el valor de entrada
    const cleanValue = value.replace(/[^0-9kK]/gi, '').toUpperCase();
    
    // Si está vacío o solo tiene un caracter, devolverlo tal como está
    if (cleanValue.length === 0) return '';
    if (cleanValue.length === 1) return cleanValue;
    
    // Si tiene más de 9 caracteres, truncar
    const truncatedValue = cleanValue.length > 9 ? cleanValue.slice(0, 9) : cleanValue;
    
    // Separar la parte numérica del dígito verificador
    const rutPart = truncatedValue.slice(0, -1);
    const verifier = truncatedValue.slice(-1);
    
    // Si no hay parte numérica suficiente, devolver solo los números
    if (rutPart.length === 0) return truncatedValue;
    
    // Formatear con puntos
    let formatted = '';
    for (let i = 0; i < rutPart.length; i++) {
      if (i > 0 && (rutPart.length - i) % 3 === 0) {
        formatted += '.';
      }
      formatted += rutPart[i];
    }
    
    // Solo agregar el guión y el verificador si hay verificador
    return verifier ? formatted + '-' + verifier : formatted;
  };

  const handleSubmitContact = (event) => {
    event.preventDefault();
    
    // Validar todos los campos
    const errors = {};
    Object.keys(contactForm).forEach(field => {
      const error = validateField(field, contactForm[field]);
      errors[field] = error;
    });
    
    setFormErrors(errors);
    
    // Verificar si hay errores
    const hasErrors = Object.values(errors).some(error => error !== '');
    const hasEmptyFields = Object.values(contactForm).some(value => value.trim() === '');
    
    if (hasErrors) {
      alert('Por favor corrige los errores en el formulario');
      return;
    }
    
    if (hasEmptyFields) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    console.log('Formulario de contacto enviado:', contactForm);
    alert('¡Gracias por tu mensaje! Nos contactaremos contigo pronto.');
    handleCloseContact();
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  // Efecto para quitar foco del FAB cuando se abre modal
  useEffect(() => {
    if ((modalOpen || galleryModalOpen || contactModalOpen) && fabRef.current) {
      fabRef.current.blur();
    }
  }, [modalOpen, galleryModalOpen, contactModalOpen]);

  // Efecto para navegación por teclado en la galería
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!galleryModalOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentImageIndex((prev) => 
            prev === 0 ? galleryImages.length - 1 : prev - 1
          );
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentImageIndex((prev) => 
            prev === galleryImages.length - 1 ? 0 : prev + 1
          );
          break;
        case 'Escape':
          e.preventDefault();
          handleCloseGallery();
          break;
        default:
          break;
      }
    };

    if (galleryModalOpen) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [galleryModalOpen, galleryImages.length]);

  return (
    <>
      {/* Botón flotante a la izquierda */}
      <Zoom in={true} timeout={1000}>
        <Fab
          ref={fabRef}
          onClick={handleToggleDrawer}
          sx={{
            position: 'fixed',
            top: 30,
            left: 24,
            zIndex: theme.zIndex.fab,
            backgroundColor: '#ffffff',
            backdropFilter: 'blur(10px)',
            color: '#000000',
            border: `1px solid ${alpha('#000000', 0.1)}`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.3)}`,
            '&:hover': {
              backgroundColor: '#f5f5f5',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.3s ease',
            width: 56,
            height: 56,
          }}
        >
          {drawerOpen ? <CloseIcon /> : <MenuIcon />}
        </Fab>
      </Zoom>

      {/* Drawer lateral desde la izquierda */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleToggleDrawer}
        keepMounted={false}
        variant={isDesktop ? "persistent" : "temporary"}
        sx={{
          '& .MuiDrawer-paper': {
            width: 320,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: 'none',
            borderRight: `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
            boxShadow: `8px 0 32px ${alpha(theme.palette.common.black, 0.2)}`,
          },
        }}
        ModalProps={{
          disableEnforceFocus: true,
          disableAutoFocus: true,
          disableRestoreFocus: true,
          hideBackdrop: isDesktop,
          BackdropProps: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.2)', // Menos opacidad que el default (0.5)
            }
          }
        }}
        SlideProps={{
          direction: 'right',
        }}
      >
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header del drawer */}
          <Box
            sx={{
              p: 3,
              borderBottom: `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {!logoLoaded && (
              <Skeleton 
                variant="rectangular" 
                width={224} 
                height={96}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1
                }}
              />
            )}
            <img
              src="/loteo-v4.png"
              alt="Logo Rivera"
              style={{
                maxWidth: '224px',
                maxHeight: '96px',
                width: '100%',
                objectFit: 'contain',
                display: logoLoaded ? 'block' : 'none'
              }}
              onLoad={() => setLogoLoaded(true)}
              onError={() => setLogoLoaded(false)}
            />
          </Box>

          {/* Lista de navegación */}
          <List sx={{ flexGrow: 1, py: 2 }}>
            {navItems.map((item, index) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  onClick={() => handleNavClick(item.id)}
                  sx={{
                    py: 2.5,
                    px: 3,
                    mx: 2,
                    mb: 1,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    border: `1px solid transparent`,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.black, 0.05),
                      transform: 'translateX(8px)',
                      border: `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: '#555555',
                      minWidth: '40px',
                      '& .MuiSvgIcon-root': {
                        fontSize: '1.4rem',
                      },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      color: '#333333',
                      letterSpacing: '0.5px',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {/* Footer del drawer */}
          <Box
            sx={{
              p: 3,
              borderTop: `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#666666',
                textAlign: 'center',
                display: 'block',
                fontSize: '0.8rem',
              }}
            >
              Tour Virtual 360°
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* Modal para mostrar contenido */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        disableEnforceFocus={false}
        disableAutoFocus={false}
        disableRestoreFocus={false}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }
        }}
      >
        <Slide direction="up" in={modalOpen} mountOnEnter unmountOnExit>
          <Paper
            sx={{
              position: 'relative',
              width: currentContent?.title === 'UBICACIÓN' ? '95%' : '90%',
              maxWidth: currentContent?.title === 'UBICACIÓN' ? '1100px' : '800px',
              maxHeight: currentContent?.title === 'UBICACIÓN' ? '95vh' : '90vh',
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
              border: `2px solid ${alpha(theme.palette.common.white, 0.8)}`,
              overflow: 'hidden',
            }}
          >
            {/* Header del modal */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 3,
                borderBottom: `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#333333',
                  letterSpacing: '1px',
                }}
              >
                {currentContent?.title}
              </Typography>
              <IconButton
                onClick={handleCloseModal}
                sx={{
                  color: '#666666',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.black, 0.05),
                    transformation: 'scale(1.1)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Contenido del modal */}
            <Box
              sx={{
                p: currentContent?.title === 'UBICACIÓN' ? 0 : 4,
                height: currentContent?.title === 'UBICACIÓN' ? 'calc(95vh - 100px)' : 'auto',
                maxHeight: currentContent?.title === 'UBICACIÓN' ? 'calc(95vh - 100px)' : 'calc(90vh - 120px)',
                overflow: currentContent?.title === 'UBICACIÓN' ? 'hidden' : 'auto',
                display: currentContent?.title === 'UBICACIÓN' ? 'flex' : 'block',
                flexDirection: currentContent?.title === 'UBICACIÓN' ? 'column' : 'initial',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: alpha(theme.palette.common.black, 0.05),
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: alpha(theme.palette.common.black, 0.2),
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.black, 0.3),
                  },
                },
              }}
            >
              {/* Solo mostrar mapa para ubicación, sin texto */}
              {currentContent?.title === 'UBICACIÓN' ? (
                <MapboxMap 
                  latitude={-39.651740}
                  longitude={-72.268545}
                  zoom={11}
                  style={{ width: '100%', height: '100%', minHeight: 0 }}
                />
              ) : (
                <Typography
                  variant="body1"
                  sx={{
                    color: '#444444',
                    lineHeight: 1.8,
                    fontSize: '1.1rem',
                    textAlign: 'justify',
                    fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
                  }}
                >
                  {currentContent?.text}
                </Typography>
              )}
            </Box>
          </Paper>
        </Slide>
      </Modal>

      {/* Modal de Galería con Carousel */}
      <Modal
        open={galleryModalOpen}
        onClose={handleCloseGallery}
        closeAfterTransition
        disableEnforceFocus={false}
        disableAutoFocus={false}
        disableRestoreFocus={false}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }
        }}
      >
        <Slide direction="up" in={galleryModalOpen} mountOnEnter unmountOnExit>
          <Paper
            sx={{
              position: 'relative',
              width: '95%',
              maxWidth: '1200px',
              height: '90vh',
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
              border: `2px solid ${alpha(theme.palette.common.white, 0.8)}`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header de la galería */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 3,
                borderBottom: `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#333333',
                  letterSpacing: '1px',
                }}
              >
                GALERÍA
              </Typography>
              <IconButton
                onClick={handleCloseGallery}
                sx={{
                  color: '#666666',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.black, 0.05),
                    transformation: 'scale(1.1)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Contenedor de la imagen */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Botón anterior */}
              <IconButton
                onClick={handlePrevImage}
                sx={{
                  position: 'absolute',
                  left: { xs: 4, sm: 16 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  backgroundColor: { 
                    xs: 'rgba(255, 255, 255, 0.3)', 
                    sm: 'rgba(255, 255, 255, 0.9)' 
                  },
                  color: '#333333',
                  width: { xs: 32, sm: 56 },
                  height: { xs: 32, sm: 56 },
                  boxShadow: { 
                    xs: '0 2px 6px rgba(0, 0, 0, 0.1)', 
                    sm: '0 4px 12px rgba(0, 0, 0, 0.15)' 
                  },
                  '&:hover': {
                    backgroundColor: { 
                      xs: 'rgba(255, 255, 255, 0.5)', 
                      sm: 'rgba(255, 255, 255, 1)' 
                    },
                    transform: 'translateY(-50%) scale(1.1)',
                    boxShadow: {
                      xs: '0 3px 8px rgba(0, 0, 0, 0.15)',
                      sm: '0 6px 20px rgba(0, 0, 0, 0.2)'
                    },
                  },
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: { xs: '1.2rem', sm: '2rem' } }} />
              </IconButton>

              {/* Imagen actual */}
              <img
                src={galleryImages[currentImageIndex]}
                alt={`Imagen ${currentImageIndex + 1}`}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />

              {/* Botón siguiente */}
              <IconButton
                onClick={handleNextImage}
                sx={{
                  position: 'absolute',
                  right: { xs: 4, sm: 16 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  backgroundColor: { 
                    xs: 'rgba(255, 255, 255, 0.3)', 
                    sm: 'rgba(255, 255, 255, 0.9)' 
                  },
                  color: '#333333',
                  width: { xs: 32, sm: 56 },
                  height: { xs: 32, sm: 56 },
                  boxShadow: { 
                    xs: '0 2px 6px rgba(0, 0, 0, 0.1)', 
                    sm: '0 4px 12px rgba(0, 0, 0, 0.15)' 
                  },
                  '&:hover': {
                    backgroundColor: { 
                      xs: 'rgba(255, 255, 255, 0.5)', 
                      sm: 'rgba(255, 255, 255, 1)' 
                    },
                    transform: 'translateY(-50%) scale(1.1)',
                    boxShadow: {
                      xs: '0 3px 8px rgba(0, 0, 0, 0.15)',
                      sm: '0 6px 20px rgba(0, 0, 0, 0.2)'
                    },
                  },
                }}
              >
                <ChevronRightIcon sx={{ fontSize: { xs: '1.2rem', sm: '2rem' } }} />
              </IconButton>
            </Box>

            {/* Indicadores de imágenes */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 1,
                p: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderTop: `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
                overflowX: 'auto',
              }}
            >
              {galleryImages.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: currentImageIndex === index 
                      ? '#333333' 
                      : 'rgba(0, 0, 0, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      transform: 'scale(1.2)',
                    },
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Slide>
      </Modal>

      {/* Modal de Formulario de Contacto */}
      <Modal
        open={contactModalOpen}
        onClose={handleCloseContact}
        closeAfterTransition
        disableEnforceFocus={false}
        disableAutoFocus={false}
        disableRestoreFocus={false}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }
        }}
      >
        <Slide direction="up" in={contactModalOpen} mountOnEnter unmountOnExit>
          <Paper
            sx={{
              position: 'relative',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
              border: `2px solid ${alpha(theme.palette.common.white, 0.8)}`,
              overflow: 'hidden',
            }}
          >
            {/* Header del modal */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 3,
                borderBottom: `1px solid ${alpha(theme.palette.common.black, 0.1)}`,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#333333',
                  letterSpacing: '1px',
                }}
              >
                CONTACTO
              </Typography>
              <IconButton
                onClick={handleCloseContact}
                sx={{
                  color: '#666666',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.black, 0.05),
                    transformation: 'scale(1.1)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Formulario de contacto */}
            <Box
              component="form"
              onSubmit={handleSubmitContact}
              sx={{
                p: 4,
                maxHeight: 'calc(90vh - 120px)',
                overflow: 'auto',
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: '#666666',
                  mb: 3,
                  textAlign: 'center',
                  lineHeight: 1.6,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                }}
              >
                Nos interesa conocer tu opinión sobre Lote Los Volcanes. 
                Completa el formulario y nos contactaremos contigo.
              </Typography>

              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Nombre completo"
                    variant="outlined"
                    required
                    value={contactForm.nombre}
                    onChange={handleContactFormChange('nombre')}
                    error={!!formErrors.nombre}
                    helperText={formErrors.nombre}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'white',
                        '& fieldset': {
                          borderColor: '#e8e8e8',
                          borderWidth: '1px',
                        },
                        '&:hover fieldset': {
                          borderColor: '#666666',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#333333',
                          borderWidth: '1px',
                        },
                        '& input:-webkit-autofill': {
                          WebkitBoxShadow: '0 0 0 1000px white inset !important',
                          WebkitTextFillColor: '#333333 !important',
                          transition: 'background-color 5000s ease-in-out 0s',
                        },
                        '& input:-webkit-autofill:hover': {
                          WebkitBoxShadow: '0 0 0 1000px white inset !important',
                        },
                        '& input:-webkit-autofill:focus': {
                          WebkitBoxShadow: '0 0 0 1000px white inset !important',
                        },
                        '& input:-webkit-autofill:active': {
                          WebkitBoxShadow: '0 0 0 1000px white inset !important',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#555555',
                        fontWeight: 500,
                        fontSize: { xs: '0.85rem', sm: '1rem' },
                        '&.Mui-focused': {
                          color: '#333333',
                        },
                      },
                      '& .MuiOutlinedInput-input': {
                        fontSize: { xs: '0.85rem', sm: '1rem' },
                        padding: { xs: '16px 14px', sm: '16.5px 14px' },
                        color: '#333333',
                        '&::placeholder': {
                          color: '#999999',
                          opacity: 1,
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    required
                    type="email"
                    value={contactForm.email}
                    onChange={handleContactFormChange('email')}
                    placeholder="tucorreo@ejemplo.com"
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'white',
                        '& fieldset': {
                          borderColor: '#e8e8e8',
                          borderWidth: '1px',
                        },
                        '&:hover fieldset': {
                          borderColor: '#666666',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#333333',
                          borderWidth: '1px',
                        },
                        '& input:-webkit-autofill': {
                          WebkitBoxShadow: '0 0 0 1000px white inset !important',
                          WebkitTextFillColor: '#333333 !important',
                          transition: 'background-color 5000s ease-in-out 0s',
                        },
                        '& input:-webkit-autofill:hover': {
                          WebkitBoxShadow: '0 0 0 1000px white inset !important',
                        },
                        '& input:-webkit-autofill:focus': {
                          WebkitBoxShadow: '0 0 0 1000px white inset !important',
                        },
                        '& input:-webkit-autofill:active': {
                          WebkitBoxShadow: '0 0 0 1000px white inset !important',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#555555',
                        fontWeight: 500,
                        fontSize: { xs: '0.85rem', sm: '1rem' },
                        '&.Mui-focused': {
                          color: '#333333',
                        },
                      },
                      '& .MuiOutlinedInput-input': {
                        fontSize: { xs: '0.85rem', sm: '1rem' },
                        padding: { xs: '16px 14px', sm: '16.5px 14px' },
                        color: '#333333',
                        '&::placeholder': {
                          color: '#999999',
                          opacity: 1,
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    variant="outlined"
                    required
                    type="tel"
                    value={contactForm.telefono}
                    onChange={handleContactFormChange('telefono')}
                    placeholder="+56 9 1234 5678"
                    error={!!formErrors.telefono}
                    helperText={formErrors.telefono || '+56 9 XXXX XXXX'}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'white',
                        '& fieldset': {
                          borderColor: '#e8e8e8',
                          borderWidth: '1px',
                        },
                        '&:hover fieldset': {
                          borderColor: '#666666',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#333333',
                          borderWidth: '1px',
                        },
                        '& input:-webkit-autofill': {
                          WebkitBoxShadow: '0 0 0 1000px white inset !important',
                          WebkitTextFillColor: '#333333 !important',
                          transition: 'background-color 5000s ease-in-out 0s',
                        },
                        '& input:-webkit-autofill:hover': {
                          WebkitBoxShadow: '0 0 0 1000px white inset !important',
                        },
                        '& input:-webkit-autofill:focus': {
                          WebkitBoxShadow: '0 0 0 1000px white inset !important',
                        },
                        '& input:-webkit-autofill:active': {
                          WebkitBoxShadow: '0 0 0 1000px white inset !important',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#555555',
                        fontWeight: 500,
                        fontSize: { xs: '0.85rem', sm: '1rem' },
                        '&.Mui-focused': {
                          color: '#333333',
                        },
                      },
                      '& .MuiOutlinedInput-input': {
                        fontSize: { xs: '0.85rem', sm: '1rem' },
                        padding: { xs: '16px 14px', sm: '16.5px 14px' },
                        color: '#333333',
                        '&::placeholder': {
                          color: '#999999',
                          opacity: 1,
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Asunto"
                    variant="outlined"
                    required
                    value={contactForm.asunto}
                    onChange={handleContactFormChange('asunto')}
                    placeholder="Consulta sobre el proyecto"
                    error={!!formErrors.asunto}
                    helperText={formErrors.asunto}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'white',
                        '& fieldset': {
                          borderColor: '#e8e8e8',
                          borderWidth: '1px',
                        },
                        '&:hover fieldset': {
                          borderColor: '#666666',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#333333',
                          borderWidth: '1px',
                        },
                        '& input:-webkit-autofill': {
                          WebkitBoxShadow: '0 0 0 1000px white inset !important',
                          WebkitTextFillColor: '#333333 !important',
                          transition: 'background-color 5000s ease-in-out 0s',
                        },
                        '& input:-webkit-autofill:hover': {
                          WebkitBoxShadow: '0 0 0 1000px white inset !important',
                        },
                        '& input:-webkit-autofill:focus': {
                          WebkitBoxShadow: '0 0 0 1000px white inset !important',
                        },
                        '& input:-webkit-autofill:active': {
                          WebkitBoxShadow: '0 0 0 1000px white inset !important',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#555555',
                        fontWeight: 500,
                        fontSize: { xs: '0.85rem', sm: '1rem' },
                        '&.Mui-focused': {
                          color: '#333333',
                        },
                      },
                      '& .MuiOutlinedInput-input': {
                        fontSize: { xs: '0.85rem', sm: '1rem' },
                        padding: { xs: '16px 14px', sm: '16.5px 14px' },
                        color: '#333333',
                        '&::placeholder': {
                          color: '#999999',
                          opacity: 1,
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      justifyContent: 'flex-end',
                      mt: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={handleCloseContact}
                      sx={{
                        borderRadius: '12px',
                        borderColor: '#999999',
                        color: '#666666',
                        px: 3,
                        py: 1.5,
                        fontSize: { xs: '0.85rem', sm: '0.9rem' },
                        '&:hover': {
                          borderColor: '#333333',
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        borderRadius: '12px',
                        backgroundColor: '#333333',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: { xs: '0.85rem', sm: '0.9rem' },
                        '&:hover': {
                          backgroundColor: '#555555',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                        },
                      }}
                    >
                      Enviar Consulta
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Slide>
      </Modal>
    </>
  );
};

export default Navigation;
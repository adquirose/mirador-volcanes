import React, { useState, useEffect, useRef } from 'react';
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
  Skeleton
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Description as ProjectIcon,
  PhotoLibrary as GalleryIcon,
  LocationOn as LocationIcon,
  ContactMail as ContactIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import MapboxMap from './MapboxMap';

const Navigation = () => {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentContent, setCurrentContent] = useState(null);\n  const [logoLoaded, setLogoLoaded] = useState(false);
  const fabRef = useRef(null);

  // Estado del formulario de contacto
  const [contactForm, setContactForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    rut: ''
  });

  // Estado para errores de validación
  const [formErrors, setFormErrors] = useState({
    nombre: '',
    telefono: '',
    email: '',
    rut: ''
  });

  // Funciones de validación
  const validateRut = (rut) => {
    if (!rut.trim()) return '';
    
    const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    
    // No mostrar error si aún está incompleto (menos de 7 caracteres)
    if (cleanRut.length < 7) return '';
    
    if (cleanRut.length < 8 || cleanRut.length > 9) {
      return 'RUT debe tener entre 8 y 9 dígitos';
    }

    const rutNumber = cleanRut.slice(0, -1);
    const verifierDigit = cleanRut.slice(-1);
    
    // Validar que la parte númerica sea válida
    if (!/^[0-9]+$/.test(rutNumber)) {
      return 'RUT debe contener solo números';
    }
    
    let sum = 0;
    let multiplier = 2;
    
    // Algoritmo del módulo 11 para RUT chileno
    for (let i = rutNumber.length - 1; i >= 0; i--) {
      sum += parseInt(rutNumber[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    
    const remainder = 11 - (sum % 11);
    let calculatedVerifier;
    
    if (remainder === 11) {
      calculatedVerifier = '0';
    } else if (remainder === 10) {
      calculatedVerifier = 'K';
    } else {
      calculatedVerifier = remainder.toString();
    }
    
    return verifierDigit === calculatedVerifier ? '' : 'RUT inválido';
  };

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
      case 'rut':
        return validateRut(value);
      case 'email':
        return validateEmail(value);
      case 'telefono':
        return validatePhone(value);
      case 'nombre':
        return value.trim().length < 2 ? 'Nombre debe tener al menos 2 caracteres' : '';
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
    { label: 'CONTACTO', id: 'contacto', icon: <ContactIcon /> }
  ];

  const content = {
    proyecto: {
      title: 'PROYECTO',
      text: 'Ubicado en uno de los sectores más atractivos de Panguipulli, Mirador Los Volcanes es un loteo exclusivo de sólo 10 sitios de ~5.000 m², con vistas privilegiadas a los volcanes Villarrica y Choshuenco. La primera línea de sitios se integra a bosque nativo y borde de lago, mientras que la segunda línea se encuentra en una pradera de suave pendiente con inigualables vistas panorámicas. El entorno es ideal para quienes buscan un espacio de tranquilidad y privacidad junto al lago, a sólo 10 minutos del pueblo. El loteo contempla urbanización soterrada y un amplio sector de playa común con 80 mt de frente de lago, muelle, bajada pavimentada, bajada de lancha, estacionamientos y bodegas para equipos náuticos. Mirador Los Volcanes ofrece una excelente conectividad por camino Etchegaray, ruta de muy bajo tránsito, con acceso por camino privado y portón exclusivo que refuerzan un entorno seguro, silencioso y verdaderamente único para vivir o descansar junto al lago.'
    },
    galeria: {
      title: 'GALERÍA',
      text: 'Galería de imágenes del proyecto Mirador Los Volcanes. Aquí podrás ver fotografías de los sitios, las vistas panorámicas, el entorno natural y las instalaciones comunes del loteo.'
    },
    ubicacion: {
      title: 'UBICACIÓN',
      text: 'Mirador Los Volcanes se encuentra estratégicamente ubicado en Panguipulli, Región de Los Ríos, Chile. Con fácil acceso por camino Etchegaray y a solo 10 minutos del centro del pueblo, ofrece la perfecta combinación entre tranquilidad y conectividad.'
    },
    contacto: {
      title: 'CONTACTO',
      text: 'Para más información sobre Mirador Los Volcanes, no dudes en contactarnos. Nuestro equipo está disponible para resolver todas tus consultas sobre este exclusivo proyecto inmobiliario.'
    }
  };

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavClick = (itemId) => {
    console.log(`Navegando a: ${itemId}`);
    
    if (itemId === 'galeria') {
      setGalleryModalOpen(true);
      setCurrentImageIndex(0);
    } else if (itemId === 'contacto') {
      setContactModalOpen(true);
    } else {
      setCurrentContent(content[itemId]);
      setModalOpen(true);
    }
    
    setDrawerOpen(false);
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
      rut: ''
    });
    setFormErrors({
      nombre: '',
      telefono: '',
      email: '',
      rut: ''
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
            top: 24,
            left: 24,
            zIndex: theme.zIndex.fab,
            backgroundColor: alpha(theme.palette.background.default, 0.9),
            backdropFilter: 'blur(10px)',
            color: theme.palette.text.primary,
            border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.3)}`,
            '&:hover': {
              backgroundColor: alpha(theme.palette.background.default, 0.95),
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
            <img
              src="/logorivera.png"
              alt="Logo Rivera"
              style={{
                maxWidth: '280px',
                maxHeight: '120px',
                width: '100%',
                objectFit: 'contain',
              }}
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
        disableEnforceFocus
        disableAutoFocus
        disableRestoreFocus
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }}
      >
        <Slide direction="up" in={modalOpen} mountOnEnter unmountOnExit>
          <Paper
            sx={{
              position: 'relative',
              width: '90%',
              maxWidth: '800px',
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
                p: 4,
                maxHeight: 'calc(90vh - 120px)',
                overflow: 'auto',
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
            </Box>
          </Paper>
        </Slide>
      </Modal>

      {/* Modal de Galería con Carousel */}
      <Modal
        open={galleryModalOpen}
        onClose={handleCloseGallery}
        closeAfterTransition
        disableEnforceFocus
        disableAutoFocus
        disableRestoreFocus
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
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
        disableEnforceFocus
        disableAutoFocus
        disableRestoreFocus
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
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
                Nos interesa conocer tu opinión sobre Mirador Los Volcanes. 
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

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="RUT"
                    variant="outlined"
                    required
                    value={contactForm.rut}
                    onChange={handleContactFormChange('rut')}
                    onBlur={handleFieldBlur('rut')}
                    placeholder="12.345.678-9"
                    error={!!formErrors.rut}
                    helperText={formErrors.rut || 'Formato: XX.XXX.XXX-X'}
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

                <Grid size={{ xs: 12, sm: 6 }}>
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
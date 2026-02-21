// Configuración del proyecto - Parámetros centralizados
export const PROJECT_CONFIG = {
  // Información del proyecto
  PROJECT_NAME: 'mirador-volcanes',
  PROJECT_DISPLAY_NAME: 'Lote Los Volcanes',
  
  // Configuración de Firebase/Firestore
  FIREBASE_PROJECT_COLLECTION: 'mirador-volcanes',
  
  // Logos y branding
  LOGO_PATH: '/logo-mirador-volcanes.png',
  LOGO_ALT: 'Lote Los Volcanes',
  
  // Configuración de Krpano
  KRPANO_BASE_PATH: '/krpano/',
  
  // Estados de lotes disponibles
  ESTADOS_LOTES: [
    { value: 'disponible', label: 'Disponible', color: 'success' },
    { value: 'reservado', label: 'Reservado', color: 'warning' },
    { value: 'vendido', label: 'Vendido', color: 'error' },
    { value: 'no disponible', label: 'No Disponible', color: 'default' }
  ]
}

// Función para obtener rutas de Firestore
export const getFirestorePath = (collection) => {
  return `proyectos/${PROJECT_CONFIG.FIREBASE_PROJECT_COLLECTION}/${collection}`
}

// Función para obtener la configuración de estado por valor
export const getEstadoConfig = (estado) => {
  return PROJECT_CONFIG.ESTADOS_LOTES.find(e => e.value === estado) || PROJECT_CONFIG.ESTADOS_LOTES[0]
}
# Sistema de Administración - Mirador Los Volcanes

## Acceso al Sistema

### URL de Administración
```
http://localhost:5176/admin
```

### Credenciales de Acceso
- **Email**: [Configure en Firebase Authentication]
- **Contraseña**: [Configure en Firebase Authentication]

## Funcionalidades

### 1. Autenticación
- Login seguro con Firebase Authentication
- Sesión persistente
- Logout seguro

### 2. Gestión de Lotes
- **Ver todos los lotes**: Lista completa con información detallada
- **Buscar lotes**: Filtro por ID, nombre o estado
- **Editar lotes**: Modificación de propiedades en línea
- **Estados disponibles**:
  - ✅ Disponible
  - ⏳ Reservado
  - ❌ Vendido
  - 🚫 No disponible

### 3. Propiedades Editables
- **Nombre**: Título del lote
- **Estado**: Estado de comercialización
- **Superficie**: Superficie total en m²
- **Superficie Útil**: Superficie útil en m²
- **Precio**: Precio en pesos (opcional)
- **Observaciones**: Notas adicionales

### 4. Interfaz Responsive
- **Vista Desktop**: Tabla completa con todas las columnas
- **Vista Móvil**: Cards adaptadas para dispositivos móviles
- **Edición en línea**: Modificación directa sin diálogos

## Configuración Firebase

### Usuarios Autorizados
Para agregar usuarios administradores:

1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Seleccionar proyecto `lanube360-29882`
3. Authentication > Users
4. Add user con email y contraseña

### Estructura de Datos
```
proyectos/
  mirador-volcanes/
    lotes/
      lote1: {
        nombre: string,
        estado: 'disponible'|'reservado'|'vendido'|'no disponible',
        superficie: number,
        superficieUtil: number,
        precio: number,
        observaciones: string,
        krpano: {
          scene_master: {
            ath: number,
            atv: number
          }
        },
        fechaModificacion: string (ISO)
      }
```

## Uso del Sistema

### Flujo de Trabajo
1. **Acceder**: Navegar a `/admin`
2. **Login**: Ingresar credenciales
3. **Dashboard**: Ver resumen de lotes
4. **Buscar**: Usar filtro para encontrar lotes específicos
5. **Editar**: Click en "Editar" o ícono de lápiz
6. **Modificar**: Cambiar valores necesarios
7. **Guardar**: Click en "Guardar" para aplicar cambios
8. **Verificar**: Los cambios se reflejan automáticamente en el tour

### Tips de Uso
- **Búsqueda rápida**: Usar Ctrl+F en el navegador
- **Edición múltiple**: Editar un lote a la vez
- **Validación**: Los números se validan automáticamente  
- **Respaldo**: Los cambios se guardan en Firestore inmediatamente
- **Sincronización**: El tour virtual se actualiza automáticamente

## Integración con Tour Virtual

Los cambios realizados en la administración se reflejan automáticamente en:
- **Colores de hotspots**: Según el estado del lote
- **Información de cards**: Datos actualizados en tiempo real
- **Disponibilidad**: Filtros por estado

## Soporte Técnico

### Estructura del Código
```
src/
  config/
    projectConfig.js        # Configuración central
  hooks/
    useAuth.jsx            # Hook de autenticación
  components/
    AdminApp.jsx           # App principal de admin
    AdminDashboard.jsx     # Dashboard con tabs
    LoginPage.jsx          # Página de login
    LotesAdmin.jsx         # Gestión de lotes
```

### Rutas Configuradas
- `/` - Tour virtual principal
- `/admin` - Sistema de administración
- `/*` - Fallback al tour virtual

## Seguridad

- ✅ Autenticación Firebase
- ✅ Sesiones seguras
- ✅ Validación de permisos
- ✅ Logout automático por inactividad
- ✅ Comunicación encriptada (HTTPS)
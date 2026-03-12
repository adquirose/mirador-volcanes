# Implementación de Google Tag Manager (GTM) y Sistema de Contactos

## Resumen
Se ha implementado Google Tag Manager con ID `AW-17952235814` en toda la aplicación y se ha creado un **sistema completo de gestión de contactos** que incluye:

1. **Formulario de contacto** - Envío real a Firestore + Tracking GTM
2. **Panel de administración** - Gestión de contactos recibidos  
3. **Clicks en WhatsApp** - Tracking desde navegación y tour Krpano
4. **Conversiones** - Seguimiento de leads generados

## 🚀 **NUEVA FUNCIONALIDAD**: Sistema de Contactos

### ✅ **Formulario de Contacto Funcional**
**Antes:** Los datos se perdían (solo console.log)  
**Ahora:** Los datos se guardan en **Firestore** con tracking completo

**Datos guardados:**
- Información del contacto (nombre, email, teléfono, asunto)
- Timestamp automático
- Estado de procesamiento
- Información técnica (userAgent, fuente)
- ID único para seguimiento

### ✅ **Panel de Administración Mejorado** 
- **Pestañas navegables**: "Gestión de Lotes" y "Gestión de Contactos"
- **Vista en tiempo real** de contactos recibidos
- **Acciones directas**: WhatsApp, Email, marcar como procesado
- **Filtros**: Pendientes vs Procesados
- **Detalles completos** en modal

## Archivos modificados/creados:

### 🆕 **Nuevos archivos:**
- [src/services/contactService.js](src/services/contactService.js) - Servicio Firestore para contactos
- [src/components/ContactosAdmin.jsx](src/components/ContactosAdmin.jsx) - Panel admin de contactos
- [src/utils/gtm.js](src/utils/gtm.js) - Utilidades de tracking GTM  
- [public/krpano/krpano-gtm.js](public/krpano/krpano-gtm.js) - Scripts GTM para tour 360°

### 📝 **Archivos modificados:**
- [index.html](index.html) - Código GTM base
- [src/components/Navigation.jsx](src/components/Navigation.jsx) - Formulario funcional + eventos GTM
- [src/components/AdminDashboard.jsx](src/components/AdminDashboard.jsx) - Sistema de pestañas + contactos
- [public/krpano/tour.html](public/krpano/tour.html) - Scripts GTM para tour
- [public/krpano/index.html](public/krpano/index.html) - GTM en tour principal  
- [public/krpano/skin/ficha.xml](public/krpano/skin/ficha.xml) - Tracking botones WhatsApp por lote

## 📊 **Flujo del Formulario de Contacto:**

1. **Usuario llena formulario** → Validación en tiempo real
2. **Envío exitoso** → Datos guardados en Firestore  
3. **Tracking automático** → Eventos enviados a GTM
4. **Notificación** → Administrador ve contacto en tiempo real
5. **Gestión** → Admin puede contactar directamente desde panel

## 🎯 **Eventos GTM configurados:**

### Formulario de Contacto
```javascript
gtag('event', 'form_submit', {
  event_category: 'Lead Generation',
  form_name: 'Contact Form',
  email: datos.email,
  transaction_id: firestore_id // NUEVO: ID único del registro
});

gtag('event', 'conversion', {
  event_category: 'Conversions', 
  conversion_type: 'contact_form_lead',
  transaction_id: firestore_id
});
```

### WhatsApp  
```javascript
gtag('event', 'whatsapp_click', {
  event_category: 'Communication',
  contact_method: 'WhatsApp',
  source: 'navigation' | 'krpano_tour' | 'admin_panel',
  phone_number: '56982521849'
});
```

## 💾 **Base de Datos (Firestore)**

### Colección `contactos`:
```json
{
  "nombre": "string",
  "email": "string", 
  "telefono": "string",
  "asunto": "string",
  "fechaEnvio": "timestamp",
  "procesado": "boolean",
  "fechaProcesado": "timestamp (opcional)",
  "fuente": "formulario_web",
  "userAgent": "string",
  "ip": null
}
```

## 🔧 **Funcionalidades del Panel Admin:**

### Panel de Contactos:
- ✅ Lista en tiempo real (sin recargar página)
- ✅ Filtrado por estado (pendiente/procesado)
- ✅ Acciones directas: WhatsApp, Email, marcado
- ✅ Vista detallada en modal 
- ✅ Responsive (móvil y escritorio)
- ✅ Contador de pendientes

### Flujo de Gestión:
1. **Contacto llega** → Aparece automáticamente como "Pendiente"
2. **Admin revisa** → Ve todos los detalles del contacto  
3. **Contacta** → Click directo a WhatsApp o Email
4. **Procesa** → Marca como "Procesado" para control

## 🔍 **Verificación:**
- ✅ Aplicación inicia sin errores
- ✅ Formulario guarda en Firestore correctamente
- ✅ Eventos GTM se registran (visible en console)
- ✅ Panel admin muestra contactos en tiempo real
- ✅ Compatible con sistema existente

## 📱 **Acceso al Panel Admin:**
1. Ir a `/admin` 
2. Login con credenciales
3. Pestaña "Gestión de Contactos"
4. Ver/gestionar todos los contactos recibidos

¡El sistema ahora captura y gestiona todos los leads de manera profesional!
// Utilidades para Google Tag Manager

/**
 * Función para enviar eventos a Google Tag Manager
 * @param {string} eventName - Nombre del evento
 * @param {Object} eventData - Datos adicionales del evento
 */
export const trackEvent = (eventName, eventData = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'Engagement',
      event_label: 'Loteo Los Volcanes',
      ...eventData
    });
    
    console.log('GTM Event tracked:', eventName, eventData);
  } else {
    console.warn('GTM no está disponible para trackear el evento:', eventName);
  }
};

/**
 * Trackear envío de formulario de contacto
 * @param {Object} formData - Datos del formulario
 */
export const trackContactFormSubmit = (formData) => {
  trackEvent('form_submit', {
    event_category: 'Lead Generation',
    form_name: 'Contact Form',
    form_location: 'Navigation Modal',
    email: formData.email,
    phone: formData.telefono,
    subject: formData.asunto,
    name: formData.nombre
  });
};

/**
 * Trackear click en WhatsApp
 * @param {string} source - Origen del click (navigation, krpano, etc.)
 */
export const trackWhatsAppClick = (source = 'navigation') => {
  trackEvent('whatsapp_click', {
    event_category: 'Communication',
    contact_method: 'WhatsApp',
    source: source,
    phone_number: '56982521849'
  });
};

/**
 * Trackear conversión (lead)
 * @param {string} conversionType - Tipo de conversión
 * @param {Object} conversionData - Datos de la conversión
 */
export const trackConversion = (conversionType, conversionData = {}) => {
  trackEvent('conversion', {
    event_category: 'Conversions',
    conversion_type: conversionType,
    currency: 'CLP',
    ...conversionData
  });
};
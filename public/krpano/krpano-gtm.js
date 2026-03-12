// Script para eventos GTM desde Krpano
// Este archivo se exporta como función global para ser utilizado desde XML de Krpano

// Función global para trackear WhatsApp desde Krpano
window.trackKrpanoWhatsApp = function(loteInfo = '') {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'whatsapp_click', {
      event_category: 'Communication',
      event_label: 'Loteo Los Volcanes',
      contact_method: 'WhatsApp',
      source: 'krpano_tour',
      phone_number: '56982521849',
      lote_info: loteInfo || 'No especificado'
    });
    
    console.log('GTM Event tracked from Krpano:', 'whatsapp_click', {
      source: 'krpano_tour',
      lote_info: loteInfo
    });
  } else {
    console.warn('GTM no está disponible para trackear evento desde Krpano');
  }
};

// Función global para trackear interacciones del tour
window.trackKrpanoInteraction = function(action, details = '') {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'tour_interaction', {
      event_category: 'Engagement',
      event_label: 'Krpano Tour',
      action: action,
      details: details
    });
    
    console.log('GTM Event tracked from Krpano:', 'tour_interaction', {
      action: action,
      details: details
    });
  }
};

console.log('Krpano GTM tracking scripts loaded');
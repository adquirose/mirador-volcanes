import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Envía los datos del formulario de contacto a Firestore
 * @param {Object} formData - Datos del formulario
 * @returns {Promise} - Promise con el resultado
 */
export const submitContactForm = async (formData) => {
  try {
    const contactData = {
      nombre: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
      asunto: formData.asunto,
      fechaEnvio: serverTimestamp(),
      procesado: false,
      fuente: 'formulario_web',
      userAgent: navigator.userAgent,
      ip: null // Se puede agregar después
    };

    // Guardar en colección 'contactos'
    const docRef = await addDoc(collection(db, 'contactos'), contactData);
    
    console.log('Formulario guardado en Firestore con ID:', docRef.id);
    return { success: true, id: docRef.id };
    
  } catch (error) {
    console.error('Error al guardar formulario:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envía email de notificación (opcional - requiere backend)
 * @param {Object} formData - Datos del formulario
 */
export const sendNotificationEmail = async (formData) => {
  // Implementación futura con Cloud Functions o servicio de email
  console.log('Notificación de email pendiente para:', formData);
};
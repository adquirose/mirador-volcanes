// Configuración de Firebase solo para Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD8nCm_5axBN1KJR58HRzhIUlIzuI5zpzs",
  authDomain: "lanube360-29882.firebaseapp.com",
  projectId: "lanube360-29882",
  storageBucket: "lanube360-29882.firebasestorage.app",
  messagingSenderId: "910468433599",
  appId: "1:910468433599:web:4dee048a0a5cdb8f1d1701"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Solo exportar Firestore
export const db = getFirestore(app);

export default app;
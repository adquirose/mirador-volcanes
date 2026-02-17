// Configuración de Firebase para Mirador Volcanes
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

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

// Inicializar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);

// Conectar a emuladores en desarrollo (opcional)
// if (location.hostname === 'localhost') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectAuthEmulator(auth, 'http://localhost:9099');
// }

export default app;
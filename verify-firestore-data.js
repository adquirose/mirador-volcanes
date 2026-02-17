import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function verificarDatosFirestore() {
  try {
    console.log('🔍 VERIFICACIÓN DE DATOS EN FIRESTORE');
    console.log('=====================================\n');
    
    console.log(`📍 Proyecto Firebase: ${process.env.VITE_FIREBASE_PROJECT_ID}`);
    console.log(`🌐 Dominio: ${process.env.VITE_FIREBASE_AUTH_DOMAIN}\n`);
    
    // Verificar documento del proyecto
    console.log('1️⃣  Verificando documento del proyecto...');
    const proyectoRef = doc(db, 'proyectos', 'mirador-volcanes');
    const proyectoSnap = await getDoc(proyectoRef);
    
    if (proyectoSnap.exists()) {
      const proyectoData = proyectoSnap.data();
      console.log('✅ Proyecto encontrado:');
      console.log(`   - Nombre: ${proyectoData.nombre}`);
      console.log(`   - Total lotes: ${proyectoData.totalLotes}`);
      console.log(`   - Estructura: ${proyectoData.estructura}`);
      console.log(`   - Version: ${proyectoData.version}`);
      console.log(`   - Fecha: ${proyectoData.fechaCreacion?.toDate()}\n`);
    } else {
      console.log('❌ No se encontró el documento del proyecto\n');
      return;
    }
    
    // Verificar colección de lotes
    console.log('2️⃣  Verificando colección de lotes...');
    const lotesRef = collection(db, 'proyectos', 'mirador-volcanes', 'lotes');
    const lotesSnapshot = await getDocs(lotesRef);
    
    if (lotesSnapshot.empty) {
      console.log('❌ No se encontraron lotes en la colección');
      return;
    }
    
    console.log(`✅ Se encontraron ${lotesSnapshot.size} lotes:\n`);
    
    // Mostrar cada lote
    lotesSnapshot.forEach((doc) => {
      const loteData = doc.data();
      console.log(`📝 ID: ${doc.id}`);
      console.log(`   - Nombre: ${loteData.nombre}`);
      console.log(`   - Estado: ${loteData.estado}`);  
      console.log(`   - Superficie: ${loteData.superficie} m²`);
      console.log(`   - SuperficieUtil: ${loteData.superficieUtil} m²`);
      
      if (loteData.krpano) {
        console.log(`   - Escenas Krpano: ${Object.keys(loteData.krpano).length}`);
        Object.entries(loteData.krpano).forEach(([escena, coords]) => {
          console.log(`     * ${escena}: ath=${coords.ath}, atv=${coords.atv}`);
        });
      }
      console.log('');
    });
    
    console.log('🎯 INSTRUCCIONES PARA VER EN CONSOLA FIREBASE:');
    console.log('============================================');
    console.log('1. Ve a: https://console.firebase.google.com/');
    console.log(`2. Selecciona proyecto: ${process.env.VITE_FIREBASE_PROJECT_ID}`);
    console.log('3. En el menú lateral: Firestore Database');
    console.log('4. Navega a: proyectos > mirador-volcanes');
    console.log('5. Subcollección: lotes');
    console.log('6. Deberías ver documentos: lote1, lote2, lote3... lote10\n');
    
    console.log('✅ ¡Verificación completada! Los datos están en Firestore.');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('\n🔒 Posible problema de permisos de Firestore.');
      console.log('Verifica las reglas de seguridad en la consola de Firebase.');
    }
    
    if (error.code === 'unavailable') {
      console.log('\n🌐 Problema de conectividad con Firestore.');
      console.log('Verifica tu conexión a internet y la configuración de Firebase.');
    }
  }
}

// Ejecutar verificación
verificarDatosFirestore();
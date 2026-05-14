/**
 * Script de migración: contactos raíz → proyectos/mirador-volcanes/contactos
 *
 * - Lee todos los documentos de la colección raíz `contactos`
 * - Los copia a `proyectos/mirador-volcanes/contactos` conservando el mismo ID
 * - NO elimina los documentos originales (operación segura y reversible)
 * - Omite documentos que ya existan en el destino para evitar duplicados
 *
 * Uso: node migrate-contactos.js
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const ORIGEN = 'contactos';
const DESTINO = 'proyectos/mirador-volcanes/contactos';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrarContactos() {
  console.log('🚀 MIGRACIÓN DE CONTACTOS');
  console.log('==========================');
  console.log(`📤 Origen : ${ORIGEN}`);
  console.log(`📥 Destino: ${DESTINO}\n`);

  // Leer todos los documentos del origen
  const origenRef = collection(db, ORIGEN);
  const snapshot = await getDocs(origenRef);

  if (snapshot.empty) {
    console.log('ℹ️  No se encontraron documentos en la colección origen. Nada que migrar.');
    process.exit(0);
  }

  console.log(`📋 Documentos encontrados en origen: ${snapshot.size}\n`);

  let copiados = 0;
  let omitidos = 0;
  let errores = 0;

  for (const docSnap of snapshot.docs) {
    const id = docSnap.id;
    const data = docSnap.data();

    try {
      // Verificar si el documento ya existe en destino
      const destinoRef = doc(db, DESTINO, id);
      const destinoSnap = await getDoc(destinoRef);

      if (destinoSnap.exists()) {
        console.log(`⏭️  [OMITIDO]  ${id} — ya existe en destino`);
        omitidos++;
        continue;
      }

      // Copiar documento conservando ID y todos los campos originales
      await setDoc(destinoRef, {
        ...data,
        _migradoDesde: ORIGEN,
        _migradoEn: new Date().toISOString(),
      });

      const nombre = data.nombre || '(sin nombre)';
      const email = data.email || '(sin email)';
      console.log(`✅ [COPIADO]  ${id} — ${nombre} <${email}>`);
      copiados++;
    } catch (err) {
      console.error(`❌ [ERROR]    ${id} — ${err.message}`);
      errores++;
    }
  }

  console.log('\n==========================');
  console.log('📊 RESUMEN');
  console.log(`   ✅ Copiados : ${copiados}`);
  console.log(`   ⏭️  Omitidos : ${omitidos} (ya existían en destino)`);
  console.log(`   ❌ Errores  : ${errores}`);
  console.log('\n⚠️  Los documentos originales en la raíz NO fueron eliminados.');
  console.log('   Puedes revisarlos en Firebase Console antes de borrarlos manualmente.');
  console.log(`   https://console.firebase.google.com/project/lanube360-29882/firestore`);

  process.exit(errores > 0 ? 1 : 0);
}

migrarContactos().catch((err) => {
  console.error('💥 Error fatal:', err);
  process.exit(1);
});

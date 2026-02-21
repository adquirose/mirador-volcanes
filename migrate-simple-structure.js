import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Función para parsear spots con múltiples coordenadas
function parseSpots(xmlContent) {
  const spots = [];
  const spotRegex = /<spot\s+[^>]*>/g;
  
  let match;
  while ((match = spotRegex.exec(xmlContent)) !== null) {
    const spotTag = match[0];
    
    const nameMatch = spotTag.match(/name="([^"]*)"/);
    const estadoMatch = spotTag.match(/estado="([^"]*)"/);
    const htmlMatch = spotTag.match(/html="([^"]*)"/);
    
    if (nameMatch && estadoMatch && htmlMatch) {
      const spotData = {
        name: nameMatch[1],
        estado: estadoMatch[1],
        html: htmlMatch[1],
        coordenadas: {}
      };
      
      // Extraer todas las coordenadas
      const coordRegex = /(ath\d*|atv\d*)="([^"]*)"/g;
      let coordMatch;
      
      while ((coordMatch = coordRegex.exec(spotTag)) !== null) {
        const key = coordMatch[1];
        const value = coordMatch[2];
        if (value && value.trim() !== '') {
          spotData.coordenadas[key] = parseFloat(value);
        }
      }
      
      spots.push(spotData);
    }
  }
  
  return spots;
}

function parseData(xmlContent) {
  const data = {};
  const fichaRegex = /<data name="(ficha\d+)">([\s\S]*?)<\/data>/g;
  
  let match;
  while ((match = fichaRegex.exec(xmlContent)) !== null) {
    const fichaName = match[1];
    const content = match[2];
    
    const loteMatch = content.match(/<h2>Lote (\d+)\s*<\/h2>/);
    const loteNumber = loteMatch ? parseInt(loteMatch[1]) : null;
    
    const superficieMatch = content.match(/Superficie:\s*([\d,\.]+)\s*m2/);
    const superficie = superficieMatch ? parseFloat(superficieMatch[1].replace(',', '.')) : 0;
    
    const superficieUtilMatch = content.match(/Superficie Útil:\s*([\d,\.]+)\s*m2/);
    const superficieUtil = superficieUtilMatch ? parseFloat(superficieUtilMatch[1].replace(',', '.')) : 0;
    
    if (loteNumber) {
      data[fichaName] = {
        numero: loteNumber,
        superficie,
        superficieUtil
      };
    }
  }
  
  return data;
}

function parseTourScenes(xmlContent) {
  const scenes = [];
  const sceneRegex = /<scene\s+name="([^"]*)"\s+title="([^"]*)"\s+onstart="([^"]*)"[^>]*>/g;
  
  let match;
  while ((match = sceneRegex.exec(xmlContent)) !== null) {
    const name = match[1];
    const title = match[2];
    const onstart = match[3];
    
    const generarSpotsRegex = /generar_spots\((\d+),(\d+)(?:,(\d+))?\)/g;
    let generarMatch;
    
    while ((generarMatch = generarSpotsRegex.exec(onstart)) !== null) {
      const inicio = parseInt(generarMatch[1]);
      const fin = parseInt(generarMatch[2]);
      const numero = generarMatch[3] ? parseInt(generarMatch[3]) : null;
      
      scenes.push({
        name,
        title,
        generarSpots: {
          inicio,
          fin,
          numero
        }
      });
    }
  }
  
  return scenes;
}

function mapSpotsToScenes(spots, scenes, data) {
  const lotes = {};
  
  // Crear lotes base con estructura simplificada
  spots.forEach(spot => {
    const fichaNumber = parseInt(spot.html);
    const fichaName = `ficha${fichaNumber}`;
    const fichaData = data[fichaName];
    
    if (fichaData) {
      const loteId = `lote${fichaNumber}`;
      
      if (!lotes[loteId]) {
        lotes[loteId] = {
          nombre: `Lote ${fichaNumber}`,
          numero: fichaNumber,
          html: spot.html,
          estado: spot.estado,
          superficie: fichaData.superficie,
          superficieUtil: fichaData.superficieUtil,
          krpano: {}  // Objeto en lugar de array
        };
      }
    }
  });
  
  // Procesar asignaciones escena-lote
  scenes.forEach(scene => {
    const { inicio, fin, numero } = scene.generarSpots;
    
    const coordSuffix = numero === null ? '' : numero.toString();
    const athKey = `ath${coordSuffix}`;
    const atvKey = `atv${coordSuffix}`;
    
    console.log(`🎬 Procesando escena: ${scene.title}`);
    console.log(`   - Rango de lotes: ${inicio}-${fin}`);
    console.log(`   - Coordenadas: ${athKey}, ${atvKey}`);
    
    for (let fichaNumber = inicio; fichaNumber <= fin; fichaNumber++) {
      const loteId = `lote${fichaNumber}`;
      
      if (lotes[loteId]) {
        const spot = spots.find(s => parseInt(s.html) === fichaNumber);
        
        if (spot && spot.coordenadas[athKey] !== undefined && spot.coordenadas[atvKey] !== undefined) {
          // Agregar como propiedad directa del objeto krpano
          lotes[loteId].krpano[scene.name] = {
            ath: spot.coordenadas[athKey],
            atv: spot.coordenadas[atvKey],
            titulo: scene.title
          };
          
          console.log(`   ✓ ${lotes[loteId].nombre}: ${scene.name} → ath=${spot.coordenadas[athKey]}, atv=${spot.coordenadas[atvKey]}`);
        } else {
          console.log(`   ⚠️  ${lotes[loteId]?.nombre}: coordenadas ${athKey}/${atvKey} no encontradas`);
        }
      }
    }
    console.log('');
  });
  
  return lotes;
}

async function migrateToFirestoreSimple() {
  try {
    console.log('🚀 Iniciando migración con estructura simplificada...');
    
    // Leer archivos XML
    const spotsPath = path.join(__dirname, 'public/krpano/skin/spots.xml');
    const dataPath = path.join(__dirname, 'public/krpano/skin/data.xml');
    const tourPath = path.join(__dirname, 'public/krpano/tour.xml');
    
    const spotsXml = fs.readFileSync(spotsPath, 'utf8');
    const dataXml = fs.readFileSync(dataPath, 'utf8');
    const tourXml = fs.readFileSync(tourPath, 'utf8');
    
    console.log('📁 Archivos XML leídos correctamente');
    
    // Parsear datos
    const spots = parseSpots(spotsXml);
    const data = parseData(dataXml);
    const scenes = parseTourScenes(tourXml);
    
    console.log(`📊 Datos parseados:`);
    console.log(`   - ${spots.length} spots encontrados`);
    console.log(`   - ${Object.keys(data).length} fichas de datos`);
    console.log(`   - ${scenes.length} llamadas a generar_spots`);
    console.log('');
    
    // Mapear spots a escenas y crear estructura de lotes
    const lotes = mapSpotsToScenes(spots, scenes, data);
    
    console.log(`🎯 ${Object.keys(lotes).length} lotes procesados para migración`);
    
    // Crear documento del proyecto en Firestore
    const proyectoRef = doc(db, 'proyectos', 'mirador-volcanes');
    
    await setDoc(proyectoRef, {
      nombre: 'Lote Los Volcanes',
      descripcion: 'Proyecto de lotes con vista panorámica',
      fechaCreacion: new Date(),
      totalLotes: Object.keys(lotes).length,
      estructura: 'simple',
      version: '3.0'
    }, { merge: true });
    
    console.log('✅ Documento del proyecto actualizado');
    
    // Crear/actualizar documentos de lotes en la subcolección
    const lotesRef = collection(proyectoRef, 'lotes');
    
    for (const [loteId, loteData] of Object.entries(lotes)) {
      await setDoc(doc(lotesRef, loteId), loteData, { merge: true });
      
      console.log(`\n📝 ${loteData.nombre}:`);
      console.log(`   - ID: ${loteId}`);
      console.log(`   - Estado: ${loteData.estado}`);
      console.log(`   - Superficie: ${loteData.superficie} m²`);
      console.log(`   - Superficie Útil: ${loteData.superficieUtil} m²`);
      console.log(`   - Escenas Krpano:`);
      
      Object.entries(loteData.krpano).forEach(([escena, coords]) => {
        console.log(`     * ${escena}: "${coords.titulo}" → ath=${coords.ath}, atv=${coords.atv}`);
      });
    }
    
    console.log('\n🎉 ¡Migración con estructura simple completada!');
    console.log(`📈 Resumen: ${Object.keys(lotes).length} lotes migrados con estructura simplificada`);
    
    // Mostrar ejemplo de estructura
    const ejemploLote = Object.values(lotes)[0];
    console.log('\n📋 Ejemplo de estructura generada:');
    console.log(JSON.stringify({
      [Object.keys(lotes)[0]]: ejemploLote
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
migrateToFirestoreSimple();
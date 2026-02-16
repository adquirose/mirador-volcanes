import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxMap = ({ 
  latitude = -39.651740, 
  longitude = -72.268545, 
  zoom = 11,
  style = { width: '100%', height: '100%' }
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    // Obtener el token desde las variables de entorno
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    console.log('Mapbox Token:', mapboxgl.accessToken ? 'Token cargado correctamente' : 'Token no encontrado');

    if (!mapboxgl.accessToken) {
      console.error('Token de Mapbox no encontrado. Asegúrate de definir VITE_MAPBOX_ACCESS_TOKEN en tu archivo .env');
      setError('Token de Mapbox no encontrado');
      return;
    }

    if (map.current) return; // Inicializar mapa solo una vez

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12', // Formato híbrido
        center: [longitude, latitude],
        zoom: zoom
      });

      // Agregar controles de navegación
      map.current.addControl(new mapboxgl.NavigationControl());
      
      // Centrar el mapa en el marcador
      map.current.setCenter([longitude, latitude]);

      console.log('Mapa creado exitosamente');
    } catch (error) {
      console.error('Error creando el mapa:', error);
      setError('Error al cargar el mapa');
      return;
    }

    // Agregar marker con animación
    const el = document.createElement('div');
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#FF0000';
    el.style.border = '3px solid #FFFFFF';
    el.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';

    // CSS de animación más simple
    if (!document.getElementById('pulse-animation')) {
      const style = document.createElement('style');
      style.id = 'pulse-animation';
      style.textContent = `
        .pulse-marker {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(255, 0, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
        }
      `;
      document.head.appendChild(style);
    }
    
    el.className = 'pulse-marker';

    new mapboxgl.Marker(el)
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    console.log('Marcador agregado en:', latitude, longitude);

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [latitude, longitude, zoom]);

  if (error) {
    return (
      <div style={{ 
        ...style, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '8px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p>⚠️ Error al cargar el mapa</p>
          <small>{error}</small>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} style={style} />;
};

export default MapboxMap;
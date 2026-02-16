import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxMap = ({ 
  latitude = -33.45694, 
  longitude = -70.64827, 
  zoom = 13,
  style = { width: '100%', height: '400px' }
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    // Obtener el token desde las variables de entorno
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    if (!mapboxgl.accessToken) {
      console.error('Token de Mapbox no encontrado. Asegúrate de definir VITE_MAPBOX_ACCESS_TOKEN en tu archivo .env');
      return;
    }

    if (map.current) return; // Inicializar mapa solo una vez

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [longitude, latitude],
      zoom: zoom
    });

    // Agregar marker con animación
    const el = document.createElement('div');
    el.className = 'pulse-marker';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#FF0000';
    el.style.border = '3px solid #FFFFFF';
    el.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
    el.style.animation = 'pulse 2s infinite';

    // Agregar CSS de animación
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
        }
        70% {
          box-shadow: 0 0 0 15px rgba(255, 0, 0, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
        }
      }
    `;
    document.head.appendChild(style);

    new mapboxgl.Marker(el)
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [latitude, longitude, zoom]);

  return <div ref={mapContainer} style={style} />;
};

export default MapboxMap;
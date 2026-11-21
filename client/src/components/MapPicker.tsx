import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number, address?: string) => void;
  className?: string;
}

export const MapPicker: React.FC<MapPickerProps> = ({
  lat,
  lng,
  onChange,
  className = 'h-64 sm:h-72 w-full rounded-xl overflow-hidden border border-slate-300'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const { t } = useLanguage();

  // Create SVG pin icon for picker
  const createPinIcon = () => {
    return L.divIcon({
      className: 'custom-picker-pin',
      html: `
        <div style="transform: translate(-50%, -100%);">
          <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 0C7.611 0 0 7.611 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.611 26.389 0 17 0Z" fill="#0D9488" stroke="#FFFFFF" stroke-width="2"/>
            <circle cx="17" cy="16" r="6" fill="#FFFFFF"/>
          </svg>
        </div>
      `,
      iconSize: [34, 42],
      iconAnchor: [17, 42],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lng], {
        icon: createPinIcon(),
        draggable: true,
      }).addTo(map);

      // Handle marker drag
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        onChange(position.lat, position.lng);
      });

      // Handle map click
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        marker.setLatLng([clickLat, clickLng]);
        onChange(clickLat, clickLng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync external coordinate changes
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - lat) > 0.0001 || Math.abs(currentPos.lng - lng) > 0.0001) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.panTo([lat, lng]);
      }
    }
  }, [lat, lng]);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          onChange(userLat, userLng);
          if (mapInstanceRef.current && markerRef.current) {
            markerRef.current.setLatLng([userLat, userLng]);
            mapInstanceRef.current.flyTo([userLat, userLng], 15);
          }
        },
        err => {
          console.warn('Geolocation failed:', err.message);
          // Fallback to Chennai center
          onChange(13.0827, 80.2707);
        }
      );
    }
  };

  return (
    <div className="relative">
      <div ref={mapContainerRef} className={className} />

      <div className="absolute top-2.5 right-2.5 z-[1000] flex gap-2">
        <button
          type="button"
          onClick={handleLocateMe}
          className="bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md border border-slate-200 flex items-center gap-1.5 transition-all"
        >
          <Navigation className="w-3.5 h-3.5 text-civic-teal" />
          <span>{t('btnLocateMe')}</span>
        </button>
      </div>

      <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500">
        <MapPin className="w-3 h-3 text-civic-teal shrink-0" />
        <span>{t('mapPickerHint')} ({lat.toFixed(4)}, {lng.toFixed(4)})</span>
      </div>
    </div>
  );
};

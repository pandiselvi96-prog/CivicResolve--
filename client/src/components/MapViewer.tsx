import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Complaint, ComplaintPriority } from '../types';

interface MapViewerProps {
  complaints: Complaint[];
  selectedComplaintId?: string;
  onSelectComplaint?: (complaint: Complaint) => void;
  className?: string;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
  className = 'h-96 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);

  const getPriorityColor = (priority: ComplaintPriority): string => {
    switch (priority) {
      case 'Critical':
        return '#EF4444'; // Red
      case 'High':
        return '#F97316'; // Orange
      case 'Medium':
        return '#EAB308'; // Amber
      case 'Low':
        return '#10B981'; // Green
      default:
        return '#0D9488';
    }
  };

  const createMarkerIcon = (priority: ComplaintPriority, isSelected: boolean) => {
    const color = getPriorityColor(priority);
    const size = isSelected ? 38 : 30;
    const anchorY = isSelected ? 38 : 30;
    const anchorX = size / 2;

    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="transform: translate(-50%, -100%);">
          <svg width="${size}" height="${anchorY}" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
            <path d="M17 0C7.611 0 0 7.611 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.611 26.389 0 17 0Z" fill="${color}" stroke="#FFFFFF" stroke-width="${isSelected ? 2.5 : 1.5}"/>
            <circle cx="17" cy="16" r="6" fill="#FFFFFF"/>
          </svg>
        </div>
      `,
      iconSize: [size, anchorY],
      iconAnchor: [anchorX, anchorY],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [13.04, 80.24],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.featureGroup().addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = markersGroup;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when complaints change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    if (complaints.length === 0) return;

    complaints.forEach(c => {
      const isSelected = c.id === selectedComplaintId;
      const marker = L.marker([c.location.lat, c.location.lng], {
        icon: createMarkerIcon(c.priority, isSelected),
      });

      // Custom Popup HTML
      const statusColors: Record<string, string> = {
        Submitted: 'background-color: #F1F5F9; color: #475569;',
        'Under Review': 'background-color: #FEF3C7; color: #B45309;',
        Assigned: 'background-color: #E0E7FF; color: #4338CA;',
        'In Progress': 'background-color: #CFFAFE; color: #0E7490;',
        Resolved: 'background-color: #DCFCE7; color: #15803D;'
      };

      const popupContent = `
        <div style="font-family: inherit; min-width: 200px; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: #0F172A; font-size: 13px;">${c.id}</strong>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; ${statusColors[c.status] || ''}">
              ${c.status}
            </span>
          </div>
          <div style="font-weight: 600; font-size: 12px; color: #1E293B; margin-bottom: 4px; line-height: 1.3;">
            ${c.title}
          </div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">
            ${c.location.address}
          </div>
          <div style="display: flex; gap: 4px; font-size: 10px; font-weight: 600;">
            <span style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 2px 6px; border-radius: 4px; color: #334155;">
              ${c.category}
            </span>
            <span style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 2px 6px; border-radius: 4px; color: #0D9488;">
              ${c.department}
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectComplaint) {
          onSelectComplaint(c);
        }
      });

      markersGroupRef.current?.addLayer(marker);
    });

    // Auto-fit bounds if markers exist
    try {
      const bounds = markersGroupRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    } catch (e) {
      // Ignore initial fit bound errors
    }
  }, [complaints, selectedComplaintId]);

  return (
    <div className="relative">
      <div ref={mapContainerRef} className={className} />

      {/* Priority Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl shadow-md border border-slate-200/90 text-[11px] font-semibold text-slate-700 flex items-center gap-3">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Priority:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Low</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, ExternalLink } from 'lucide-react';

interface PropertyMapViewerProps {
  coordinates: { lat: number; lng: number };
  title: string;
  location: string;
}

export const PropertyMapViewer: React.FC<PropertyMapViewerProps> = ({
  coordinates,
  title,
  location,
}) => {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Pinpointed Property Location</span>
        </h4>
        <button
          type="button"
          onClick={handleOpenGoogleMaps}
          className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden border border-emerald-200 dark:border-slate-700 shadow-sm bg-slate-100 dark:bg-slate-800">
        {apiKey ? (
          <APIProvider apiKey={apiKey} libraries={['marker']}>
            <Map
              mapId="DEMO_MAP_ID"
              style={{ width: '100%', height: '100%' }}
              defaultCenter={coordinates}
              defaultZoom={14}
              gestureHandling="greedy"
              disableDefaultUI={false}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            >
              <AdvancedMarker position={coordinates} title={title}>
                <Pin
                  background="#059669"
                  borderColor="#047857"
                  glyphColor="#ffffff"
                  scale={1.2}
                />
              </AdvancedMarker>
            </Map>
          </APIProvider>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-slate-500 text-xs">
            <MapPin className="w-6 h-6 text-emerald-600 mb-1" />
            <span>{location}</span>
          </div>
        )}

        <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-emerald-100 dark:border-slate-800 rounded-xl px-3 py-1 text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="font-mono truncate">{coordinates.lat.toFixed(5)}° N, {coordinates.lng.toFixed(5)}° E</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold ml-2 shrink-0">Verified Pin</span>
          </div>
        </div>
      </div>
    </div>
  );
};

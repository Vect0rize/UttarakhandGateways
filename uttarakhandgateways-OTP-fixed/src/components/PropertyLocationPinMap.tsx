import React, { useState, useEffect, useCallback } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  useMap 
} from '@vis.gl/react-google-maps';
import { MapPin, Navigation, RotateCcw, CheckCircle, Info } from 'lucide-react';
import { UttarakhandCity } from '../types';

export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Dehradun': { lat: 30.3165, lng: 78.0322 },
  'Rishikesh': { lat: 30.0869, lng: 78.2676 },
  'Haridwar': { lat: 29.9457, lng: 78.1642 },
  'Mussoorie': { lat: 30.4598, lng: 78.0644 },
  'Nainital': { lat: 29.3919, lng: 79.4542 },
  'Mukteshwar': { lat: 29.4722, lng: 79.6477 },
  'Almora': { lat: 29.5971, lng: 79.6591 },
  'Ranikhet': { lat: 29.6434, lng: 79.4322 },
  'Bhowali': { lat: 29.3831, lng: 79.5204 },
  'Devprayag': { lat: 30.1459, lng: 78.5986 },
  'Uttarkashi': { lat: 30.7268, lng: 78.4354 },
  'Chakrata': { lat: 30.7016, lng: 77.8696 },
  'Dhanaulti': { lat: 30.4514, lng: 78.2393 },
  'Kanatal': { lat: 30.4137, lng: 78.3444 },
  'Tehri Garhwal': { lat: 30.3800, lng: 78.4800 },
  'Rudraprayag': { lat: 30.2844, lng: 78.9811 },
  'Kotdwar': { lat: 29.7464, lng: 78.5284 },
  'Bhimtal': { lat: 29.3500, lng: 79.5500 },
};

interface PropertyLocationPinMapProps {
  city: UttarakhandCity;
  coordinates?: { lat: number; lng: number };
  onChangeCoordinates: (coords: { lat: number; lng: number } | undefined) => void;
}

// Controller component to programmatically pan/zoom map
const MapController: React.FC<{
  center: { lat: number; lng: number };
  zoom?: number;
}> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
      if (zoom) map.setZoom(zoom);
    }
  }, [map, center, zoom]);
  return null;
};

export const PropertyLocationPinMap: React.FC<PropertyLocationPinMapProps> = ({
  city,
  coordinates,
  onChangeCoordinates,
}) => {
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const cityDefault = CITY_COORDINATES[city] || { lat: 30.3165, lng: 78.0322 };
  
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(
    coordinates || cityDefault
  );
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // When city changes and no pin is placed yet, pan to selected city
  useEffect(() => {
    if (!coordinates) {
      const newCityCoords = CITY_COORDINATES[city] || { lat: 30.3165, lng: 78.0322 };
      setMapCenter(newCityCoords);
    }
  }, [city, coordinates]);

  const handleMapClick = useCallback((event: any) => {
    if (event.detail && event.detail.latLng) {
      const lat = event.detail.latLng.lat;
      const lng = event.detail.latLng.lng;
      const newCoords = { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
      onChangeCoordinates(newCoords);
      setMapCenter(newCoords);
      setLocationError(null);
    }
  }, [onChangeCoordinates]);

  const handleDragEnd = useCallback((event: any) => {
    if (event.latLng) {
      const lat = typeof event.latLng.lat === 'function' ? event.latLng.lat() : event.latLng.lat;
      const lng = typeof event.latLng.lng === 'function' ? event.latLng.lng() : event.latLng.lng;
      const newCoords = { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
      onChangeCoordinates(newCoords);
      setMapCenter(newCoords);
    }
  }, [onChangeCoordinates]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        };
        onChangeCoordinates(coords);
        setMapCenter(coords);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        setLocationError(`Location request failed: ${error.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCenterCity = () => {
    const coords = CITY_COORDINATES[city] || { lat: 30.3165, lng: 78.0322 };
    setMapCenter(coords);
  };

  const handleClearPin = () => {
    onChangeCoordinates(undefined);
    setLocationError(null);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Pinpoint Exact Location on Google Maps</span>
          </label>
          <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Optional
          </span>
        </div>

        {/* Current status pill */}
        {coordinates ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-700">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              <span>{coordinates.lat.toFixed(4)}° N, {coordinates.lng.toFixed(4)}° E</span>
            </span>
            <button
              type="button"
              onClick={handleClearPin}
              className="text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
            >
              Clear Pin
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            No pin placed (click on map to set)
          </span>
        )}
      </div>

      {/* Map Action Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-medium transition-all shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <Navigation className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{isLocating ? 'Detecting GPS...' : 'Use My Current Location'}</span>
        </button>

        <button
          type="button"
          onClick={handleCenterCity}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-medium transition-all shadow-2xs cursor-pointer"
        >
          <RotateCcw className="w-3 h-3 text-slate-500" />
          <span>Center on {city}</span>
        </button>

        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 ml-auto">
          <Info className="w-3 h-3 text-emerald-600" />
          <span>Tap anywhere on the map or drag the pin</span>
        </span>
      </div>

      {locationError && (
        <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
          {locationError}
        </div>
      )}

      {/* Google Map Container with explicit height to prevent collapse (CF2) */}
      <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-emerald-200/90 dark:border-slate-700 shadow-inner bg-slate-100 dark:bg-slate-800">
        {apiKey ? (
          <APIProvider apiKey={apiKey} libraries={['marker']}>
            <Map
              mapId="DEMO_MAP_ID"
              style={{ width: '100%', height: '100%' }}
              defaultCenter={mapCenter}
              defaultZoom={12}
              gestureHandling="greedy"
              disableDefaultUI={false}
              onClick={handleMapClick}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            >
              <MapController center={mapCenter} />

              {coordinates && (
                <AdvancedMarker
                  position={coordinates}
                  draggable={true}
                  onDragEnd={handleDragEnd}
                  title="Your Property Location Pin"
                >
                  <Pin
                    background="#059669"
                    borderColor="#047857"
                    glyphColor="#ffffff"
                    scale={1.15}
                  />
                </AdvancedMarker>
              )}
            </Map>
          </APIProvider>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-slate-500 dark:text-slate-400 text-xs">
            <MapPin className="w-8 h-8 text-emerald-500 mb-2 opacity-50" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Google Maps Key Loading...
            </p>
            <p className="text-[11px] mt-1">
              Pinpointing is optional. You can submit your property listing anytime.
            </p>
          </div>
        )}

        {/* Floating guidance overlay */}
        <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-emerald-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-[11px] text-slate-700 dark:text-slate-300 shadow-sm flex items-center justify-between">
            <span className="truncate">
              {coordinates 
                ? `📍 Pin: ${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)} (Drag pin to fine-tune)` 
                : `💡 Optional: Tap anywhere to mark the exact site`}
            </span>
            {coordinates && (
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 ml-2 shrink-0">
                Location Saved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

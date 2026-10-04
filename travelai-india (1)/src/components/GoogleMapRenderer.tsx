// Source: Google Maps Platform Code Assist
// Google Maps JavaScript API Integration with @vis.gl/react-google-maps
// Supports Advanced Markers, InfoWindows, and Directions Polyline Rendering

import React, { useEffect, useRef, useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { Coordinates, Destination, Hotel, Attraction, FoodItem, DirectionsRoute, PlaceResult } from '../types';
import { Layers, Key, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';

interface GoogleMapRendererProps {
  apiKey: string;
  destinations: Destination[];
  mapData: {
    hotels: Hotel[];
    attractions: Attraction[];
    food: FoodItem[];
  };
  filterType: 'all' | 'attractions' | 'hotels' | 'food';
  selectedDestinationId: string;
  activeRoute: DirectionsRoute | null;
  searchedPlaces: PlaceResult[];
  geocodedLocation: { address: string; coordinates: Coordinates } | null;
  onSelectItem: (item: any, type: string) => void;
  onMapClick?: (coords: Coordinates) => void;
  onSwitchToVector?: () => void;
}

// Polyline Subcomponent to draw active route on Google Map
const RoutePolyline: React.FC<{ polylinePoints: Coordinates[] }> = ({ polylinePoints }) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || polylinePoints.length < 2) {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      return;
    }

    const path = polylinePoints.map((p) => ({ lat: p.lat, lng: p.lng }));

    if (!polylineRef.current) {
      polylineRef.current = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#F27D26',
        strokeOpacity: 0.9,
        strokeWeight: 5,
        map,
      });
    } else {
      polylineRef.current.setPath(path);
      polylineRef.current.setMap(map);
    }

    // Fit map bounds to encompass the route
    const bounds = new google.maps.LatLngBounds();
    path.forEach((pt) => bounds.extend(pt));
    map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [map, polylinePoints]);

  return null;
};

// Camera updater for destination selection
const MapCameraController: React.FC<{
  center: Coordinates;
  zoom: number;
  selectedDestinationId: string;
}> = ({ center, zoom, selectedDestinationId }) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      map.panTo({ lat: center.lat, lng: center.lng });
      map.setZoom(zoom);
    }
  }, [map, center.lat, center.lng, zoom, selectedDestinationId]);

  return null;
};

export const GoogleMapRenderer: React.FC<GoogleMapRendererProps> = ({
  apiKey,
  destinations,
  mapData,
  filterType,
  selectedDestinationId,
  activeRoute,
  searchedPlaces,
  geocodedLocation,
  onSelectItem,
  onMapClick,
  onSwitchToVector,
}) => {
  const [selectedMarker, setSelectedMarker] = useState<{
    position: Coordinates;
    title: string;
    type: string;
    data: any;
  } | null>(null);

  // Validate that apiKey is a genuine Google Maps API Key (typically starts with AIza...)
  const isGoogleKeyValid = Boolean(apiKey && apiKey.trim().length > 20 && apiKey.startsWith('AIza'));

  // If no valid Google Maps API Key is configured, show a helpful fallback rather than crashing @vis.gl/react-google-maps
  if (!isGoogleKeyValid) {
    return (
      <div className="w-full h-full min-h-[520px] relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#141414] to-[#0D0D0D] border border-[#2A2A2A] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#F27D26]/10 border border-[#F27D26]/30 flex items-center justify-center text-[#F27D26] shadow-lg">
          <Key className="w-8 h-8" />
        </div>

        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-serif-display font-bold text-[#F0F0F0]">
            Google Maps JavaScript API Engine
          </h3>
          <p className="text-xs text-[#8E9299] leading-relaxed">
            The Google Maps JavaScript API requires a Google Cloud API Key with Maps JavaScript API enabled (<code className="text-[#F27D26] bg-[#222] px-1.5 py-0.5 rounded">GOOGLE_MAPS_API_KEY</code>).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {onSwitchToVector && (
            <button
              onClick={onSwitchToVector}
              className="px-5 py-2.5 rounded-xl bg-[#F27D26] hover:bg-[#ff8f3d] text-black font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              Use Vector Canvas (OpenStreetMap)
            </button>
          )}

          <a
            href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_git_agentskills_v1"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#222] hover:bg-[#2A2A2A] text-[#F0F0F0] border border-[#333] text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Get Maps Demo Key
            <ExternalLink className="w-3 h-3 text-[#8E9299]" />
          </a>
        </div>

        <div className="p-3 bg-[#111] rounded-xl border border-[#222] text-[11px] text-[#777] max-w-lg text-left space-y-1">
          <span className="text-[#F27D26] font-semibold block">⚡ Pro Tip:</span>
          <span>
            The <strong>Vector Canvas</strong> engine is fully interactive, requires zero setup, and renders all 140+ Indian destinations, ASI monuments, Heritage stays, turn-by-turn routing, and live Geocoding pins immediately.
          </span>
        </div>
      </div>
    );
  }

  // Compute map center based on selected destination
  let mapCenter: Coordinates = { lat: 22.5937, lng: 78.9629 };
  let zoomLevel = 5;

  if (selectedDestinationId !== 'all') {
    const dest = destinations.find((d) => d.id === selectedDestinationId);
    if (dest) {
      mapCenter = dest.coordinates;
      zoomLevel = 12;
    }
  } else if (geocodedLocation) {
    mapCenter = geocodedLocation.coordinates;
    zoomLevel = 14;
  }

  // Collect items to plot
  const itemsToPlot: Array<{
    type: 'destination' | 'attraction' | 'hotel' | 'food';
    data: any;
    coords: Coordinates;
    title: string;
  }> = [];

  if (selectedDestinationId === 'all') {
    destinations.forEach((d) => {
      itemsToPlot.push({
        type: 'destination',
        data: d,
        coords: d.coordinates,
        title: d.name,
      });
    });
  }

  if (filterType === 'all' || filterType === 'attractions') {
    mapData.attractions
      .filter((a) => selectedDestinationId === 'all' || a.destinationId === selectedDestinationId)
      .forEach((a) => {
        if (a.coordinates) {
          itemsToPlot.push({
            type: 'attraction',
            data: a,
            coords: a.coordinates,
            title: a.name,
          });
        }
      });
  }

  if (filterType === 'all' || filterType === 'hotels') {
    mapData.hotels
      .filter((h) => selectedDestinationId === 'all' || h.destinationId === selectedDestinationId)
      .forEach((h) => {
        if (h.coordinates) {
          itemsToPlot.push({
            type: 'hotel',
            data: h,
            coords: h.coordinates,
            title: h.name,
          });
        }
      });
  }

  if (filterType === 'all' || filterType === 'food') {
    mapData.food
      .filter((f) => selectedDestinationId === 'all' || f.destinationId === selectedDestinationId)
      .forEach((f) => {
        if (f.coordinates) {
          itemsToPlot.push({
            type: 'food',
            data: f,
            coords: f.coordinates,
            title: f.name,
          });
        }
      });
  }

  return (
    <APIProvider apiKey={apiKey} libraries={['places', 'routes', 'geometry', 'core']}>
      <div className="w-full h-full min-h-[520px] relative rounded-2xl overflow-hidden">
        <Map
          defaultCenter={{ lat: mapCenter.lat, lng: mapCenter.lng }}
          defaultZoom={zoomLevel}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full min-h-[520px]"
          onClick={(e) => {
            if (e.detail.latLng && onMapClick) {
              onMapClick({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
            }
          }}
        >
          <MapCameraController
            center={mapCenter}
            zoom={zoomLevel}
            selectedDestinationId={selectedDestinationId}
          />

          {/* Route polyline */}
          {activeRoute && activeRoute.polylinePoints.length > 0 && (
            <RoutePolyline polylinePoints={activeRoute.polylinePoints} />
          )}

          {/* Destination & Verified Items Advanced Markers */}
          {itemsToPlot.map((item, idx) => {
            let bg = '#F27D26';
            let glyphColor = '#FFFFFF';
            let borderColor = '#000000';

            if (item.type === 'destination') {
              bg = '#E11D48';
            } else if (item.type === 'attraction') {
              bg = '#D97706';
            } else if (item.type === 'hotel') {
              bg = '#9333EA';
            } else if (item.type === 'food') {
              bg = '#10B981';
            }

            return (
              <AdvancedMarker
                key={`${item.type}-${item.data.id || idx}`}
                position={{ lat: item.coords.lat, lng: item.coords.lng }}
                title={item.title}
                onClick={() => {
                  setSelectedMarker({
                    position: item.coords,
                    title: item.title,
                    type: item.type,
                    data: item.data,
                  });
                  onSelectItem(item.data, item.type);
                }}
              >
                <Pin
                  background={bg}
                  glyphColor={glyphColor}
                  borderColor={borderColor}
                />
              </AdvancedMarker>
            );
          })}

          {/* Live Searched Places Markers (Places API) */}
          {searchedPlaces.map((place) => {
            if (!place.location) return null;
            return (
              <AdvancedMarker
                key={`place-${place.id}`}
                position={{ lat: place.location.lat, lng: place.location.lng }}
                title={place.displayName.text}
                onClick={() => {
                  setSelectedMarker({
                    position: place.location!,
                    title: place.displayName.text,
                    type: 'place',
                    data: place,
                  });
                  onSelectItem(place, 'place');
                }}
              >
                <Pin background="#3B82F6" glyphColor="#FFFFFF" borderColor="#1E3A8A" />
              </AdvancedMarker>
            );
          })}

          {/* Geocoded Location Marker */}
          {geocodedLocation && (
            <AdvancedMarker
              position={{ lat: geocodedLocation.coordinates.lat, lng: geocodedLocation.coordinates.lng }}
              title={geocodedLocation.address}
              onClick={() => {
                setSelectedMarker({
                  position: geocodedLocation.coordinates,
                  title: 'Geocoded Address',
                  type: 'geocode',
                  data: geocodedLocation,
                });
              }}
            >
              <Pin background="#EC4899" glyphColor="#FFFFFF" borderColor="#831843" />
            </AdvancedMarker>
          )}

          {/* InfoWindow for selected pin */}
          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.position.lat, lng: selectedMarker.position.lng }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2 max-w-[240px] text-stone-900">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block mb-0.5">
                  {selectedMarker.type.toUpperCase()}
                </span>
                <h4 className="font-bold text-sm leading-snug">{selectedMarker.title}</h4>
                {selectedMarker.data.rating && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold mt-1">
                    <span>★ {selectedMarker.data.rating}</span>
                    {selectedMarker.data.reviewCount && (
                      <span className="text-stone-500 font-normal">
                        ({selectedMarker.data.reviewCount?.toLocaleString() || 0} reviews)
                      </span>
                    )}
                  </div>
                )}
                {selectedMarker.data.address && (
                  <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">
                    {selectedMarker.data.address}
                  </p>
                )}
                {selectedMarker.data.formattedAddress && (
                  <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">
                    {selectedMarker.data.formattedAddress}
                  </p>
                )}
                <button
                  onClick={() => {
                    onSelectItem(selectedMarker.data, selectedMarker.type);
                    setSelectedMarker(null);
                  }}
                  className="mt-2 w-full py-1 text-center bg-stone-900 hover:bg-stone-800 text-white rounded text-[11px] font-semibold cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
};

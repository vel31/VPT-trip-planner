// Source: Google Maps Platform Code Assist
// Interactive Map View with Google Maps Platform Integration:
// - Maps JavaScript API (@vis.gl/react-google-maps)
// - Directions API / Routes API
// - Geocoding API (Forward & Reverse)
// - Places API (New)

import React, { useEffect, useRef, useState } from 'react';
import { 
  Destination, 
  Hotel, 
  Attraction, 
  FoodItem, 
  Coordinates, 
  DirectionsRoute, 
  GeocodeResult, 
  PlaceResult 
} from '../types';
import { 
  MapPin, 
  Layers, 
  Landmark, 
  Hotel as HotelIcon, 
  Utensils, 
  Star, 
  ExternalLink,
  Compass,
  Navigation,
  Search,
  Route,
  Car,
  Bike,
  Footprints,
  Train,
  CheckCircle2,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  Phone,
  Globe
} from 'lucide-react';
import { GoogleMapRenderer } from './GoogleMapRenderer';

interface InteractiveMapViewProps {
  destinations: Destination[];
  onSelectDestination: (destination: Destination) => void;
}

export const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({
  destinations,
  onSelectDestination,
}) => {
  // Map container refs for Leaflet fallback
  const leafletMapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapInstanceRef = useRef<any>(null);
  const leafletMarkersGroupRef = useRef<any>(null);
  const leafletPolylineRef = useRef<any>(null);

  // Map and Data State
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'attractions' | 'hotels' | 'food'>('all');
  const [activeItemDetails, setActiveItemDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mapEngine, setMapEngine] = useState<'google' | 'vector'>('vector');
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
  
  const [mapData, setMapData] = useState<{
    hotels: Hotel[];
    attractions: Attraction[];
    food: FoodItem[];
  }>({ hotels: [], attractions: [], food: [] });

  // Tab state: 'explore' | 'directions' | 'geocoding' | 'places'
  const [activeToolTab, setActiveToolTab] = useState<'explore' | 'directions' | 'geocoding' | 'places'>('explore');

  // Directions (Routes API) State
  const [routeOrigin, setRouteOrigin] = useState<string>('Delhi (Red Fort)');
  const [routeDestination, setRouteDestination] = useState<string>('Agra (Taj Mahal)');
  const [originCoords, setOriginCoords] = useState<Coordinates>({ lat: 28.6562, lng: 77.2410 });
  const [destCoords, setDestCoords] = useState<Coordinates>({ lat: 27.1751, lng: 78.0421 });
  const [travelMode, setTravelMode] = useState<'DRIVE' | 'TRANSIT' | 'WALK' | 'TWO_WHEELER'>('DRIVE');
  const [activeRoute, setActiveRoute] = useState<DirectionsRoute | null>(null);
  const [computingRoute, setComputingRoute] = useState<boolean>(false);

  // Geocoding API State
  const [geocodeQuery, setGeocodeQuery] = useState<string>('');
  const [geocodedLocation, setGeocodedLocation] = useState<{ address: string; coordinates: Coordinates } | null>(null);
  const [geocodingLoading, setGeocodingLoading] = useState<boolean>(false);
  const [geocodeResultsList, setGeocodeResultsList] = useState<GeocodeResult[]>([]);

  // Places API (New) State
  const [placesQuery, setPlacesQuery] = useState<string>('Heritage Monuments & Forts');
  const [placesLoading, setPlacesLoading] = useState<boolean>(false);
  const [searchedPlaces, setSearchedPlaces] = useState<PlaceResult[]>([]);

  // Fetch Maps Configuration & Verified Data on mount
  useEffect(() => {
    async function initDataAndConfig() {
      try {
        setLoading(true);
        
        // 1. Fetch Maps Config
        const configRes = await fetch('/api/maps/config');
        if (configRes.ok) {
          const config = await configRes.json();
          if (config.hasGoogleKey && config.googleMapsApiKey) {
            setGoogleMapsApiKey(config.googleMapsApiKey);
            setMapEngine('google');
          } else {
            setGoogleMapsApiKey('');
            setMapEngine('vector');
          }
        }

        // 2. Fetch Data
        const res = await fetch('/api/search?q=');
        if (res.ok) {
          const data = await res.json();
          setMapData({
            hotels: data.hotels || [],
            attractions: data.attractions || [],
            food: data.food || [],
          });
        }
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    }
    initDataAndConfig();
  }, []);

  // Compute Initial Sample Route on load
  useEffect(() => {
    handleComputeRoute();
  }, []);

  // Handle Directions Route Computation
  const handleComputeRoute = async (customOrigin?: Coordinates, customDest?: Coordinates, customOrigName?: string, customDestName?: string) => {
    try {
      setComputingRoute(true);
      const payload = {
        origin: customOrigin || originCoords,
        destination: customDest || destCoords,
        originName: customOrigName || routeOrigin,
        destinationName: customDestName || routeDestination,
        mode: travelMode,
      };

      const res = await fetch('/api/maps/directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const route: DirectionsRoute = await res.json();
        setActiveRoute(route);

        // If Leaflet is active, render the polyline
        if (leafletMapInstanceRef.current && route.polylinePoints.length > 0) {
          const L = await import('leaflet');
          if (leafletPolylineRef.current) {
            leafletPolylineRef.current.remove();
          }
          const latLngs: [number, number][] = route.polylinePoints.map((p) => [p.lat, p.lng]);
          leafletPolylineRef.current = L.polyline(latLngs, {
            color: '#F27D26',
            weight: 5,
            opacity: 0.85,
          }).addTo(leafletMapInstanceRef.current);

          leafletMapInstanceRef.current.fitBounds(leafletPolylineRef.current.getBounds(), {
            padding: [50, 50],
          });
        }
      }
    } catch (err) {
      console.error('Failed to compute route:', err);
    } finally {
      setComputingRoute(false);
    }
  };

  // Handle Geocoding Search
  const handleGeocodeSearch = async (addressToSearch?: string) => {
    const q = addressToSearch || geocodeQuery;
    if (!q) return;

    try {
      setGeocodingLoading(true);
      const res = await fetch('/api/maps/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: q }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const first = data.results[0];
          setGeocodedLocation({
            address: first.formattedAddress,
            coordinates: first.coordinates,
          });
          setGeocodeResultsList(data.results);

          // Center Leaflet map if in vector mode
          if (leafletMapInstanceRef.current) {
            leafletMapInstanceRef.current.setView([first.coordinates.lat, first.coordinates.lng], 13);
          }
        }
      }
    } catch (err) {
      console.error('Geocoding search failed:', err);
    } finally {
      setGeocodingLoading(false);
    }
  };

  // Handle Reverse Geocode on map click
  const handleMapReverseGeocode = async (coords: Coordinates) => {
    try {
      setGeocodingLoading(true);
      const res = await fetch('/api/maps/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: coords.lat, lng: coords.lng }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const first = data.results[0];
          setGeocodedLocation({
            address: first.formattedAddress,
            coordinates: coords,
          });
          setActiveItemDetails({
            name: 'Selected Geographic Point',
            address: first.formattedAddress,
            coordinates: coords,
            type: 'Geocoded Pin',
            description: `Coordinates: ${coords.lat.toFixed(5)}°N, ${coords.lng.toFixed(5)}°E. Located in ${first.city || 'India'}.`,
            source: 'Google Geocoding API',
          });
        }
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
    } finally {
      setGeocodingLoading(false);
    }
  };

  // Handle Places API (New) Search
  const handlePlacesSearch = async (categoryQuery?: string) => {
    const q = categoryQuery || placesQuery;
    if (!q) return;

    try {
      setPlacesLoading(true);
      const currentDest = destinations.find((d) => d.id === selectedDestinationId);
      const lat = currentDest ? currentDest.coordinates.lat : 28.6139;
      const lng = currentDest ? currentDest.coordinates.lng : 77.2090;

      const res = await fetch('/api/maps/places/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          lat,
          lng,
          radius: 25000,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.places) {
          setSearchedPlaces(data.places);
        }
      }
    } catch (err) {
      console.error('Places search failed:', err);
    } finally {
      setPlacesLoading(false);
    }
  };

  // Initialize Leaflet Map for vector fallback mode
  useEffect(() => {
    if (mapEngine !== 'vector') return;
    let isMounted = true;

    async function initLeaflet() {
      if (!leafletMapContainerRef.current) return;
      const L = await import('leaflet');
      if (!isMounted) return;

      if (!leafletMapInstanceRef.current) {
        const map = L.map(leafletMapContainerRef.current, {
          center: [22.5937, 78.9629],
          zoom: 5,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap | Google Maps Platform Engine',
        }).addTo(map);

        map.on('click', (e: any) => {
          handleMapReverseGeocode({ lat: e.latlng.lat, lng: e.latlng.lng });
        });

        const markersGroup = L.layerGroup().addTo(map);
        leafletMapInstanceRef.current = map;
        leafletMarkersGroupRef.current = markersGroup;
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }
    };
  }, [mapEngine]);

  // Synchronize Leaflet Markers and Polyline whenever data, filters, or selected items change
  useEffect(() => {
    if (mapEngine !== 'vector' || !leafletMapInstanceRef.current || !leafletMarkersGroupRef.current) return;

    async function updateMarkers() {
      const L = await import('leaflet');
      const group = leafletMarkersGroupRef.current;
      const map = leafletMapInstanceRef.current;
      if (!group || !map) return;

      group.clearLayers();

      // Custom icon helper
      const createIcon = (color: string, label: string) => {
        return L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5); font-size: 11px; font-weight: bold; color: white;">${label}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
          popupAnchor: [0, -14],
        });
      };

      // 1. Destinations
      if (selectedDestinationId === 'all') {
        destinations.forEach((d) => {
          const marker = L.marker([d.coordinates.lat, d.coordinates.lng], {
            icon: createIcon('#E11D48', '🏛️'),
          });
          marker.bindPopup(`
            <div style="font-family: sans-serif; min-width: 160px; color: #1c1917;">
              <span style="font-size: 9px; font-weight: bold; color: #e11d48; text-transform: uppercase;">DESTINATION</span>
              <h4 style="margin: 2px 0 4px; font-size: 13px; font-weight: bold;">${d.name}</h4>
              <p style="margin: 0; font-size: 11px; color: #57534e;">${d.tagline || d.state}</p>
            </div>
          `);
          marker.on('click', () => {
            setActiveItemDetails({ type: 'destination', ...d });
          });
          group.addLayer(marker);
        });
      }

      // 2. Attractions / ASI Monuments
      if (filterType === 'all' || filterType === 'attractions') {
        mapData.attractions
          .filter((a) => selectedDestinationId === 'all' || a.destinationId === selectedDestinationId)
          .forEach((a) => {
            if (a.coordinates) {
              const marker = L.marker([a.coordinates.lat, a.coordinates.lng], {
                icon: createIcon('#D97706', '🏛️'),
              });
              marker.bindPopup(`
                <div style="font-family: sans-serif; min-width: 160px; color: #1c1917;">
                  <span style="font-size: 9px; font-weight: bold; color: #d97706; text-transform: uppercase;">ASI MONUMENT</span>
                  <h4 style="margin: 2px 0 4px; font-size: 13px; font-weight: bold;">${a.name}</h4>
                  <p style="margin: 0; font-size: 11px; color: #57534e;">${a.type || 'Heritage Site'}</p>
                </div>
              `);
              marker.on('click', () => {
                setActiveItemDetails({ type: 'attraction', ...a });
              });
              group.addLayer(marker);
            }
          });
      }

      // 3. Hotels
      if (filterType === 'all' || filterType === 'hotels') {
        mapData.hotels
          .filter((h) => selectedDestinationId === 'all' || h.destinationId === selectedDestinationId)
          .forEach((h) => {
            if (h.coordinates) {
              const marker = L.marker([h.coordinates.lat, h.coordinates.lng], {
                icon: createIcon('#9333EA', '🏨'),
              });
              marker.bindPopup(`
                <div style="font-family: sans-serif; min-width: 160px; color: #1c1917;">
                  <span style="font-size: 9px; font-weight: bold; color: #9333ea; text-transform: uppercase;">HERITAGE STAY</span>
                  <h4 style="margin: 2px 0 4px; font-size: 13px; font-weight: bold;">${h.name}</h4>
                  <p style="margin: 0; font-size: 11px; color: #57534e;">★ ${h.rating || 4.5} · ${h.priceRange || 'Luxury'}</p>
                </div>
              `);
              marker.on('click', () => {
                setActiveItemDetails({ type: 'hotel', ...h });
              });
              group.addLayer(marker);
            }
          });
      }

      // 4. Food
      if (filterType === 'all' || filterType === 'food') {
        mapData.food
          .filter((f) => selectedDestinationId === 'all' || f.destinationId === selectedDestinationId)
          .forEach((f) => {
            if (f.coordinates) {
              const marker = L.marker([f.coordinates.lat, f.coordinates.lng], {
                icon: createIcon('#10B981', '🍛'),
              });
              marker.bindPopup(`
                <div style="font-family: sans-serif; min-width: 160px; color: #1c1917;">
                  <span style="font-size: 9px; font-weight: bold; color: #10b981; text-transform: uppercase;">CULINARY GEM</span>
                  <h4 style="margin: 2px 0 4px; font-size: 13px; font-weight: bold;">${f.name}</h4>
                  <p style="margin: 0; font-size: 11px; color: #57534e;">${f.specialty || 'Traditional Cuisine'}</p>
                </div>
              `);
              marker.on('click', () => {
                setActiveItemDetails({ type: 'food', ...f });
              });
              group.addLayer(marker);
            }
          });
      }

      // 5. Searched Places
      searchedPlaces.forEach((place) => {
        if (place.location) {
          const marker = L.marker([place.location.lat, place.location.lng], {
            icon: createIcon('#3B82F6', '✨'),
          });
          marker.bindPopup(`
            <div style="font-family: sans-serif; min-width: 160px; color: #1c1917;">
              <span style="font-size: 9px; font-weight: bold; color: #3b82f6; text-transform: uppercase;">PLACES (NEW)</span>
              <h4 style="margin: 2px 0 4px; font-size: 13px; font-weight: bold;">${place.displayName.text}</h4>
              <p style="margin: 0; font-size: 11px; color: #57534e;">${place.formattedAddress || 'Point of Interest'}</p>
            </div>
          `);
          marker.on('click', () => {
            setActiveItemDetails({ type: 'place', ...place });
          });
          group.addLayer(marker);
        }
      });

      // 6. Geocoded Location
      if (geocodedLocation) {
        const marker = L.marker([geocodedLocation.coordinates.lat, geocodedLocation.coordinates.lng], {
          icon: createIcon('#EC4899', '📍'),
        });
        marker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 160px; color: #1c1917;">
            <span style="font-size: 9px; font-weight: bold; color: #ec4899; text-transform: uppercase;">GEOCODED PIN</span>
            <h4 style="margin: 2px 0 4px; font-size: 13px; font-weight: bold;">${geocodedLocation.address}</h4>
          </div>
        `);
        group.addLayer(marker);
      }

      // Pan to destination if selected
      if (selectedDestinationId !== 'all') {
        const dest = destinations.find((d) => d.id === selectedDestinationId);
        if (dest) {
          map.setView([dest.coordinates.lat, dest.coordinates.lng], 12);
        }
      }
    }

    updateMarkers();
  }, [mapEngine, selectedDestinationId, filterType, mapData, destinations, searchedPlaces, geocodedLocation]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-[#F0F0F0]">
      
      {/* Google Maps Platform Header & API Status Banner */}
      <div className="bg-[#161616] p-5 rounded-3xl border border-[#2A2A2A] shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif-display text-2xl font-bold text-[#F0F0F0]">
                Google Maps Platform Navigation & Discovery Hub
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F27D26]/20 text-[#F27D26] border border-[#F27D26]/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                4 Active APIs
              </span>
            </div>
            <p className="text-xs text-[#8E9299] mt-1">
              Integrated with <strong>Directions API</strong>, <strong>Geocoding API</strong>, <strong>Places API (New)</strong>, and <strong>Maps JavaScript API</strong>.
            </p>
          </div>

          {/* Engine Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#1A1A1A] p-1 rounded-xl border border-[#333]">
              <button
                onClick={() => setMapEngine('google')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mapEngine === 'google'
                    ? 'bg-[#F27D26] text-black font-bold shadow-md'
                    : 'text-[#8E9299] hover:text-[#F0F0F0]'
                }`}
              >
                Maps JavaScript API
              </button>
              <button
                onClick={() => setMapEngine('vector')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mapEngine === 'vector'
                    ? 'bg-[#333] text-white font-bold shadow-md'
                    : 'text-[#8E9299] hover:text-[#F0F0F0]'
                }`}
              >
                Vector Canvas
              </button>
            </div>
          </div>
        </div>

        {/* 4 APIs Capability Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#2A2A2A]">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1A1A1A]/70 border border-[#2A2A2A] text-xs">
            <Route className="w-4 h-4 text-[#F27D26] shrink-0" />
            <div>
              <span className="font-bold text-[#F0F0F0] block text-[11px]">Routing API</span>
              <span className="text-[10px] text-[#8E9299]">Geoapify / Routes Turn-by-Turn</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1A1A1A]/70 border border-[#2A2A2A] text-xs">
            <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
            <div>
              <span className="font-bold text-[#F0F0F0] block text-[11px]">Geocoding API</span>
              <span className="text-[10px] text-[#8E9299]">Geoapify Forward & Reverse</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1A1A1A]/70 border border-[#2A2A2A] text-xs">
            <Search className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="font-bold text-[#F0F0F0] block text-[11px]">Places API</span>
              <span className="text-[10px] text-[#8E9299]">Geoapify POIs & Stays</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1A1A1A]/70 border border-[#2A2A2A] text-xs">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-[#F0F0F0] block text-[11px]">Vector & JS Maps</span>
              <span className="text-[10px] text-[#8E9299]">Leaflet + OpenStreetMap Tiles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left/Main Column: Map View & Feature Toolbar (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Map View Mode Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161616] p-2 rounded-2xl border border-[#2A2A2A]">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveToolTab('explore')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeToolTab === 'explore'
                    ? 'bg-[#F27D26] text-black font-bold'
                    : 'text-[#8E9299] hover:text-[#F0F0F0]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Explore Sights
              </button>
              <button
                onClick={() => setActiveToolTab('directions')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeToolTab === 'directions'
                    ? 'bg-[#F27D26] text-black font-bold'
                    : 'text-[#8E9299] hover:text-[#F0F0F0]'
                }`}
              >
                <Route className="w-3.5 h-3.5" />
                Directions & Route
              </button>
              <button
                onClick={() => setActiveToolTab('geocoding')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeToolTab === 'geocoding'
                    ? 'bg-[#F27D26] text-black font-bold'
                    : 'text-[#8E9299] hover:text-[#F0F0F0]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                Geocode Lookup
              </button>
              <button
                onClick={() => setActiveToolTab('places')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeToolTab === 'places'
                    ? 'bg-[#F27D26] text-black font-bold'
                    : 'text-[#8E9299] hover:text-[#F0F0F0]'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                Places API (New)
              </button>
            </div>

            {/* Destination Hub Filter */}
            <select
              value={selectedDestinationId}
              onChange={(e) => setSelectedDestinationId(e.target.value)}
              className="px-2.5 py-1 text-xs bg-[#1A1A1A] border border-[#333] rounded-lg text-[#F0F0F0] focus:outline-none"
            >
              <option value="all">🗺️ All India (8 Hubs)</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  📍 {d.name}, {d.state}
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Map Canvas Container */}
          <div className="bg-[#161616] rounded-3xl border border-[#2A2A2A] overflow-hidden shadow-2xl h-[560px] relative">
            {mapEngine === 'google' ? (
              <GoogleMapRenderer
                apiKey={googleMapsApiKey}
                destinations={destinations}
                mapData={mapData}
                filterType={filterType}
                selectedDestinationId={selectedDestinationId}
                activeRoute={activeRoute}
                searchedPlaces={searchedPlaces}
                geocodedLocation={geocodedLocation}
                onSelectItem={(item, type) => setActiveItemDetails({ type, ...item })}
                onMapClick={(coords) => handleMapReverseGeocode(coords)}
                onSwitchToVector={() => setMapEngine('vector')}
              />
            ) : (
              <div ref={leafletMapContainerRef} className="w-full h-full" />
            )}

            {/* Floating Legend */}
            <div className="absolute bottom-4 left-4 z-[400] bg-[#161616]/90 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-[#2A2A2A] text-xs shadow-xl space-y-1.5 pointer-events-auto">
              <span className="text-[10px] uppercase font-bold text-[#8E9299] block">Map Pins & Routes</span>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#F0F0F0]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> ASI Monuments
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Heritage Stays
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Places (New)
                </span>
                {activeRoute && (
                  <span className="flex items-center gap-1 text-[#F27D26] font-semibold">
                    <span className="w-3 h-1 bg-[#F27D26] inline-block rounded" /> Active Route ({activeRoute.distanceText})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Active Tool Sub-Panel */}
          {activeToolTab === 'directions' && (
            <div className="bg-[#161616] p-5 rounded-3xl border border-[#2A2A2A] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Route className="w-5 h-5 text-[#F27D26]" />
                  <h3 className="font-serif-display font-bold text-lg text-[#F0F0F0]">
                    Directions API / Routes Engine
                  </h3>
                </div>
                <span className="text-xs text-[#8E9299]">
                  Origin to Destination Route Calculation
                </span>
              </div>

              {/* Mode Selectors */}
              <div className="flex items-center gap-2 bg-[#1A1A1A] p-1 rounded-xl border border-[#2A2A2A] w-fit">
                <button
                  onClick={() => {
                    setTravelMode('DRIVE');
                    handleComputeRoute();
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    travelMode === 'DRIVE' ? 'bg-[#F27D26] text-black font-bold' : 'text-[#8E9299] hover:text-white'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" /> Driving (Traffic-Aware)
                </button>
                <button
                  onClick={() => {
                    setTravelMode('TRANSIT');
                    handleComputeRoute();
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    travelMode === 'TRANSIT' ? 'bg-[#F27D26] text-black font-bold' : 'text-[#8E9299] hover:text-white'
                  }`}
                >
                  <Train className="w-3.5 h-3.5" /> Transit
                </button>
                <button
                  onClick={() => {
                    setTravelMode('TWO_WHEELER');
                    handleComputeRoute();
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    travelMode === 'TWO_WHEELER' ? 'bg-[#F27D26] text-black font-bold' : 'text-[#8E9299] hover:text-white'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" /> Two-Wheeler
                </button>
                <button
                  onClick={() => {
                    setTravelMode('WALK');
                    handleComputeRoute();
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    travelMode === 'WALK' ? 'bg-[#F27D26] text-black font-bold' : 'text-[#8E9299] hover:text-white'
                  }`}
                >
                  <Footprints className="w-3.5 h-3.5" /> Walking
                </button>
              </div>

              {/* Input Coordinates / Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8E9299] block">Origin Point</label>
                  <input
                    type="text"
                    value={routeOrigin}
                    onChange={(e) => setRouteOrigin(e.target.value)}
                    placeholder="e.g. Red Fort, Delhi"
                    className="w-full px-3 py-2 text-xs bg-[#1A1A1A] border border-[#333] rounded-xl text-[#F0F0F0] focus:outline-none focus:border-[#F27D26]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#8E9299] block">Destination Point</label>
                  <input
                    type="text"
                    value={routeDestination}
                    onChange={(e) => setRouteDestination(e.target.value)}
                    placeholder="e.g. Taj Mahal, Agra"
                    className="w-full px-3 py-2 text-xs bg-[#1A1A1A] border border-[#333] rounded-xl text-[#F0F0F0] focus:outline-none focus:border-[#F27D26]"
                  />
                </div>
              </div>

              {/* Route Presets */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#8E9299]">Popular Heritage Routes:</span>
                <button
                  onClick={() => {
                    setRouteOrigin('Delhi (Red Fort)');
                    setRouteDestination('Agra (Taj Mahal)');
                    setOriginCoords({ lat: 28.6562, lng: 77.2410 });
                    setDestCoords({ lat: 27.1751, lng: 78.0421 });
                    handleComputeRoute({ lat: 28.6562, lng: 77.2410 }, { lat: 27.1751, lng: 78.0421 }, 'Delhi (Red Fort)', 'Agra (Taj Mahal)');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] text-stone-300 border border-[#333] text-[11px] cursor-pointer"
                >
                  Delhi ➔ Agra (Golden Triangle)
                </button>
                <button
                  onClick={() => {
                    setRouteOrigin('Jaipur (Hawa Mahal)');
                    setRouteDestination('Amber Palace');
                    setOriginCoords({ lat: 26.9239, lng: 75.8267 });
                    setDestCoords({ lat: 26.9855, lng: 75.8513 });
                    handleComputeRoute({ lat: 26.9239, lng: 75.8267 }, { lat: 26.9855, lng: 75.8513 }, 'Jaipur (Hawa Mahal)', 'Amber Palace');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] text-stone-300 border border-[#333] text-[11px] cursor-pointer"
                >
                  Jaipur City ➔ Amber Fort
                </button>
                <button
                  onClick={() => {
                    setRouteOrigin('Gateway of India, Mumbai');
                    setRouteDestination('Marine Drive');
                    setOriginCoords({ lat: 18.9220, lng: 72.8347 });
                    setDestCoords({ lat: 18.9432, lng: 72.8230 });
                    handleComputeRoute({ lat: 18.9220, lng: 72.8347 }, { lat: 18.9432, lng: 72.8230 }, 'Gateway of India', 'Marine Drive');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] text-stone-300 border border-[#333] text-[11px] cursor-pointer"
                >
                  Gateway ➔ Marine Drive
                </button>
              </div>

              <button
                onClick={() => handleComputeRoute()}
                disabled={computingRoute}
                className="w-full py-2.5 rounded-xl bg-[#F27D26] hover:bg-[#e06c18] text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 transition-all"
              >
                {computingRoute ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Computing Directions via Google Routes API...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 text-black" />
                    <span>Calculate Directions & Polyline</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Geocoding Search Panel */}
          {activeToolTab === 'geocoding' && (
            <div className="bg-[#161616] p-5 rounded-3xl border border-[#2A2A2A] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-pink-400" />
                  <h3 className="font-serif-display font-bold text-lg text-[#F0F0F0]">
                    Geocoding API (Forward & Reverse)
                  </h3>
                </div>
                <span className="text-xs text-[#8E9299]">Search any Indian address or click map</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={geocodeQuery}
                  onChange={(e) => setGeocodeQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGeocodeSearch()}
                  placeholder="Enter address, monument, or pin code (e.g. 'Meenakshi Temple, Madurai', 'Fort Kochi', 'Connaught Place')"
                  className="flex-1 px-3.5 py-2.5 text-xs bg-[#1A1A1A] border border-[#333] rounded-xl text-[#F0F0F0] focus:outline-none focus:border-[#F27D26]"
                />
                <button
                  onClick={() => handleGeocodeSearch()}
                  disabled={geocodingLoading}
                  className="px-5 py-2.5 bg-[#F27D26] hover:bg-[#e06c18] text-black font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                >
                  {geocodingLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>Geocode</span>
                </button>
              </div>

              {geocodedLocation && (
                <div className="p-3 rounded-2xl bg-[#1A1A1A] border border-pink-500/30 flex items-start gap-3 text-xs">
                  <MapPin className="w-4 h-4 text-pink-400 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <strong className="text-[#F0F0F0] block">{geocodedLocation.address}</strong>
                    <span className="text-[#8E9299] block font-mono text-[11px]">
                      Lat: {geocodedLocation.coordinates.lat.toFixed(6)}, Lng: {geocodedLocation.coordinates.lng.toFixed(6)}
                    </span>
                    <button
                      onClick={() => {
                        setRouteDestination(geocodedLocation.address);
                        setDestCoords(geocodedLocation.coordinates);
                        setActiveToolTab('directions');
                        handleComputeRoute(originCoords, geocodedLocation.coordinates, routeOrigin, geocodedLocation.address);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-[#F27D26] font-bold hover:underline mt-1 cursor-pointer"
                    >
                      Get Directions to this point <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Places API (New) Search Panel */}
          {activeToolTab === 'places' && (
            <div className="bg-[#161616] p-5 rounded-3xl border border-[#2A2A2A] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-400" />
                  <h3 className="font-serif-display font-bold text-lg text-[#F0F0F0]">
                    Places API (New) Discovery
                  </h3>
                </div>
                <span className="text-xs text-[#8E9299]">Live POIs, Ratings & Operating Hours</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={placesQuery}
                  onChange={(e) => setPlacesQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePlacesSearch()}
                  placeholder="Search live places (e.g. 'Heritage cafes', 'Handicraft markets', 'Mughal monuments')"
                  className="flex-1 px-3.5 py-2.5 text-xs bg-[#1A1A1A] border border-[#333] rounded-xl text-[#F0F0F0] focus:outline-none focus:border-[#F27D26]"
                />
                <button
                  onClick={() => handlePlacesSearch()}
                  disabled={placesLoading}
                  className="px-5 py-2.5 bg-[#F27D26] hover:bg-[#e06c18] text-black font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                >
                  {placesLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>Search Places</span>
                </button>
              </div>

              {/* Quick Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {['Heritage Forts', 'Authentic Restaurants', 'Palace Hotels', 'Handloom Bazaars', 'Metro Stations'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setPlacesQuery(tag);
                      handlePlacesSearch(tag);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] text-[#8E9299] hover:text-[#F0F0F0] border border-[#333] text-[11px] cursor-pointer"
                  >
                    🔍 {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Dynamic Inspector & Directions Turn Steps (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Active Route Summary Card */}
          {activeRoute && (
            <div className="bg-[#161616] p-5 rounded-3xl border border-[#2A2A2A] shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F27D26]/20 text-[#F27D26] border border-[#F27D26]/30">
                  Google Directions Route
                </span>
                <span className="text-xs text-[#8E9299] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#F27D26]" />
                  {activeRoute.durationText}
                </span>
              </div>

              <div>
                <h4 className="font-serif-display font-bold text-[#F0F0F0] text-base leading-snug">
                  {activeRoute.originName} ➔ {activeRoute.destinationName}
                </h4>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-[#8E9299]">
                  <span>Total Distance: <strong className="text-[#F0F0F0]">{activeRoute.distanceText}</strong></span>
                  <span>•</span>
                  <span>Travel: <strong className="text-[#F0F0F0]">{activeRoute.mode}</strong></span>
                </div>
              </div>

              {/* Turn by turn steps accordion */}
              <div className="space-y-2 pt-2 border-t border-[#2A2A2A] max-h-56 overflow-y-auto pr-1">
                <span className="text-[11px] font-bold text-[#8E9299] uppercase tracking-wider block">
                  Route Instructions ({activeRoute.steps.length} steps)
                </span>
                {activeRoute.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs bg-[#1A1A1A] p-2 rounded-xl border border-[#2A2A2A]">
                    <div className="w-5 h-5 rounded-full bg-[#2A2A2A] text-[#F27D26] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <p className="text-[#F0F0F0] text-[11px]">{step.instruction}</p>
                      <div className="flex items-center gap-2 text-[10px] text-[#8E9299]">
                        <span>{step.distanceKm} km</span>
                        <span>•</span>
                        <span>{step.durationMins} mins</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Entity Inspector */}
          {activeItemDetails ? (
            <div className="bg-[#161616] p-5 rounded-3xl border border-[#2A2A2A] shadow-xl space-y-4">
              {activeItemDetails.imageUrl || activeItemDetails.heroImageUrl ? (
                <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-[#1A1A1A]">
                  <img
                    src={activeItemDetails.imageUrl || activeItemDetails.heroImageUrl}
                    alt={activeItemDetails.name || activeItemDetails.displayName?.text}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/85 text-[#F27D26] backdrop-blur-md border border-[#F27D26]/30">
                      {activeItemDetails.type ? String(activeItemDetails.type).toUpperCase() : 'VERIFIED ITEM'}
                    </span>
                  </div>
                </div>
              ) : null}

              <div>
                <h3 className="font-serif-display text-lg font-bold text-[#F0F0F0]">
                  {activeItemDetails.name || activeItemDetails.displayName?.text}
                </h3>
                <p className="text-xs text-[#8E9299] flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F27D26]" />
                  {activeItemDetails.address || activeItemDetails.formattedAddress || activeItemDetails.destinationName || activeItemDetails.state}
                </p>
              </div>

              {activeItemDetails.rating && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{activeItemDetails.rating}</span>
                  </div>
                  {activeItemDetails.userRatingCount && (
                    <span className="text-[#8E9299]">({activeItemDetails.userRatingCount?.toLocaleString() || 0} Google reviews)</span>
                  )}
                  {activeItemDetails.reviewCount && (
                    <span className="text-[#8E9299]">({activeItemDetails.reviewCount?.toLocaleString() || 0} reviews)</span>
                  )}
                </div>
              )}

              <p className="text-xs text-[#8E9299] leading-relaxed">
                {activeItemDetails.description || activeItemDetails.overview}
              </p>

              {/* Dynamic properties */}
              <div className="bg-[#121212] p-3 rounded-xl space-y-1.5 text-xs text-[#8E9299] border border-[#2A2A2A]">
                {activeItemDetails.openingHours && (
                  <div><strong className="text-[#F0F0F0]">Opening Hours:</strong> {activeItemDetails.openingHours}</div>
                )}
                {activeItemDetails.entryFeeINR !== undefined && (
                  <div><strong className="text-[#F0F0F0]">Entry Fee:</strong> ₹{activeItemDetails.entryFeeINR}</div>
                )}
                {(activeItemDetails.pricePerNightINR || activeItemDetails.basePricePerNightINR) && (
                  <div><strong className="text-[#F0F0F0]">Nightly Rate:</strong> ₹{(activeItemDetails.pricePerNightINR ?? activeItemDetails.basePricePerNightINR ?? 0).toLocaleString()}</div>
                )}
                {activeItemDetails.nationalPhoneNumber && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#F27D26]" />
                    <strong className="text-[#F0F0F0]">Phone:</strong> {activeItemDetails.nationalPhoneNumber}
                  </div>
                )}
                {activeItemDetails.websiteUri && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-[#F27D26]" />
                    <a href={activeItemDetails.websiteUri} target="_blank" rel="noopener noreferrer" className="text-[#F27D26] hover:underline truncate">
                      {activeItemDetails.websiteUri}
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {activeItemDetails.coordinates && (
                  <button
                    onClick={() => {
                      setRouteDestination(activeItemDetails.name || activeItemDetails.displayName?.text || 'Target Spot');
                      setDestCoords(activeItemDetails.coordinates);
                      setActiveToolTab('directions');
                      handleComputeRoute(originCoords, activeItemDetails.coordinates, routeOrigin, activeItemDetails.name);
                    }}
                    className="w-full py-2 rounded-xl bg-[#F27D26] hover:bg-[#e06c18] text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-black" />
                    Calculate Directions to this Spot
                  </button>
                )}

                {activeItemDetails.coordinates && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${activeItemDetails.coordinates.lat},${activeItemDetails.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] text-[#F0F0F0] border border-[#333] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    Open in Google Maps
                    <ExternalLink className="w-3 h-3 text-[#8E9299]" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#161616] p-6 rounded-3xl border border-dashed border-[#333] text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] text-[#8E9299] flex items-center justify-center mx-auto border border-[#2A2A2A]">
                <Compass className="w-6 h-6" />
              </div>
              <h4 className="font-serif-display font-bold text-[#F0F0F0] text-base">
                Select Any Destination or Pin
              </h4>
              <p className="text-xs text-[#8E9299] leading-relaxed">
                Click any Advanced Marker on the map or use the Directions, Geocoding, and Places tools to inspect verified data.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

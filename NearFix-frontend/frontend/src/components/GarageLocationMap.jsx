import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX } from '../config';

const GarageLocationMap = ({ address }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coordinates, setCoordinates] = useState(null);

  // Format address for Mapbox geocoding API
  const formatAddressForGeocoding = (address) => {
    if (!address) return '';
    
    const parts = [];
    
    // Start with street and number if available
    if (address.street && address.number) {
      parts.push(`${address.street} ${address.number}`);
    } else if (address.street) {
      parts.push(address.street);
    } else if (address.number) {
      parts.push(address.number);
    }
    
    // Add city
    if (address.city) parts.push(address.city);
    
    // Add ZIP code
    if (address.zipCode) parts.push(address.zipCode);
    
    // Add country (prefer Romania for better results)
    if (address.country) {
      // Normalize country name for better geocoding
      const country = address.country.toLowerCase();
      if (country === 'romania' || country === 'ro' || country === 'românia') {
        parts.push('Romania');
      } else {
        parts.push(address.country);
      }
    }
    
    return parts.join(', ');
  };

  // Geocode address to get coordinates
  const geocodeAddress = async (addressString) => {
    if (!addressString) {
      setError('No address provided');
      setLoading(false);
      return;
    }

    try {
      const encodedAddress = encodeURIComponent(addressString);
      const response = await fetch(
        `${MAPBOX.GEOCODING_BASE_URL}/${encodedAddress}.json?access_token=${MAPBOX.API_KEY}&limit=1&types=address&country=RO&language=en`
      );

      if (!response.ok) {
        throw new Error('Failed to geocode address');
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        setCoordinates({ longitude, latitude });
        setError('');
      } else {
        // Try with broader search if specific address not found
        const broaderResponse = await fetch(
          `${MAPBOX.GEOCODING_BASE_URL}/${encodedAddress}.json?access_token=${MAPBOX.API_KEY}&limit=1&types=place,neighborhood&country=RO&language=en`
        );
        
        if (broaderResponse.ok) {
          const broaderData = await broaderResponse.json();
          if (broaderData.features && broaderData.features.length > 0) {
            const [longitude, latitude] = broaderData.features[0].center;
            setCoordinates({ longitude, latitude });
            setError('');
          } else {
            setError('Address not found');
          }
        } else {
          setError('Address not found');
        }
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Failed to locate address');
    } finally {
      setLoading(false);
    }
  };

  // Initialize map when coordinates are available
  useEffect(() => {
    if (coordinates && mapContainer.current && !map.current) {
      mapboxgl.accessToken = MAPBOX.API_KEY;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAPBOX.DEFAULT_MAP_STYLE,
        center: [coordinates.longitude, coordinates.latitude],
        zoom: 14, // Slightly more zoomed in for better detail
        interactive: true,
        attributionControl: false // Hide attribution for cleaner look
      });

      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.innerHTML = `
        <div style="
          width: 24px; 
          height: 24px; 
          background-color: #92a8bf; 
          border-radius: 50%; 
          border: 2px solid white; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `;

      // Add marker to map
      marker.current = new mapboxgl.Marker(markerEl)
        .setLngLat([coordinates.longitude, coordinates.latitude])
        .addTo(map.current);

      // Handle map load
      map.current.on('load', () => {
        console.log('Garage location map loaded successfully');
      });

      // Handle map errors
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setError('Failed to load map');
      });
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (marker.current) {
        marker.current = null;
      }
    };
  }, [coordinates]);

  // Initialize geocoding when address changes
  useEffect(() => {
    if (address) {
      setLoading(true);
      setError('');
      setCoordinates(null);
      
      // Clean up existing map
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (marker.current) {
        marker.current = null;
      }
      
      const addressString = formatAddressForGeocoding(address);
      geocodeAddress(addressString);
    }
  }, [address]);

  if (loading) {
    return (
      <div className="w-full h-32 bg-[#f5f7fa] rounded-lg flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#819bb9]">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm">Loading map...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-32 bg-[#f5f7fa] rounded-lg flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#819bb9]">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-32 rounded-lg overflow-hidden border border-[#e2e8f0]">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default GarageLocationMap; 
import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX } from '../config';

const AddressMapModal = ({ isOpen, onClose, address }) => {
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
            setError('Address not found on map');
          }
        } else {
          setError('Address not found on map');
        }
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Failed to locate address on map');
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
        zoom: MAPBOX.DEFAULT_ZOOM
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.innerHTML = `
        <div style="
          width: 32px; 
          height: 32px; 
          background-color: #92a8bf; 
          border-radius: 50%; 
          border: 2px solid white; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
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
        console.log('Map loaded successfully');
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

  useEffect(() => {
    if (isOpen && address) {
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
  }, [isOpen, address]);

  const handleClose = () => {
    setCoordinates(null);
    setError('');
    setLoading(false);
    
    // Clean up map
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    if (marker.current) {
      marker.current = null;
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl mx-4 shadow-xl transform transition-all duration-300 hover:shadow-2xl max-h-[90vh] overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#708eb3]">Address Location</h2>
              <button
                onClick={handleClose}
                className="text-[#a4b5c5] hover:text-[#819bb9] transition-colors duration-300"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Address Display */}
            <div className="mb-4 bg-[#f8fafc] rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#e2e8f0]">
              <h3 className="text-lg font-semibold text-[#708eb3] mb-2">Address:</h3>
              <p className="text-[#819bb9]">
                {address ? (
                  <>
                    {address.street && address.number ? (
                      `${address.street} ${address.number}`
                    ) : (
                      address.street || address.number || ''
                    )}
                    {address.city && `, ${address.city}`}
                    {address.country && `, ${address.country}`}
                    {address.zipCode && ` (${address.zipCode})`}
                  </>
                ) : (
                  'No address provided'
                )}
              </p>
            </div>

            {/* Map Container */}
            <div className="relative h-96 rounded-lg overflow-hidden border border-[#a4b5c5]">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#92a8bf]"></div>
                    <p className="mt-2 text-[#819bb9]">Loading map...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-[#a4b5c5] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                    </svg>
                    <p className="text-[#819bb9]">{error}</p>
                  </div>
                </div>
              )}

              <div 
                ref={mapContainer} 
                className="w-full h-full"
                style={{ display: coordinates && !loading && !error ? 'block' : 'none' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressMapModal; 
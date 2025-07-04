# Mapbox Integration for Address Display

## Overview
This implementation integrates Mapbox GL JS directly to display user addresses on an interactive map. When a user clicks on their address in the profile page, a modal opens showing their location pinned on a map.

## How It Works

### 1. Address Processing
The address is processed through the `formatAddressForGeocoding` function in `AddressMapModal.jsx`:

```javascript
const formatAddressForGeocoding = (address) => {
  const parts = [];
  
  // Street and number
  if (address.street && address.number) {
    parts.push(`${address.street} ${address.number}`);
  } else if (address.street) {
    parts.push(address.street);
  }
  
  // City, ZIP, Country
  if (address.city) parts.push(address.city);
  if (address.zipCode) parts.push(address.zipCode);
  if (address.country) parts.push(address.country);
  
  return parts.join(', ');
};
```

### 2. Mapbox Geocoding API
The formatted address is sent to Mapbox's Geocoding API:

**Primary Request:**
- Endpoint: `https://api.mapbox.com/geocoding/v5/mapbox.places/{address}.json`
- Parameters:
  - `access_token`: Your Mapbox API key
  - `limit=1`: Return only the best match
  - `types=address`: Search for specific addresses
  - `country=RO`: Prioritize Romania
  - `language=en`: Return results in English

**Fallback Request:**
If no specific address is found, a broader search is performed:
- `types=place,neighborhood`: Search for cities/neighborhoods
- This provides approximate location when exact address isn't found

### 3. Response Processing
The API returns GeoJSON with coordinates:
```json
{
  "features": [
    {
      "center": [longitude, latitude],
      "place_name": "Full address string",
      "relevance": 0.9
    }
  ]
}
```

### 4. Map Display
- Uses `mapbox-gl` directly for better compatibility
- Displays a custom marker at the geocoded coordinates
- Includes navigation controls for zoom/pan
- Responsive design with loading states

## Configuration

### Mapbox API Key
Located in `config.js`:
```javascript
export const MAPBOX = {
  API_KEY: 'your-mapbox-api-key',
  GEOCODING_BASE_URL: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
  DEFAULT_MAP_STYLE: 'mapbox://styles/mapbox/streets-v12',
  DEFAULT_ZOOM: 15
};
```

### Dependencies
- `mapbox-gl`: Core Mapbox library (direct usage, no React wrapper)

## Error Handling

1. **No Address Provided**: Shows "No address provided" message
2. **Geocoding Failed**: Shows "Failed to locate address on map"
3. **Address Not Found**: Shows "Address not found on map"
4. **Map Load Error**: Shows "Failed to load map"

## User Experience Features

- **Clickable Address**: Hover effects indicate the address is clickable
- **Loading States**: Spinner while geocoding and map loading
- **Responsive Modal**: Works on all screen sizes
- **Navigation Controls**: Users can zoom and pan the map
- **Custom Marker**: Branded location pin matching the app's design

## Address Format Examples

**Input Address:**
```javascript
{
  street: "Strada Mihai Eminescu",
  number: "15",
  city: "București",
  country: "Romania",
  zipCode: "010001"
}
```

**Formatted for API:**
```
"Strada Mihai Eminescu 15, București, 010001, Romania"
```

**API Response:**
```json
{
  "features": [
    {
      "center": [26.1025, 44.4268],
      "place_name": "Strada Mihai Eminescu 15, București, Romania"
    }
  ]
}
```

## Technical Implementation

### Map Initialization
```javascript
mapboxgl.accessToken = MAPBOX.API_KEY;

map.current = new mapboxgl.Map({
  container: mapContainer.current,
  style: MAPBOX.DEFAULT_MAP_STYLE,
  center: [coordinates.longitude, coordinates.latitude],
  zoom: MAPBOX.DEFAULT_ZOOM
});
```

### Custom Marker
```javascript
const markerEl = document.createElement('div');
markerEl.innerHTML = `
  <div style="
    width: 32px; 
    height: 32px; 
    background-color: #92a8bf; 
    border-radius: 50%; 
    border: 2px solid white; 
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  ">
    <!-- SVG icon -->
  </div>
`;

new mapboxgl.Marker(markerEl)
  .setLngLat([coordinates.longitude, coordinates.latitude])
  .addTo(map.current);
```

## Best Practices

1. **Country Filtering**: Prioritize Romania (`country=RO`) for better local results
2. **Fallback Search**: Use broader search types when exact address fails
3. **Error Handling**: Graceful degradation when geocoding fails
4. **Loading States**: Clear feedback during API calls
5. **Responsive Design**: Works on mobile and desktop
6. **Memory Management**: Proper cleanup of map instances to prevent memory leaks 
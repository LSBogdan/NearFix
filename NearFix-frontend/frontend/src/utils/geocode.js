// Mapbox geocoding utility
import { MAPBOX } from '../config';

export function formatAddressForGeocoding(address) {
  if (!address) return '';
  const parts = [];
  if (address.street && address.number) {
    parts.push(`${address.street} ${address.number}`);
  } else if (address.street) {
    parts.push(address.street);
  } else if (address.number) {
    parts.push(address.number);
  }
  if (address.city) parts.push(address.city);
  if (address.zipCode) parts.push(address.zipCode);
  if (address.country) {
    const country = address.country.toLowerCase();
    if (country === 'romania' || country === 'ro' || country === 'românia') {
      parts.push('Romania');
    } else {
      parts.push(address.country);
    }
  }
  return parts.join(', ');
}

export async function geocodeAddress(address) {
  const addressString = formatAddressForGeocoding(address);
  if (!addressString) return null;
  try {
    const encodedAddress = encodeURIComponent(addressString);
    const response = await fetch(
      `${MAPBOX.GEOCODING_BASE_URL}/${encodedAddress}.json?access_token=${MAPBOX.API_KEY}&limit=1&types=address&country=RO&language=en`
    );
    if (!response.ok) throw new Error('Failed to geocode address');
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      return { longitude, latitude };
    } else {
      // Try broader search
      const broaderResponse = await fetch(
        `${MAPBOX.GEOCODING_BASE_URL}/${encodedAddress}.json?access_token=${MAPBOX.API_KEY}&limit=1&types=place,neighborhood&country=RO&language=en`
      );
      if (broaderResponse.ok) {
        const broaderData = await broaderResponse.json();
        if (broaderData.features && broaderData.features.length > 0) {
          const [longitude, latitude] = broaderData.features[0].center;
          return { longitude, latitude };
        }
      }
    }
    return null;
  } catch (err) {
    console.error('Geocoding error:', err);
    return null;
  }
} 
import { format } from 'date-fns';

/**
 * Formats a date string to a readable format.
 * @param {string} dateString - Date string in ISO format.
 * @returns {string} - Formatted date string.
 */
export const getRemainingTime = (pickupDate) => {
  const now = new Date();
  const target = new Date(pickupDate);
  const diff = target - now;

  if (diff <= 0) return '(Now or Past)';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `(${hours}h ${minutes}m remaining)`;
};
export const formatDate = (dateString) => {

  return format(new Date(dateString), ' dd-MM-yyyy hh:mm:ss a');
};


export const formatOnlyDate = (dateString) => {

  return format(new Date(dateString), 'dd-MM-yyyy');
};
// Function to decode buffer data and convert to coordinates
export const decodePolygonBuffer = (bufferData) => {
  // Step 1: Decode the buffer into a string (UTF-8)
  const decodedString = new TextDecoder().decode(new Uint8Array(bufferData));

  try {
    // Step 2: Parse the decoded string into a JSON object
    const geoJson = JSON.parse(decodedString);

    // Step 3: Check if the decoded GeoJSON is valid
    if (geoJson.type === 'Polygon' && Array.isArray(geoJson.coordinates)) {
      // Step 4: Extract coordinates from the GeoJSON Polygon
      const coordinates = geoJson.coordinates[0];  // The first array contains the polygon's coordinates

      // Step 5: Return the coordinates in {lat, lng} format
      return coordinates.map(([lng, lat]) => ({ lat, lng }));
    } else {
      throw new Error('Invalid GeoJSON format for Polygon.');
    }
  } catch (error) {
    console.error('Error decoding polygon:', error);

    // Fallback: Return a default polygon if decoding fails

    return [
      { lat: 40.8003, lng: -73.958 },
      { lat: 40.7967, lng: -73.949 },
      { lat: 40.7658, lng: -73.973 },
      { lat: 40.8003, lng: -73.958 }, // Closing the polygon
    ];
  }
};
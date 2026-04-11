// components/GoogleMap.js

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Polygon, DrawingManager } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '500px',
};

const center = {
  lat: 20.5937, // Center coordinates for India
  lng: 78.9629, // Center coordinates for India
};

const GoogleMapComponent = ({googlePoly}) => {
  const [polygonPaths, setPolygonPaths] = useState([]);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const mapRef = useRef(null);
  const drawingManagerRef = useRef(null);

  // Handle the map load
  const onLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
  }, []);

  // Handle drawing a polygon
  const onPolygonComplete = (polygon) => {
    const path = polygon.getPath().getArray();
      setPolygonPaths(path);
      
      // const geoJsonPolygon = {
      //   type: 'Polygon',
      //   coordinates: [
      //     path.map((latLng) => [latLng.lng(), latLng.lat()]), // Format each coordinate as [lng, lat]
      //   ],
      // };
      
    const formattedCoords = path
              .map((latLng) => `${latLng.lat()},${latLng.lng()}`) // Format each coordinate as lat,lng
              .join(';'); // Join them with semicolons

    googlePoly(formattedCoords)
  };


  // Detect when the google maps script is fully loaded
  useEffect(() => {
    
    if (typeof google !== 'undefined' && google.maps) {
      setGoogleLoaded(true);
    }
  }, []);

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyA3GfFqfSjITAXoeaK_kDce__LJa8iCK7M"
      libraries={['drawing']}
      onLoad={() => setGoogleLoaded(true)} // Set googleLoaded to true once the script is loaded
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={6}
        onLoad={onLoad}
      >
        {/* Only render the DrawingManager after google is loaded */}
        {googleLoaded && (
          <DrawingManager
            ref={drawingManagerRef}
            options={{
              drawingMode: google.maps.drawing.OverlayType.POLYGON, // Set to draw only polygons
              polygonOptions: {
                fillColor: '#FF0000',
                fillOpacity: 0.4,
                strokeColor: '#FF0000',
                strokeOpacity: 1,
                strokeWeight: 2,
              },
              
              // Do not include options for other shapes (so they are disabled by default)
              circleOptions: '', // Disable drawing circles
              markerOptions: '', // Disable drawing markers
            }}
            onPolygonComplete={onPolygonComplete}
          />
        )}

        {/* Render the newly drawn polygon */}
        {polygonPaths.length > 0 && (
          <Polygon
            paths={polygonPaths}
            options={{
              fillColor: '#FF0000',
              fillOpacity: 0.4,
              strokeColor: '#FF0000',
              strokeOpacity: 1,
              strokeWeight: 2,
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapComponent;
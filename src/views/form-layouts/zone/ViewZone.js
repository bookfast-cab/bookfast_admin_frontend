"use client";
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { useRouter } from 'next/router';
import { GoogleMap, LoadScript, Polygon } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '500px',
};

const defaultCenter = {
  lat: 20.5937, // Default center (before fitting bounds)
  lng: 78.9629, // Default center (before fitting bounds)
};

const parsePolygonString = (polygonString) => {
  polygonString = polygonString.replace(/;$/, ""); // Remove trailing semicolon if present

  const coordinatesArray = polygonString.split(";").map(coord => {
    const parts = coord.split(",").map(Number);
    
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const [lat, lng] = parts;
      
      return { lat, lng };
    } else {
      console.error(`Invalid coordinate: ${coord}`);
      
      return null;
    }
  });

  return coordinatesArray.filter(coord => coord !== null); // Filter out invalid coordinates
};

const getZones = async (id, token) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/zones/${id}/polygon`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    return data.polygon; 
  } catch (error) {
    console.error('Error:', error);
    
    return null;
  }
};

const ViewZone = () => {
  const router = useRouter();
  const { id } = router.query;
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  const [loading, setLoading] = useState(true); // To track if the API call is still pending
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  useEffect(() => {
    const fetchviewZone = async () => {
      const singlezone = await getZones(id, token);
      if (singlezone) {
        const parsedPolygon = parsePolygonString(singlezone);
        setPolygonCoordinates(parsedPolygon);
      }
      setLoading(false); // Set loading to false once the data is fetched
    };
    fetchviewZone();
  }, [id, token]);

  const handleBoundsAndCenter = (polygonCoordinates) => {
    const bounds = new window.google.maps.LatLngBounds();
    polygonCoordinates.forEach(coord => {
      if (coord && !isNaN(coord.lat) && !isNaN(coord.lng)) {
        bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
      }
    });

    // Get the center of the polygon by calculating the center of the bounds
    const center = bounds.getCenter();
   
    return { bounds, center };
  };

  // Only render the map after the data is fetched
  if (loading) {
    
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Loading...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6} style={{ marginBottom: "40px" }}>
          <Grid item xs={6}>
            <Typography variant="h6">{'Zones'}</Typography>
          </Grid>
          <Grid item xs={6} style={{ textAlign: 'right' }}>
            <Button variant="contained" onClick={() => router.push('/zones')}>
              Back
            </Button>
          </Grid>
        </Grid>
        <LoadScript googleMapsApiKey="AIzaSyA3GfFqfSjITAXoeaK_kDce__LJa8iCK7M">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter} // Default center (before fitting bounds)
            zoom={6} // Initial zoom level
            onLoad={(map) => {
              if (polygonCoordinates.length > 0) {
                const { bounds, center } = handleBoundsAndCenter(polygonCoordinates);
                
                // Fit bounds and set the center after fitting the bounds
                map.fitBounds(bounds); // This zooms the map to fit the polygon
                map.setCenter(center); // This ensures the map is centered on the polygon
              }
            }}
          >
            {polygonCoordinates.length > 0 && (
              <Polygon
                paths={polygonCoordinates}
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
      </CardContent>
    </Card>
  );
};

export default ViewZone;

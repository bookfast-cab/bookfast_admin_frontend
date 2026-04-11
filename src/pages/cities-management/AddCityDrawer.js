import {
  Drawer,
  Box,
  Typography,
  Grid,
  Divider,
  Button,
  CardContent,
  TextField,
  Snackbar
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Autocomplete, LoadScript } from '@react-google-maps/api';
import MuiAlert from '@mui/material/Alert';

const AddCityDrawer = ({ open, onClose, initialData }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const [formData, setFormData] = useState({
    name: '',
    pickup: '',
    pickupLat: '',
    pickupLng: ''
  });

  useEffect(()=>{
 setFormData({
    name: '',
    pickup: '',
    pickupLat: '',
    pickupLng: ''
  })
  },[open])

  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        pickup: initialData.name || '',
        pickupLat: initialData.lat || '',
        pickupLng: initialData.lng || ''
      });
    }
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCloseSnackbar = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setFormData({
    name: '',
    pickup: '',
    pickupLat: '',
    pickupLng: ''
  })
  };

  const handlePlaceSelect = (place, fieldName) => {
    if (!place?.geometry) return;

    const cityComponent = place.address_components.find(comp =>
    comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')
  );

  const cityName = cityComponent?.long_name || place.name;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setFormData(prev => ({
      ...prev,
      [fieldName]: cityName,
      [`${fieldName}Lat`]: lat,
      [`${fieldName}Lng`]: lng,
    }));
  };

  useEffect(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    .pac-container {
      z-index: 2000 !important;
    }
  `;
  document.head.appendChild(style);

  return () => {
    document.head.removeChild(style);
  };
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/cities/add`, {
        method: 'POST',
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.pickup,
          lat: formData.pickupLat,
          lng: formData.pickupLng
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);
        setTimeout(() => {
          onClose(true); // Refresh list
        }, 1000);
      } else {
        setErrorMessage(data.message || 'Failed to add city.');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={() => onClose(false)}>
      <Box sx={{ width: 500, p: 3 }}>
        <LoadScript
          googleMapsApiKey="AIzaSyA3GfFqfSjITAXoeaK_kDce__LJa8iCK7M"
          libraries={['places']}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>Add City</Typography>
            <form onSubmit={handleSubmit}>
              <Box sx={{ mt: 2 }}>
                <Autocomplete
                  onLoad={(ref) => { autocompleteRef.current = ref }}
                  onPlaceChanged={() => {
                    const place = autocompleteRef.current?.getPlace();
                    handlePlaceSelect(place, 'pickup');
                  }}
                >
                  <TextField
                    label="City Name"
                    name="pickup"
                    value={formData.pickup}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                </Autocomplete>
              </Box>

              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Latitude"
                  name="pickupLat"
                  value={formData.pickupLat}
                  onChange={handleChange}
                  fullWidth
                  disabled
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Longitude"
                  name="pickupLng"
                  value={formData.pickupLng}
                  onChange={handleChange}
                  fullWidth
                  disabled
                />
              </Box>

              <Button sx={{ mt: 3 }} variant="contained" color="primary" type="submit">
                Submit
              </Button>
            </form>

            <Snackbar
              open={!!errorMessage}
              autoHideDuration={3000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <MuiAlert elevation={6} variant="filled" severity="error">
                {errorMessage}
              </MuiAlert>
            </Snackbar>

            <Snackbar
              open={!!successMessage}
              autoHideDuration={3000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <MuiAlert elevation={6} variant="filled" severity="success">
                {successMessage}
              </MuiAlert>
            </Snackbar>
          </CardContent>
        </LoadScript>
      </Box>
    </Drawer>
  );
};

export default AddCityDrawer;

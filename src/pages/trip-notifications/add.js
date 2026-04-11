import { useCallback, useRef, useState } from 'react';

// ** MUI Imports
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useRouter } from 'next/router';
import { Autocomplete, LoadScript } from '@react-google-maps/api';

const AddNotification = () => {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    userType: 2,
    notificationType: 2,
    image: null,
    mobileNumber: '',
    status: 1,
    pickup: '',
    pickupLat: '',
    pickupLng: '',
    drop: '',
    dropLat: '',
    dropLng: '',
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const handleCloseSnackbar = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (event) => {

    setFormData((prevData) => ({ ...prevData, image: event.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('title', formData.title);
    form.append('message', formData.message);
    form.append('userType', formData.userType);
    form.append('notificationType', formData.notificationType);
    form.append('status', formData.status);
    form.append('mobileNumber', formData.mobileNumber);
    if (formData.image) {
      form.append('image', formData.image);
    }

    form.append('pickup', formData.pickup);
    form.append('pickupLat', formData.pickupLat);
    form.append('pickupLng', formData.pickupLng);
    form.append('drop', formData.drop);
    form.append('dropLat', formData.dropLat);
    form.append('dropLng', formData.dropLng);

    // return false;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/notification-messages/add`, {
        method: 'POST',
        headers: {
          Authorization: `${token}`,
        },
        body: form,
      });
      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);
        setTimeout(() => {
          router.push('/trip-notifications');
        }, 1000);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  const [pickupRef, setPickupRef] = useState(null);
  const [dropRef, setDropRef] = useState(null);

  const handlePlaceSelect = (place, fieldName) => {
    if (!place?.geometry) return;

    const location = place.formatted_address || place.name;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setFormData(prev => ({
      ...prev,
      [fieldName]: location,
      [`${fieldName}Lat`]: lat,
      [`${fieldName}Lng`]: lng,
    }));
  };

  const googleRef = useRef(null);

  const onLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
    if (window.google) {
      googleRef.current = window.google;
      setGoogleLoaded(true);
    }
  }, []);

  return (
    <Card>
      <LoadScript
        googleMapsApiKey={'AIzaSyA3GfFqfSjITAXoeaK_kDce__LJa8iCK7M'}
        libraries={['places', 'drawing']}

      >
        <CardContent>
          <Grid container spacing={6}>
            <Grid item xs={6}>
              <Typography variant="h6">Add Notification Message</Typography>
            </Grid>
            <Grid item xs={6} style={{ textAlign: 'right' }}>
              <Button variant="contained" onClick={() => router.push('/trip-notifications')}>
                Back
              </Button>
            </Grid>
          </Grid>

          <form onSubmit={handleSubmit}>

            {/* Pickup Location */}
            <Box sx={{ mt: 2 }}>
              <Autocomplete
                onLoad={(ref) => setPickupRef(ref)}
                onPlaceChanged={() => handlePlaceSelect(pickupRef.getPlace(), 'pickup')}
              >
                <TextField
                  label="Pickup Location"
                  name="pickup"
                  value={formData.pickup}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Autocomplete>
            </Box>

            {/* Drop Location */}
            <Box sx={{ mt: 2 }}>
              <Autocomplete
                onLoad={(ref) => setDropRef(ref)}
                onPlaceChanged={() => handlePlaceSelect(dropRef.getPlace(), 'drop')}
              >
                <TextField
                  label="Drop Location"
                  name="drop"
                  value={formData.drop}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Autocomplete>
            </Box>

            <TextField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
              multiline
              rows={4}
            />


            {/* User Type Dropdown */}
            <Box sx={{ mt: 2 }}>
              <Select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                required
                fullWidth
                displayEmpty
              >
                <MenuItem value="" disabled>
                  User Type
                </MenuItem>
                <MenuItem value="1">Customer</MenuItem>
                <MenuItem value="2">Driver</MenuItem>
                {/* <MenuItem value="3">Vendor</MenuItem> */}
              </Select>
            </Box>

            {/* Conditional Mobile Number Field */}

            <Box sx={{ mt: 2 }}>
              <TextField
                label="Mobile Number"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                fullWidth
              />
            </Box>

            {/* File Upload */}
            {/* <Box sx={{ mt: 2 }}>
            <Button variant="outlined" component="label">
              Upload Image
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>
          </Box> */}

            <Button sx={{ mt: 3 }} variant="contained" color="primary" type="submit">
              Submit
            </Button>

            {/* Snackbar for Errors */}
            <Snackbar
              open={!!errorMessage}
              autoHideDuration={3000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <MuiAlert
                elevation={6}
                variant="filled"
                onClose={handleCloseSnackbar}
                severity="error"
              >
                {errorMessage}
              </MuiAlert>
            </Snackbar>

            {/* Snackbar for Success */}
            <Snackbar
              open={!!successMessage}
              autoHideDuration={3000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <MuiAlert
                elevation={6}
                variant="filled"
                onClose={handleCloseSnackbar}
                severity="success"
              >
                {successMessage}
              </MuiAlert>
            </Snackbar>
          </form>
        </CardContent>
      </LoadScript>

    </Card>
  );
};

export default AddNotification;

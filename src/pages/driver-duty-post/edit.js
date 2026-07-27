import { useCallback, useEffect, useRef, useState } from 'react';

// ** MUI Imports
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useRouter } from 'next/router';
import { Autocomplete, LoadScript } from '@react-google-maps/api';
import dayjs from 'dayjs';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const EditDriverPost = () => {
  const router = useRouter();
  const { id } = router.query;
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    mobile: '',
    pick_lat: '',
    pick_lng: '',
    drop_lat: '',
    drop_lng: '',
    pick_address: '',
    drop_address: '',
    vehicle_type: '',
    total_price: '',
    commission: '',
    driver_earning: '',
    pickup_date: '',
    distance: '',
    duration: '',
  });

  const [vehicleCategories, setVehicleCategories] = useState([]);

  useEffect(() => {
    fetchVehicleCategories();
  }, []);

  const fetchVehicleCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/get-vehicle-categories`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setVehicleCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching vehicle categories:', error);
    }
  };
    
  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/getSelfPostById/${id}`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        const data = await res.json();
        if (data.success && data.data) {
          const trip = data.data;

          const totalPriceVal = trip.total_price || '';
          const commissionVal = trip.commission || '';
          
          let calculatedEarning = '';
          if (totalPriceVal !== '' && commissionVal !== '') {
            const tp = parseFloat(totalPriceVal) || 0;
            const com = parseFloat(commissionVal) || 0;
            calculatedEarning = com > tp ? 0 : Math.max(0, tp - com);
          } else if (trip.driver_earning !== undefined && trip.driver_earning !== null) {
            calculatedEarning = trip.driver_earning;
          }

          setFormData({
            title: trip.title || '',
            message: trip.message || '',
            mobile: trip.mobile || '',
            pick_lat: trip.pick_lat || '',
            pick_lng: trip.pick_lng || '',
            drop_lat: trip.drop_lat || '',
            drop_lng: trip.drop_lng || '',
            pick_address: trip.pick_address || '',
            drop_address: trip.drop_address || '',
            vehicle_type: trip.vehicle_type || '',
            total_price: totalPriceVal,
            commission: commissionVal > totalPriceVal ? totalPriceVal : commissionVal,
            driver_earning: calculatedEarning,
            pickup_date: trip.pickup_date ? dayjs(trip.pickup_date).format("YYYY-MM-DDTHH:mm") : '',
            distance: trip.distance || '',
            duration: trip.duration || '',
          });
        } else {
          setErrorMessage(data.message || 'Failed to load booking details');
        }
      } catch (err) {
        console.error(err);
        setErrorMessage('Error loading booking details');
      }
    };

    fetchBooking();
  }, [id]);

  const handleCloseSnackbar = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    
    setFormData((prev) => {
      let updatedValue = type === 'checkbox' ? checked : value;
      let updatedTotal = prev.total_price;
      let updatedComm = prev.commission;

      if (name === 'total_price') {
        updatedTotal = updatedValue;
        if (updatedValue !== '' && updatedComm !== '') {
          const tp = parseFloat(updatedValue) || 0;
          let com = parseFloat(updatedComm) || 0;
          if (com > tp) {
            updatedComm = updatedValue;
          }
        }
      } else if (name === 'commission') {
        if (updatedValue !== '' && updatedTotal !== '') {
          const tp = parseFloat(updatedTotal) || 0;
          let com = parseFloat(updatedValue) || 0;
          if (com > tp) {
            updatedValue = updatedTotal;
          }
        }
        updatedComm = updatedValue;
      }

      const tpNum = parseFloat(name === 'total_price' ? updatedTotal : prev.total_price) || 0;
      const comNum = parseFloat(name === 'commission' ? updatedComm : prev.commission) || 0;
      
      const newDriverEarning = (updatedTotal !== '' && updatedComm !== '') 
        ? Math.max(0, tpNum - comNum) 
        : prev.driver_earning;

      return {
        ...prev,
        [name]: updatedValue,
        ...(name === 'total_price' || name === 'commission' ? { 
            commission: updatedComm, 
            driver_earning: newDriverEarning 
        } : {})
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/updateSelfPostData/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      if (data.success) {
        setSuccessMessage(data.message);
        setTimeout(() => router.push('/driver-duty-post'), 1000);
      } else {
        setErrorMessage(data.message);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  const [pickupRef, setPickupRef] = useState(null);
  const [dropRef, setDropRef] = useState(null);

  const handlePlaceSelect = async (place, fieldName) => {
    if (!place?.geometry) return;
    const location = place.formatted_address || place.name;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    const updated = {
      ...formData,
      [fieldName]: location,
      [`${fieldName === 'pick_address' ? 'pick' : 'drop'}_lat`]: lat,
      [`${fieldName === 'pick_address' ? 'pick' : 'drop'}_lng`]: lng,
    };

    setFormData(updated);

    const pickLat = fieldName === 'pick_address' ? lat : formData.pick_lat;
    const pickLng = fieldName === 'pick_address' ? lng : formData.pick_lng;
    const dropLat = fieldName === 'drop_address' ? lat : formData.drop_lat;
    const dropLng = fieldName === 'drop_address' ? lng : formData.drop_lng;

    if (pickLat && pickLng && dropLat && dropLng && window.google) {
      const service = new window.google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [{ lat: parseFloat(pickLat), lng: parseFloat(pickLng) }],
          destinations: [
            { lat: parseFloat(dropLat), lng: parseFloat(dropLng) },
          ],
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
        },
        (res, status) => {
          if (status === 'OK') {
            const element = res.rows[0].elements[0];
            if (element.status === 'OK') {
              setFormData((prev) => ({
                ...prev,
                distance: element.distance.text,
                duration: element.duration.text,
              }));
            }
          }
        }
      );
    }
  };

  return (
    <Card>
      <LoadScript
        googleMapsApiKey="AIzaSyA3GfFqfSjITAXoeaK_kDce__LJa8iCK7M"
        libraries={['places', 'drawing']}
      >
        <CardContent>
          <Grid container spacing={6}>
            <Grid item xs={6}>
              <Typography variant="h6">Edit Driver Duty</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Button variant="contained" onClick={() => router.push('/advanceBooking')}>
                Back
              </Button>
            </Grid>
          </Grid>

          <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
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

            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Autocomplete
                    onLoad={(ref) => setPickupRef(ref)}
                    onPlaceChanged={() => handlePlaceSelect(pickupRef.getPlace(), 'pick_address')}
                  >
                    <TextField
                      label="Pick Address"
                      name="pick_address"
                      value={formData.pick_address}
                      onChange={handleChange}
                      required
                      fullWidth
                    />
                  </Autocomplete>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Autocomplete
                    onLoad={(ref) => setDropRef(ref)}
                    onPlaceChanged={() => handlePlaceSelect(dropRef.getPlace(), 'drop_address')}
                  >
                    <TextField
                      label="Drop Address"
                      name="drop_address"
                      value={formData.drop_address}
                      onChange={handleChange}
                      required
                      fullWidth
                    />
                  </Autocomplete>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Distance"
                    name="distance"
                    value={formData.distance}
                    fullWidth
                    disabled
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Duration"
                    name="duration"
                    disabled
                    value={formData.duration}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Pickup Date"
                    name="pickup_date"
                    type="datetime-local"
                    value={formData.pickup_date}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Total Price"
                    name="total_price"
                    type="number"
                    value={formData.total_price}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Commission"
                    name="commission"
                    type="number"
                    value={formData.commission}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Driver Earning"
                    disabled
                    name="driver_earning"
                    type="number"
                    value={formData.driver_earning}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Vehicle Type</InputLabel>
                    <Select
                      name="vehicle_type"
                      value={formData.vehicle_type}
                      label="Vehicle Type"
                      onChange={handleChange}
                    >
                      {vehicleCategories.map(v => (
                        (v.vehicle_type != 'Bike' && v.vehicle_type != 'AUTO' && v.vehicle_type != 'HatchBack') &&
                        <MenuItem key={v.id} value={v.id}>
                          {v.vehicle_type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Button sx={{ mt: 3 }} variant="contained" color="primary" type="submit">
              Update
            </Button>

            <Snackbar open={!!errorMessage} autoHideDuration={3000} onClose={handleCloseSnackbar}>
              <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="error">
                {errorMessage}
              </MuiAlert>
            </Snackbar>

            <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={handleCloseSnackbar}>
              <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="success">
                {successMessage}
              </MuiAlert>
            </Snackbar>
          </form>
        </CardContent>
      </LoadScript>
    </Card>
  );
};

export default EditDriverPost;
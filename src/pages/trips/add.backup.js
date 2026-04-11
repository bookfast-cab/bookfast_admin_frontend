import { useCallback, useEffect, useRef, useState } from 'react';

// MUI Imports
import {
  Box, Card, Grid, Button, TextField,
  Typography, CardContent, Select, MenuItem,
  Snackbar, Divider
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { useRouter } from 'next/router';
import { Autocomplete, LoadScript } from '@react-google-maps/api';
import { FormControl, InputLabel, FormHelperText } from '@mui/material';
import CustomerSearchDrawer from '../customers/CustomerSearchDrawer';
import CommonDatePicker from 'src/components/CommonDatePicker';
import PersonIcon from '@mui/icons-material/Person'; // or use ExpandMore, Search, etc.

import dayjs from 'dayjs';

const AddMenualTrip = () => {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [vehicleList, setVehicleList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false);
  const [data, setData] = useState(null)
  const [tripDate, settripDate] = useState(dayjs());

  const [formErrors, setFormErrors] = useState({
    customerId: '',
    pickup: '',
    pickupLat: '',
    pickupLng: '',
    drop: '',
    dropLat: '',
    dropLng: '',
    trip_sub_type: '1',
    vehicle_type: '',
  });

  const [formData, setFormData] = useState({
    customerId: '', // ← add this
    pickup: '',
    pickupLat: '',
    pickupLng: '',
    drop: '',
    dropLat: '',
    dropLng: '',
    tripType: '',
    trip_sub_type: '1',
    vehicle_type: 1,
    couponCode: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_API_URL}customers/checkFareAdmin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {

        setData(data.data)

        //setSuccessMessage(data.message || 'Trip added successfully!');
        // setTimeout(() => {
        //   //router.push('/trips');
        // }, 1000);

      } else {
        setErrorMessage(data.message || 'Failed to add trip');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  useEffect(() => {

    getoutstationConfig();

  }, [token]);

  const getoutstationConfig = () => {

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/outstation-packageConfig`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }

        return response.json();
      })
      .then((result) => {
        let data = result.data;

        setVehicleList(data.vehicleList);
      })
      .catch((error) => {
        setErrorMessage('Failed to fetch app version data.');
        console.error(error);
      })
      .finally(() => {

      });
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



  const [errorMessageTrip, setErrorMessageTrip] = useState('');

 const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};


  const confirmTrip = async () => {
    if (!data) return;

const { gst, couponData, ...dataWithoutGstAndCoupon } = data;

   const payload = {
  ...dataWithoutGstAndCoupon,
  tripDate: formatDate(tripDate),
  pickupLat: formData.pickupLat,
  pickupLng: formData.pickupLng,
  dropLat: formData.dropLat,
  dropLng: formData.dropLng,
  customerId:formData.customerId
};

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_API_URL}customers/confirmBookingAdmin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(data.message);
        setTimeout(() => {
          router.push('/trips');
        }, 5000);
      } else {
        setErrorMessage(result.message || 'Failed to create trip');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  return (
    <Card>
      <LoadScript
        googleMapsApiKey={'AIzaSyA3GfFqfSjITAXoeaK_kDce__LJa8iCK7M'}
        libraries={['places']}
      >
        <CardContent>
          <Typography variant="h6" sx={{ mb: 4 }}>
            Add Manual Trip
          </Typography>

          <Grid container spacing={6}>
            {/* LEFT COLUMN - Trip Form */}
            <Grid item xs={12} md={5}>
              <form onSubmit={handleSubmit}>
                <Button
                  variant="outlined"
                  startIcon={<PersonIcon />}
                  onClick={() => setCustomerDrawerOpen(true)}
                  sx={{ marginBottom: 2 }}
                >
                  Select Customer
                </Button>
                {selectedCustomer && (
                  <Box sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Customer Details:</Typography>
                    <Typography variant="body2"><strong>Name:</strong> {selectedCustomer.first_name}</Typography>
                    <Typography variant="body2"><strong>Phone:</strong> {selectedCustomer.phone_number}</Typography>
                    <Typography variant="body2"><strong>Email:</strong> {selectedCustomer.email}</Typography>
                  </Box>
                )}
                <Box sx={{ mb: 2 }}>
                  <Autocomplete
                    onLoad={setPickupRef}
                    onPlaceChanged={() =>
                      handlePlaceSelect(pickupRef.getPlace(), 'pickup')
                    }
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

                <Box sx={{ mb: 2 }}>
                  <Autocomplete
                    onLoad={setDropRef}
                    onPlaceChanged={() =>
                      handlePlaceSelect(dropRef.getPlace(), 'drop')
                    }
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

                <Box sx={{ mb: 2 }}>
                  <FormControl fullWidth variant="outlined" error={!!formErrors.vehicle_type}>
                    <InputLabel id="vehicle-type-label">Vehicle Type</InputLabel>
                    <Select
                      labelId="vehicle-type-label"
                      name="vehicle_type"
                      value={formData.vehicle_type}
                      onChange={handleChange}
                      label="Vehicle Type"
                      displayEmpty
                    >
                      <MenuItem value="">Select Vehicle Type</MenuItem>
                      {vehicleList.map((vehicle) => (
                        <MenuItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.vehicle_type}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.vehicle_type && (
                      <FormHelperText>{formErrors.vehicle_type}</FormHelperText>
                    )}
                  </FormControl>
                </Box>


                <Box sx={{ mb: 2 }}>
                  <TextField
                    label="Coupon Code (Optional)"
                    name="couponCode"
                    value={formData.couponCode}
                    onChange={handleChange}
                    fullWidth
                  />
                </Box>

                <Button variant="contained" color="primary" type="submit">
                  Submit
                </Button>
              </form>
            </Grid>

            {/* RIGHT COLUMN - Trip Preview or Result */}

            <Grid item xs={12} md={7}>
              <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Trip Preview
                </Typography>

                {data ? (
                  <>
                    <Typography><strong>Pick Address:</strong> {data.pickAddress}</Typography>
                    <Typography><strong>Drop Address:</strong> {data.dropAddress}</Typography>
                    <Divider sx={{ my: 2 }} />

                    <Typography><strong>Base Fare:</strong> ₹{data.base_fare}</Typography>
                    <Typography><strong>Additional Fare:</strong> ₹{data.additional_fare}</Typography>
                    <Typography><strong>Driver Allowance:</strong> ₹{data.driverAllowance}</Typography>
                    <Typography><strong>Tax:</strong> ₹{data.tax}</Typography>
                    <Typography><strong>Toll Tax:</strong> ₹{data.tollTax}</Typography>
                    <Typography><strong>Discount:</strong> ₹{data.discount}</Typography>
                    <Typography><strong>GST:</strong> {data.gst?.title} (₹{data.gst?.amount})</Typography>
                    <Divider sx={{ my: 2 }} />

                    <Typography><strong>Price Per KM:</strong> ₹{data.price_per_km}</Typography>
                    <Typography><strong>Total KM:</strong> {data.km} km</Typography>
                    <Typography><strong>Trip Type:</strong> {data.trip_type}</Typography>
                    <Typography><strong>Trip Sub Type:</strong> {data.trip_sub_type}</Typography>
                    <Divider sx={{ my: 2 }} />

                    {/* DATE PICKER */}


                    {/* TOTAL FARE */}
                    <Typography variant="h6" sx={{ mt: 3 }}>
                      Total Fare: ₹{data.total_fare}
                    </Typography>
                    <CommonDatePicker
                      type="datetime"
                      label="Select Date & Time"
                      value={tripDate}
                      onChange={settripDate}
                    />
                    {/* SUBMIT BUTTON */}
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={confirmTrip}
                    >
                      Create Trip
                    </Button>

                    {errorMessage && (
                      <Typography color="error" sx={{ mt: 1 }}>
                        {errorMessage}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography color="text.secondary">No data available</Typography>
                )}
              </Box>
            </Grid>


          </Grid>

          {/* Snackbar Notifications */}
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
          <CustomerSearchDrawer
            open={customerDrawerOpen}
            onClose={() => setCustomerDrawerOpen(false)}
            onSelectCustomer={(customer) => {
              setSelectedCustomer(customer);
              setFormData(prev => ({ ...prev, customerId: customer.id }));
            }}
          />
        </CardContent>
      </LoadScript>
    </Card>
  );

};

export default AddMenualTrip;

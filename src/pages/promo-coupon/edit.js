"use client";
import { useEffect, useState } from 'react';
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
import { Edit } from '@mui/icons-material';
import { FormControl, FormHelperText, InputLabel } from '@mui/material';

const EditDailyFareManagement = () => {
  
  const router = useRouter();
  const { id } = router.query;
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicleList, setVehicleList] = useState([]);

  const [formErrors, setFormErrors] = useState({
    country_id: 2,
    vehicle_type: '',
    base_fare: '',
    price_per_km: '',
    price_per_min: '',
    waiting_time_charge: '',
    cancellation_charge: '',
    status: '',
  });

  const [formData, setFormData] = useState({
    country_id: 2,
    vehicle_type: '',
    base_fare: '',
    price_per_km: '',
    price_per_min: '',
    waiting_time_charge: '',
    cancellation_charge: '',
    status: '',
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const handleCloseSnackbar = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  useEffect(() => {
    getoutstationConfig();
  }, [token]);


  useEffect(() => {

    getoutstation();

  }, [token]);

  const getoutstation = () => {



    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/daily-fare-management/${id}`, {
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

        setFormData({
          country_id: data.country_id || 2,
          vehicle_type: data.vehicle?.id?.toString() || '',
          base_fare: data.base_fare?.toString() || '',
          price_per_km: data.price_per_km?.toString() || '',
          price_per_min: data.price_per_min?.toString() || '',
          waiting_time_charge: data.waiting_time_charge?.toString() || '',
          cancellation_charge: data.cancellation_charge?.toString() || '',
          status: data.status?.toString() || '',
        });
        
       // setVehicleList(data.vehicleList ? data.vehicleList : []);
      })
      .catch((error) => {
        setErrorMessage('Failed to fetch app version data.');
        console.error(error);
      })
      .finally(() => {

      });
  };

  const validateForm = () => {
    let errors = {};
    let formIsValid = true;

    if (!formData.vehicle_type) {
      formIsValid = false;
      errors.vehicle_type = 'Vehicle type is required.';
    }

    if (!formData.base_fare || isNaN(formData.base_fare) || parseFloat(formData.base_fare) <= 0) {
      formIsValid = false;
      errors.base_fare = 'Base fare is required and should be a positive number.';
    }

    if (!formData.price_per_km || isNaN(formData.price_per_km) || parseFloat(formData.price_per_km) <= 0) {
      formIsValid = false;
      errors.price_per_km = 'Price per km is required and should be a positive number.';
    }

    if (!formData.price_per_min || isNaN(formData.price_per_min) || parseFloat(formData.price_per_min) <= 0) {
      formIsValid = false;
      errors.price_per_min = 'Price per minute is required and should be a positive number.';
    }

    if (!formData.waiting_time_charge || isNaN(formData.waiting_time_charge) || parseFloat(formData.waiting_time_charge) <= 0) {
      formIsValid = false;
      errors.waiting_time_charge = 'Waiting time charge is required and should be a positive number.';
    }

    if (!formData.cancellation_charge || isNaN(formData.cancellation_charge) || parseFloat(formData.cancellation_charge) <= 0) {
      formIsValid = false;
      errors.cancellation_charge = 'Cancellation charge is required and should be a positive number.';
    }

    if (!formData.status) {
      formIsValid = false;
      errors.status = 'Status is required.';
    }

    setFormErrors(errors);

    return formIsValid;
  };


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
  
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {

      return; // Stop the form submission if validation fails
    }
    setLoading(true);
    try {
      const formParams = new URLSearchParams({

        country_id: 2,
        vehicle_type: formData.vehicle_type,
        base_fare: formData.base_fare,
        price_per_km: formData.price_per_km,
        price_per_min: formData.price_per_min,
        waiting_time_charge: formData.waiting_time_charge,
        cancellation_charge: formData.cancellation_charge,
        status: formData.status,

      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/daily-fare-management/${id}`, {
        method: 'put',
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formParams.toString(),
      });

      const data = await response.json();


      if (data.success) {
        setSuccessMessage(data.message);
        setTimeout(() => {
          router.push('/daily-fare-management');
        }, 1000);
      } else {
        setErrorMessage(data.message);
      }

    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          <Grid item xs={6}>
            <Typography variant="h6">{'Daily Fare Management'}</Typography>
          </Grid>
          <Grid item xs={6} style={{ textAlign: 'right' }}>
            <Button variant="contained" onClick={() => router.push('/daily-fare-management')}>
              Back
            </Button>
          </Grid>
        </Grid>

        <form onSubmit={handleSubmit}>

{/* Vehicle Type */}
<Grid item xs={12} md={6}>
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
      <MenuItem value="0" >Select Vehicle Type</MenuItem>
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
</Grid>


{/* Base Fare */}
<TextField
  label="Base Fare"
  name="base_fare"
  value={formData.base_fare}
  onChange={handleChange}
  fullWidth
  margin="normal"
  error={!!formErrors.base_fare}
  helperText={formErrors.base_fare}
/>

{/* Price per km */}
<TextField
  label="Price per km"
  name="price_per_km"
  value={formData.price_per_km}
  onChange={handleChange}
  fullWidth
  margin="normal"
  error={!!formErrors.price_per_km}
  helperText={formErrors.price_per_km}
/>

{/* Price per minute */}

<TextField
  label="Price per minutes"
  name="price_per_min"
  value={formData.price_per_min}
  onChange={handleChange}
  fullWidth
  margin="normal"
  error={!!formErrors.price_per_min}
  helperText={formErrors.price_per_min}
/>

{/* Waiting Time Charges */}
<TextField
  label="Waiting Time Charges"
  name="waiting_time_charge"
  value={formData.waiting_time_charge}
  onChange={handleChange}
  fullWidth
  margin="normal"
  error={!!formErrors.waiting_time_charge}
  helperText={formErrors.waiting_time_charge}
/>

{/* Cancellation Charges */}
<TextField
  label="Cancellation Charges"
  name="cancellation_charge"
  value={formData.cancellation_charge}
  onChange={handleChange}
  fullWidth
  margin="normal"
  error={!!formErrors.cancellation_charge}
  helperText={formErrors.cancellation_charge}
/>

{/* Status */}
<Box>
  <Select
    name="status"
    value={formData.status}
    onChange={handleChange}
    required
    fullWidth
    displayEmpty
    error={!!formErrors.status}
  >
    <MenuItem value="" disabled>Status</MenuItem>
    <MenuItem value="1">Active</MenuItem>
    <MenuItem value="0">Inactive</MenuItem>
  </Select>

  {formErrors.status && (
    <FormHelperText error>{formErrors.status}</FormHelperText>
  )}
</Box>

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
    </Card>
  );
};

export default EditDailyFareManagement;

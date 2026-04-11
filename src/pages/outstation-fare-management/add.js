"use client";
import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CardContent from '@mui/material/CardContent';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useRouter } from 'next/router';
import { Box, Select, MenuItem, Typography, InputLabel, FormHelperText } from "@mui/material";

const AddOuStationFare = () => {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicleList, setVehicleList] = useState([]);
  const [pickDropList, setPickDropList] = useState([]);

  const [formErrors, setFormErrors] = useState({
    vehicle_type: '',
    trip_sub_type: '',
    base_fare: '',
    per_km_rs: '',
    driver_allowance: '',
  });

  const [formData, setFormData] = useState({
    vehicle_type: '',
    trip_sub_type: '',
    base_fare: '',
    per_km_rs: 0,
    driver_allowance: '',
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

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
        setPickDropList(data.pickDropList);
        setVehicleList(data.vehicleList);
      })
      .catch((error) => {
        setErrorMessage('Failed to fetch app version data.');
        console.error(error);
      })
      .finally(() => {

      });
  };

  const handleCloseSnackbar = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const validateForm = () => {
    let errors = {};
    let formIsValid = true;


    if (!formData.vehicle_type) {
      formIsValid = false;
      errors.vehicle_type = 'Vehicle type is required.';
    }

    if (!formData.trip_sub_type) {
      formIsValid = false;
      errors.trip_sub_type = 'Trip sub type is required.';
    }
    if (!formData.base_fare || isNaN(formData.base_fare) || parseFloat(formData.base_fare) <= 0) {
      formIsValid = false;
      errors.base_fare = 'Base fare is required and should be a positive number.';
    }
    if (!formData.per_km_rs || isNaN(formData.per_km_rs) || parseFloat(formData.per_km_rs) <= 0) {
      formIsValid = false;
      errors.per_km_rs = 'Price per km is required and should be a positive number.';
    }

    if (!formData.driver_allowance || isNaN(formData.driver_allowance) || parseFloat(formData.driver_allowance) <= 0) {
      formIsValid = false;
      errors.driver_allowance = 'Driver allowance is required and should be a positive number.';
    }

    setFormErrors(errors);

    return formIsValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {

      return; // Stop the form submission if validation fails
    }
    setLoading(true);

    try {
      const formParams = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        formParams.append(key, value);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/fare-outstation-management`, {
        method: 'post',
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
          router.push('/fare-outstation-management');
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
            <Typography variant="h6">{'Outstation Fare Management'}</Typography>
          </Grid>
          <Grid item xs={6} style={{ textAlign: 'right' }}>
            <Button variant="contained" onClick={() => router.push('/outstation-package')}>
              Back
            </Button>
          </Grid>
        </Grid>

        <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>



          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", marginTop: "15px", marginBottom: "15px" }}>

            {/* Vehicle Type */}
            <Box sx={{ flex: 1 }}>
              <InputLabel id="vehicle-type-label">Vehicle Type</InputLabel>
              <Select
                labelId="vehicle-type-label"
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleChange}
                fullWidth
                displayEmpty
              >
                <MenuItem value="" disabled>Select Vehicle Type</MenuItem>
                {vehicleList.map((vehicle) => (
                  <MenuItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.vehicle_type}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.vehicle_type && (
                <FormHelperText error>{formErrors.vehicle_type}</FormHelperText>
              )}
            </Box>


            {/* Trip Sub Type */}
            <Box sx={{ flex: 1 }}>
              <InputLabel id="trip-sub-type-label">Trip Sub Type</InputLabel>
              <Select
                labelId="trip-sub-type-label"
                name="trip_sub_type"
                value={formData.trip_sub_type}
                onChange={handleChange}
                fullWidth
                displayEmpty
              >
                <MenuItem value="" disabled>Select Trip Sub Type</MenuItem>
                <MenuItem value="1">One Way</MenuItem>
                <MenuItem value="2">Round Trip</MenuItem>
              </Select>
              {formErrors.trip_sub_type && (
                <FormHelperText error>{formErrors.trip_sub_type}</FormHelperText>
              )}
            </Box>
          </Box>


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
          <TextField
            label="Price per km"
            name="per_km_rs"
            value={formData.per_km_rs}
            onChange={handleChange}

            fullWidth
            margin="normal"
            error={!!formErrors.per_km_rs}
            helperText={formErrors.per_km_rs}
          />
          {/* <TextField
            label="Price per minutes"
            name="per_minute_charge"
            value={formData.per_minute_charge}
            onChange={handleChange}

            fullWidth
            margin="normal"
            error={!!formErrors.per_minute_charge}
            helperText={formErrors.per_minute_charge}
          /> */}
          {/* <TextField
            label="Waiting Time Charges"
            name="waiting_time_charges"
            value={formData.waiting_time_charges}
            onChange={handleChange}

            fullWidth
            margin="normal"
            error={!!formErrors.waiting_time_charges}
            helperText={formErrors.waiting_time_charges}
          /> */}
          {/* <TextField
            label="After Limit km Charge"
            name="after_limit_km_charge"
            value={formData.after_limit_km_charge}
            onChange={handleChange}

            fullWidth
            margin="normal"
            error={!!formErrors.after_limit_km_charge}
            helperText={formErrors.after_limit_km_charge}
          /> */}

          {/* <TextField
            label="Total KM Limit"
            name="total_km_limit"
            value={formData.total_km_limit}
            onChange={handleChange}

            fullWidth
            margin="normal"
            error={!!formErrors.total_km_limit}
            helperText={formErrors.total_km_limit}
          /> */}
          {/* <TextField
            label="Total Minutes Limit"
            name="total_minutes_limit"
            value={formData.total_minutes_limit}
            onChange={handleChange}

            fullWidth
            margin="normal"
            error={!!formErrors.total_minutes_limit}
            helperText={formErrors.total_minutes_limit}
          /> */}

          <TextField
            label="Driver Allowance"
            name="driver_allowance"
            value={formData.driver_allowance}
            onChange={handleChange}

            fullWidth
            margin="normal"
            error={!!formErrors.driver_allowance}
            helperText={formErrors.driver_allowance}
          />

          {/* <TextField
            label="Driver Night Charge"
            name="driver_night_charge"
            value={formData.driver_night_charge}
            onChange={handleChange}

            fullWidth
            margin="normal"
            error={!!formErrors.driver_night_charge}
            helperText={formErrors.driver_night_charge}
          /> */}
          {/* <TextField
            label="Total Tax"
            name="total_tax"
            value={formData.total_tax}
            onChange={handleChange}

            fullWidth
            margin="normal"
            error={!!formErrors.total_tax}
            helperText={formErrors.total_tax}
          />
          <TextField
            label="Other Charge"
            name="other_charge"
            value={formData.other_charge}
            onChange={handleChange}

            fullWidth
            margin="normal"
            error={!!formErrors.other_charge}

          /> */}

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

export default AddOuStationFare;

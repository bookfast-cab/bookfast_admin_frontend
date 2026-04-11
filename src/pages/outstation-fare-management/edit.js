"use client";
import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useRouter } from 'next/router';
import { Box, FormControl, InputLabel, MenuItem, Select, FormHelperText } from "@mui/material";

const AddOuStationFareManagement = () => {
  const router = useRouter();

  const { id } = router.query;
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicleList, setVehicleList] = useState([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const [formErrors, setFormErrors] = useState({
    vehicle_type: '',
    trip_sub_type_id: '',
    base_fare: '',
    price_per_km: '',
    driver_allowance: '',

  });

  const [formData, setFormData] = useState({

    vehicle_type: '',
    trip_sub_type_id: '',
    base_fare: '',
    price_per_km: 0,
    driver_allowance: '',
  });

  useEffect(() => {

    getoutstation();

  }, [token]);

  const getoutstation = () => {



    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/fare-outstation-management/${id}`, {
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
          vehicle_type: data.vehicle?.id || '',
          trip_sub_type_id: data.trip_sub_type_id?.toString() || '',
          base_fare: data.base_fare?.toString() || '',
          price_per_km: data.price_per_km?.toString() || '',
          driver_allowance: data.driver_allowance?.toString() || '',
        });
        setVehicleList(data.vehicleList ? data.vehicleList : []);
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

    // if (!formData.name) {
    //   formIsValid = false;
    //   errors.name = 'Name is required.';
    // }
  
    if (!formData.vehicle_type) {
      formIsValid = false;
      errors.vehicle_type = 'Vehicle type is required.';
    }

    // if (!formData.waiting_time_charges) {
    //   formIsValid = false;
    //   errors.waiting_time_charges = 'Waiting time charges is required.';
    // }

    if (!formData.trip_sub_type_id) {
      formIsValid = false;
      errors.trip_sub_type_id = 'Trip sub type is required.';
    }
    if (!formData.base_fare || isNaN(formData.base_fare) || parseFloat(formData.base_fare) <= 0) {
      formIsValid = false;
      errors.base_fare = 'Base fare is required and should be a positive number.';
    }

    // if (!formData.price_per_km || isNaN(formData.price_per_km) || parseFloat(formData.price_per_km) <= 0) {
    //   formIsValid = false;
    //   errors.price_per_km = 'Price per km is required and should be a positive number.';
    // }
    // if (!formData.total_km_limit || isNaN(formData.total_km_limit) || parseFloat(formData.total_km_limit) <= 0) {
    //   formIsValid = false;
    //   errors.total_km_limit = 'Total km limit is required and should be a positive number.';
    // }
    // if (!formData.per_minute_charge || isNaN(formData.per_minute_charge) || parseFloat(formData.per_minute_charge) <= 0) {
    //   formIsValid = false;
    //   errors.per_minute_charge = 'Price per minute is required and should be a positive number.';
    // }
    // if (!formData.total_minutes_limit || isNaN(formData.total_minutes_limit) || parseFloat(formData.total_minutes_limit) <= 0) {
    //   formIsValid = false;
    //   errors.total_minutes_limit = 'Total minutes limit is required and should be a positive number.';
    // }
    // if (!formData.after_limit_km_charge || isNaN(formData.after_limit_km_charge) || parseFloat(formData.after_limit_km_charge) <= 0) {
    //   formIsValid = false;
    //   errors.after_limit_km_charge = 'After limit km charge is required and should be a positive number.';
    // }
    if (!formData.driver_allowance || isNaN(formData.driver_allowance) || parseFloat(formData.driver_allowance) <= 0) {
      formIsValid = false;
      errors.driver_allowance = 'Driver allowance is required and should be a positive number.';
    }

    // if (!formData.driver_night_charge || isNaN(formData.driver_night_charge) || parseFloat(formData.driver_night_charge) <= 0) {
    //   formIsValid = false;
    //   errors.driver_night_charge = 'Driver night charge is required and should be a positive number.';
    // }
    // if (!formData.total_tax || isNaN(formData.total_tax) || parseFloat(formData.total_tax) <= 0) {
    //   formIsValid = false;
    //   errors.total_tax = 'Total tax is required and should be a positive number.';
    // }

    // if (!formData.other_charge || isNaN(formData.other_charge) || parseFloat(formData.other_charge) <= 0) {
    //   formIsValid = false;
    //   errors.other_charge = 'Other charge is required and should be a positive number.';
    // }

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/fare-outstation-management/${id}`, {
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
          router.push('/outstation-fare-management');
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
            <Typography variant="h6">{'OutstationPackage'}</Typography>
          </Grid>
          <Grid item xs={6} style={{ textAlign: 'right' }}>
            <Button variant="contained" onClick={() => router.push('/outstation-package')}>
              Back
            </Button>
          </Grid>
        </Grid>

        <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>



          <Box sx={{ display: "flex", gap: 2, marginTop: "15px", marginBottom: "15px" }}>

            {/* Vehicle Type */}
            <FormControl fullWidth error={!!formErrors.vehicle_type}>
              <InputLabel id="vehicle-type-label">Vehicle Type</InputLabel>
              <Select
                labelId="vehicle-type-label"
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleChange}
                label="Vehicle Type"
                displayEmpty
              >
                <MenuItem value="">
                  <em>Select Vehicle Type</em>
                </MenuItem>
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
            <FormControl fullWidth error={!!formErrors.trip_sub_type_id}>
              <InputLabel id="trip-sub-type-label">Trip Sub Type</InputLabel>
              <Select
                labelId="trip-sub-type-label"
                name="trip_sub_type_id"
                value={formData.trip_sub_type_id}
                onChange={handleChange}
                label="Trip Sub Type"
                displayEmpty
              >
                <MenuItem value="">
                  <em>Select Trip Sub Type</em>
                </MenuItem>
                <MenuItem value="1">One Way</MenuItem>
                <MenuItem value="2">Round Trip</MenuItem>
              </Select>
              {formErrors.trip_sub_type_id && (
                <FormHelperText>{formErrors.trip_sub_type_id}</FormHelperText>
              )}
            </FormControl>
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
            name="price_per_km"
            value={formData.price_per_km}
            onChange={handleChange}

            fullWidth
            margin="normal"
            error={!!formErrors.price_per_km}
            helperText={formErrors.price_per_km}
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
          /> */}
          {/* <TextField
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

export default AddOuStationFareManagement;

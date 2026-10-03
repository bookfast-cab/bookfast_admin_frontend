"use client";
import { useEffect, useState, useRef } from 'react';
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

const EditVehicleCategory = () => {
  const router = useRouter();
  const { id } = router.query;
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    vehicle_type: '',
    vehicle_mode: '1',
    status: '1',
    base_fare: '',
    price_per_km: '',
    description: '',
    vehicle_type_ar: '',
    description_ar: '',
  });



  useEffect(() => {
    if (id && token) {
      getVehicleCategory();
    }
  }, [id, token]);

  const getVehicleCategory = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/vehicle-category/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to fetch data. Status: ${response.status}`);
        return response.json();
      })
      .then((result) => {
        let data = result.data;
        if (data) {
          setFormData({
            vehicle_type: data.vehicle_type || '',
            vehicle_mode: data.vehicle_mode?.toString() || '1',
            status: data.status?.toString() || '1',
            base_fare: data.base_fare?.toString() || '',
            price_per_km: data.price_per_km?.toString() || '',
            description: data.description || '',
            vehicle_type_ar: data.vehicle_type_ar || '',
            description_ar: data.description_ar || '',
          });
        }
      })
      .catch((error) => {
        setErrorMessage('Failed to fetch vehicle category data.');
        console.error(error);
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

    if (!formData.vehicle_type) { formIsValid = false; errors.vehicle_type = 'Vehicle type is required.'; }
    if (!formData.vehicle_mode) { formIsValid = false; errors.vehicle_mode = 'Vehicle mode is required.'; }
    if (!formData.base_fare || isNaN(formData.base_fare)) { formIsValid = false; errors.base_fare = 'Base fare must be a valid number.'; }
    if (!formData.price_per_km || isNaN(formData.price_per_km)) { formIsValid = false; errors.price_per_km = 'Price per km must be a valid number.'; }
    if (!formData.description) { formIsValid = false; errors.description = 'Description is required.'; }

    setFormErrors(errors);
    return formIsValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/edit-vehicle-category/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();

      if (resData.success) {
        setSuccessMessage(resData.message || 'Vehicle category updated successfully');
        setTimeout(() => {
          router.push('/vehicle-category');
        }, 1000);
      } else {
        setErrorMessage(resData.message || 'Error updating vehicle category');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          <Grid item xs={6}>
            <Typography variant="h6">Edit Vehicle Category</Typography>
          </Grid>
          <Grid item xs={6} style={{ textAlign: 'right' }}>
            <Button variant="contained" onClick={() => router.push('/vehicle-category')}>
              Back
            </Button>
          </Grid>
        </Grid>

        <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
          <TextField
            label="Vehicle Type (English)"
            name="vehicle_type"
            value={formData.vehicle_type}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!formErrors.vehicle_type}
            helperText={formErrors.vehicle_type}
          />

          <TextField
            label="Vehicle Type (Arabic)"
            name="vehicle_type_ar"
            value={formData.vehicle_type_ar}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

          <Box sx={{ display: "flex", gap: 2, marginTop: "15px", marginBottom: "15px" }}>
            <FormControl fullWidth error={!!formErrors.vehicle_mode}>
              <InputLabel id="vehicle-mode-label">Vehicle Mode</InputLabel>
              <Select
                labelId="vehicle-mode-label"
                name="vehicle_mode"
                value={formData.vehicle_mode}
                onChange={handleChange}
                label="Vehicle Mode"
              >
                <MenuItem value="1">Taxi / Ride</MenuItem>
                <MenuItem value="2">Delivery / Cargo</MenuItem>
              </Select>
              {formErrors.vehicle_mode && <FormHelperText>{formErrors.vehicle_mode}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="1">Active</MenuItem>
                <MenuItem value="0">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", gap: 2, marginTop: "15px", marginBottom: "15px" }}>
            <TextField
              label="Base Fare"
              name="base_fare"
              value={formData.base_fare}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.base_fare}
              helperText={formErrors.base_fare}
            />
            <TextField
              label="Price Per KM"
              name="price_per_km"
              value={formData.price_per_km}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.price_per_km}
              helperText={formErrors.price_per_km}
            />
          </Box>

          <TextField
            label="Description (English)"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            margin="normal"
            error={!!formErrors.description}
            helperText={formErrors.description}
          />

          <TextField
            label="Description (Arabic)"
            name="description_ar"
            value={formData.description_ar}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            margin="normal"
          />



          <Button sx={{ mt: 3 }} variant="contained" color="primary" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>

          <Snackbar open={!!errorMessage} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="error">{errorMessage}</MuiAlert>
          </Snackbar>

          <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="success">{successMessage}</MuiAlert>
          </Snackbar>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditVehicleCategory;

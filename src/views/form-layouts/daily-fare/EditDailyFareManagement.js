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

const EditDailyFareManagement = () => {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
        country: '',
        vehicle_type: '',
        base_fare: '',
        price_per_km: '',
        price_per_minutes:'',
        waiting_time_charges:'',
        Cancellation_Charges:'',
        status:'',
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
    setLoading(true);
    try {
      const formParams = new URLSearchParams({
        
        country: formData.country,
        vehicle_type: formData.vehicle_type,
        base_fare: formData.base_fare,
        price_per_km: formData.price_per_km,
        price_per_minutes:formData.price_per_minutes,
        waiting_time_charges:formData.waiting_time_charges,
        cancellation_charges:formData.cancellation_charges,
        status:formData.status,

        });
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/daily-fare-management`, {
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
          
        <Box sx={{ mt: 2 }}>
            <Select
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              fullWidth
              displayEmpty
            >
              <MenuItem value="" disabled></MenuItem>
              <MenuItem value="1">switzerland</MenuItem>
              <MenuItem value="2">India</MenuItem>
            </Select>
          </Box>
        <TextField
                label="Vehicle Type"
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleChange}
                required
                fullWidth
                margin="normal"
                />
        
          <TextField
            label="Base Fare"
            name="base_fare"
            value={formData.base_fare}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            />
          <TextField
            label="Price per km"
            name="price_per_km"
            value={formData.price_per_km}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            />
          <TextField
            label="Price per minutes"
            name="price_per_minutes"
            value={formData.price_per_minutes}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            />
          <TextField
            label="Waiting Time Charges"
            name="waiting_time_charges"
            value={formData.waiting_time_charges}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            />
        
            <TextField
                label="Cancellation Charges"
                name="cancellation_charges"
                value={formData.cancellation_charges}
                onChange={handleChange}
                required
                fullWidth
                margin="normal"
                />

            <Box>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  fullWidth
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Status
                  </MenuItem>
                  <MenuItem value="1">Active</MenuItem>
                  <MenuItem value="0">Inactive</MenuItem>
                </Select>
  
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

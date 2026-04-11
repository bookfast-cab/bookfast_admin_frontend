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

const ShowDailyFareManagement = () => {
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

        <form >
          
        <Box sx={{ mt: 2 }}>
            <Select
              name="country"
              value={formData.country}             
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
                fullWidth
                margin="normal"
                />
        
          <TextField
            label="Base Fare"
            name="base_fare"
            value={formData.base_fare}
            fullWidth
            margin="normal"
            />
          <TextField
            label="Price per km"
            name="price_per_km"
            value={formData.price_per_km}
            fullWidth
            margin="normal"
            />
          <TextField
            label="Price per minutes"
            name="price_per_minutes"
            value={formData.price_per_minutes}
            
            
            fullWidth
            margin="normal"
            />
          <TextField
            label="Waiting Time Charges"
            name="waiting_time_charges"
            value={formData.waiting_time_charges}
            
            
            fullWidth
            margin="normal"
            />
        
            <TextField
                label="Cancellation Charges"
                name="cancellation_charges"
                value={formData.cancellation_charges}
                
                
                fullWidth
                margin="normal"
                />

            <Box>
                <Select
                  name="status"
                  value={formData.status}
                  
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

export default ShowDailyFareManagement;

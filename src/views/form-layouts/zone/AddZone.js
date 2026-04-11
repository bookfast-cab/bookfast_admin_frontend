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

const AddZone = () => {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    country_id: '',
        zone: '',
        zone_ar: '',
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
        
        country_id: formData.country_id,
        name:formData.zone,
        name_ar:formData.zone_ar,

        });
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/zones`, {
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
          router.push('/zones');
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
            <Typography variant="h6">{'Zones'}</Typography>
          </Grid>
          <Grid item xs={6} style={{ textAlign: 'right' }}>
            <Button variant="contained" onClick={() => router.push('/zones')}>
              Back
            </Button>
          </Grid>
        </Grid>

        <form onSubmit={handleSubmit}>
          
        <Box sx={{ mt: 2 }}>
            <Select
              name="country_id"
              value={formData.country_id}
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
                label="Zone"
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                required
                fullWidth
                margin="normal"
                />
        
          <TextField
            label="Zone Ar"
            name="zone_ar"
            value={formData.zone_ar}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            />

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

export default AddZone;

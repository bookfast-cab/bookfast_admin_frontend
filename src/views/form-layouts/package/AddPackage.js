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

const AddForm = () => {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
 
  const [formData, setFormData] = useState({
    package_name: '',
    package_name_ar: '',
    hours: '',
    kilometers  : '',
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
          package_name: formData.package_name,
          package_name_ar: formData.package_name_ar,
          hours: formData.hours,
          kilometers: formData.kilometers,

        });
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/package`, {
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
          router.push('/package');
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
            <Typography variant="h6">{'Add Package'}</Typography>
          </Grid>
          <Grid item xs={6} style={{ textAlign: 'right' }}>
            <Button variant="contained" onClick={() => router.push('/package')}>
              Back
            </Button>
          </Grid>
        </Grid>

        <form onSubmit={handleSubmit}>
          
       

        <TextField
            label="Package Name"
            name="package_name"
            value={formData.package_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

         <TextField
            label="Package Name Arabic"
            name="package_name_ar"
            value={formData.package_name_ar}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />

         <TextField
            label="Hours"
            name="hours"
            value={formData.hours}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

         <TextField
            label="Kilometers"
            name="kilometers"
            value={formData.kilometers}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
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

export default AddForm;

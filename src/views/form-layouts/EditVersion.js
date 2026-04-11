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

const EditVersion = () => {
  const router = useRouter();
  const { id } = router.query;
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
 
  const [formData, setFormData] = useState({
    id: id,
    app_type: '',
    force_update: 1,
    version_code: '',
    version_number: '',
    status: 1,
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
        id: formData.id,
        app_type: formData.app_type,
        force_update: formData.force_update,
        version_code: formData.version_code,
        version_number: formData.version_number,
      });
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/update-app-version-status`, {
        method: 'post',
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formParams.toString(),
      });
      
      const data = await response.json();
      console.log('data res', data);
      
      if (data.success) {
        setSuccessMessage(data.message);
        setTimeout(() => {
          router.push('/app-versions');
        }, 1000);
      } else {
        setErrorMessage(data.message);
      }
      
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  useEffect(() => {
    if (router.query.id) {
      const fetchNotification = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/app-version-detail?id=${router.query.id}`, {
          method: 'GET',
          headers: {
            Authorization: `${token}`,
          },
        })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              setFormData({
                id: data.data.id,
                app_type: data.data.appType,
                force_update: data.data.forceUpdate,
                version_code: data.data.versionCode,
                version_number: data.data.versionNumber,
                status: data.data.status,
              });
            } else {
              setErrorMessage(data.message);
            }
          })
          .catch(error => {
            console.error('Error:', error);
            setErrorMessage('An error occurred. Please try again.');
          })
          .finally(() => {
            setLoading(false);
          });
      };
      fetchNotification();
    }
  }, [router.query.id]);
  

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          <Grid item xs={6}>
            <Typography variant="h6">{'Update Force Update'}</Typography>
          </Grid>
          <Grid item xs={6} style={{ textAlign: 'right' }}>
            <Button variant="contained" onClick={() => router.push('/app-versions')}>
              Back
            </Button>
          </Grid>
        </Grid>

        <form onSubmit={handleSubmit}>
        <Typography variant="h7">App type : {formData.app_type}</Typography>
       

           <Box sx={{ mt: 2 }}>
            <Select
              name="force_update"
              value={formData.force_update}
              onChange={handleChange}
              required
              fullWidth
              displayEmpty
            >
              <MenuItem value="" disabled>Force Update</MenuItem>
              <MenuItem value="1">Yes</MenuItem>
              <MenuItem value="0">No</MenuItem>
            </Select>
          </Box>

          <TextField
            label="Version Code"
            name="version_code"
            value={formData.version_code}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Version Number"
            name="version_number"
            value={formData.version_number}
            onChange={handleChange}
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

export default EditVersion;

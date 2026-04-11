import { useEffect, useState } from 'react';

// ** MUI Imports
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

const EditNotification = () => {
  const router = useRouter();
  const { id } = router.query; // Get notification ID from query params
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    userType: '',
    image: null,
    mobileNumber: '',
  });
  const [loading, setLoading] = useState(false);
 
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // Fetch notification message data if editing
  useEffect(() => {
    const fetchNotification = async () => {
      if (id) {
        setLoading(true);
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/notification-message/${id}`, {
            headers: {
              Authorization: `${token}`,
            },
          });
          const data = await response.json();

          if (data.success) {
            setFormData({
              title: data.data.title || '',
              message: data.data.message || '',
              userType: data.data.type || '',
              image: null, // Leave null; don't pre-fill image
              mobileNumber: data.data.mobile_number || '',
            });
          } else {
            setErrorMessage('Failed to fetch notification data.');
          }
        } catch (error) {
          console.error('Error fetching notification data:', error);
          setErrorMessage('An error occurred while fetching data.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchNotification();
  }, [id, token]);

  const handleCloseSnackbar = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (event) => {
    setFormData((prevData) => ({ ...prevData, image: event.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('title', formData.title);
    form.append('message', formData.message);
    form.append('userType', formData.userType);
    form.append('mobileNumber', formData.mobileNumber);
    if (formData.image) {
      form.append('image', formData.image);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/notification-messages/update/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `${token}`,
        },
        body: form,
      });
      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);
        setTimeout(() => {
          router.push('/trip-notifications');
        }, 1000);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          <Grid item xs={6}>
            <Typography variant="h6">{id ? 'Edit' : 'Add'} Notification Message</Typography>
          </Grid>
          <Grid item xs={6} style={{ textAlign: 'right' }}>
            <Button variant="contained" onClick={() => router.push('/trip-notifications')}>
              Back
            </Button>
          </Grid>
        </Grid>

        {loading ? (
          <Typography variant="body1" style={{ textAlign: 'center', marginTop: '20px' }}>
            Loading...
          </Typography>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
              multiline
              rows={4}
            />

            {/* Notification Type Dropdown */}
            <Box sx={{ mt: 2 }}>
              <Select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                required
                fullWidth
                displayEmpty
              >
                <MenuItem value={1}>Customer</MenuItem>
                <MenuItem value={2}>Driver</MenuItem>
              </Select>
            </Box>

            
            <TextField
              label="Mobile Number"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
            />

            <Button sx={{ mt: 3 }} variant="contained" color="primary" type="submit">
              {id ? 'Update' : 'Submit'}
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
        )}
      </CardContent>
    </Card>
  );
};

export default EditNotification;

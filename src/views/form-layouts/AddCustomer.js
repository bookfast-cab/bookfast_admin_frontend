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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useRouter } from 'next/router';


const AddCustomerDetails = () => {

  const router = useRouter();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[6-9]\d{9}$/;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    country_id: 2,
    currency: '1',
    country_code: '+91',
    phone_number: '',
    email: '',
    profile_picture: null,
    status: '1',
    gender: null,
  });
  
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [profilePicPreview, setProfilePic] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [errors, setErrors] = useState({
    phone_number: '',
    email: '',
  }); 

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, phone_number: value });

    // Validate phone number (example: 123-456-7890 or 123 456 7890)
    const phoneRegex = /^[0-9]{3}[-\s]?[0-9]{3}[-\s]?[0-9]{4}$/;
    if (!phoneRegex.test(value)) {
      setErrors({ ...errors, phone_number: 'Enter a valid 10-digit phone number' });
    } else {
      setErrors({ ...errors, phone_number: '' });
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });

    // Validate email (simple email regex)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      setErrors({ ...errors, email: 'Enter a valid email address' });
    } else {
      setErrors({ ...errors, email: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (errors.phone_number || errors.email) {
      return;
    }

    const formDataToSend = new FormData();

    // Append the form data
    for (const key in formData) {
      if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customers`, {
        method: 'POST',
        headers: {
          Authorization: `${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Customer created successfully!');
        setOpenSnackbar(true);
        setTimeout(() => {
          router.push('/customers');
        }, 1000);
      } else {
        setErrorMessage(data.message || 'Error creating customer');
      }
    } catch (error) {
      setErrorMessage('An error occurred while creating the customer.');
      console.error('Error:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    setFormData({ ...formData, [fieldName]: file });
    setProfilePic(URL.createObjectURL(file));
    // Create an object URL for the preview
    // const objectUrl = URL.createObjectURL(file);
    // setImagePreviews({ ...imagePreviews, [fieldName]: objectUrl });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Add Customer Details</Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
          <Grid item xs={12}>
              <Typography variant="subtitle1">Profile Picture</Typography>
              <Box>
                {(
                  <img
                    src={profilePicPreview??'/image_not_found.png'}
                    alt="Profile"
                    style={{ width: '150px', height: '150px', borderRadius: '50%' }}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button variant="outlined" component="label">
                  Select File
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'profile_picture')}
                  />
                </Button>
              </Box>
            </Grid>
            {/* Driver Name */}
            <Grid item xs={12} md={6}>
              <TextField
                label="First Name"
                value={formData.first_name}
                fullWidth
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Last Name"
                value={formData.last_name}
                fullWidth
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </Grid>


            {/* Country */}
            <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined"> {/* Wrap Select with FormControl */}
                    <InputLabel id="country">Country</InputLabel>
                    <Select
                        labelId="country" // Links InputLabel to Select
                        value={formData.country_id || 2}
                        onChange={(e) => setFormData({ ...formData, country_id: e.target.value })} // Update state on change
                        label="Country" // This makes the label float properly
                    >
                        <MenuItem value="" disabled>Country</MenuItem> {/* Default placeholder */}
                        <MenuItem value={1}>Switzerland</MenuItem>
                        <MenuItem value={2}>India</MenuItem>
                    </Select>
                </FormControl>
            </Grid>


            {/* Phone Number */}
            <Grid item xs={12} md={6}>
            <TextField
                label="Phone Number"
                fullWidth
                value={formData.phone_number}
                onChange={handlePhoneNumberChange}
                required
                error={!!errors.phone_number}
                helperText={errors.phone_number}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={6}>
            <TextField
                label="Email"
                fullWidth
                value={formData.email}
                onChange={handleEmailChange}
                required
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>

            

            {/* Cab Attachment City */}
            <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined"> {/* Wrap Select with FormControl */}
                    <InputLabel id="cab-attachment-city-label">Gender</InputLabel>
                    <Select
                        labelId="cab-attachment-city-label" // Links InputLabel to Select
                        value={formData.gender || ''}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })} // Update state on change
                        label="Cab Attachment City" // This makes the label float properly
                    >
                        <MenuItem value="">Select Gender</MenuItem>
                        <MenuItem value={"male"}>Male</MenuItem>
                        <MenuItem value={"female"}>Female</MenuItem>
                        <MenuItem value={"transgender"}>Transgender</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="master_approval_status">Status</InputLabel>
                <Select
                  labelId="master_approval_status"
                  value={formData.profileApproved || 1}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value={1}>Active</MenuItem>
                  <MenuItem value={0}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            
            {/* Submit Button */}
            <Grid item xs={12} mt={10} style={{ display: 'grid' }}>
              <Button variant="contained" color="primary" type="submit">
                Submit
              </Button>
            </Grid>
          </Grid>

          {/* Error Message */}
          {errorMessage && (
            <Snackbar
              open={!!errorMessage}
              autoHideDuration={3000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <MuiAlert severity="error" onClose={handleCloseSnackbar}>
                {errorMessage}
              </MuiAlert>
            </Snackbar>
          )}      

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

export default AddCustomerDetails;


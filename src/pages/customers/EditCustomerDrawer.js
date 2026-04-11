// components/EditCustomerDrawer.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Avatar,
  Divider,
  Stack,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Tabs,
  Tab,
  Card,
  CardContent,
  Snackbar,
  Select,
  MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getTrips } from 'src/apis/tripApis';
import { formatDate } from 'src/utils/utils';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MuiAlert from '@mui/material/Alert';

const InfoRow = ({ label, value }) => (
  <Grid container spacing={1} sx={{ mb: 1 }}>
    <Grid item xs={5}>
      <Typography variant="body2" fontWeight="bold">{label}</Typography>
    </Grid>
    <Grid item xs={7}>
      <Typography variant="body2">{value ?? '—'}</Typography>
    </Grid>
  </Grid>
);

const EditCustomerDrawer = ({ open, onClose, data = {}, vehicleList = [] }) => {

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [profilePicPreview, setProfilePic] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const customer = data || {};

  const fullName = `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim();
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const [bgColor, setBgColor] = useState('#ccc');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [tripData, setTripData] = useState([]);
  const [tripPage, setTripPage] = useState(0);

  const [formData, setFormData] = useState({
    customer_id:null,
    first_name: "",
    last_name: "",
    country_id: 2,
    currency: '1',
    country_code: '+91',
    phone_number: '',
    email: '',
    profile_picture: null,
    status: '1',
    gender: null,
  });
  
  useEffect(() => {
    if (open && data) {
      setFormData({
        customer_id:data.id,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        country_id: 2,
        currency: '1',
        country_code: '+91',
        phone_number: data.phone_number,
        email: data.email || '',
        profile_picture: customer,
        status: '1',
        gender: data.gender || '',
      });
    }
  }, [open, data]); // Runs every time drawer opens or data changes

  const [errors, setErrors] = useState({
    phone_number: '',
    email: '',
  }); 



  useEffect(() => {
    if (open) {
      fetchTrips()
    }
  }, [open]);

  const fetchTrips = async () => {
   
    const result = await getTrips({ page: tripPage, perPage: 20, type: '', token ,customer_id:customer.id });
  
    if (result.success) {
      setTripData(result.data);

      // setTotalRecords(result.totalItems);
      // setTotalPages(result.totalPages);
      // setCurrentPage(result.currentPage);
      // setPerPage(result.perPage);
      
    } else {
      console.error(result.error);
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

  const handleCancelClick = () => setCancelDialogOpen(true);

  const handleDelete = async (idToDelete) => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/
    -trip/${idToDelete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        if (data.success) {
          setSuccessMessage('Trip deleted successfully!')
        } else {
          setErrorMessage(data.message)
        }
      })
      .catch(error => {
        console.error('Error:', error)
      })

  }



  const handleClose = () => {
    setReason('');
    setCancelDialogOpen(false);
  };

  const initials = fullName
    ? fullName.split(' ').map(word => word[0]).join('')
    : customer.phone_number?.slice(-4) ?? 'CU';

  const tripTypeMap = {
    1: "Local",
    2: "Rental",
    3: "Outstation",
  };

  const tripSubTypeMap = {
    1: "Oneway Trip",
    2: "Two Way Trip",
  };

  const getRandomColor = () => {
    const colors = [
      '#FFCDD2', '#F8BBD0', '#E1BEE7', '#D1C4E9',
      '#C5CAE9', '#BBDEFB', '#B3E5FC', '#B2EBF2',
      '#B2DFDB', '#C8E6C9', '#DCEDC8', '#F0F4C3',
      '#FFECB3', '#FFE0B2', '#FFCCBC'
    ];

    return colors[Math.floor(Math.random() * colors.length)];
  };



  useEffect(() => {
    if (open) {
      setBgColor(getRandomColor());
    }
  }, [open]);



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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customers/${formData.customer_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
      body: JSON.stringify(formDataToSend),
    });

    const data = await response.json();

    if (data.success) {
      setSuccessMessage('Customer updated successfully!');
      setOpenSnackbar(true);
      setTimeout(() => {
        onClose()
      }, 1000);
    } else {
      setErrorMessage(data.message || 'Error updating customer');
    }
  } catch (error) {
    setErrorMessage('An error occurred while updating the customer.');
    console.error('Error:', error);
  }
};


  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 600 } }}>
      <Box sx={{ p: 3, position: 'relative', height: '100%', overflowY: 'auto' }}>
        {/* Close Button */}
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16 }}>
          <CloseIcon />
        </IconButton>

        {data ? (
          <>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Avatar
                src={data.profile_picture}
                sx={{ width: 56, height: 56 }}
              >
                {initials}
              </Avatar>
              <Box>
                <Typography variant="h6">{fullName || 'Customer'}</Typography>
                <Typography variant="body2">{data.phone_with_code}</Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 0 }} />

            <Card>
      <CardContent>
       

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
          <Grid item xs={12}>
              <Typography variant="subtitle1">Profile Picture</Typography>
              <Box>
                {(
                  <img
                    src={profilePicPreview??'/image_not_found.png'}
                    alt="Profile"
                    style={{ width: '100px', height: '100px', borderRadius: '10%' }}
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

            <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined"> {/* Wrap Select with FormControl */}
                    <InputLabel id="gender-label">Gender</InputLabel>
                    <Select
                        labelId="gender-label" // Links InputLabel to Select
                        value={formData.gender || ''}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })} // Update state on change
                        label="Gender" // This makes the label float properly
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
                Save Changes
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
          </>
        ) : (
          <Box mt={10} textAlign="center">
            <Typography variant="h6">Loading customer details...</Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default EditCustomerDrawer;

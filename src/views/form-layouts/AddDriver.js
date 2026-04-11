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


const AddDriverDetails = () => {

  const router = useRouter(); 
  const [vehicleCategories, setVehicleCategories] = useState([]);
  const [cities, setCities] = useState([]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[6-9]\d{9}$/;

  const [formData, setFormData] = useState({
    driverName: '',
    country_id: 2,
    phone_number: '',
    email: '',
    drivingLicenseNumber: '',
    vehicleRcNo: '',
    ownerName: '',
    ownerMobileNo: '',
    cabAttachmentCity: '',
    cabCategory: '',
    remarks: '',
    profileApproved: 1,
    licenceNumber: '',
    isLicenseApproved: 1,
    isAadharCardApproved: 1,
    isPanCardApproved: 1,
    isVechleApproved: 1,
    isvehicleInsuranceApproved: 1,
    isvehiclePermitNationalApproved: 1,
    isvehicleRcApproved: 1,
    driverProfile: null,
    licenseFrontImage: null,
    licenseBackImage: null,
    panCardImage: null,
    aadharCardImage: null,
    aadharCardBackImage: null,
    bankPassbookImage: null,
    vehicleFrontImage: null,
    vehicleBackImage: null,
    vehicleInsurance: null,
    vehiclePermitNational: null,
    vehicleRcFrontImage: null,
    vehicleRcBackImage: null,
  });

  const [imagePreviews, setImagePreviews] = useState({
    driverProfile: null,
    licenseFrontImage: null,
    licenseBackImage: null,
    panCardImage: null,
    aadharCardImage: null,
    aadharCardBackImage: null,
    bankPassbookImage: null,
    vehicleFrontImage: null,
    vehicleBackImage: null,
    vehicleInsurance: null,
    vehiclePermitNational: null,
    vehicleRcFrontImage: null,
    vehicleRcBackImage: null,
  });
  
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [errors, setErrors] = useState({
    phone_number: '',
    email: '',
  }); 

  useEffect(() => {
    fetchVehicleCategories();
  }, []);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // Handle file input changes and image previews
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    setFormData({ ...formData, [fieldName]: file });

    // Create an object URL for the preview
    const objectUrl = URL.createObjectURL(file);
    setImagePreviews({ ...imagePreviews, [fieldName]: objectUrl });
  };

  const handleApprovalChange = (variable, value) => {
    setFormData({ ...formData, variable: value });
  };

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/add-driver`, {
        method: 'POST',
        headers: {
          Authorization: `${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Driver created successfully!');
        setOpenSnackbar(true);
        setTimeout(() => {
          router.push('/drivers');
        }, 1000);
      } else {
        setErrorMessage(data.message || 'Error creating driver');
      }
    } catch (error) {
      setErrorMessage('An error occurred while creating the driver.');
      console.error('Error:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const fetchVehicleCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/get-vehicle-categories`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setVehicleCategories(data.data);
        setCities(data.cities);
      }
    } catch (error) {
      console.error('Error fetching vehicle categories:', error);
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Add Driver Details</Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Driver Name */}
            <Grid item xs={12}>
              <Typography variant="subtitle1">Profile Picture</Typography>
              <Box>
                {(
                  <img
                    src={imagePreviews.driverProfile??'/image_not_found.png'}
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
                    onChange={(e) => handleFileChange(e, 'driverProfile')}
                  />
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Driver Name"
                value={formData.driverName}
                fullWidth
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
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

            {/* Vehicle RC Number */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Vehicle RC Number"
                value={formData.vehicleRcNo}
                fullWidth
                onChange={(e) => setFormData({ ...formData, vehicleRcNo: e.target.value })}
                required
              />
            </Grid>

            {/* Driving License Number */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Driving License Number"
                value={formData.drivingLicenseNumber}
                fullWidth
                onChange={(e) => setFormData({ ...formData, drivingLicenseNumber: e.target.value })}
                required
              />
            </Grid>

            {/* Owner Name */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Owner Name"
                value={formData.ownerName}
                fullWidth
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              />
            </Grid>

            {/* Owner Mobile Number */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Owner Mobile Number"
                variant="outlined" // Set the variant to 'outlined'
                value={formData.ownerMobileNo}
                fullWidth
                onChange={(e) => setFormData({ ...formData, ownerMobileNo: e.target.value })}
                required
                error={!phoneRegex.test(formData.ownerMobileNo) && formData.ownerMobileNo !== ''}
                helperText={
                  !phoneRegex.test(formData.ownerMobileNo) && formData.ownerMobileNo !== ''
                    ? 'Enter a valid 10-digit phone number'
                    : ''
                }
              />
            </Grid>

            {/* Cab Attachment City */}
            <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined"> {/* Wrap Select with FormControl */}
                    <InputLabel id="cab-attachment-city-label">Cab Attachment City</InputLabel>
                    <Select
                        labelId="cab-attachment-city-label" // Links InputLabel to Select
                        value={formData.cabAttachmentCity || ''}
                        onChange={(e) => setFormData({ ...formData, cabAttachmentCity: e.target.value })} // Update state on change
                        label="Cab Attachment City" // This makes the label float properly
                    >
                        <MenuItem value="">Select city</MenuItem>
                        {cities && cities.map((city) => (
                          <MenuItem key={city.id} value={city.id}>
                            {city.name}
                          </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            {/* Cab Category */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="category">Cab Category</InputLabel>
                <Select
                  labelId="category"
                  value={formData.cabCategory || ''}
                  onChange={(e) => setFormData({ ...formData, cabCategory: e.target.value })}
                  label="Cab Category"
                >
                  <MenuItem value="">Select Cab Category</MenuItem>
                  {vehicleCategories && vehicleCategories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.vehicle_type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Remarks */}
            <Grid item xs={12}>
              <TextField
                label="Remarks"
                value={formData.remarks}
                fullWidth
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="master_approval_status">Master Approval Status</InputLabel>
                <Select
                  labelId="master_approval_status"
                  value={formData.profileApproved || 1}
                  onChange={(e) => setFormData({ ...formData, profileApproved: e.target.value })}
                  label="Master Approval Status"
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value={1}>Approved</MenuItem>
                  <MenuItem value={2}>Unapproved</MenuItem>
                  <MenuItem value={3}>Blocked</MenuItem>
                  <MenuItem value={4}>Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* License Front Image */}
            <Grid item xs={12} style={{ display: 'grid' }}>
              <Box>
                {(
                  <img
                    src={imagePreviews.licenseFrontImage?? '/image_not_found.png'}
                    alt="License Front Preview"
                    style={{ width: '300px', height: '300px' }}
                  />
                )}
              </Box>

              <Button variant="outlined" component="label" style={{ width: "25%" }} >
                License Front Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'licenseFrontImage')}
                />
              </Button>
              
            </Grid>

            {/* License Back Image */}
            <Grid item xs={12} style={{ display: 'grid' }}>
            <Box>
              {(
                <img
                  src={imagePreviews.licenseBackImage ?? '/image_not_found.png'}
                  alt="License Back Preview"
                  style={{ width: '300px', height: '300px' }}
                />
              )}
              </Box>
              <Button variant="outlined" component="label" style={{ width: "25%" }}>
                License Back Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'licenseBackImage')}
                />
              </Button>
              
            </Grid>

            {/* Pan Card Image */}
            <Grid item xs={12} style={{ display: 'grid' }}>
            <Box>
              {(
                <img
                  src={imagePreviews.panCardImage ?? '/image_not_found.png'}
                  alt="Pan Card Preview"
                  style={{ width: '300px', height: '300px' }}
                />
              )}
              </Box>
              <Button variant="outlined" component="label" style={{ width: "25%"}}>
                Pan Card Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'panCardImage')}
                />
              </Button>
            
            </Grid>

            {/* Aadhar Card Image */}
            <Grid item xs={12} style={{ display: 'grid' }} >
            <Box>
              {(
                <img
                  src={imagePreviews.aadharCardImage ?? '/image_not_found.png'}
                  alt="Aadhar Card Preview"
                  style={{ width: '300px', height: '300px' }}

                />
              )}
              </Box>
              <Button variant="outlined" component="label" style={{ width: "25%"}}>
                Aadhar Card Front Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'aadharCardImage')}
                />
              </Button>
              
            </Grid>

            {/* Aadhar Card Image */}
            <Grid item xs={12} style={{ display: 'grid' }} >
            <Box>
              {(
                <img
                  src={imagePreviews.aadharCardBackImage ?? '/image_not_found.png'}
                  alt="Aadhar Card Preview"
                  style={{ width: '300px', height: '300px' }}

                />
              )}
              </Box>
              <Button variant="outlined" component="label" style={{ width: "25%"}}>
                Aadhar Card Back Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'aadharCardBackImage')}
                />
              </Button>
              
            </Grid>

            {/* Vehicle Image Front */}
            <Grid item xs={12} style={{ display: 'grid' }} >
            <Box>
              {(
                <img
                  src={imagePreviews.vehicleFrontImage ?? '/image_not_found.png'}
                  alt="Vehicle Front Preview"
                  style={{ width: '300px', height: '300px' }}
                />
              )}
              </Box>
              <Button variant="outlined" component="label" style={{ width: "25%"}}>
                Vehicle Image Front
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  
                  onChange={(e) => handleFileChange(e, 'vehicleFrontImage')}
                />
              </Button>
              
            </Grid>

            {/* Vehicle Image Back */}
            <Grid item xs={12} style={{ display: 'grid' }}>
            <Box>
              {(
                <img
                  src={imagePreviews.vehicleBackImage ?? '/image_not_found.png'}
                  alt="Vehicle Back Preview"
                  style={{ width: '300px', height: '300px' }}
                />
              )}
              </Box>
              <Button variant="outlined" component="label" style={{ width: "25%"}}>
                Vehicle Image Back
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'vehicleBackImage')}
                />
              </Button>
              
            </Grid>

            {/* Vehicle Insurance */}
            <Grid item xs={12} style={{ display: 'grid' }}>
            <Box>
              {(
                <img
                  src={imagePreviews.vehicleInsurance ?? '/image_not_found.png'}
                  alt="Vehicle Insurance Preview"
                  style={{ width: '300px', height: '300px' }}
                />
              )}
              </Box>
              <Button variant="outlined" component="label" style={{ width: "25%"}}>
                Vehicle Insurance
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'vehicleInsurance')}
                />
              </Button>
             
            </Grid>

            {/* Vehicle Permit National */}
            <Grid item xs={12} style={{ display: 'grid' }}>
            <Box>
              {(
                <img
                  src={imagePreviews.vehiclePermitNational ?? '/image_not_found.png'}
                  alt="Vehicle Permit National Preview"
                  style={{ height: '300px', width: '300px' }}
                />
              )}
              </Box>
              <Button variant="outlined" component="label" style={{ width: "25%"}}>
                Vehicle Permit National
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'vehiclePermitNational')}
                />
              </Button>
             
            </Grid>

            {/* Vehicle RC Front */}
            <Grid item xs={12} style={{ display: 'grid' }}>
            <Box>
              {(
                <img
                  src={imagePreviews.vehicleRcFrontImage ?? '/image_not_found.png'}
                  alt="Vehicle RC Front Preview"
                  style={{ height: '300px', width: '300px' }}
                />
              )}
              </Box>
              <Button variant="outlined" component="label" style={{ width: "25%"}}>
                Vehicle RC Front
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'vehicleRcFrontImage')}
                />
              </Button>
             
            </Grid>

            {/* Vehicle RC Back */}
            <Grid item xs={12} style={{ display: 'grid' }}>
            <Box>
              {(
                <img
                  src={imagePreviews.vehicleRcBackImage ?? '/image_not_found.png'}
                  alt="Vehicle RC Back Preview"
                  style={{ height: '300px', width: '300px' }}
                />
              )}
              </Box>
              <Button variant="outlined" component="label" style={{ width: "25%"}}>
                Vehicle RC Back
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'vehicleRcBackImage')}
                />
              </Button>
             
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

export default AddDriverDetails;


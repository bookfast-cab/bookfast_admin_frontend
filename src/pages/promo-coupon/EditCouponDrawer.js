import {
    Drawer,
    Box,
    Typography,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Button,
    Autocomplete,
    Chip,
    Snackbar,
  } from '@mui/material';
  import MuiAlert from '@mui/material/Alert';
  import { useState, useEffect } from 'react';
  
  const EditCouponDrawer = ({ open, onClose, initialData }) => {
    const [formData, setFormData] = useState({
      code: '',
      discount_type: '',
      discount_value: '',
      min_ride_amount: '',
      max_discount: '',
      valid_from: '',
      valid_to: '',
      limit: '',
      mobileNumbers: [],
    });
  
    const [formErrors, setFormErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  

    const formatDateOnly = (isoDate) => isoDate ? isoDate.split('T')[0] : '';


    useEffect(() => {
      if (initialData) {
        setFormData({
            ...initialData,
            mobileNumbers: initialData.customers?.map(customer => customer.mobile_number) || [],
            valid_from: formatDateOnly(initialData.valid_from),
            valid_to: formatDateOnly(initialData.valid_to),
          });
      }
    }, [initialData]);
  
    const handleCloseSnackbar = () => {
      setSuccessMessage('');
      setErrorMessage('');
    };
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  
    const validateForm = () => {
      const errors = {};
      if (!formData.code) errors.code = 'Code is required';
      if (!formData.discount_type) errors.discount_type = 'Discount type is required';
      if (!formData.discount_value) errors.discount_value = 'Discount value is required';
      if (!formData.min_ride_amount) errors.min_ride_amount = 'Minimum ride amount is required';
      if (!formData.max_discount) errors.max_discount = 'Maximum discount is required';
      if (!formData.valid_from) errors.valid_from = 'Valid from date is required';
      if (!formData.valid_to) errors.valid_to = 'Valid to date is required';
      setFormErrors(errors);
      
      return Object.keys(errors).length === 0;
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;
  
      try {
        const formParams = new URLSearchParams();
        Object.entries(formData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => formParams.append(`${key}[]`, v));
          } else {
            formParams.append(key, value);
          }
        });
  
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/promoCoupon/${initialData.coupon_id}`, {
          method: 'put',
          headers: {
            Authorization: `${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formParams.toString(),
        });
  
        const data = await response.json();
  
        if (data.success) {
          setSuccessMessage(data.message || 'Coupon updated successfully');
          setTimeout(() => {
            onClose(true); // Pass true to indicate success
          }, 1000);
        } else {
          setErrorMessage(data.message || 'Update failed');
        }
      } catch (err) {
        setErrorMessage('Something went wrong. Please try again.');
      }
    };
  
    return (
      <>
        <Drawer anchor="right" open={open} onClose={() => onClose(false)}>
          <Box sx={{ width: 500, p: 3 }}>
            <Typography variant="h6" gutterBottom>Edit Coupon</Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Coupon Code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    fullWidth
                    error={!!formErrors.code}
                    helperText={formErrors.code}
                  />
                </Grid>
  
                <Grid item xs={12}>
                  <FormControl fullWidth error={!!formErrors.discount_type}>
                    <InputLabel>Discount Type</InputLabel>
                    <Select
                      name="discount_type"
                      value={formData.discount_type}
                      onChange={handleChange}
                      label="Discount Type"
                    >
                      <MenuItem value="percentage">Percentage</MenuItem>
                      <MenuItem value="fixed">Flat</MenuItem>
                    </Select>
                    {formErrors.discount_type && <FormHelperText>{formErrors.discount_type}</FormHelperText>}
                  </FormControl>
                </Grid>
  
                <Grid item xs={12}>
                  <TextField
                    label="Discount Value"
                    name="discount_value"
                    value={formData.discount_value}
                    onChange={handleChange}
                    fullWidth
                    error={!!formErrors.discount_value}
                    helperText={formErrors.discount_value}
                  />
                </Grid>
  
                <Grid item xs={12}>
                  <TextField
                    label="Min Ride Amount"
                    name="min_ride_amount"
                    value={formData.min_ride_amount}
                    onChange={handleChange}
                    fullWidth
                    error={!!formErrors.min_ride_amount}
                    helperText={formErrors.min_ride_amount}
                  />
                </Grid>
  
                <Grid item xs={12}>
                  <TextField
                    label="Max Discount"
                    name="max_discount"
                    value={formData.max_discount}
                    onChange={handleChange}
                    fullWidth
                    error={!!formErrors.max_discount}
                    helperText={formErrors.max_discount}
                  />
                </Grid>
  
                <Grid item xs={12}>
                  <TextField
                    label="Valid From"
                    name="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!formErrors.valid_from}
                    helperText={formErrors.valid_from}
                  />
                </Grid>
  
                <Grid item xs={12}>
                  <TextField
                    label="Valid To"
                    name="valid_to"
                    type="date"
                    value={formData.valid_to}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!formErrors.valid_to}
                    helperText={formErrors.valid_to}
                  />
                </Grid>
  
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={formData.mobileNumbers}
                    onChange={(event, newValue) => {
                      const numericOnly = newValue.filter((val) => /^[0-9]+$/.test(val));
                      setFormData({ ...formData, mobileNumbers: numericOnly });
                    }}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip key={index} variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Mobile Numbers"
                        placeholder="Enter and press Enter"
                        type="tel"
                      />
                    )}
                  />
                </Grid>
  
                <Grid item xs={12}>
                  <TextField
                    label="Usage Limit"
                    name="limit"
                    value={formData.limit}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
  
                <Grid item xs={12}>
                  <Button variant="contained" type="submit">Update</Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Drawer>
  
        <Snackbar open={!!errorMessage} autoHideDuration={3000} onClose={handleCloseSnackbar}>
          <MuiAlert elevation={6} variant="filled" severity="error" onClose={handleCloseSnackbar}>
            {errorMessage}
          </MuiAlert>
        </Snackbar>
  
        <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={handleCloseSnackbar}>
          <MuiAlert elevation={6} variant="filled" severity="success" onClose={handleCloseSnackbar}>
            {successMessage}
          </MuiAlert>
        </Snackbar>
      </>
    );
  };
  
  export default EditCouponDrawer;
  
"use client";
import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { FormControl, FormHelperText, InputLabel } from '@mui/material';
import { Autocomplete, TextField, Chip } from "@mui/material";
import { useRouter } from 'next/router';

const AddCouponForm = () => {

    const router = useRouter()
  

  const [formData, setFormData] = useState({
    code: '',
    discount_type: '',
    discount_value: '',
    min_ride_amount: '',
    max_discount: '',
    valid_from: '',
    valid_to: '',
    limit: '',
    mobileNumbers : []

  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;


  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  

  const handleCloseSnackbar = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
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
    setLoading(true);

    try {
      const formParams = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'mobileNumbers' && Array.isArray(value)) {
          formParams.append(key, value.join(',')); // ✅ IMPORTANT
        } else {
          formParams.append(key, value);
        }
      });
      

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/promoCoupon`, {
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
          router.push('/promo-coupon/');
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
    <>
        <Typography variant="h6">Add Coupon Code</Typography>
        <form onSubmit={handleSubmit}>
  <Grid container spacing={3}>
    <Grid item xs={12} md={4}>
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

    <Grid item xs={12} md={4}>
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
        {formErrors.discount_type && (
          <FormHelperText>{formErrors.discount_type}</FormHelperText>
        )}
      </FormControl>
    </Grid>

    <Grid item xs={12} md={4}>
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

    <Grid item xs={12} md={4}>
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

    <Grid item xs={12} md={4}>
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

    <Grid item xs={12} md={4}>
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

    <Grid item xs={12} md={4}>
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

   

    <Grid item xs={12} md={6}>
  <Autocomplete
    multiple
    freeSolo
    options={[]}
    value={formData.mobileNumbers}
    onChange={(event, newValue) => {
      setFormData(prev => ({
        ...prev,
        mobileNumbers: newValue
      }));
    }}
    renderTags={(value, getTagProps) =>
      value.map((option, index) => (
        <Chip
          key={index}
          label={option}
          {...getTagProps({ index })}
        />
      ))
    }
    renderInput={(params) => (
      <TextField
        {...params}
        label="Mobile Numbers"
        placeholder="Type number and press Enter"
        type="tel"
        inputProps={{
          ...params.inputProps,
          onKeyDown: (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();

              const inputValue = e.target.value.trim();

              if (/^[0-9]{10}$/.test(inputValue)) {
                setFormData(prev => {
                  if (prev.mobileNumbers.includes(inputValue)) return prev;

                  return {
                    ...prev,
                    mobileNumbers: [...prev.mobileNumbers, inputValue],
                  };
                });
              }

              e.target.value = '';
            }
          }
        }}
      />
    )}
  />
</Grid>




    <Grid item xs={12} md={4}>
      <TextField
        label="Usage Limit"
        name="limit"
        value={formData.limit}
        onChange={handleChange}
        fullWidth
      />
    </Grid>

    

    <Grid item xs={12}>
      <Button sx={{ mt: 2 }} variant="contained" type="submit">
        Submit
      </Button>
    </Grid>
  </Grid>
</form>


        <Snackbar
          open={!!errorMessage}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="error">
            {errorMessage}
          </MuiAlert>
        </Snackbar>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="success">
            {successMessage}
          </MuiAlert>
        </Snackbar>
        </>
  );
};

export default AddCouponForm;

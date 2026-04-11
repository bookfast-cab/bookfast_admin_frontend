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

const editHistory = async (id, token) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/driver-wallet-histories/${id}`, {
    headers: {
      Authorization: `${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
 
  const data = await response.json();
  
  return data.data;
};

const EditDriverWalletHistory = () => {
  const router = useRouter();
  const { id } = router.query;
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [AllDrivers, setAllDrivers] = useState([]);
  
  const [formData, setFormData] = useState({
    driver_id: '',
    wallet_amount: '',
    app_type: '',
    driver_message: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    driver_id: '',
    wallet_amount: '',
    app_type: '',
    driver_message: '',
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

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate driver_id
    if (!formData.driver_id) {
      errors.driver_id = 'Please select a driver.';
      isValid = false;
    }

    // Validate wallet_amount
    if (!formData.wallet_amount || isNaN(formData.wallet_amount) || parseFloat(formData.wallet_amount) <= 0) {
      errors.wallet_amount = 'Please enter a valid amount greater than 0.';
      isValid = false;
    }

    // Validate app_type
    if (!formData.app_type) {
      errors.app_type = 'Please select the transaction type (Credit/Debit).';
      isValid = false;
    }

    // Validate driver_message
    if (!formData.driver_message) {
      errors.driver_message = 'Please enter a message.';
      isValid = false;
    }

    setFormErrors(errors);
   
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return; // Stop form submission if validation fails
    }

    setLoading(true);
    try {
      const formParams = new URLSearchParams({
        driver_id: formData.driver_id,
        amount: formData.wallet_amount,
        action: formData.app_type,
        message: formData.driver_message,
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/driver-wallet-histories/${id}`, {
        method: 'PUT',
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
          router.push('/driver-wallet-history');
        }, 1000);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllDrivers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/all-drivers`, {
          headers: {
            Authorization: `${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        const data = await response.json();
        setAllDrivers(data.data);
      } catch (error) {
        console.error('Error fetching drivers:', error);
      }
    };

    const fetchDriverWalletHistory = async () => {
      if (!id) return;
      setLoadingData(true);
      const driverWalletHistory = await editHistory(id, token);
      if (driverWalletHistory) {
        setFormData({
          driver_id: driverWalletHistory.driver_id,
          wallet_amount: driverWalletHistory.amount,
          app_type: driverWalletHistory.action,
          driver_message: driverWalletHistory.message,
        });
      }
      setLoadingData(false);
    };

    fetchAllDrivers();
    fetchDriverWalletHistory();
  }, [id, token]);

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          <Grid item xs={6}>
            <Typography variant="h6">Driver Wallet History</Typography>
          </Grid>
          <Grid item xs={6} style={{ textAlign: 'right' }}>
            <Button variant="contained" onClick={() => router.push('/driver-wallet-history')}>
              Back
            </Button>
          </Grid>
        </Grid>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mt: 2 }} style={{marginTop:"25px"}}>
            <Select
              name="driver_id"
              value={formData.driver_id}
              onChange={handleChange}
              required
              fullWidth
              displayEmpty
            >
              <MenuItem value="" disabled>
                Driver name
              </MenuItem>
              {AllDrivers.map((driver) => (
                driver.driverName !== null && (
                  <MenuItem key={driver.id} value={driver.id}>
                    {driver.driverName}
                  </MenuItem>
                )
              ))}
            </Select>
            {formErrors.driver_id && <Typography color="error">{formErrors.driver_id}</Typography>}
          </Box>

          <TextField
            label="Message"
            name="driver_message"
            value={formData.driver_message}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!formErrors.driver_message}
            helperText={formErrors.driver_message}
          />

          <Box sx={{ mt: 2 }}>
            <Select
              name="app_type"
              value={formData.app_type}
              onChange={handleChange}
              required
              fullWidth
              displayEmpty
            >
              <MenuItem value="" disabled>Type</MenuItem>
              <MenuItem value="cr">Credit</MenuItem>
              <MenuItem value="dr">Debit</MenuItem>
            </Select>
            {formErrors.app_type && <Typography color="error">{formErrors.app_type}</Typography>}
          </Box>

          <TextField
            label="Amount"
            name="wallet_amount"
            value={formData.wallet_amount}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!formErrors.wallet_amount}
            helperText={formErrors.wallet_amount}
          />

          <Button sx={{ mt: 3 }} variant="contained" color="primary" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>

          {/* Snackbar for Errors */}
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

          {/* Snackbar for Success */}
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
        </form>
      </CardContent>
    </Card>
  );
};

export default EditDriverWalletHistory;

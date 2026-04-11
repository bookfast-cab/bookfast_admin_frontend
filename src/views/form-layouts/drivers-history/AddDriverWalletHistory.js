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
import { Paper,
  
  Alert,
 } from '@mui/material';

const AddDriverWalletHistory = () => {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [AllDrivers, setAllDrivers] = useState([]);
  const [searchText, setSearchText] = useState('');
  
  const [formData, setFormData] = useState({
    driver_id: '',
    wallet_amount: '',
    driver_type: '',
    driver_message: '',
  }); 
  
  const [formErrors, setFormErrors] = useState({
    driver_id: '',
    wallet_amount: '',
    driver_type: '',
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
    
    // Clear error message when the user interacts with the input
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const validateForm = () => {
    let errors = {};
    let formIsValid = true;

    // Validate driver_id
    if (!formData.driver_id) {
      formIsValid = false;
      errors.driver_id = 'Please select a driver.';
    }

    // Validate wallet_amount
    if (!formData.wallet_amount || isNaN(formData.wallet_amount) || parseFloat(formData.wallet_amount) <= 0) {
      formIsValid = false;
      errors.wallet_amount = 'Please enter a valid wallet amount greater than 0.';
    }

    // Validate driver_type
    if (!formData.driver_type) {
      formIsValid = false;
      errors.driver_type = 'Please select the type (Credit or Debit).';
    }

    // Validate driver_message
    if (!formData.driver_message || formData.driver_message.length < 5) {
      formIsValid = false;
      errors.driver_message = 'Message must be at least 5 characters long.';
    }

    setFormErrors(errors);
    
    return formIsValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return; // Stop the form submission if validation fails
    }
    
    setLoading(true);
    try {
      const formParams = new URLSearchParams({
        driver_id: formData.driver_id,
        amount: formData.wallet_amount,
        action: formData.driver_type,
        type: formData.driver_type === 'debit' ? 0 : 1,
        message: formData.driver_message,
      });
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/driver-wallet-histories`, {
        method: 'POST',
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
      console.error('Error:', error);
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchButtonClick = async () => {
    if (searchText.trim() === '') {
      // Optionally handle empty search query
      return;
    }
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/all-drivers?filter=${searchText}`, {
        method: 'GET',
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
  
      const data = await response.json();
  
      if (data.success) {
        let singleResult = data.data;
        if (singleResult.length > 0) {
          // Update only driver_id and leave other fields unchanged
          setFormData((prevData) => ({
            ...prevData,
            driver_id: singleResult[0].id,  // Update only driver_id
          }));
        } else {
          // Reset driver_id if no driver is found
          setFormData((prevData) => ({
            ...prevData,
            driver_id: '',  // Reset driver_id
          }));
        }
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.error('Error during search:', error);
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
    fetchAllDrivers();
  }, [token]);

  return (
    <Card sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 3, borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            <Typography variant="h6" fontWeight={600}>
              Driver Wallet History
            </Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Button variant="contained" color="secondary" onClick={() => router.push("/driver-wallet-history")}>
              Back
            </Button>
          </Grid>
        </Grid>

        <Paper
          elevation={2}
          sx={{ display: "flex", alignItems: "center", p: 2, mt: 3, borderRadius: 2 }}
        >
          <TextField
            id="search-field"
            variant="outlined"
            size="small"
            placeholder="Driver Phone Number"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <Button variant="contained" color="primary" sx={{ ml: 2 }} onClick={handleSearchButtonClick}>
            Find
          </Button>
        </Paper>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mt: 3 }}>
            <Select name="driver_id" value={formData.driver_id} fullWidth displayEmpty readOnly>
              <MenuItem value="" disabled>
                Select Driver
              </MenuItem>
              {AllDrivers.map((driver) => (
                <MenuItem key={driver.id} value={driver.id}>
                  {driver.driverName}
                </MenuItem>
              ))}
            </Select>
            {formErrors.driver_id && (
              <Typography color="error" variant="body2">
                {formErrors.driver_id}
              </Typography>
            )}
          </Box>

          <TextField label="Driver ID" name="driver_id" value={formData.driver_id} fullWidth margin="normal" readOnly />

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
            <Select name="driver_type" value={formData.driver_type} onChange={handleChange} fullWidth displayEmpty>
              <MenuItem value="" disabled>
                Type
              </MenuItem>
              <MenuItem value="cr">Credit</MenuItem>
              <MenuItem value="dr">Debit</MenuItem>
            </Select>
            {formErrors.driver_type && (
              <Typography color="error" variant="body2">
                {formErrors.driver_type}
              </Typography>
            )}
          </Box>

          <TextField
            label="Amount"
            name="wallet_amount"
            value={formData.wallet_amount}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="number"
            error={!!formErrors.wallet_amount}
            helperText={formErrors.wallet_amount}
          />

          <Button sx={{ mt: 3, py: 1.5 }} variant="contained" color="primary" type="submit" fullWidth disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </form>

        <Snackbar open={!!errorMessage} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
          <Alert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="error">
            {errorMessage}
          </Alert>
        </Snackbar>

        <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
          <Alert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="success">
            {successMessage}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default AddDriverWalletHistory;

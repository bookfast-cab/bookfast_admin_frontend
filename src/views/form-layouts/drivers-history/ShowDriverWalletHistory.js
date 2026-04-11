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
import { create } from 'eslint-plugin-react/lib/rules/button-has-type';
import { formatDate } from '../../../utils/utils';

const driverHistoryshow = async (id, token) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/driver-wallet-histories/${id}`, {
      headers: {
        Authorization: `${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const data = response.json();
    
    return data;
  } catch (error) {
    console.error('Error fetching drivers:', error);
  }
}

const EditDriverWalletHistory = () => {
  const router = useRouter();
  const { id } = router.query; // Get driver ID from query params
  
  const [formData, setFormData] = useState({
    driver_id: '',
    driver_name: '',
    phone_number: '',
    amount: '',
    message: '',
    created_at: '',
    updated_at: '',
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  useEffect(() => {
    if (id) {
      driverHistoryshow(id, token).then((data) => {
        setFormData({
          driver_id: data.data.driver_id,
          driver_name: data.data.driver.driverName,
          phone_number: data.data.driver.phone_number,
          
          amount: data.data.amount,
          message: data.data.message,
          created_at: formatDate(data.data.created_at),
          updated_at: formatDate(data.data.updated_at),
        });
      });
    }

  }, [id, token]);

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          <Grid item xs={6}>
            <Typography variant="h6">{'Driver Wallet History'}</Typography>
          </Grid>
          <Grid item xs={6} style={{ textAlign: 'right' }}>
            <Button variant="contained" onClick={() => router.push('/driver-wallet-history')}>
              Back
            </Button>
          </Grid>
        </Grid>

        <form>
          <TextField
            label="Driver"
            name="driver"
            value={formData.driver_name}
            fullWidth
            readonly
            margin="normal"
          />
          <TextField
            label="Driver Phone"
            name="phone_number"
            value={formData.phone_number}
            fullWidth
            readonly
            margin="normal"
          />
          <TextField
            label="Message"
            name="message"
            value={formData.message}
            fullWidth
            readonly
            margin="normal"
          />

          <TextField
            label="Amount"
            name="amount"
            value={formData.amount}
            fullWidth
            readonly
            margin="normal"
          />
          <TextField
            label="Created At"
            name="created_at"
            value={formData.created_at}
            fullWidth
            readonly
            margin="normal"
          />
          <TextField
            label="Updated At"
            name="updated_at"
            value={formData.updated_at}
            fullWidth
            readonly
            margin="normal"
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default EditDriverWalletHistory;

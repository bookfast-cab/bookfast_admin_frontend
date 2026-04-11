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
import { formatDate } from 'src/utils/utils';


const getSingleZone = async (id,token) => {

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/zones/${id}`, {
      headers: {
        Authorization: `${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  const data = await response.json();
  
  return data.data;
};

const ShowZone = () => {
  const router = useRouter();
  const {id}=router.query;
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    country_id: '',
        zone_ar: '',
        zone: '',
        created_at:'',
        updated_at:'',
      
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const handleCloseSnackbar = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  
  useEffect(() => {
      const fetchSingleZone = async () => {
  
        const singlezone = await getSingleZone(id,token);
        if(singlezone){
          setFormData({
            country_id: singlezone.country_id,
            zone: singlezone.name,
            zone_ar: singlezone.name_ar,
            created_at: singlezone.created_at?formatDate(singlezone.created_at):null,
            updated_at: singlezone.updated_at?formatDate(singlezone.updated_at):null,
          });
        }
      };
      fetchSingleZone();
    },[id,token]);

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          <Grid item xs={6}>
            <Typography variant="h6">{'Zones'}</Typography>
          </Grid>
          <Grid item xs={6} style={{ textAlign: 'right' }}>
            <Button variant="contained" onClick={() => router.push('/zones')}>
              Back
            </Button>
          </Grid>
        </Grid>

        <form >
          
        <Box sx={{ mt: 2 }}>
            <Select
              name="country_id"
              value={formData.country_id}             
              fullWidth
              displayEmpty
              disabled
            >
              <MenuItem value="" disabled></MenuItem>
              <MenuItem value="1">switzerland</MenuItem>
              <MenuItem value="2">India</MenuItem>
            </Select>
          </Box>
        <TextField
                label="Zone"
                name="zone"
                value={formData.zone_ar}
                fullWidth
                margin="normal"
                readonly
                />
        
          <TextField
            label="Zone Ar"
            name="zone_ar"
            value={formData.zone_ar}
            fullWidth
            margin="normal"
            readonly
            />
    
        <TextField
                label="Created At"
                name="created_at"
                value={formData.created_at}
                fullWidth
                margin="normal"
                readonly
                />
                
            <TextField
            label="Updated At"
            name="updated_at"
            value={formData.updated_at}
            fullWidth
            margin="normal"
            readonly
            />
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

export default ShowZone;

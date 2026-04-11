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
import { formatDate } from '../../../utils/utils';

const packageHistory = async (id,token) => {

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/package/${id}`, {
      headers: {
        Authorization: `${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  const data = await response.json();
  
  return data.data;
};

const EditPackage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    package_name: '',
    package_name_ar: '',
    hours: '',
    kilometers  : '',
    created_at: '',
    updated_at: '',
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

   

  useEffect(() => {

    
    const fetchPackage = async () => {

      const packageData = await packageHistory(id,token);
      if(packageData){
        setFormData({
          package_name: packageData.package_name,
          package_name_ar: packageData.package_name_ar,
          hours: packageData.hours,
          kilometers: packageData.kilometers,
          created_at: formatDate(packageData.created_at),
          updated_at: formatDate(packageData.updated_at),
        });
      }
    };
    fetchPackage();
  },[id,token]);

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          <Grid item xs={6}>
            <Typography variant="h6">{'Package Details'}</Typography>
          </Grid>
          <Grid item xs={6} style={{ textAlign: 'right' }}>
            <Button variant="contained" onClick={() => router.push('/package')}>
              Back
            </Button>
          </Grid>
        </Grid>

        <form >
          
         
                 <TextField
                     label="Package Name"
                     name="package_name"
                     value={formData.package_name}
                       readonly
                     fullWidth
                     margin="normal"
                     required
                   />
         
                  <TextField
                     label="Package Name Arabic"
                     name="package_name_ar"
                     value={formData.package_name_ar}
                       readonly
                     fullWidth
                     margin="normal"
                   />
         
                  <TextField
                     label="Hours"
                     name="hours"
                     value={formData.hours}
                    readonly
                     fullWidth
                     margin="normal"
                     required
                   />
         
                  <TextField
                     label="Kilometers"
                     name="kilometers"
                     value={formData.kilometers}
                       readonly
                     fullWidth
                     margin="normal"
                     required
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

export default EditPackage;

// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import FormHelperText from '@mui/material/FormHelperText'

import { Select,MenuItem } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useRouter } from 'next/router'

// ** Icons Imports
import EyeOutline from 'mdi-material-ui/EyeOutline'
import EyeOffOutline from 'mdi-material-ui/EyeOffOutline'
import dynamic from 'next/dynamic';

import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const FormLayoutsBasicPageSetupEdit = () => {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleCloseSnackbar = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    slug: '',
    description: '',
  });

  let token, loginType;
  if (typeof window !== 'undefined') {
    // Code that uses localStorage
    token = localStorage.getItem('access_token');
    loginType = atob(localStorage.getItem('login_type'));
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  
  const handleDescriptionChange = (value) => {
    setFormData((prevData) => ({ ...prevData, description: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/common/updatePage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization' : `${token}`
      },
      body: JSON.stringify( formData ),
    }).then(response => response.json())
      .then(data => {
        if(data.success){
          setSuccessMessage(data.message);
          setTimeout(()=>{
            router.push('/pages-setup');
          },1000);
        }else{
          setErrorMessage(data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const getEmployee = async(id) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/common/getPageById/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization' : `${token}`
      },
     
    }).then(response => response.json())
      .then(data => {
        if(data.data.id){
          setFormData(data.data);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  useEffect(()=>{
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    getEmployee(id);
  },[])

  return (
    <Card>
      {/*<CardHeader title='Edit Admin' titleTypographyProps={{ variant: 'h6' }} />*/}
      <CardContent>

        <Grid container spacing={6}>
          <Grid item xs={6}>
            <Typography variant='h6'>
              Edit Page
            </Typography>
          </Grid>
          <Grid item xs={6} style={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              onClick={()=>router.push('/pages-setup')}
            >
              Back
            </Button>
          </Grid>
        </Grid>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          {/* <TextField
            label="Slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          /> */}
          <Box margin="normal" style={{ marginBottom:'50px' }}>
            <Typography variant="body1">Description</Typography>

            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={handleDescriptionChange}  
              style={{ height: '200px' }}
            />
          </Box>
    
          <Button variant="contained" color="primary" type="submit">
            Submit
          </Button>

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
  )
}

export default FormLayoutsBasicPageSetupEdit

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { Button, SvgIcon } from '@mui/material'
import TextField from '@mui/material/TextField';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import TableBasic from 'src/views/tables/WebsiteBookingsTable'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const MUITable = () => {

  const [data, setData] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(0);
  const [loadingExport, setLoadingExport] = useState(false);

  let token
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token')
  }
  const router = useRouter();
  const { type } = router.query;

  const handleCloseSnackbar = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  const exportToExcel = () => {
    setLoadingExport(true);
    try {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/export-bookings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
          }
      })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'websiteBookings.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(error => {
        console.error('Error exporting to Excel:', error);
      });
      setSuccessMessage('Export successful!');
    } catch (error) {
      setErrorMessage('Export failed. Please try again.');
    } finally {
      setLoadingExport(false);
    }
  };  
 
  const getWebsiteBookings = async (page_num, perPage=10) => {
    const queryParams = new URLSearchParams({
      page: page_num,
      perPage,
      type
    }).toString();

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/website-bookings?${queryParams}`, {
      method: 'GET',
      
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setData(data.data);
        setTotalRecords(data.totalRecords);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setPerPage(data.perPage);
      })
      .catch((err) => {
        console.log(err)
      })
  }

  useEffect(() => { 
    getWebsiteBookings(1);
}, []);


  const searchBookings = async (searchdata) => {
    //console.log("API URL:", `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/booking-search?search=${searchdata}&type=${type}`);
    if (!searchdata) {
      getWebsiteBookings(1);
    }
    
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/booking-search?search=${searchdata}&type=${type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setData(data.data);
        setTotalRecords(data.totalRecords);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setPerPage(data.perPage);
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const handleSearchMethod=(searchdata)=>{
    searchBookings(searchdata)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={6}>
        <Typography variant='h5'>
          Trips {type=='active' ? '(Active)' : ''}
        </Typography>
      </Grid>

      <Grid
        item
        xs={12}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        {/* Search Field */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Search:</span>
          <TextField
            id="search-field"
            variant="outlined"
            size="small"
            placeholder="Search Bookings"
            onChange={(e) => handleSearchMethod(e.target.value)}
            style={{ width: '300px' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
        <Button
              variant="contained"
              onClick={() => exportToExcel() }
            >
            {loadingExport ? 'Processing...' : 'Export'}
          </Button>
        </div>
      </Grid>


      <Grid item xs={12}>
        <Card>
          <TableBasic
            items={data}
            totalRecords={totalRecords}
            totalPages={totalPages}
            currentPage={currentPage}
            perPage={perPage}
            onPageChange={getWebsiteBookings}
          />
        </Card>
      </Grid>

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

    </Grid>
  )
}

export default MUITable

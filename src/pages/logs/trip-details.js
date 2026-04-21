import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { Button, SvgIcon } from '@mui/material'
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import TripLogsDetailsTable from 'src/views/tables/TripLogsDetailsTable';
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const TripDetails = () => {

  const [data, setData] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(0);
  
  let token
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token')
  }
  const router = useRouter();
  const { trip_id } = router.query

  const handleCloseSnackbar = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  const getTripDetails = async (page_num, perPage=10,search='') => {
    
    const queryParams = new URLSearchParams({
      page: page_num,
      perPage,
      search:search,
      trip_id:trip_id
    }).toString();

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/get-trip-logs-details?${queryParams}`, {
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
    if (!router.isReady) return;
    getTripDetails(0);
}, [router.isReady, trip_id]);


  return (
    <Grid container spacing={6}>
      <Grid item xs={6}>
        <Typography variant='h5'>
          Trip Sent Details
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
            placeholder="Search Trip"
            onChange={(e) => getTripDetails(0,10,e.target.value)}
            style={{ width: '300px' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
      
          {/* <Button startIcon={(
            <SvgIcon fontSize="small">
            <PlusIcon />
            </SvgIcon>
        )}
            variant="contained"
            onClick={() => router.push('/trips/add')}
          >
            Add 
          </Button> */}
        </div>
      </Grid>


      <Grid item xs={12}>
        <Card>
          <TripLogsDetailsTable
            items={data}
            totalRecords={totalRecords}
            totalPages={totalPages}
            currentPage={currentPage}
            perPage={perPage}
            onPageChange={getTripDetails}
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

export default TripDetails

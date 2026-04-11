import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { Button, SvgIcon } from '@mui/material'
import TextField from '@mui/material/TextField';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import TableBasic from 'src/views/tables/TourPackageTable';
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
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/export-tourPackages`, {
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
        a.download = 'tourPackages.csv';
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
 
  const getTourPackages = async (page_num, perPage=10) => {
    
    const queryParams = new URLSearchParams({
      page: page_num,
      perPage,
      type
    }).toString();
    console.log('Fetching data from:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/tour-packages?${queryParams}`);

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/tour-packages?${queryParams}`, {
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
    getTourPackages(1);
}, []);


  const searchTrips = async (searchdata) => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/package-search?search=${searchdata}&type=${type}`, {
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
 

  const handleDelete = async (idToDelete) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/delete-package/${idToDelete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setSuccessMessage('Tour Package deleted successfully!')
            setData(data.filter((item) => item.id != idToDelete));
        } else {
          setErrorMessage(data.message)
        }
      })
      .catch(error => {
        console.error('Error:', error)
      })

  }

  const handleUpdateStatus = (id, newStatus) => {
    setData(data.map(notification =>
      notification.id === id ? { ...notification, status: newStatus } : notification
    ))
  }

  const handleSearchMethod=(searchdata)=>{
    searchTrips(searchdata)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={6}>
        <Typography variant='h5'>
          Packages {type=='active' ? '(Active)' : ''}
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
            placeholder="Search Packages"
            onChange={(e) => handleSearchMethod(e.target.value)}
            style={{ width: '300px' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
        <Button
              variant="contained"
              
              // onClick={() => downloadCSV(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/export-drivers`, 'drivers.csv')}
              onClick={() => exportToExcel() }
            >
            {loadingExport ? 'Processing...' : 'Export'}
          </Button>
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
          <TableBasic
            items={data}
            onDelete={handleDelete}
            onUpdateStatus={handleUpdateStatus}
            totalRecords={totalRecords}
            totalPages={totalPages}
            currentPage={currentPage}
            perPage={perPage}
            onPageChange={getTourPackages}
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

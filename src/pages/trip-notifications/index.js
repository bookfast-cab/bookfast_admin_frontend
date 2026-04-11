// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { Button, SvgIcon } from '@mui/material'
import PlusIcon from '@heroicons/react/24/solid/PlusIcon'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'

// ** Demo Components Imports
import TableBasic from 'src/views/tables/TripNotifications'

// ** React Imports
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

  let token
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token')
  }
  const router = useRouter()

  const handleCloseSnackbar = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  const getNotificationMessages = async (page_num) => {
    const queryParams = new URLSearchParams({
      page: page_num
    }).toString();
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/notification-messages/trip?${queryParams}`, {
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
    getNotificationMessages(1)
  }, [])

  const handleDelete = async (idToDelete) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/delete-notification-message/${idToDelete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setSuccessMessage('Notification message deleted successfully!')
          getNotificationMessages(1)
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

  return (
    <Grid container spacing={6}>
      <Grid item xs={6}>
        <Typography variant='h5'>
            Trip Notification
        </Typography>
      </Grid>
      <Grid item xs={6} style={{ textAlign: 'right' }}>
        <Button
          startIcon={(
            <SvgIcon fontSize="small">
              <PlusIcon />
            </SvgIcon>
          )}
          variant="contained"
          onClick={() => router.push('/trip-notifications/add')}
        >
          Add
        </Button>
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
            onPageChange={getNotificationMessages}
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

// pages/admin/AdvanceBookingManagement.js

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { Button, Chip, IconButton, Tooltip, TextField, SvgIcon } from '@mui/material'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import CommonDataTable from 'src/components/CommonDataTable'
import { formatDate } from 'src/utils/utils'
import PlusIcon from '@heroicons/react/24/solid/PlusIcon'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationDialog from 'src/components/Confirmation'
import AdvanceBookingDrawer from './AdvanceBookingDrawer'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

// import AdvanceBookingDrawer from './AdvanceBookingDrawer' // optional detail drawer

const AdvanceBookingManagement = () => {
  const [data, setData] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [openUpdateStatusDialog, setOpenUpdateStatusDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleOpenUpdateStatusDialog = (row) => {
    setSelectedBooking(row);
    setOpenUpdateStatusDialog(true);
  };

  const handleCloseUpdateStatusDialog = () => {
    setOpenUpdateStatusDialog(false);
    setSelectedBooking(null);
  };
  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const router = useRouter()

  let token
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token')
  }

  const handleCloseSnackbar = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  const fetchAdvanceBookings = async (page_num = 0, perPage = 10) => {
    const queryParams = new URLSearchParams({
      page: page_num,
      perPage, perPage,
      search: searchText
    }).toString()

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/advance-bookings?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        }
      })

      const response = await res.json()
      setData(
        response.data.map((item) => ({
          ...item,
          id: item.id
        }))
      )
      setTotalRecords(response.totalRecords)
      setTotalPages(response.totalPages)
      setCurrentPage(response.currentPage)
      setPerPage(response.perPage)
    } catch (err) {
      console.error(err)
      setErrorMessage('Failed to fetch bookings')
    }
  }

  const handleUpdateStatus = async (status) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/updateAdvanceTripStatus`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            bookingId: selectedBooking.id,
            status,
          }),
        }
      );
      const data = await response.json();

      if (data.success) {
         setSuccessMessage('Booking status updated successfully')
       setData((prevData) =>
        prevData.map((item) =>
          item.id === selectedBooking.id ? { ...item, status: 3 } : item
        )
      );
        handleCloseUpdateStatusDialog();

        // TODO: refresh DataGrid

      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Something went wrong!');
    }
  };

  useEffect(() => {
    fetchAdvanceBookings(0)
  }, [searchText])

  const handleView = (row) => {
    setSelectedRow(row);
    setDrawerOpen(true);
  };

  const handleEdit = (row) => {
    router.push(`/advanceBooking/EditAdvanceBooking?id=${row}`)
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedRow(null);
  };

  const handleOpenConfirmDialog = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmOpen(false);
    setDeleteId(null);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      handleDelete(deleteId); // your existing delete function
    }
    handleCloseConfirmDialog();
  };

  const handleDelete = async (idToDelete) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/deleteAdvanceBooking/${idToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Advance booking deleted successfully!');
        fetchAdvanceBookings(currentPage, perPage);
      } else {
        setErrorMessage(data.message || 'Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting advance booking:', error);
      setErrorMessage('An unexpected error occurred.');
    }
  };


  const columns = [
    {
      field: 'id',
      headerName: 'Trip ID',
      flex: 0.5, // smaller width compared to others
      minWidth: 80,
      renderCell: (params) => (
        <span
          style={{
            cursor: 'pointer',
            color: '#1976d2',
            textDecoration: 'underline'
          }}
          onClick={() => handleView(params.row)}
        >
          {params.row.id}
        </span>
      )
    },
    { field: 'driver_id', headerName: 'Book by driver', flex: 0.5, minWidth: 80 },
{
  field: 'trip_created_by',
  headerName: 'Created By',
  flex: 0.5,
  minWidth: 80,
  valueGetter: (params) => {
    console.log(params)
    if (!params) return '';

    return params.charAt(0).toUpperCase() + params.slice(1);
  },
},
    { field: 'contact_mobile', headerName: 'Mobile', flex: 0.7, minWidth: 100 },
    {
      field: 'pickup_date',
      headerName: 'Pickup Date',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => <span>{formatDate(params.row.pickup_date)}</span>
    },
    {
      field: 'pickup_address',
      headerName: 'Pickup',
      flex: 1.5,
      minWidth: 160,
      renderCell: (params) => (
        <Tooltip title={params.row.pickup_address || ''}>
          <span
            style={{
              cursor: 'pointer',
              color: '#1976d2',
              textDecoration: 'underline'
            }}
            onClick={() => handleView(params.row)}
          >
            {(params.row.pickup_address || '').slice(0, 40)}...
          </span>
        </Tooltip>
      )
    },
    {
      field: 'drop_address',
      headerName: 'Drop',
      flex: 1.5,
      minWidth: 160,
      renderCell: (params) => (
        <Tooltip title={params.row.drop_address || ''}>
          <span>{(params.row.drop_address || '').slice(0, 40)}...</span>
        </Tooltip>
      )
    },
    { field: 'total_amount', headerName: 'Fare', flex: 0.6, minWidth: 80 },
    { field: 'commission_amount', headerName: 'Commission Amt', flex: 0.8, minWidth: 100 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const status = params.row.status;

        if (status === 0) {
          return (
            <Tooltip title="Update Status" arrow>
              <IconButton
                onClick={() => handleOpenUpdateStatusDialog(params.row)}
                sx={{
                  backgroundColor: '#f0f0f0',
                  borderRadius: '8px',
                  padding: '5px',
                  transition: '0.2s',
                  '&:hover': {
                    backgroundColor: '#e0e0e0'
                  }
                }}
              >
                <CheckCircleOutlineIcon sx={{ color: '#1976d2', fontSize: '20px' }} />
              </IconButton>
            </Tooltip>
          );
        }

        const label = status === 1 || status === 3 ? 'Booked' : 'Cancelled';
        const color = status === 1 || status === 3 ? 'success' : 'error';

        return <Chip label={label} color={color} size="small" />;
      }
    },

    {
      field: 'created_at',
      headerName: 'Created At',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => <span>{formatDate(params.row.created_at)}</span>
    },
    {
  field: 'actions',
  headerName: 'Actions',
  flex: 1,
  minWidth: 140,
  sortable: false,
  filterable: false,
  renderCell: (params) => (
    <>
      <Tooltip title="View" arrow>
        <IconButton
          onClick={() => handleView(params.row)}
          sx={{
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            padding: '5px',
            marginRight: '5px',
            transition: '0.2s',
            '&:hover': {
              backgroundColor: '#e0e0e0'
            }
          }}
        >
          <VisibilityIcon sx={{ color: '#2e7d32', fontSize: '20px' }} />
        </IconButton>
      </Tooltip>

      {/* ✅ Show Edit button only if status == 0 */}
      {params.row.status === 0 && (
        <Tooltip title="Edit" arrow>
          <IconButton
            onClick={() => handleEdit(params.row.id)}
            sx={{
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              padding: '5px',
              transition: '0.2s',
               marginRight: '5px',
              '&:hover': {
                backgroundColor: '#e0e0e0'
              }
            }}
          >
            <EditIcon sx={{ color: 'blue', fontSize: '20px' }} />
          </IconButton>
        </Tooltip>
      )}

      {params.row.status !== 1 && (
        <Tooltip title="Delete" arrow>
          <IconButton
            onClick={() => handleOpenConfirmDialog(params.row.id)}
            sx={{
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              padding: '5px',
              transition: '0.2s',
              '&:hover': {
                backgroundColor: '#e0e0e0'
              }
            }}
          >
            <DeleteIcon sx={{ color: 'red', fontSize: '20px' }} />
          </IconButton>
        </Tooltip>
      )}
    </>
  )
}

  ];




  return (
    <Grid container spacing={6}>
      <Grid item xs={6}>
        <Typography variant='h5'>
          Advance Booking
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
          onClick={() => router.push('/advanceBooking/addAdvanceBooking')}
        >
          Add
        </Button>
      </Grid>

      <Grid item xs={12} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Search:</span>
          <TextField
            id="search-field"
            variant="outlined"
            size="small"
            placeholder="Search Bookings"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: '300px' }}
          />
        </div>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CommonDataTable
            columns={columns}
            items={data}
            totalRecords={totalRecords}
            totalPages={totalPages}
            currentPage={currentPage}
            rowsPerPage={perPage}
            onPageChange={fetchAdvanceBookings}
          />
        </Card>
      </Grid>

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

      {/* <AdvanceBookingDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        row={selectedRow}
      /> */}
      <ConfirmationDialog
        open={confirmOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        content="Are you sure you want to delete this trip? This action cannot be undone."
      />
      <AdvanceBookingDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        data={selectedRow}

      />
      <Dialog open={openUpdateStatusDialog} onClose={handleCloseUpdateStatusDialog}>
        <DialogTitle>Advance booking status</DialogTitle>
        <DialogContent>
          Do you want to update the booking status for <b>{selectedBooking?.id}</b>?
        </DialogContent>
        <DialogActions>
           {/* <Button onClick={() => handleUpdateStatus(4)} color="error" variant="outlined">
            Cancel
          </Button> */}
           <Button onClick={handleCloseUpdateStatusDialog} color="error" variant="outlined">
            Cancel
          </Button>
          <Button onClick={() => handleUpdateStatus(2)} color="success" variant="contained">
            Mark as Booked
          </Button>
         
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default AdvanceBookingManagement

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { Button, IconButton, SvgIcon } from '@mui/material'
import TextField from '@mui/material/TextField';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import TableBasic from 'src/views/tables/DailyFireManagement'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

import * as XLSX from 'xlsx';
import CommonDataTable from 'src/components/CommonDataTable';
import { Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

const MUITable = () => {

  const [data, setData] = useState([])
  const [dataToExport, setDataToExport] = useState([])
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

  const downloadCSV = async (main_url, filename) => {
    const response = await fetch(main_url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'Donloaded_file';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };
 
  const getDailyFareManagement = async (page_num) => {
    const queryParams = new URLSearchParams({
      page: page_num
    }).toString();
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/daily-fare-management?${queryParams}`, {
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
    getDailyFareManagement(1);
  }, [])

  const handleDelete = async (idToDelete) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/daily-fare-management/${idToDelete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setSuccessMessage('Daily Fare deleted successfully!')
          getDailyFareManagement(1)
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

  const handleEdit = (id) => {
    router.push(`/daily-fare-management/edit?id=${id}`);
  };

  const handleShow = (id) => {
    router.push(`/daily-fare-management/show?id=${id}`);
  };



  const columns = [
    { field: 'id', headerName: '#', width: 70, renderCell: (params) =>params.row.id },
    { field: 'vehicle', headerName: 'Vehicle Type', valueGetter: (params) => params.vehicle_type || '-', },

    { field: 'base_fare', headerName: 'Base Fare', width: 120 },
    { field: 'price_per_km', headerName: 'Price / KM', width: 130 },
    { field: 'price_per_min', headerName: 'Price / Minute', width: 150 },
    { field: 'waiting_time_charge', headerName: 'Waiting Charges', width: 160 },
    { field: 'cancellation_charge', headerName: 'Cancellation Charges', width: 170 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) =>
        params.value === 1 ? (
          <Chip label="Active" color="success" size="small" />
        ) : (
          <Chip label="Inactive" color="error" size="small" />
        )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleEdit(params.row.id)}>
            <EditIcon />
          </IconButton>
          <IconButton color="info" onClick={() => handleShow(params.row.id)}>
            <VisibilityIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </>
      )
    }
  ];
  

  return (
    <Grid container spacing={4} sx={{ bgcolor: "white", padding: 3 }}>

      <Grid item xs={6}>
        <Typography variant="h5">Daily Fare Management</Typography>
      </Grid>
      <Grid item xs={6} style={{ textAlign: 'right' }}>
        <Button startIcon={(
                <SvgIcon fontSize="small">
                <PlusIcon />
                </SvgIcon>
            )}
            variant="contained"
            onClick={() => router.push('/daily-fare-management/add')}
            >
          Add
        </Button>
      </Grid>
 

      <Grid item xs={12}>
        <Card>
        <CommonDataTable
            columns={columns}
            items={data}
            onDelete={handleDelete}
            onUpdateStatus={(id, newStatus) =>
              setData((prevData) =>
                prevData.map((item) =>
                  item.id === id ? { ...item, status: newStatus } : item
                )
              )
            }
            totalRecords={totalRecords}
            totalPages={totalPages}
            currentPage={currentPage}
            rowsPerPage={perPage}
            onPageChange={getDailyFareManagement}
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

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { Button, Chip, IconButton, SvgIcon, Tooltip } from '@mui/material'
import TextField from '@mui/material/TextField';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import { formatDate, formatTime } from 'src/utils/utils';

import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import CommonDataTable from 'src/components/CommonDataTable';
import CustomerDrawer from './CustomerDrawer';
import EditCustomerDrawer from './EditCustomerDrawer';

const MUITable = () => {

  const [data, setData] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(0);
  const [searchText, setSearchText] = useState("");

  let token
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token')
  }
  const router = useRouter()

  const handleCloseSnackbar = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  const getCustomers = async (page_num, perPage = 10) => {
    const queryParams = new URLSearchParams({
      page: page_num,
       perPage: perPage,
       search: searchText
    }).toString();
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customers?${queryParams}`, {
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
    getCustomers(1)
  }, [searchText])

  const handleDelete = async (idToDelete) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/delete-customer/${idToDelete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setSuccessMessage('Customer deleted successfully!')
          getCustomers(1)
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

  const exportToExcel = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/export-customers`, {
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
        a.download = 'customers.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(error => {
        console.error('Error exporting to Excel:', error);
      });
  }

  const handleSearchMethod = (searchdata) => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customer-search?search=${searchdata}`, {
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


  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const handleView = (row) => {
    console.log(row)
    setSelectedRowData(row);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedRowData(null);
  };

  const handleEditDrawerClose = () => {
    setEditDrawerOpen(false);
    setSelectedRowData(null);
  };


  const handleEditView = (row) => {
    setSelectedRowData(row);
    setEditDrawerOpen(true);
  };

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
    },
    {
      field: 'full_name',
      headerName: 'Name',
      width: 180,
      renderCell: (params) => (
        <span>
          {params.row.first_name || 'N/A'} {params.row.last_name || ''}
        </span>
      ),
    },
    {
      field: 'phone_with_code',
      headerName: 'Phone',
      width: 150,
    },
    {
      field: 'gender',
      headerName: 'Gender',
      width: 100,
      renderCell: (params) => <span>{params.row.gender || '-'}</span>,
    },
    {
      field: 'referral_code',
      headerName: 'Referral Code',
      width: 150,
    },
    {
      field: 'wallet',
      headerName: 'Wallet',
      width: 120,
    },
    {
      field: 'created_at',
      headerName: 'Created At',
      width: 180,
      renderCell: (params) => (
        <span>{params.row.created_at ? params.row.created_at : 'N/A'}</span>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.status === 1 ? 'Active' : 'Inactive'}
          color={params.row.status === 1 ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
     renderCell: (params) => (
  <>
    <Tooltip title="Edit" arrow>
      <IconButton
        onClick={() => handleEditView(params.row)}
        sx={{
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
          padding: '5px',
          marginRight: '5px',
          transition: '0.2s',
          '&:hover': {
            backgroundColor: '#e0e0e0',
          },
        }}
      >
        <EditIcon sx={{ color: '#1976d2', fontSize: '20px' }} />
      </IconButton>
    </Tooltip>

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
            backgroundColor: '#e0e0e0',
          },
        }}
      >
        <VisibilityIcon sx={{ color: '#2e7d32', fontSize: '20px' }} />
      </IconButton>
    </Tooltip>

    <Tooltip title="Delete" arrow>
      <IconButton
        onClick={() => handleDelete(params.row.id)}
        sx={{
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
          padding: '5px',
          transition: '0.2s',
          '&:hover': {
            backgroundColor: '#e0e0e0',
          },
        }}
      >
        <DeleteIcon sx={{ color: 'red', fontSize: '20px' }} />
      </IconButton>
    </Tooltip>
  </>
)

    },
  ];

  return (
    <Grid container spacing={6}>
      <Grid item xs={6}>
        <Typography variant='h5'>
          Customers
        </Typography>
      </Grid>
      <Grid item
        xs={12}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Search:</span>
          <TextField
            id="search-field"
            variant="outlined"
            size="small"
            placeholder="Search Customers"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: '300px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="contained"
            onClick={() => exportToExcel()}
          >
            Export
          </Button>
          <Button
            startIcon={(
              <SvgIcon fontSize="small">
                <PlusIcon />
              </SvgIcon>
            )}
            variant="contained"
            onClick={() => router.push('/customers/add')}
          >
            Add
          </Button>
        </div>
      </Grid>
      <Grid item xs={12}>
        <Card>

          <CommonDataTable
            columns={columns}
            items={data}
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
            onPageChange={getCustomers}
          />

          {/* <TableBasic
            items={data}
            onDelete={handleDelete}
            onUpdateStatus={handleUpdateStatus}
            totalRecords={totalRecords}
            totalPages={totalPages}
            currentPage={currentPage}
            perPage={perPage}
            onPageChange={getCustomers}
          /> */}
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
      <CustomerDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        data={selectedRowData}
      />
      <EditCustomerDrawer
        open={editDrawerOpen}
        onClose={handleEditDrawerClose}
        data={selectedRowData}
      />
    </Grid>
  )
}

export default MUITable

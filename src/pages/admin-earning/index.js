import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { Button, Chip, IconButton, SvgIcon, Tooltip } from '@mui/material'
import TextField from '@mui/material/TextField'
import PlusIcon from '@heroicons/react/24/solid/PlusIcon'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'

import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import CommonDataTable from 'src/components/CommonDataTable'
import { formatDate } from 'src/utils/utils'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PaymentRemarksDrawer from './PaymentRemarksDrawer'

const AdminEarning = () => {
  const [data, setData] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [earningsByStatus, setearningsByStatus] = useState({});

  let token
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token')
  }

  const router = useRouter()

  const handleCloseSnackbar = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  const fetchPayments = async (page_num = 0) => {
    const queryParams = new URLSearchParams({ page: page_num,
       search: searchText,
     }).toString()
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/admin-commission?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      })
      const response = await res.json()
      setData(response.data)
      setTotalRecords(response.totalRecords)
      setTotalPages(response.totalPages)
      setCurrentPage(response.currentPage)
      setPerPage(response.perPage)
      setearningsByStatus(response.earningsByStatus)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchPayments(0)
  }, [searchText])

 

  const handleReloadRow = async (row) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/payment/${row.orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        }
      });

      const result = await res.json();
      if (result.success) {
        const updatedRow = {
          ...result.data,
          id: result.data.payment_id  // ✅ Add `id` field for MUI DataGrid
        };

        setData((prevData) =>
          prevData.map((item) =>
            item.orderId === row.orderId ? updatedRow : item
          )
        );
        setSuccessMessage('Payment refreshed');
      } else {
        setErrorMessage(result.message || 'Failed to reload');
      }

    } catch (err) {
      console.error('Reload error:', err);
      setErrorMessage('Error refreshing row');
    }
  };


const columns = [
  { field: 'id', headerName: 'ID', flex: 0.5, minWidth: 70 },

  {
    field: 'trip_id',
    headerName: 'Trip ID',
    flex: 1,
    minWidth: 150,
    renderCell: (params) => {
      const fullTripId = params.row.trip_id?.toString() || '';
      const shortTripId = fullTripId.length > 12 ? `${fullTripId.slice(0, 12)}...` : fullTripId;

      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span title={fullTripId}>{shortTripId}</span>
        </div>
      );
    }
  },

  { field: 'driver_id', headerName: 'Driver ID', flex: 0.8, minWidth: 100 },

  {
    field: 'commission_amount',
    headerName: 'Commission (₹)',
    flex: 0.8,
    minWidth: 120,
    renderCell: (params) => (
      <span style={{ fontWeight: 'bold' }}>
        ₹{parseFloat(params.row.commission_amount || 0).toFixed(2)}
      </span>
    )
  },

  {
    field: 'commission_status',
    headerName: 'Status',
    flex: 0.7,
    minWidth: 100,
    renderCell: (params) => (
      <Chip
        label={params.row.commission_status === 1 ? 'Paid' : 'Pending'}
        color={params.row.commission_status === 1 ? 'success' : 'warning'}
        size="small"
      />
    )
  },

  {
    field: 'created_at',
    headerName: 'Created At',
    flex: 1,
    minWidth: 150,
    renderCell: (params) => (
      <span>{formatDate(params.row.created_at)}</span>
    )
  },

  {
    field: 'actions',
    headerName: 'Actions',
    flex: 0.6,
    minWidth: 100,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Tooltip title="View">
        <IconButton onClick={() => {
          setSelectedRow(params.row);
          setDrawerOpen(true);
        }}>
          <VisibilityIcon fontSize="small" sx={{ color: '#2e7d32' }} />
        </IconButton>
      </Tooltip>
    )
  }
];


  return (
    <Grid container spacing={6}>
      <Grid item xs={6}>
    <Typography variant="h5">Admin Commission</Typography>
  </Grid>

  <Grid item xs={6} style={{ textAlign: 'right' }}>
    <Typography variant="body1">
      <strong>Pending:</strong> ₹{earningsByStatus[0]?.toFixed(2) || '0.00'}
    </Typography>
    <Typography variant="body1">
      <strong>Paid:</strong> ₹{earningsByStatus[1]?.toFixed(2) || '0.00'}
    </Typography>
  </Grid>

      <Grid item xs={12} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Search:</span>
          <TextField
            id="search-field"
            variant="outlined"
            size="small"
            placeholder="Search Payments"
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
            onPageChange={fetchPayments}

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
      <PaymentRemarksDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        row={selectedRow}
      />
    </Grid>
  )
}

export default AdminEarning

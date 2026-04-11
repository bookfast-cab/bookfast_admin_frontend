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

const PaymentManagement = () => {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/payments?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      })
      const response = await res.json()
      setData(
        response.data.map((item) => ({
          ...item,
          id: item.payment_id // 👈 Add `id` using `payment_id`
        }))
      )
      setTotalRecords(response.totalRecords)
      setTotalPages(response.totalPages)
      setCurrentPage(response.currentPage)
      setPerPage(response.perPage)
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
    { field: 'payment_id', headerName: 'ID', width: 90 },
    { field: 'userType', headerName: 'User Type', width: 120 },
    { field: 'userId', headerName: 'User ID', width: 100 },
    {
      field: 'orderId',
      headerName: 'Order ID',
      width: 200,
      renderCell: (params) => {
        const fullOrderId = params.row.orderId;
        const shortOrderId = fullOrderId.length > 15 ? `${fullOrderId.slice(0, 15)}...` : fullOrderId;

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span title={fullOrderId}>{shortOrderId}</span>
            <Tooltip title="Copy Order ID">
              <IconButton
                size="small"
                onClick={() => navigator.clipboard.writeText(fullOrderId)}
              >
                <ContentCopyIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </div>
        );
      }
    },
    { field: 'amount', headerName: 'Amount', width: 100 },
    {
      field: 'memberShipPlanId',
      headerName: 'Type',
      width: 100,
      renderCell: (params) => (
        <span>{params.row.memberShipPlanId > 0 ? 'Membership' : 'Wallet'}</span>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.row.status || 'Unknown'}
          color={params.row.status === 'success' ? 'success' : 'warning'}
          size="small"
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 180,
      renderCell: (params) => <span>{formatDate(params.row.createdAt) || '-'}</span>
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <Tooltip title="View">
            <IconButton onClick={() => {
              setSelectedRow(params.row); // full row object
              setDrawerOpen(true);
            }}>
              <VisibilityIcon fontSize="small" sx={{ color: '#2e7d32' }} />
            </IconButton>
          </Tooltip>

          {params.row.status !== 'success' && (
            <Tooltip title="Reload">
              <IconButton onClick={() => handleReloadRow(params.row)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M2 12a10 10 0 1 1 5 8.66M2 12H7m-5 0l2.5 2.5"
                    stroke="#f57c00"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconButton>
            </Tooltip>
          )}
        </>
      )
    }


  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={6}>
        <Typography variant="h5">Payments</Typography>
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

export default PaymentManagement

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { 
  Button, Chip, IconButton, SvgIcon, Tooltip, Box, 
  Drawer, Divider, Paper, Link as MuiLink,
  Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material'
import TextField from '@mui/material/TextField'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import CommonDataTable from 'src/components/CommonDataTable'
import { formatDate } from 'src/utils/utils'
import axios from 'axios'
import getFingerprint from 'src/utils/Fingerprint'
import { CircularProgress } from '@mui/material'
import ExportButton from 'src/components/export'

// Helper to map admin_status / payment_status to meaningful labels and colors
const getStatusDetails = (status) => {
  if (status === null || status === undefined) {
    return { label: 'N/A', color: 'default' };
  }

  const stringStatus = String(status);

  switch (stringStatus) {
    case '0': return { label: 'Pending', color: 'warning' };
    case '1': return { label: 'Approved', color: 'success' };
    case '2': return { label: 'Rejected', color: 'error' };
    case 'success': return { label: 'Success', color: 'success' };
    case 'failed': return { label: 'Failed', color: 'error' };
    default: return { label: stringStatus, color: 'default' };
  }
};

const WithdrawalRequestsTable = () => {
  const [data, setData] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Drawer States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  
  const [searchText, setSearchText] = useState("");
  const [searchType, setSearchType] = useState("id"); 
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false); 
  const [loadingExport, setLoadingExport] = useState(false);

  // Reject Dialog States
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRemark, setRejectRemark] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const abortControllerRef = useRef(null); 

  let token
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token')
  }

  const router = useRouter()

  const handleCloseSnackbar = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  // Fetch Requests
  const fetchWithdrawals = async (page_num = 0) => {
    if (loading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);

    const queryParams = new URLSearchParams({ 
      page: page_num,
      perPage:perPage,
      search: searchText,
      searchType: searchType
    }).toString()

    try {
      const device_id = await getFingerprint();
      
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/driver-withdrawal-requests?${queryParams}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
          'x-device-id': device_id,
        }
      })
      
      const response = res.data;
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
      if (axios.isCancel(err)) return;
      if (err.response && err.response.status === 401) {
        localStorage.clear();
        window.location.href = '/pages/login'; 
      }
      console.error('Error fetching withdrawal requests:', err);
      setErrorMessage('Failed to load withdrawal requests.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWithdrawals(0)
    
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
    
  }, []) 

  const executeStatusUpdate = async (id, status, remark = '') => {
    const actionText = status === '1' ? 'Approve' : 'Reject';
    const device_id = await getFingerprint();

    setLoading(true);
    try {
      const payload = {
        request_id: id,
        admin_status: status,
      };
      
      if (remark) {
        payload.remark = remark; 
      }

      await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/update-driver-withdrawal-request`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
          'x-device-id': device_id,
        }
      });
      
      setSuccessMessage(`Request successfully ${actionText.toLowerCase()}d!`);
      setDrawerOpen(false); 
      fetchWithdrawals(currentPage); 
    } catch (error) {
      console.error(`Error ${actionText}ing request:`, error);
      setErrorMessage(error.response?.data?.message || `Failed to ${actionText.toLowerCase()} request.`);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = (id, status) => {
    if (status === '2') {
      setSelectedRequestId(id);
      setRejectRemark('');
      setRejectDialogOpen(true);
    } else {
      if (!window.confirm('Are you sure you want to approve this withdrawal request?')) {
        
        return;

      }
      executeStatusUpdate(id, status);
    }
  }

  const handleRejectSubmit = () => {
    if (!rejectRemark.trim()) {
      setErrorMessage("Please enter a remark for rejection.");
      
      return;

    }
    setRejectDialogOpen(false);
    executeStatusUpdate(selectedRequestId, '2', rejectRemark);
  }

  const handleSearchClick = () => {
    if (!loading) fetchWithdrawals(1);
  };

  const exportToExcel = async () => {
    setLoadingExport(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/export-withdrawals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'withdrawal_requests.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setSuccessMessage('Export successful!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setErrorMessage('Export failed. Please try again.');
    } finally {
      setLoadingExport(false);
    }
  }

  // Handler to explicitly open the drawer
  const handleOpenDrawer = (row) => {
    setSelectedRow(row);
    setDrawerOpen(true);
  };

  // Updated columns definition with explicit click trigger on User Name
  const columns = [
    { field: 'id', headerName: 'Request ID', width: 100, renderCell: (params) => <div>#{params.row?.id || '-'}</div> },
    { 
      field: 'user_name', 
      headerName: 'User Name', 
      width: 160, 
      renderCell: (params) => (
        <MuiLink 
          component="button" 
          variant="body2" 
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDrawer(params.row);
          }}
          sx={{ 
            fontWeight: 600, 
            textAlign: 'left', 
            textDecoration: 'underline', 
            cursor: 'pointer', 
            color: 'primary.main',
            background: 'none',
            border: 'none',
            padding: 0
          }}
        >
          {params.row?.driver?.driverName || '-'}
        </MuiLink>
      ) 
    },
    { field: 'user_id', headerName: 'User Id', width: 140, renderCell: (params) => <div>{params.row?.user_id || '-'}</div> },
    { field: 'user_mobile', headerName: 'User Mobile', width: 140, renderCell: (params) => <div>{params.row?.driver?.phone_number || '-'}</div> },
    { field: 'user_type', headerName: 'User Type', width: 120, renderCell: (params) => <div style={{ textTransform: 'capitalize' }}>{params.row?.user_type || '-'}</div> },
    { field: 'amount', headerName: 'Amount', width: 110, renderCell: (params) => <div>₹{params.row?.amount || 0}</div> },
    {
      field: 'admin_status',
      headerName: 'Request Status',
      width: 140,
      renderCell: (params) => {
        const statusDetails = getStatusDetails(params.row.admin_status);
      
        return <Chip label={statusDetails.label} color={statusDetails.color} size="small" />;
      
      }
    },
    {
      field: 'created_at',
      headerName: 'Date',
      width: 180,
      renderCell: (params) => <span>{formatDate(params.row.created_at) || '-'}</span>
    },
     {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {params.row.admin_status === '0' && (
            <>
              <Tooltip title="Approve">
                <IconButton 
                  disabled={actionLoading} 
                  onClick={() => handleUpdateStatus(params.row.id, '1')}
                >
                  <CheckCircleIcon fontSize="small" sx={{ color: '#2e7d32' }} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Reject">
                <IconButton 
                  disabled={actionLoading} 
                  onClick={() => handleUpdateStatus(params.row.id, '2')}
                >
                  <CancelIcon fontSize="small" sx={{ color: '#d32f2f' }} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      )
    }
  ]

  return (
    <Grid container spacing={4} sx={{ bgcolor: "white", padding: 3 }}>
      <Grid item xs={12}>
        <Typography variant="h5">Withdrawal Requests</Typography>
      </Grid>

      <Grid item xs={12} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, marginBottom: '16px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1, maxWidth: 600 }}>
          <TextField
            id="search-field"
            variant="outlined"
            size="small"
            placeholder={`Search Request ID...`}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            fullWidth
            onKeyPress={(e) => e.key === 'Enter' && handleSearchClick()}
            InputProps={{ endAdornment: (<IconButton onClick={handleSearchClick}><SearchIcon /></IconButton>) }}
          />
        </Box>

        {/* <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
          <Button
            startIcon={<SvgIcon fontSize="small"><DownloadIcon /></SvgIcon>}
            variant="contained"
            onClick={exportToExcel}
            disabled={loadingExport}
          >
             {loadingExport ? 'Exporting...' : 'Export Requests'}
          </Button>
        </Box> */}
      </Grid>

      <Grid item xs={12}>

        {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.6)', // Transparent white overlay
                zIndex: 10, // Table ke upar dikhane ke liye
              }}
            >
              <CircularProgress color="primary" />
            </Box>
          )}
          
        <Card>
          <CommonDataTable
            columns={columns}
            items={data}
            totalRecords={totalRecords}
            totalPages={totalPages}
            currentPage={currentPage}
            rowsPerPage={perPage}
            onPageChange={fetchWithdrawals}
            onRowClick={(params) => handleOpenDrawer(params.row)}
          />
        </Card>
      </Grid>

      {/* Side Drawer for Details */}
          <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ 
          sx: { 
            width: { xs: '100%', sm: 460 }, 
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: '#fcfcfc'
          } 
        }}
      >
        {/* Header */}
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white', borderBottom: '1px solid #eaeaea' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ReceiptLongIcon color="primary" />
            <Typography variant="h6" fontWeight="600">Request Overview</Typography>
          </Box>
          <IconButton onClick={() => setDrawerOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        {selectedRow && (
          <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Top Summary Banner */}
            <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'white', border: '1px solid #eaeaea', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.85, letterSpacing: 0.5 }}>REQUEST ID</Typography>
                <Typography variant="h6" fontWeight="700">#{selectedRow.id}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ opacity: 0.85, letterSpacing: 0.5 }}>AMOUNT</Typography>
                <Typography variant="h5" fontWeight="700">₹{selectedRow.amount || 0}</Typography>
              </Box>
            </Paper>


            {/* Driver Details Box */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight="600" color="textSecondary">Driver Information</Typography>
              </Box>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', gap: 1.5 }}>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">User Id</Typography>
                  <Typography variant="body2" fontWeight="600">{selectedRow.user_id || '-'}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">Name</Typography>
                  <Typography variant="body2" fontWeight="600">{selectedRow.driver?.driverName || '-'}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">Mobile</Typography>
                  <Typography variant="body2" fontWeight="600">{selectedRow.driver?.phone_number || '-'}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">Email</Typography>
                  <Typography variant="body2" fontWeight="600">{selectedRow.driver?.email || '-'}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">User Type</Typography>
                  <Typography variant="body2" fontWeight="600" sx={{ textTransform: 'capitalize' }}>{selectedRow.user_type || '-'}</Typography>
                </Box>
              </Paper>
            </Box>

            {/* Bank Details Box */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AccountBalanceIcon fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight="600" color="textSecondary">Bank & Payout Details</Typography>
              </Box>
              {(selectedRow.accountDetails?.account_type == 'vpa') ? 
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">UPI VPA</Typography>
                    <Typography variant="body2" fontWeight="600">{selectedRow.accountDetails?.vpa_address || '-'}</Typography>
                  </Box>
                </Paper>
                :
                 <Paper elevation={0} sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Bank Name</Typography>
                    <Typography variant="body2" fontWeight="600">{selectedRow.accountDetails?.bank_name || '-'}</Typography>
                  </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">Account Holder</Typography>
                  <Typography variant="body2" fontWeight="600">{selectedRow.accountDetails?.account_name || '-'}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">Account Number</Typography>
                  <Typography variant="body2" fontWeight="600" sx={{ fontFamily: 'monospace' }}>{selectedRow.accountDetails?.account_number || '-'}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">IFSC Code</Typography>
                  <Typography variant="body2" fontWeight="600" sx={{ fontFamily: 'monospace' }}>{selectedRow.accountDetails?.ifsc_code || '-'}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">Relation</Typography>
                  <Typography variant="body2" fontWeight="600" sx={{ fontFamily: 'monospace' }}>{selectedRow.accountDetails?.relation || '-'}</Typography>
                </Box>
              </Paper>
              }
            </Box>

            {/* Additional Info Box */}
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <ReceiptLongIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2" fontWeight="600" color="textSecondary">Payout Details</Typography>
                </Box>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Request Status</Typography>
                    <Chip label={getStatusDetails(selectedRow.admin_status).label} color={getStatusDetails(selectedRow.admin_status).color} size="small" sx={{ fontWeight: 600 }} />
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Payment Status</Typography>
                    <Chip label={getStatusDetails(selectedRow.payment_status).label} color={getStatusDetails(selectedRow.payment_status).color} size="small" sx={{ fontWeight: 600 }} />
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Txn ID</Typography>
                    <Typography variant="body2" fontWeight="600" sx={{ fontFamily: 'monospace' }}>{selectedRow.razorpay_txn_id || '-'}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Remark</Typography>
                    <Typography variant="body2" fontWeight="600">{selectedRow.remark || '-'}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Requested Date</Typography>
                    <Typography variant="body2" fontWeight="600">{formatDate(selectedRow.created_at) || '-'}</Typography>
                  </Box>
                </Paper>
            </Box>

          </Box>
        )}

        {/* Sticky Footer Actions (Only for pending requests) */}
        {selectedRow && selectedRow.admin_status === '0' && (
          <Box sx={{ p: 2.5, bgcolor: 'white', borderTop: '1px solid #eaeaea', display: 'flex', gap: 2, mt: 'auto' }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              size="large"
              startIcon={<CancelIcon />}
              disabled={actionLoading}
              onClick={() => handleUpdateStatus(selectedRow.id, '2')}
              sx={{ borderRadius: 2 }}
            >
              Reject
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="success"
              size="large"
              startIcon={<CheckCircleIcon />}
              disabled={actionLoading}
              onClick={() => handleUpdateStatus(selectedRow.id, '1')}
              sx={{ borderRadius: 2, boxShadow: 'none' }}
            >
              Approve
            </Button>
          </Box>
        )}
      </Drawer>

      {/* Reject Remark Dialog */}
      <Dialog 
        open={rejectDialogOpen} 
        onClose={() => setRejectDialogOpen(false)} 
        fullWidth 
        maxWidth="sm"
      >
        <DialogTitle>Reject Withdrawal Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>
            Please provide a reason for rejecting this withdrawal request.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="remark"
            label="Rejection Remark"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={rejectRemark}
            onChange={(e) => setRejectRemark(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleRejectSubmit} 
            variant="contained" 
            color="error" 
            disabled={actionLoading || !rejectRemark.trim()}
          >
            Submit Rejection
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!errorMessage} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="error">
          {errorMessage}
        </MuiAlert>
      </Snackbar>
      <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="success">
          {successMessage}
        </MuiAlert>
      </Snackbar>
    </Grid>
  )
}

export default WithdrawalRequestsTable
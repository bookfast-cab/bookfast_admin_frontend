import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { 
  Button, Chip, IconButton, SvgIcon, Tooltip, Box, 
  Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material'
import TextField from '@mui/material/TextField'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import CommonDataTable from 'src/components/CommonDataTable'
import { formatDate } from 'src/utils/utils'
import axios from 'axios'
import getFingerprint from 'src/utils/Fingerprint'
import { CircularProgress } from '@mui/material'
import ExportButton from 'src/components/export'


// Helper to map status to meaningful labels and colors
const getAdminStatusDetails = (status) => {
  switch (status) {
    case '0': return { label: 'Pending', color: 'warning' };
    case '1': return { label: 'Approved', color: 'success' };
    case '2': return { label: 'Rejected', color: 'error' };
    default: return { label: 'Unknown', color: 'default' };
  }
};

const BankRequestsTable = () => {
  const [data, setData] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [perPage, setPerPage] = useState(10)

  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const [searchText, setSearchText] = useState("");
  const [searchType, setSearchType] = useState("id"); 
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false); 
  const [loadingExport, setLoadingExport] = useState(false);

  // --- NEW: Reject Dialog States ---
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
  const fetchBanks = async (page_num = 0) => {
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
      
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/pending-bank-accounts-list?${queryParams}`, {
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
      console.error('Error fetching Bank requests:', err);
      setErrorMessage('Failed to load Bank requests.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBanks(0)

    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };

  }, []) 

  // Core API call for Approve/Reject
  const executeStatusUpdate = async (id, status, remark = '') => {
    const actionText = status === '1' ? 'Approve' : 'Reject';
    const device_id = await getFingerprint();

    setLoading(true);
    try {
      const payload = {
        request_id: id,
        status: status,
      };
      
      if (remark) {
        payload.remark = remark; // Ensure your backend accepts this field
      }

      await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/update-driver-bank-accounts`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
          'x-device-id': device_id,
        }
      });
      
      setSuccessMessage(`Request successfully ${actionText.toLowerCase()}d!`);
      fetchBanks(currentPage); 
    } catch (error) {
      console.error(`Error ${actionText}ing request:`, error);
      setErrorMessage(error.response?.data?.message || `Failed to ${actionText.toLowerCase()} request.`);
    } finally {
      setLoading(false);
    }
  }

  // Triggered when Approve or Reject icons are clicked
  const handleUpdateStatus = (id, status) => {
    if (status === '2') {
      // Open reject popup instead of confirming immediately
      setSelectedRequestId(id);
      setRejectRemark('');
      setRejectDialogOpen(true);
    } else {
      // Approve flow
      if (!window.confirm('Are you sure you want to approve this Bank request?')) {
    
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
    if (!loading) fetchBanks(1);
  };


  const columns = [
    { field: 'id', headerName: 'Request ID', width: 100 },
    { field: 'user_id', headerName: 'User', width: 100, renderCell: (params) => <div> {params.row?.driver?.driverName} </div> },
    { field: 'user_type', headerName: 'User Type', width: 100, textTransform: 'capitalize' },
    { 
      field: 'bankName', 
      headerName: 'Bank Name', 
      width: 130, 
      renderCell: (params) => <div>{params.row?.bank_name || '-'}</div> 
    },
    { 
      field: 'accountHolderName', 
      headerName: 'Account Holder Name', 
      width: 130, 
      renderCell: (params) => <div>{params.row?.account_name || '-'}</div> 
    },
    { 
      field: 'accountNumber', 
      headerName: 'Account Number', 
      width: 130, 
      renderCell: (params) => <div>{params.row?.account_number || '-'}</div> 
    },
    { 
      field: 'ifsc', 
      headerName: 'IFSC', 
      width: 130, 
      renderCell: (params) => <div>{params.row?.ifsc || '-'}</div> 
    },
    { 
      field: 'vpa_address', 
      headerName: 'UPI', 
      width: 130, 
      renderCell: (params) => <div>{params.row?.vpa_address || '-'}</div> 
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => {
        const statusDetails = getAdminStatusDetails(params.row.status);

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
          {params.row.status === '0' && (
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
        <Typography variant="h5">Bank Requests</Typography>
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
            onPageChange={fetchBanks}
          />
        </Card>
      </Grid>

      {/* Reject Remark Dialog */}
      <Dialog 
        open={rejectDialogOpen} 
        onClose={() => setRejectDialogOpen(false)} 
        fullWidth 
        maxWidth="sm"
      >
        <DialogTitle>Reject Bank Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, mt: 1 }}>
            Please provide a reason for rejecting this Bank request.
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

export default BankRequestsTable
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
import { List } from '@mui/icons-material'
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
    case 'processed': return { label: 'processed', color: 'success' };
    case 'reversed': return { label: 'reversed', color: 'error' };
    case 'processing': return { label: 'processing', color: 'warning' };
    case 'success': return { label: 'Success', color: 'success' };
    case 'failed': return { label: 'Failed', color: 'error' };
    default: return { label: stringStatus, color: 'default' };
  }
};

const WithdrawalHistoryTable = () => {
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

  // Image Preview States
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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
      
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/driver-withdrawal-history?${queryParams}`, {
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

    setActionLoading(true);
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
      setActionLoading(false);
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

  // Handler to explicitly open the drawer
  const handleOpenDrawer = (row) => {
    setSelectedRow(row);
    setDrawerOpen(true);
  };

  // Handler for opening image preview
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
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
    { field: 'utr', headerName: 'UTR No.', width: 140, renderCell: (params) => <div>{params.row?.utr || '--'}</div> },
    {
      field: 'screenshot',
      headerName: 'Screenshot',
      width: 110,
      renderCell: (params) => (
        params.row.screenshot ? (
          <img 
            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/payment/${params.row.screenshot}`}
            alt="Screenshot" 
            width={36} 
            height={36} 
            style={{ objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: '1px solid #ccc' }} 
            onClick={(e) => {
              e.stopPropagation();
              handleImageClick(`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/payment/${params.row.screenshot}`);
            }} 
          />
        ) : (
          <div>--</div>
        )
      )
    },
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
      field: 'payment_status',
      headerName: 'Payment Status',
      width: 140,
      renderCell: (params) => {
        const statusDetails = getStatusDetails(params.row.payment_status);
        return <Chip label={statusDetails.label} color={statusDetails.color} size="small" />;

      }
    },
    { field: 'remark', headerName: 'Remark', width: 150, renderCell: (params) => <div>{params.row?.remark || '-'}</div> },
    {
      field: 'created_at',
      headerName: 'Request Date',
      width: 180,
      renderCell: (params) => <span>{formatDate(params.row.created_at) || '-'}</span>
    },
    {
      field: 'approve_date',
      headerName: 'Approve/Reject Date',
      width: 180,
      renderCell: (params) => <span>{(params.row.approve_date)?formatDate(params.row.approve_date): '--'}</span>
    },
    {
      field: 'settlement_date',
      headerName: 'Settlement Date',
      width: 180,
      renderCell: (params) => <span>{(params.row.settlement_date)?formatDate(params.row.settlement_date): '--'}</span>
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

        <ExportButton columns={columns} url={`driver-withdrawal-history`} />
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
                    <Typography variant="body2" color="textSecondary">UTR</Typography>
                    <Typography variant="body2" fontWeight="600" sx={{ fontFamily: 'monospace' }}>{selectedRow.utr || '-'}</Typography>
                  </Box>
                  <Divider />
                  {/* Screenshot added here */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="textSecondary">Screenshot</Typography>
                    {selectedRow.screenshot ? (
                      <Box
                        component="img"
                        src={selectedRow.screenshot}
                        alt="Screenshot"
                        sx={{
                          width: 48,
                          height: 48,
                          objectFit: 'cover',
                          borderRadius: 1,
                          cursor: 'pointer',
                          border: '1px solid #ccc'
                        }}
                        onClick={() => handleImageClick(selectedRow.screenshot)}
                      />
                    ) : (
                      <Typography variant="body2" fontWeight="600">--</Typography>
                    )}
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
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Approve/Reject Date</Typography>
                    <Typography variant="body2" fontWeight="600">{(selectedRow.approve_date)?formatDate(selectedRow.approve_date) : '--'}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">Settlement Date</Typography>
                    <Typography variant="body2" fontWeight="600">{(selectedRow.settlement_date)? formatDate(selectedRow.settlement_date) : '--'}</Typography>
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

      {/* Full-Size Image Preview Dialog */}
      <Dialog
        open={imageModalOpen}
        onClose={handleCloseImageModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Payment Preview
          <IconButton onClick={handleCloseImageModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3, bgcolor: '#f5f5f5' }}>
          {selectedImage && (
            <img 
              src={selectedImage} 
              alt="Payment Preview" 
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '4px' }} 
            />
          )}
        </DialogContent>
      </Dialog>

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

export default WithdrawalHistoryTable
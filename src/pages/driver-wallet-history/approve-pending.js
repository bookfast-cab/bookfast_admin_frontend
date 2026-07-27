"use client";
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Button, SvgIcon, TextField, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import CommonDataTable from 'src/components/CommonDataTable';
import { formatDate } from 'src/utils/utils';
import DeleteIcon from '@mui/icons-material/Delete';
import { Tooltip, IconButton, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Check, Close } from 'mdi-material-ui';
import { Select, MenuItem, FormControl } from '@mui/material';
// Dynamically import PlusIcon
const PlusIcon = dynamic(() => import('@heroicons/react/24/solid/PlusIcon'), { ssr: false });

const MUITable = () => {
  const [data, setData] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [staffOnly, setStaffOnly] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [type, settype] = useState(0);
  
  // Reject Dialog States
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectRemark, setRejectRemark] = useState('');

  const router = useRouter();

  // Retrieve token from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('access_token'));
    }
  }, []);

  useEffect(() => {
    getDriversWalletHistorys(0, perPage,type);
  }, [searchText, staffOnly]);

  const handleSearchClick = (searchdata) => {
    getDriversWalletHistorys(1, perPage,type);
  };

  const handleCloseSnackbar = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Fetch App Versions
  const getDriversWalletHistorys = (page_num, perPage = 10,type=0) => {
    
    if (!token) return;

    const queryParams = new URLSearchParams({ page: page_num, perPage: perPage, search: searchText, type: type }).toString();

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/get-approve-pending-list?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
        
        return response.json();

      })
      .then((result) => {
        settype(type);
        let resData = result.data;

        setData(resData || []);
        setTotalRecords(result.totalRecords || 0);
        setTotalPages(result.totalPages || 0);
        setCurrentPage(result.currentPage || 1);
        setPerPage(result.perPage || 0);
      })
      .catch((error) => {
        setErrorMessage('Failed to fetch app version data.');
        console.error(error);
      });
  };

  const handleApprove = (id) => {
    
    if (!token) return;

    let body = {
      status: 1,
      id: id
    };

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/approve-wallet-histories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
        
        return response.json();

      })
      .then((result) => {
        if (result.success) {
          setSuccessMessage('Approved successfully.');
          getDriversWalletHistorys(0, perPage,type);
        } else {
          setErrorMessage(result.message);
        }
      })
      .catch((error) => {
        setErrorMessage('Failed to process approval.');
        console.error(error);
      });
  };

  // Open Reject Dialog
  const handleOpenReject = (id) => {
    setRejectId(id);
    setRejectRemark('');
    setOpenRejectDialog(true);
  };

  // Close Reject Dialog
  const handleCloseReject = () => {
    setOpenRejectDialog(false);
    setRejectId(null);
    setRejectRemark('');
  };

  // Submit Reject with Remark
  const handleSubmitReject = () => {
    if (!token || !rejectId) return;

    let body = {
      status: 2, 
      id: rejectId,
      message: rejectRemark
    };

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/approve-wallet-histories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
        
        return response.json();

      })
      .then((result) => {
        if (result.success) {
          setSuccessMessage('Rejected successfully.');
          handleCloseReject();
          getDriversWalletHistorys(0, perPage,type);
        } else {
          setErrorMessage(result.message);
        }
      })
      .catch((error) => {
        setErrorMessage('Failed to process rejection.');
        console.error(error);
      });
  };

  useEffect(() => {
    if (token) {
      getDriversWalletHistorys(0);
    }
  }, [token]);

  const columns = [
    {
      field: 'id',
      headerName: 'S.No',
      width: 80,
      flex: 0.5,
    },
    {
      field: 'driverName',
      headerName: 'Driver Name',
      width: 150,
      flex: 1,
      renderCell: (params) => (
        <span>{params.row.driver?.driverName || 'N/A'}</span>
      )
    },
    {
      field: 'phone_number',
      headerName: 'Phone Number',
      width: 150,
      flex: 1,
      renderCell: (params) => (
        <span>{params.row.driver?.phone_number || 'N/A'}</span>
      )
    },
    {
      field: 'message',
      headerName: 'Message',
      width: 200,
      flex: 1.5,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 100,
      flex: 0.8,
      renderCell: (params) => (
        <span style={{ fontWeight: 'bold' }}>₹{params.row.amount}</span>
      )
    },
    {
      field: 'admin',
      headerName: 'Added By',
      width: 100,
      flex: 0.8,
      renderCell: (params) => (
        <span style={{ fontWeight: 'bold' }}>{params.row.admin?.name || 'N/A'}</span>
      )
    },
    {
      field: 'admin_approve_status',
      headerName: 'Status',
      width: 100,
      flex: 0.8,
      renderCell: (params) => (
        (params.row.admin_approve_status != null) ?
          <Chip
            label={params.row.admin_approve_status == 1 ? 'Approved' : params.row.admin_approve_status == 2 ? 'Rejected' : 'Pending'}
            size="small"
            sx={{
              backgroundColor: params.row.admin_approve_status == 1 ? '#4caf50' : params.row.admin_approve_status == 2 ? '#f50c0cff' : '#ff9800',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '12px',
              '&:hover': {
                backgroundColor: params.row.admin_approve_status == 1 ? '#45a049' : params.row.admin_approve_status == 2 ? '#f50c0cff' : '#ff9800',
              }
            }}
          />
          :
          <span style={{ fontWeight: 'bold' }}>--</span>
      )
    },
    {
      field: 'action',
      headerName: 'Type',
      width: 100,
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.row.action === 'cr' ? 'Credit' : 'Debit'}
          size="small"
          sx={{
            backgroundColor: params.row.action === 'cr' ? '#4caf50' : '#ff9800',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '12px',
            '&:hover': {
              backgroundColor: params.row.action === 'cr' ? '#45a049' : '#e68900',
            }
          }}
        />
      )
    },
    {
      field: 'created_at',
      headerName: 'Date',
      width: 160,
      flex: 1,
      renderCell: (params) => (
        <span>{params.row.created_at ? formatDate(params.row.created_at) : 'N/A'}</span>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
       (params?.row?.admin_approve_status == 0) && <>
          <Tooltip title="Approve" arrow>
            <IconButton
              onClick={() => handleApprove(params.row.id)}
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
              <Check sx={{ color: '#2e7d32', fontSize: '20px' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Reject" arrow>
            <IconButton
              onClick={() => handleOpenReject(params.row.id)}
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
              <Close sx={{ color: 'red', fontSize: '20px' }} />
            </IconButton>
          </Tooltip>
        </>
      ),
    }
  ];
const handleDropdownChange = (event) => {
  const selectedType = event.target.value;
  settype(selectedType);
  getDriversWalletHistorys(0, perPage, selectedType);
};

  return (
    <Grid container spacing={4} sx={{ bgcolor: "white", padding: 3 }}>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              Approve Pending Wallet
            </Typography>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
           <div style={{ display: 'flex',marginBottom:10,marginRight:10,marginLeft:10, alignItems: 'center',justifyContent:'space-between', gap: '15px', flexWrap: 'wrap' }}>
            {/* Search Field */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Search:
              </Typography>
              <TextField
                id="search-field"
                variant="outlined"
                size="small"
                placeholder="Search records..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{ 
                  width: '300px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleSearchClick}>
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
              />
            </div>
            <FormControl size="small" sx={{ minWidth: 180}}>
              <Select
                value={type}
                onChange={handleDropdownChange}
                displayEmpty
                sx={{
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  color: '#000',
                  '& .MuiSelect-icon': {
                    color: '#000', // Dropdown arrow icon color
                  },
                }}
              >
                <MenuItem value={0}>Pending List</MenuItem>
                <MenuItem value={1}>Approve List</MenuItem>
                <MenuItem value={2}>Reject List</MenuItem>
              </Select>
            </FormControl>
</div>
          
          <div style={{ width: '100%', overflowX: 'auto' }}>
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
              onPageChange={(newPage) => getDriversWalletHistorys(newPage, perPage,type)}
              sx={{
                '& .MuiDataGrid-root': {
                  border: 'none',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f0f0f0',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f8f9fa',
                  borderBottom: '2px solid #e0e0e0',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 'bold',
                  color: '#1976d2',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#f8f9fa',
                },
              }}
            />
          </div>
        </Card>
      </Grid>

      {/* Reject Remark Dialog */}
      <Dialog open={openRejectDialog} onClose={handleCloseReject} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#d32f2f' }}>Reject Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Please provide a remark/reason for rejecting this request.
          </Typography>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            label="Enter Remark"
            value={rejectRemark}
            onChange={(e) => setRejectRemark(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button onClick={handleCloseReject} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSubmitReject} variant="contained" color="error">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

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
    </Grid>
  );
};

export default MUITable;
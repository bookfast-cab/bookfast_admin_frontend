"use client";
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import TableBasic from 'src/views/tables/DriverWalletHistoryTable';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Button, SvgIcon, TextField } from '@mui/material'
import CommonDataTable from 'src/components/CommonDataTable';
import { formatDate } from 'src/utils/utils';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { Tooltip, IconButton, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// Dynamically import PlusIcon
const PlusIcon = dynamic(() => import('@heroicons/react/24/solid/PlusIcon'), { ssr: false });

const MUITable = () => {
  const [data, setData] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  // Retrieve token from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('access_token'));
    }
  }, []);

  useEffect(() => {
    getDriversWalletHistorys(0, perPage)
  }, [searchText]);

  const handleSearchClick = (searchdata) => {
    getDriversWalletHistorys(1, perPage);
  };

  const handleCloseSnackbar = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Fetch App Versions
  const getDriversWalletHistorys = (page_num, perPage = 10) => {
    if (!token) return;

    const queryParams = new URLSearchParams({ page: page_num, perPage: perPage, search: searchText }).toString();

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/driver-wallet-histories?${queryParams}`, {
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
      })
      .finally(() => {
        // setIsLoading(false);
      });
  };

  const handleEdit = (id) => {
    router.push(`/driver-wallet-history/edit?id=${id}`);
  };

  const handleShow = (id) => {
    router.push(`/driver-wallet-history/show?id=${id}`);
  };

  const handleDelete = (id) => {
    // Add your delete logic here
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
        <>
          <Tooltip title="Edit" arrow>
            <IconButton
              onClick={() => handleEdit(params.row.id)}
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
              onClick={() => handleShow(params.row.id)}
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
      ),
    }
  ];

  return (
    <Grid container spacing={4} sx={{ bgcolor: "white", padding: 3 }}>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              Driver Wallet History
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button 
              startIcon={(
                <SvgIcon fontSize="small">
                  <PlusIcon />
                </SvgIcon>
              )}
              variant="contained"
              onClick={() => router.push('/driver-wallet-history/add')}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 'bold',
              }}
            >
              Add New Record
            </Button>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <div style={{ 
            padding: '16px', 
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
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
              onPageChange={getDriversWalletHistorys}
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
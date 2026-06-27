"use client";
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Button, SvgIcon, TextField, Tooltip, IconButton, Chip } from '@mui/material';
import CommonDataTable from 'src/components/CommonDataTable';
import { formatDate } from 'src/utils/utils';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { Switch } from '@mui/material'; // Import Switch
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
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('access_token'));
    }
  }, []);

  const getDriversSelfPost = (page_num = 0, rowsPerPage = 10) => {
    if (!token) return;

    const queryParams = new URLSearchParams({ 
        page: page_num, 
        perPage: rowsPerPage, 
        search: searchText 
    }).toString();

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/fetchDriverSelfPostList?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
      .then((response) => response.json())
      .then((result) => {
        const resData = result.data || [];
        
        // Yahan 'id' add kar rahe hain taaki MUI DataGrid crash na ho
        const formattedData = resData.map((item) => ({
          ...item,
          id: item.notiId 
        }));

        setData(formattedData);
        // API se aane wala total count set karein, array nahi
        setTotalRecords(result.totalRecords || 0); 
        setTotalPages(result.totalPages || 0);
        setCurrentPage(result.currentPage || 1);
        setPerPage(result.perPage || 10);
      })
      .catch((error) => {
        setErrorMessage('Failed to fetch data.');
        console.error(error);
      });
  };



  const handleToggleStatus = (id,status) => {
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/changeSelfPostStatus`, {
      method: 'POST',
      body:JSON.stringify({status:status,notiId:id}),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
      .then((response) => response.json())
      .then((result) => {
        if(result.success==1){
          setSuccessMessage(result.message);
          getDriversSelfPost();
        }
      })
      .catch((error) => {
        setErrorMessage('Failed to fetch data.');
        console.error(error);
      });
  };

  useEffect(() => {
    if (token) getDriversSelfPost(0, perPage);
  }, [token]);

  const handleSearchClick = () => {
    getDriversSelfPost(0, perPage);
  };

  const handleCloseSnackbar = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const columns = [
    { field: 'notiId', headerName: 'Id', width: 80 },
    { 
      field: 'driverName', 
      headerName: 'Driver Name', 
      width: 120,
      valueGetter: (params, row) => row.driver ? row.driver.driverName : 'N/A'
    },
    { field: 'title', headerName: 'Title', width: 120 },
    { field: 'message', headerName: 'Message', width: 200 },
    { field: 'mobile', headerName: 'Mobile', width: 110 },
    { field: 'pick_address', headerName: 'Pickup Address', width: 200 },
    { field: 'drop_address', headerName: 'Drop Address', width: 200 },
    { 
      field: 'total_price', 
      headerName: 'Total Price', 
      width: 100, 
      renderCell: (params) => <span>₹{params.row.total_price || 0}</span> 
    },
    { 
      field: 'commission', 
      headerName: 'Commission', 
      width: 100, 
      renderCell: (params) => <span>₹{params.row.commission || 0}</span> 
    },
    { 
      field: 'driver_earning', 
      headerName: 'Driver Earning', 
      width: 100, 
      renderCell: (params) => <span>₹{params.row.driver_earning || 0}</span> 
    },
    { 
      field: 'platform_fee', 
      headerName: 'Platform Fee', 
      width: 100, 
      renderCell: (params) => <span>₹{params.row.platform_fee || 0}</span> 
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const getStatusInfo = (status) => {
          switch (status) {
            case '0': return { label: 'Inactive', color: '#757575' }; // Grey for Inactive
            case '1': return { label: 'Active', color: '#2196f3' };   // Blue for Active
            case '2': return { label: 'Booked', color: '#4caf50' };   // Green for Booked
            default: return { label: 'Unknown', color: '#ff9800' };   // Orange for default
          }
        };

        const statusInfo = getStatusInfo(params.row.status);

        return (
          <Chip
            label={statusInfo.label}
            size="small"
            sx={{ 
              backgroundColor: statusInfo.color, 
              color: 'white',
              fontWeight: 'bold' 
            }}
          />
        );
      }
    },
    {
      field: 'createdAt',
      headerName: 'Created Date',
      width: 160,
      renderCell: (params) => <span>{formatDate(params.row.createdAt)}</span>
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <>
          <Switch
            checked={params.row.status === '1' || params.row.status === '2'}
            disabled={params.row.status === '2'}
            onChange={(e) => handleToggleStatus(params.row.notiId, e.target.checked ? '1' : '0')}
            color="info"
            inputProps={{ 'aria-label': 'toggle status' }}
          />
        </>
      ),
    }
  ];

  return (
    <Grid container spacing={4} sx={{ bgcolor: "white", padding: 3 }}>
      <Grid item xs={12}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>Driver Duty Post</Typography>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <div style={{ padding: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search records..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                endAdornment: <IconButton onClick={handleSearchClick}><SearchIcon /></IconButton>,
              }}
            />
          </div>
          
          <CommonDataTable
            columns={columns}
            items={data}
            totalRecords={totalRecords}
            totalPages={totalPages}
            currentPage={currentPage}
            rowsPerPage={perPage}
            onPageChange={getDriversSelfPost}
            getRowId={(row) => row.id} // Ab humne 'id' add kar diya hai
          />
        </Card>
      </Grid>

      <Snackbar open={!!errorMessage} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <MuiAlert severity="error">{errorMessage}</MuiAlert>
      </Snackbar>
    </Grid>
  );
};

export default MUITable;
"use client";
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Button, IconButton, SvgIcon, TextField, Switch } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';

// Dynamically import PlusIcon
const PlusIcon = dynamic(() => import('@heroicons/react/24/solid/PlusIcon'), { ssr: false });

const VehicleCategoryTable = () => {
  const [data, setData] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const router = useRouter();
  
  let token
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token')
  }

  // Close Snackbar
  const handleCloseSnackbar = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const getVehicleCategories = (page_num = 1, perPage = 10) => {
    if (!token) return;
  
    setIsLoading(true);
  
    const queryParams = new URLSearchParams({ page: page_num, perPage: perPage, search: searchText }).toString();
  
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/vehicle-category?${queryParams}`, {
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
        setData(result.data || []);
        setTotalRecords(result.totalRecords || 0);
        setTotalPages(result.totalPages || 0);
        setCurrentPage(result.currentPage || 1);
        setPerPage(result.perPage || 10);
      })
      .catch((error) => {
        setErrorMessage('Failed to fetch vehicle categories.');
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  
  const handleSearchClick = () => {
    getVehicleCategories(1, perPage);
  };

  const handleEdit = (id) => {
    router.push(`/vehicle-category/edit?id=${id}`);
  };

  const handleToggleStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/edit-vehicle-category/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMessage('Status updated successfully!');
        setData((prevData) =>
          prevData.map((item) =>
            item.id === id ? { ...item, status: newStatus } : item
          )
        );
      } else {
        setErrorMessage(data.message || 'Error updating status');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Failed to update status.');
    }
  };

  // Fetch data on token or page change
  useEffect(() => {
    if (token) {
      getVehicleCategories(1, perPage);
    }
  }, [token, searchText]);

  const columns = [
    { field: 'id', headerName: 'Id', width: 60 },
    { field: 'vehicle_type', headerName: 'Vehicle Type', flex: 1 },
    { field: 'vehicle_mode', headerName: 'Vehicle Mode', flex: 1 },
    { field: 'base_fare', headerName: 'Base Fare', flex: 1 },
    { field: 'price_per_km', headerName: 'Price per Km', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 2 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 100, 
      renderCell: (params) => (
        <Switch
          checked={params.row.status === 1 || params.row.status === '1'}
          onChange={(e) => handleToggleStatus(params.row.id, e.target.checked ? 1 : 0)}
          color="info"
        />
      ) 
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <>
          <Tooltip title="Edit">
            <IconButton color="primary" onClick={() => handleEdit(params.row.id)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];
  
  return (
    <Grid container spacing={4} sx={{ bgcolor: "white", padding: 3 }}>
      <Grid item xs={6}>
        <Typography variant="h5">Vehicle Category</Typography>
      </Grid>
      <Grid item xs={12} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Search:</span>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <TextField
              id="search-field"
              variant="outlined"
              size="small"
              placeholder="Search category"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '300px' }}
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
      </Grid>
      <Grid item xs={12}>
        <Card>
          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={data}
              columns={columns}
              paginationMode="server"
              rowCount={totalRecords}
              paginationModel={{ page: currentPage - 1, pageSize: perPage }}
              onPaginationModelChange={(newModel) => {
                getVehicleCategories(newModel.page + 1, newModel.pageSize);
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              loading={isLoading}
            />
          </div>
        </Card>
      </Grid>
      <Snackbar open={!!errorMessage} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="error">{errorMessage}</MuiAlert>
      </Snackbar>
      <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="success">{successMessage}</MuiAlert>
      </Snackbar>
    </Grid>
  );
};

export default VehicleCategoryTable;

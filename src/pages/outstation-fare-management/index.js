"use client";
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import TableBasic from 'src/views/tables/OutStationTable';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Button, Drawer, IconButton, SvgIcon, TextField } from '@mui/material'
import CommonDataTable from 'src/components/CommonDataTable';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { formatOnlyDate } from 'src/utils/utils';
import DeleteButtonWithConfirm from 'src/components/DeleteButtonWithConfirm';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import RoundTripManagement from 'src/views/outstation-fare-management/RoundTripManagement';

// Dynamically import PlusIcon
const PlusIcon = dynamic(() => import('@heroicons/react/24/solid/PlusIcon'), { ssr: false });


const MUITable = () => {

  const [data, setData] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [tabValue, setTabValue] = useState(0);
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };


  const getoutstation = (page_num, perPage = 10) => {
    if (!token) return;

    setIsLoading(true);

    const queryParams = new URLSearchParams({ page: page_num, perPage: perPage, search: searchText }).toString();

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/fare-outstation-management?${queryParams}`, {
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
        setPerPage(result.perPage || 0);
      })
      .catch((error) => {
        setErrorMessage('Failed to fetch app version data.');
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSearchClick = (searchdata) => {


    getoutstation(1, perPage);

  };

  const handleDelete = async (idToDelete) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/fare-outstation-management/${idToDelete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setSuccessMessage('OutStation Delete successfully!')
          getoutstation(1)
        } else {
          setErrorMessage(data.message)
        }
      })
      .catch(error => {
        console.error('Error:', error)
      })

  }

  const handleEdit = (id) => {
    router.push(`/outstation-fare-management/edit?id=${id}`);
  };


  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // const handleEdit = (rowId) => {
  //   setSelectedRow(rowId);
  //   setIsDrawerOpen(true);
  // };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedRow(null);
  };


  useEffect(() => {
    if (token) {
      getoutstation(1, perPage);
    }
  }, [token, searchText]);

  // Prevent mismatches by showing a loading state

  const columns = [


    { field: 'vehicle', headerName: 'Vehicle Type', valueGetter: (params) => params.vehicle_type || '-', },
    { field: 'trip_sub_type_id', headerName: 'Trip Sub Type', flex: 1 },
    { field: 'base_fare', headerName: 'Base Fare', width: 100 },
    { field: 'price_per_km', headerName: 'Per Km Rs', flex: 1 },
    { field: 'driver_allowance', headerName: 'Driver Allowance', flex: 1 },


    {
      field: 'updated_at',
      headerName: 'Updated At',
      flex: 1,
      renderCell: (params) => formatOnlyDate(params.row.updated_at) || 'N/A',
    }
    ,
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
          <DeleteButtonWithConfirm
            id={params.row.id}
            handleDelete={handleDelete}
            tooltipText="Delete"
          />
        </>
      ),
    },
  ];

  return (
    <Grid container spacing={4} sx={{ bgcolor: "white", padding: 3 }}>

      <Grid item xs={6}>
        <Typography variant="h5">Outstation Fare Management</Typography>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="outstation fare tabs">
            <Tab label="Outstation" />
            <Tab label="Round Trip" />
          </Tabs>
        </Box>
      </Grid>

      {tabValue === 0 && (
        <>
          <Grid
            item
            xs={12}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Search:</span>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <TextField
                  id="search-field"
                  variant="outlined"
                  size="small"
                  placeholder="Search package"
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
            <Grid item xs={6} style={{ textAlign: 'right' }}>
              <Button startIcon={(
                <SvgIcon fontSize="small">
                  <PlusIcon />
                </SvgIcon>
              )}
                variant="contained"
                onClick={() => router.push('/outstation-fare-management/add')}
              >
                Add
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CommonDataTable
                columns={columns}
                items={data}
                onDelete={handleDelete}
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
                onPageChange={getoutstation}
              />
            </Card>
          </Grid>
        </>
      )}

      {tabValue === 1 && (
        <Grid item xs={12}>
          <Card sx={{ p: 4 }}>
            <RoundTripManagement />
          </Card>
        </Grid>
      )}

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
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={handleDrawerClose}
      >
        <div style={{ width: 350, padding: 20 }}>
          <h3>Edit Row {selectedRow}</h3>
          {/* Place your form or edit content here */}
        </div>
      </Drawer>

    </Grid>
  );
};

export default MUITable;

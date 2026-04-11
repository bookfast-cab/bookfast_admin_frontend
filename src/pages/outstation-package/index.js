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
import { Button, IconButton, SvgIcon, TextField } from '@mui/material'
import CommonDataTable from 'src/components/CommonDataTable';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import DeleteButtonWithConfirm from 'src/components/DeleteButtonWithConfirm';

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


  const getoutstation = (page_num, perPage = 10) => {
    if (!token) return;
  
    setIsLoading(true);
  
    const queryParams = new URLSearchParams({ page: page_num, perPage: perPage,search:searchText }).toString();
  
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/outstation-package?${queryParams}`, {
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
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/outstation-package/${idToDelete}`, {
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
  router.push(`/outstation-package/edit?id=${id}`);
};



  // Fetch data on token or page change
  useEffect(() => {
    if (token) {
      getoutstation(1,perPage);
    }
  }, [token,searchText]);

  // Prevent mismatches by showing a loading state
 
  const columns = [
    { field: 'id', headerName: 'Id', flex: 1 },
    { field: 'name', headerName: 'Name' , width: 150},
    { field: 'pickupLocation', headerName: 'Pickup Location', flex: 1 },
    { field: 'dropLocation', headerName: 'Drop Location', flex: 1 },
    { field: 'vehicle', headerName: 'Vehicle Type', valueGetter: (params) => params.vehicle_type || '-', },
    { field: 'tripSubType', headerName: 'Trip Sub Type', flex: 1 },
    { field: 'baseFare', headerName: 'Base Fare', width: 100 },
    { field: 'perKmRs', headerName: 'Per Km Rs', flex: 1 },
    { field: 'totalKmLimit', headerName: 'Total Km Limit', flex: 1 },
    { field: 'perMinuteCharge', headerName: 'Per Minute Charge', flex: 1 },
    { field: 'totalMinutesLimit', headerName: 'Total Minutes Limit', flex: 1 },
    { field: 'afterLimitKmCharge', headerName: 'After Limit Km Charge', flex: 1 },
    { field: 'driverAllowance', headerName: 'Driver Allowance', flex: 1 },
    { field: 'driverNightCharge', headerName: 'Driver Night Charge', flex: 1 },
    { field: 'totalTax', headerName: 'Total Tax', flex: 1 },
    { field: 'otherCharge', headerName: 'Other Charge', flex: 1 },
    
    { field: 'updated_at', headerName: 'Updated At', flex: 1 },
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
        <Typography variant="h5">OutstationPackage</Typography>
      </Grid>
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
            onClick={() => router.push('/outstation-package/add')}
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

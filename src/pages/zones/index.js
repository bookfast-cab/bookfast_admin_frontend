"use client";
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import TableBasic from 'src/views/tables/ZonesTable';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Button, SvgIcon, TextField } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import CommonDataTable from 'src/components/CommonDataTable';

// Dynamically import PlusIcon
const PlusIcon = dynamic(() => import('@heroicons/react/24/solid/PlusIcon'), { ssr: false });


const MUITable = () => {
  const [data, setData] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(0);
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

  // Close Snackbar
  const handleCloseSnackbar = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };



  const getZones = async (page_num , perPage = 10) => {
    if (!token) return;

    // setIsLoading(true);

    try {
      const queryParams = new URLSearchParams({ page: page_num,perPage: perPage,search:searchText }).toString();
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/zones?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data || []);
      setTotalRecords(result.totalRecords || 0);
      setTotalPages(result.totalPages || 0);
      setCurrentPage(result.currentPage || 1);
      setPerPage(result.perPage || 0);
    } catch (error) {
      setErrorMessage('Failed to fetch app version data.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleEdit = (id) => {
    router.push(`/zones/edit?id=${id}`);
  };

  const handleShow = (id) => {
    router.push(`/zones/show?id=${id}`);
  };

  const handleCreateZone = (newZone) => {
    router.push(`/zones/create-zones?id=${newZone}`); 
  };
  
  const handleViewZone = (newZone) => {
    router.push(`/zones/view-zones?id=${newZone}`);
  };

  const exportToExcel = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/export-zone`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Zones.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(error => {
        console.error('Error exporting to Excel:', error);
      });
  }

const handleDelete = async (idToDelete) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/zones/${idToDelete}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token}`
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setSuccessMessage('Zone Delete successfully!')
        getZones(1)
      } else {
        setErrorMessage(data.message)
      }
    })
    .catch(error => {
      console.error('Error:', error)
    })

}

  // Fetch data on token or page change
  useEffect(() => {
    if (token) {
      getZones(0, perPage);
    }
  }, [token,searchText]);

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      flex: 0.5, // Smallest column
      minWidth: 70
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 150
    },
    {
      field: 'createPolygon',
      headerName: 'Create Polygon',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const isPolygonExists = !!params.row.polygon_plain;
        
        return (
          <Button
            variant="contained"
            color={isPolygonExists ? 'warning' : 'primary'} // yellow for update, blue for create
            style={{ color: "white", fontSize: "9px", height: "25px", padding: "5px" }}
            onClick={() => handleCreateZone(params.row.id)}
          >
            {isPolygonExists ? 'Update Polygon' : 'Create Polygon'}
          </Button>
        );
      }
    },
    {
      field: 'viewPolygon',
      headerName: 'View Polygon',
      flex: 1,
      minWidth: 180,
      renderCell: (params) =>
        params.row.polygon_plain ? (
          <Button
            variant="contained"
            style={{ color: "white", fontSize: "9px", height: "25px", padding: "5px" }}
            onClick={() => handleViewZone(params.row.id)}
          >
            View Polygon
          </Button>
        ) : null
    },
    
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleEdit(params.row.id)} aria-label="edit">
            <EditIcon fontSize="small" sx={{ color: '#1976d2' }} />
          </IconButton>
          <IconButton onClick={() => handleShow(params.row.id)} aria-label="show">
            <VisibilityIcon fontSize="small" sx={{ color: '#2e7d32' }} />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)} aria-label="delete">
            <DeleteIcon fontSize="small" sx={{ color: '#d32f2f' }} />
          </IconButton>
        </>
      )
    }
  ];
  


  return (
    <Grid container spacing={6}>
      <Grid item xs={6}>
        <Typography variant="h5">Zones</Typography>
      </Grid>
      <Grid item
        xs={12}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>

          <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Search:</span>
                    <TextField
                    id="search-field"
                    variant="outlined"
                    size="small"
                    placeholder="Search package"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
      
                    style={{ width: '300px' }}
                 
                  />
                  </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <Button
            variant="contained"
            onClick={() => exportToExcel()}
          >
            Export
          </Button>
          <Button startIcon={(
                <SvgIcon fontSize="small">
                <PlusIcon />
                </SvgIcon>
            )}
            variant="contained"
            onClick={() => router.push('/zones/add')}
            >
          Add
        </Button>
        </div>
      </Grid>
   
      <Grid item xs={12}>
        <Card>
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
            onPageChange={getZones}
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

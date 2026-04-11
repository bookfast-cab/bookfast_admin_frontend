import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { Button, IconButton, SvgIcon, Menu, MenuItem } from '@mui/material'
import TextField from '@mui/material/TextField';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import TableBasic from 'src/views/tables/DailyFireManagement'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

import * as XLSX from 'xlsx';
import CommonDataTable from 'src/components/CommonDataTable';
import { Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download'; // or any icon you prefer

import DeleteButtonWithConfirm from 'src/components/DeleteButtonWithConfirm';
import AddCityDrawer from './AddCityDrawer';


const MUITable = () => {

  const [data, setData] = useState([])
  const [dataToExport, setDataToExport] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [loadingExport, setLoadingExport] = useState(false);
  const [sortColumn, setSortColumn] = useState("coupon_id");
  const [sort, setSort] = useState("DESC");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  let token
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token')
  }
  
  const router = useRouter()

  const { type } = router.query;

  const handleCloseSnackbar = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  const downloadCSV = async (main_url, filename) => {
    const response = await fetch(main_url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'Donloaded_file';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const getPromoCoupon = async (page_num) => {
    const queryParams = new URLSearchParams({
      page: page_num,
      perPage,
      type,
      search: searchText,
      sort,
      sortColumn
    }).toString();

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/citiesList?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setData(data.data);
        setTotalRecords(data.totalRecords);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setPerPage(data.perPage);
      })
      .catch((err) => {
        console.log(err)
      })
  }

  useEffect(() => {
    getPromoCoupon(0);
  }, [searchText])

  const handleDelete = async (idToDelete) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/promoCoupon/${idToDelete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
       
        if (data.success) {
          setSuccessMessage('Promo coupon deleted successfully!')
          getPromoCoupon(0)
        } else {
          setErrorMessage(data.message)
        }
      })
      .catch(error => {
        console.error('Error:', error)
      })

  }

  const handleUpdateStatus = (id, newStatus) => {
    setData(data.map(notification =>
      notification.id === id ? { ...notification, status: newStatus } : notification
    ))
  }

  const handleEdit = (couponData) => {
    // router.push(`/daily-fare-management/edit?id=${id}`);
    setSelectedCoupon(couponData);
    setDrawerOpen(true);
  };

  const handleViewData = (couponData) => {
    // router.push(`/daily-fare-management/edit?id=${id}`);
  //  setSelectedCoupon(couponData);
    setViewDrawerOpen(true);
  };

  const handleShow = (id) => {
    router.push(`/daily-fare-management/show?id=${id}`);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (type) => {
    setAnchorEl(null);
    if (type) {
      exportToExcel(type)
    }
  };

  const exportToExcel = (type = "") => {

    setLoadingExport(true);
    const queryParams = new URLSearchParams();

    if (type && type !== 'all') {
      queryParams.append('status', type);
    }
  
    try {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/citiesList?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
      })
        .then(response => response.blob())
        .then(blob => {

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Promo-Coupon.csv';
          document.body.appendChild(a);
          a.click();
          a.remove();

        })
        .catch(error => {
          console.error('Error exporting to Excel:', error);
        });
      setSuccessMessage('Export successful!');
    } catch (error) {
      setErrorMessage('Export failed. Please try again.');
    } finally {
      setLoadingExport(false); // End loading
    }
  };

const columns = [
  { field: 'id', headerName: 'City ID', flex: 0.5 },
  { field: 'name', headerName: 'City Name', flex: 1 },
  { field: 'lat', headerName: 'Latitude', flex: 1 },
  { field: 'lng', headerName: 'Longitude', flex: 1 },
  {
    field: 'actions',
    headerName: 'Actions',
    flex: 0.5,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <IconButton
        color="primary"
        onClick={() => handleEdit(params.row)}
      >
        <EditIcon />
      </IconButton>
    )
  }
];




  return (
    <Grid container spacing={4} sx={{ bgcolor: "white", padding: 3 }}>

      <Grid item xs={6}>
        <Typography variant="h5">Cities Setup</Typography>
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
        {/* Search Field */}


        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Search:</span>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <TextField
              id="search-field"
              variant="outlined"
              size="small"
              placeholder="Search city..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}

              style={{ width: '300px' }}

            />
          </div>
        </div>



        <div style={{ display: 'flex', gap: '10px' }}>
            {/* <div>
                <Button
                startIcon={(
                    <SvgIcon fontSize="small">
                    <DownloadIcon />
                    </SvgIcon>
                )}
                variant="contained"
                onClick={handleClick}
                disabled={loadingExport}
                >
                {loadingExport ? 'Processing...' : 'Export Coupon'}
                </Button>

                <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={() => handleClose()}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                >
                <MenuItem onClick={() => handleClose('active')}>Active</MenuItem>
                <MenuItem onClick={() => handleClose('expired')}>Expired</MenuItem>
                <MenuItem onClick={() => handleClose('all')}>Export All</MenuItem>
                </Menu>
            </div> */}

          <Button startIcon={(
            <SvgIcon fontSize="small">
              <PlusIcon />
            </SvgIcon>
          )}
            variant="contained"
            onClick={() => {
                handleViewData();
            }}
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
            onDelete={handleDelete}
            
            totalRecords={totalRecords}
            totalPages={totalPages}
            currentPage={currentPage}
            rowsPerPage={perPage}
            onPageChange={getPromoCoupon}
          />
        </Card>
      </Grid>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity="error"
        >
          {errorMessage}
        </MuiAlert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity="success"
        >
          {successMessage}
        </MuiAlert>
      </Snackbar>
      
      <AddCityDrawer
        open={viewDrawerOpen}
        onClose={(shouldRefresh) => {
          setViewDrawerOpen(false)
          if (shouldRefresh) {
            // Reload your list
          }
        }}
        initialData={selectedCoupon}
      />
    </Grid>
  )
}

export default MUITable

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { Button, Menu, MenuItem, SvgIcon } from '@mui/material'

import PlusIcon from '@heroicons/react/24/solid/PlusIcon'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import TableBasic from 'src/views/tables/DriversTable'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { TextField, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download'; // or any icon you prefer
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import { Box } from '@mui/material';


import * as XLSX from 'xlsx';

const MUITable = () => {

  const [data, setData] = useState([])
  const [dataToExport, setDataToExport] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const [loadingExport, setLoadingExport] = useState(false);

  const [sortColumn, setSortColumn] = useState("id");
  const [sort, setSort] = useState("DESC");
  const [loadingDocsCount, setLoadingDocsCount] = useState(false);


  let token
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token')
  }
  const router = useRouter();
  const { type } = router.query; // Get driver ID from query params

  const handleCloseSnackbar = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  const onPageSizeChange = (rowPerPage) => {
    getDrivers(1, rowPerPage);
  }

  const exportToExcel = (type = "all") => {

    setLoadingExport(true);

    try {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/export-drivers/${type}`, {
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
          a.download = 'drivers.csv';
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



  useEffect(() => {
    getDrivers(currentPage, perPage);
  }, [perPage, sort, sortColumn])

  const handleDelete = async (idToDelete) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/delete-driver/${idToDelete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setSuccessMessage('Driver deleted successfully!')
          getDrivers(1)
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

  let cancelTokenSource = null;

  const getDrivers = async (page_num = 1, perPage_val = perPage) => {
    if (loading) return;

    // Cancel previous request
    if (cancelTokenSource) {
      cancelTokenSource.cancel('Operation canceled due to new request.');
    }

    // Create new cancel token
    cancelTokenSource = axios.CancelToken.source();

    setLoading(true);

    const queryParams = new URLSearchParams({
      page: page_num,
      perPage: perPage_val,
      type,
      search: searchText,
      sort,
      sortColumn
    }).toString();

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/drivers?${queryParams}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`,
          },

          //cancelToken: cancelTokenSource.token,
        }
      );

      const data = response.data;
      setData(data.data);
      setTotalRecords(data.totalRecords);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setPerPage(data.perPage);
      setRowsPerPage(data.perPage);

    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Request canceled:', err.message);
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSortModelChange = (sortModel) => {
    if (sortModel.length > 0) {
      const { field, sort } = sortModel[0]; // sort is either 'asc' or 'desc'
      setSortColumn(field)
      setSort(sort)

    } else {
      setSortColumn("")
      setSort("")
      getDrivers(1, perPage);
    }
  };

  const handleUpdateDocsCount = async () => {
    if (data.length === 0) {
      setErrorMessage('No drivers visible to update');

      return;
      
    }

    setLoadingDocsCount(true);
    try {
      const driverIds = data.map(driver => driver.id);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/updateVisibleDriversDocsCount`,
        { driverIds },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage('Visible drivers updated successfully!');
        getDrivers(currentPage, perPage); // Refresh the current view
      } else {
        setErrorMessage(response.data.message || 'Failed to update docs count');
      }
    } catch (error) {
      console.error('Error updating docs count:', error);
      setErrorMessage('An error occurred while updating docs count');
    } finally {
      setLoadingDocsCount(false);
    }
  };

  const handleSearchClick = (searchdata) => {
    if (!loading) {
      getDrivers(1, perPage);
    }
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

  return (
    <Grid container spacing={4} sx={{ bgcolor: "white", padding: 3 }}>
      <Grid item xs={6}>
        <Typography variant='h5'>
          Drivers {type == 'active' ? '(Active)' : ''}
        </Typography>
      </Grid>
      <Grid
        item
        xs={12}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          marginBottom: '16px',
        }}
      >
        {/* Search Field */}


        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, maxWidth: { sm: '400px' } }}>
          <Typography variant="body1" sx={{ marginRight: '10px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            Search:
          </Typography>
          <TextField
            id="search-field"
            variant="outlined"
            size="small"
            placeholder="Search drivers"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleSearchClick}>
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />
        </Box>



        <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
          <div>
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
              {loadingExport ? 'Processing...' : 'Export Drivers'}
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
              <MenuItem onClick={() => handleClose('Approved')}>Export Active</MenuItem>
              <MenuItem onClick={() => handleClose('Inactive')}>Export Inactive</MenuItem>
              <MenuItem onClick={() => handleClose('all')}>Export All</MenuItem>
            </Menu>
          </div>

          <Button startIcon={(
            <SvgIcon fontSize="small">
              <PlusIcon />
            </SvgIcon>
          )}
            variant="contained"
            onClick={() => router.push('/drivers/add')}
          >
            Add
          </Button>

          <Button
            startIcon={(
              <SvgIcon fontSize="small">
                <RefreshIcon />
              </SvgIcon>
            )}
            variant="contained"
            color="secondary"
            onClick={handleUpdateDocsCount}
            disabled={loadingDocsCount}
          >
            {loadingDocsCount ? 'Updating...' : 'Update Docs Count'}
          </Button>
        </Box>
      </Grid>


      <Grid item xs={12}>
        <Card>
          <TableBasic
            items={data}
            onDelete={handleDelete}
            onUpdateStatus={handleUpdateStatus}
            totalRecords={totalRecords}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageSizeChange={onPageSizeChange}
            rowsPerPage={rowsPerPage}
            onPageChange={getDrivers}
            handleSortModelChange={handleSortModelChange}
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

    </Grid>
  )
}

export default MUITable

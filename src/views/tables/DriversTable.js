import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DataGrid } from '@mui/x-data-grid';
import {

  IconButton,
  Button,
  Snackbar,
  Alert,
  Chip,
  Box,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography
} from '@mui/material';
import MuiAlert from '@mui/material/Alert'

import { formatDate, formatOnlyDate } from '../../utils/utils';

import ProfileAvatar from 'src/layouts/components/ProfileAvatar';
import { Refresh } from "@mui/icons-material";
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import DriverDrawer from 'src/pages/drivers/DriverDrawer';
// Import your DriverDrawer component

const DriversTable = ({
  items = [],
  onDelete,
  totalRecords,
  totalPages,
  currentPage,
  rowsPerPage,
  onPageSizeChange,
  onPageChange = () => { },
  handleSortModelChange = () => { }
}) => {
  const [rows, setRows] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [openDateDialog, setOpenDateDialog] = React.useState(false);
  const [endDate, setEndDate] = React.useState('');

  useEffect(() => {
    setRows(items)
  }, [items]);

  const [page, setPage] = useState(currentPage || 1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('')
  
  const router = useRouter();
  let token
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token')
  }


  const handleOpenDateDialog = (row) => {
    setSelectedDriver(row);
    setEndDate(row.membership[0]?.end_date || '');
    setOpenDateDialog(true);
  };

  const handleCloseDateDialog = () => {
    setOpenDateDialog(false);
    setSelectedDriver(null);
    setEndDate('');
  };

  const handleSubmitDate = () => {
    if (!selectedDriver || !endDate) return;

    const membershipId = selectedDriver?.membership?.[0]?.membership_id; // adjust field name as per your DB

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/updateDriverMembershipEndDate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      },
      body: JSON.stringify({
        driverId: selectedDriver.id,
        membershipId: membershipId,
        endDate: endDate
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Update membership end date in UI without reload
          setRows((prevRows) =>
            prevRows.map((row) =>
              row.id === selectedDriver.id
                ? {
                  ...row,
                  membership: row.membership.length
                    ? [{ ...row.membership[0], end_date: endDate }]
                    : row.membership
                }
                : row
            )
          );
          setSuccessMessage('MemberShip end date updated successfully');

          handleCloseDateDialog();
        } else {
          setErrorMessage(data.message || "Failed to update");
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setErrorMessage("Something went wrong");
      });
  };

  const handleClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedRowId(null);
  };

  const handleEdit = (id) => {
    router.push(`/drivers/edit?id=${id}`);
  };

  const handleViewDriver = (id) => {
    router.push(`/drivers/driverDetails?id=${id}`);
  };

  // New function to open drawer
  const handleOpenDrawer = (driver) => {
    console.log("the row is",driver)

    setSelectedDriver(driver);
    setDrawerOpen(true);
  };

  // New function to close drawer
  const handleCloseDrawer = () => {

    setSelectedDriver(null);
    setDrawerOpen(false);
  };

  const handleDelete = (id) => {
    onDelete(id);
  };

  const handlePageChange = (newPage) => {
    onPageChange(newPage);
    setPage(newPage);
  };

      const handleCloseSnackbar = () => {
        setErrorMessage('')
        setSuccessMessage('')
    }

  const handleCellClick = (params) => {
    if (params.field === "docsCount") {

      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/updateDriverDocsCount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify({ "driverId": params.id }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.data) {
            let count = data.data.count;

            setRows((prevRows) =>
              prevRows.map((row) =>
                row.id === params.id
                  ? { ...row, docsCount: count } // Simulate new data
                  : row
              )
            );

          } else {
            setErrorMessage(data.message)
          }
        })
        .catch(error => {
          console.error('Error:', error)
        })


    }
  };

  const columns = [
    {
      field: 'profile',
      headerName: '',
      renderCell: (params) => <ProfileAvatar item={params.row} />,
      width: 60,
      sortable: false
    },
    { field: 'id', headerName: 'Driver Id', width: 100 },
    {
      field: 'driverName',
      headerName: 'Driver Name',
      width: 180,
      renderCell: (params) => (
        <span onClick={() => handleOpenDrawer(params.row)} style={{ cursor: 'pointer', color: 'blue' }}>
          {params.row.driverName || 'N/A'}
        </span>
      ),
    },
    { field: 'phone_number', headerName: 'Mobile', width: 120, sortable: false },
    {
      field: 'wallet',
      headerName: 'Wallet Amt',
      width: 80,
      renderCell: (params) => (params.row.wallet ? `${params.row.wallet}/-` : ''),
    },
    {
      field: 'created_at',
      headerName: 'Enrollment Date',
      width: 100,
      renderCell: (params) => (params.row.created_at ? formatDate(params.row.created_at) : 'N/A'),
    },
    {
      field: 'membership',
      headerName: 'Membership',
      width: 150,
      sortable: false,
      renderCell: (params) => (params.row.membership.length ? params.row.membership[0].plan_name : 'N/A'),
    },
    {
      field: 'membershipStartDate',
      headerName: 'Membership startDate',
      width: 150,
      sortable: false,
      renderCell: (params) => (params.row.membership.length ? formatOnlyDate(params.row.membership[0].start_date) : ''),
    },
    {
      field: 'membershipEndDate',
      headerName: 'Membership EndDate',
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const hasMembership = params.row.membership.length > 0;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>
              {hasMembership
                ? formatOnlyDate(params.row.membership[0].end_date)
                : ''}
            </span>
            {hasMembership && (
              <IconButton
                size="small"
                onClick={() => handleOpenDateDialog(params.row)}
              >
                <EditIcon fontSize="small" color="primary" />
              </IconButton>
            )}
          </Box>
        );
      },
    },

    {
      field: "docsCount",
      headerName: "Docs Count",
      width: 120,
      renderCell: (params) => (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",  // Aligns to right
          width: "100%" // Ensures full cell width for alignment
        }}>
          <span>{params.value === null || params.value === undefined ? "--" : params.value}</span>
          <IconButton size="small" onClick={() => handleCellClick(params)}>
            <Refresh fontSize="small" />
          </IconButton>
        </div>
      )
    },

    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={
            params.row.profileApproved === 1
              ? 'Approved'
              : params.row.profileApproved === 2
                ? 'Unapproved'
                : params.row.profileApproved === 3
                  ? 'Blocked'
                  : params.row.profileApproved === 4
                    ? 'Rejected'
                    : 'Unapproved'
          }
          color={params.row.profileApproved === 1 ? 'success' : 'error'}
          sx={{
            fontSize: '12px', // Adjust font size
            padding: '4px 8px', // Adjust padding
            height: '24px', // Adjust height if needed
          }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit" arrow>
            <IconButton
              onClick={() => handleEdit(params.row.id)}
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
              <EditIcon sx={{ color: '#1976d2', fontSize: '20px' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="View Details" arrow>
            <IconButton
              onClick={() => handleOpenDrawer(params.row)}
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
              <InfoIcon sx={{ color: '#4caf50', fontSize: '20px' }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
    {
      field: 'city',
      headerName: 'Enroll City',
      width: 150,
      renderCell: (params) => (params.row.city ? params.row.city.name : ''),
    },

  ];

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10, // ✅ Default page size here
  });

  return (
    <>
      <div style={{ height: '100%', width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={rowsPerPage}
          rowCount={totalRecords} // Ensure total count is provided for server pagination
          paginationMode="server"
          //paginationModel={{ page: currentPage, pageSize: rowsPerPage }} // ✅ Use this only
          paginationModel={paginationModel} // ✅ Controlled model
          onPaginationModelChange={(model) => {
            setPaginationModel(model); // update local state
            onPageChange(model.page, model.pageSize); // your API call logic
            // onPageSizeChange(model.pageSize);
          }}
          disableSelectionOnClick={true}
          pageSizeOptions={[10, 20, 50, 100]}
          disableColumnMenu
          onSortModelChange={handleSortModelChange}
        />
      </div>

      {/* Driver Drawer Component */}
      <DriverDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        data={selectedDriver}
        onDriverUpdate={(updatedDriver) => {
          // Update the driver in the rows array
          setRows((prevRows) =>
            prevRows.map((row) =>
              row.id === updatedDriver.id ? { ...row, ...updatedDriver } : row
            )
          );
          setSuccessMessage('Driver updated successfully');
        }}
      />

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

      <Dialog open={openDateDialog} onClose={handleCloseDateDialog}>
        <DialogTitle>
          Membership – Update End Date
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            Set a new end date for the driver’s membership.
          </Typography>
          <TextField
            label="Membership End Date"
            type="date"
            value={endDate ? endDate.split('T')[0] : ''}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDateDialog} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmitDate}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
};

export default DriversTable;
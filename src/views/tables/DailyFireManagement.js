import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Paper, Table, TableRow, TableHead, TableBody, TableCell,
  TableContainer, IconButton, Menu, MenuItem, Button, Snackbar, Alert, Chip, Box
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { formatDate } from '../../utils/utils';

const DailyFireManagement = (props) => {
  const {
    items = [],
    onDelete,
    totalRecords,
    totalPages,
    currentPage,
    perPage,
    onPageChange = () => {},
  } = props;

  const [page, setPage] = useState(currentPage || 1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const handleClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedRowId(null);
  };

  const handleEdit = (id) => {
    router.push(`/daily-fare-management/edit?id=${id}`);
  };

  const handleShow = (id) => {
    router.push(`/daily-fare-management/show?id=${id}`);
  };

  const handleDelete = (id) => {
    onDelete(id);
  };

  const handlePageChange = (newPage) => {
    onPageChange(newPage);
    setPage(newPage);
  };

const renderPageNumbers = () => {
    const pages = [];
    const totalToShow = 5; // Number of page links to show at a time
    let startPage = Math.max(page - Math.floor(totalToShow / 2), 1);
    let endPage = startPage + totalToShow - 1;
  
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(totalPages - totalToShow + 1, 1);
    }
  
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          onClick={() => handlePageChange(i)}
          variant={i === page ? 'contained' : 'outlined'}
          sx={{ mx: 0.5 }}
        >
          {i}
        </Button>
      );
    }
  
    return (
      <>
        <Button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          variant="outlined"
          sx={{ mx: 0.5 }}
        >
          Prev
        </Button>
        {pages}
        <Button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          variant="outlined"
          sx={{ mx: 0.5 }}
        >
          Next
        </Button>
      </>
    );
  };

  
  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
                <TableCell>Fare Management Id</TableCell>	
                <TableCell>Country </TableCell>
                <TableCell>	Vehicle Type</TableCell>
                <TableCell>Base Fare	</TableCell>
                <TableCell>Price Per Km</TableCell>
                <TableCell>Price per Min</TableCell>
                <TableCell>Waiting Time Charge</TableCell>
                <TableCell>Cancellation Charge</TableCell>
                <TableCell>Status	</TableCell>
                <TableCell>Action</TableCell>   
            </TableRow>
          </TableHead>
          <TableBody>
            {items && items.map((item,index) => (
              <TableRow key={item.id}>
                
                <TableCell>
                  {index+1}
                </TableCell>
                <TableCell>{item.country_id}</TableCell>
                <TableCell>{item.vehicle_type}</TableCell>
                <TableCell>{item.base_fare}</TableCell>
                <TableCell>{item.price_per_km}</TableCell>
                <TableCell>{item.price_per_minute}</TableCell>
                <TableCell>{item.waiting_time_charges}</TableCell>
                <TableCell>{item.cancellation_charges}</TableCell>
                <TableCell>{item.status === 1? <Chip label="Active" color="success" /> : <Chip label="Inactive" color="error" />}</TableCell>
                <TableCell>
                  <IconButton
                    aria-controls={`menu-${item.id}`}
                    aria-haspopup="true"
                    onClick={(event) => handleClick(event, item.id)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    id={`menu-${item.id}`}
                    anchorEl={anchorEl}
                    keepMounted
                    open={selectedRowId === item.id}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={() => handleEdit(item.id)}>Edit</MenuItem>
                    <MenuItem onClick={() => handleShow(item.id)}>Show</MenuItem>
                    <MenuItem onClick={() => handleDelete(item.id)}>Delete</MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center" my={2}>
        {renderPageNumbers()}
      </Box>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DailyFireManagement;

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Paper,
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  Chip,
  Box,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { formatDate } from '../../utils/utils';

const WebsiteBookingsTable = ({ items = [], onDelete,totalRecords, totalPages, currentPage, perPage, onPageChange = () => {} }) => {
  const [page, setPage] = useState(currentPage || 1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  let token
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token')
  }
  
  const handleClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedRowId(null);
  };

//   const handleEdit = (id) => {
//     router.push(`/websiteTrips/edit?id=${id}`);
//   };
  
//   const handleDelete = (id) => {
//     onDelete(id);
//   };
  
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
            <TableCell>Id</TableCell>     
            <TableCell>Name</TableCell>  
            <TableCell>Contact Number</TableCell>  
            <TableCell>Pickup Location</TableCell>  
            <TableCell>Dropoff Location</TableCell>  
            <TableCell>Pickup DateTime</TableCell>  
            <TableCell>Trip Type</TableCell>  
            <TableCell>Fare</TableCell>  
            <TableCell>Vehicle Type</TableCell>    
          </TableRow>

          </TableHead>
          
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id || 'N/A'}</TableCell>     
                <TableCell>{item.customerName || 'N/A'}</TableCell>  
                <TableCell>{item.contactNumber || 'N/A'}</TableCell>  
                <TableCell>{item.pickupLocation || 'N/A'}</TableCell>  
                <TableCell>{item.dropoffLocation || 'N/A'}</TableCell>  
                <TableCell>{item.pickUpDateTime || 'N/A'}</TableCell>  
                <TableCell>{item.trip_type || 'N/A'}</TableCell>  
                <TableCell>{item.fare || 'N/A'}</TableCell>  
                <TableCell>{item.vehicleType || 'N/A'}</TableCell>
                
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

export default WebsiteBookingsTable;

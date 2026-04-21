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

const TripLogsDetailsTable = ({ items = [], totalPages, currentPage, onPageChange = () => {} }) => {
  const [page, setPage] = useState(currentPage || 1);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  let token
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token')
  }

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

    const formatTime = (time) => {
      const date = new Date(time);
      const formattedDate = date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return formattedDate;
    }
    return (
    <>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>            
              <TableCell>Trip Id</TableCell>
              <TableCell>Driver Id</TableCell>
              <TableCell>Driver Name</TableCell>
              <TableCell>Driver Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sent Date</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id || 'N/A'}</TableCell>
                <TableCell>{item.trip_id || 'N/A'}</TableCell>
                <TableCell>{item.driver_id || 'N/A'}</TableCell>
                <TableCell>{item.driver?.driverName || 'N/A'}</TableCell>
                <TableCell>{item?.driver?.phone_number || 'N/A'}</TableCell>
                <TableCell>{item?.status || 'N/A'}</TableCell>
                <TableCell>{formatTime(item.sent_at) || 'N/A'}</TableCell>
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

export default TripLogsDetailsTable;

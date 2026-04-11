import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Paper, Table, TableRow, TableHead, TableBody, TableCell,
  TableContainer, IconButton, Menu, MenuItem, Button, Snackbar, Alert, Chip, Box
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const CustomersTable = (props) => {
  const {
    items = [],
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
    router.push(`/customers/edit?id=${id}`);
  };

  const handlePageChange = (newPage) => {
    onPageChange(newPage);
    setPage(newPage);
  };

//   const renderPageNumbers = () => {
//     const pages = [];
//     for (let i = 1; i <= totalPages; i++) {
//       pages.push(
//         <Button
//           key={i}
//           onClick={() => handlePageChange(i)}
//           variant={i === page ? 'contained' : 'outlined'}
//           sx={{ mx: 0.5 }}
//         >
//           {i}
//         </Button>
//       );
//     }
//     return pages;
//   };

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
    hour12: false,
  });
  return formattedDate;
}

const handleCurrency = (currency) => {
  switch (currency) {
    case 1: return 'INR'; break;  // US Dollar
    case 2: return 'USD'; break;  // Euro Member Countries
    default: return '-';
  }
}
  

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
            <TableCell>Id</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Phone Number</TableCell>
              
              <TableCell>Gender</TableCell>
              <TableCell>Referral Code</TableCell>
              <TableCell>Wallet</TableCell>
              <TableCell>Enrolled On</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.id}
                </TableCell>
                <TableCell>
                  {item.first_name || 'N/A'} {item.last_name || ''}
                </TableCell>
                <TableCell>{item.phone_with_code}</TableCell>
               
                <TableCell>{item.gender?item.gender:'-'}</TableCell>
               
             
                <TableCell>{item.referral_code}</TableCell>
                <TableCell>{item.wallet}</TableCell>
                <TableCell>{formatTime(item.created_at)}</TableCell>
                <TableCell>
                  <Chip
                    label={item.status === 1 ? 'Active' : 'Inactive'}
                    color={item.status === 1 ? 'success' : 'error'}
                  />
                </TableCell>
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

export default CustomersTable;

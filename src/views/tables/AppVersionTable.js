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
    router.push(`/app-versions/edit?id=${id}`);
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
const app_type={
    0:'customer',
    1:'driver',
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
              <TableCell>App Type</TableCell>
              <TableCell>Force Update</TableCell>
              <TableCell>version code</TableCell>
              <TableCell>version number</TableCell>
              <TableCell>Device type</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item,index) => (
              <TableRow key={item.id}>
                
                <TableCell>
                  {index+1}
                </TableCell>
                <TableCell>{item.appType}</TableCell>
                
                <TableCell>
                  <Chip
                    label={item.forceUpdate === 1 ? 'Yes' : 'No'}
                    color={item.forceUpdate === 1 ? 'success' : 'error'}
                  />
                </TableCell>
                <TableCell>{item.versionCode}</TableCell>
                <TableCell>{item.versionNumber}</TableCell>
                <TableCell>{item.deviceType}</TableCell>

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

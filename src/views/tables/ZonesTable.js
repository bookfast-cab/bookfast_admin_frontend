import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Paper, Table, TableRow, TableHead, TableBody, TableCell,
  TableContainer, IconButton, Menu, MenuItem, Button, Snackbar, Alert, Chip, Box
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { formatDate } from '../../utils/utils';

const ZonesTable = (props) => {
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
    router.push(`/zones/edit?id=${id}`);
  };

  const handleShow = (id) => {
    router.push(`/zones/show?id=${id}`);
  };

  const handleDelete = (id) => {
    onDelete(id);
  };

  const handlePageChange = (newPage) => {
    onPageChange(newPage);
    setPage(newPage);
  };
  
const handleCreateZone = (newZone) => {
  router.push(`/zones/create-zones?id=${newZone}`); 
};

const handleViewZone = (newZone) => {
  router.push(`/zones/view-zones?id=${newZone}`);
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
                <TableCell>Zone Id</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>Zone	</TableCell>
                <TableCell>Zone Ar</TableCell>
                <TableCell>Polygon	</TableCell>
                <TableCell>View Polygon</TableCell>
                <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items && items.map((item,index) => (
              <TableRow key={item.id}>
                
                <TableCell>
                  {item.id}
                </TableCell>
                <TableCell>{item.country.country_name}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.name_ar}</TableCell> 
                <TableCell><Button variant="contained" onClick={()=>handleCreateZone(item.id)} style={{color:"white",fontSize:"9px",height:"25px",padding:"5px"}}>Create Polygon</Button></TableCell>
                <TableCell><Button variant="contained" onClick={()=>handleViewZone(item.id)} style={{color:"white",fontSize:"9px",height:"25px",padding:"5px"}}>View Polygon</Button></TableCell>
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

export default ZonesTable;

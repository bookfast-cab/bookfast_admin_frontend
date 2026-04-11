import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Paper, Table, TableRow, TableHead, TableBody, TableCell,
  TableContainer, IconButton, Menu, MenuItem, Button, Snackbar, Alert, Chip, Box
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { formatDate } from '../../utils/utils';

const OutStationTable = (props) => {
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
    router.push(`/outstation-package/edit?id=${id}`);
  };

  const handleShow = (id) => {
    router.push(`/outstation-package/show?id=${id}`);
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
                <TableCell>Outstation Package Id</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Pickup Location	</TableCell>
                <TableCell>Drop Location</TableCell>	
                <TableCell>Vehicle Type</TableCell>	
                <TableCell>Trip Sub Type</TableCell>	
                <TableCell>Base Fare</TableCell>	
                <TableCell>Per Km Rs</TableCell>	
                <TableCell>Total Km Limit	</TableCell>
                <TableCell>Per Minute Charge	</TableCell>
                <TableCell>Total Minutes Limit	</TableCell>
                <TableCell>After Limit Km Charge</TableCell>	
                <TableCell>Driver Allowance	</TableCell>
                <TableCell>Driver Night Charge	</TableCell>
                <TableCell>Total Tax</TableCell>	
                <TableCell>Other Charge</TableCell>	
                <TableCell>Created At</TableCell>	
                <TableCell>Updated At</TableCell>	
                <TableCell>Action</TableCell>
                            
            </TableRow>
          </TableHead>
          <TableBody>
            {items && items.map((item,index) => (
              <TableRow key={item.id}>
                
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.pickupLocation}</TableCell>
                <TableCell>{item.dropLocation}</TableCell>
                <TableCell>{item.vehicleType}</TableCell>
                <TableCell>{item.tripSubType}</TableCell>
                <TableCell>{item.baseFare}</TableCell>
                <TableCell>{item.perKmRs}</TableCell>
                <TableCell>{item.totalKmLimit}</TableCell>
                <TableCell>{item.perMinuteCharge}</TableCell>
                <TableCell>{item.total_minutes_limit}</TableCell>
                <TableCell>{item.afterLimitKmCharge}</TableCell>
                <TableCell>{item.driverAllowance}</TableCell>
                <TableCell>{item.driverNightCharge}</TableCell>
                <TableCell>{item.totalTax}</TableCell>
                <TableCell>{item.otherCharge}</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}}>{formatDate(item.created_at)}</TableCell>
                <TableCell style={{whiteSpace:'nowrap'}}>{formatDate(item.updated_at)}</TableCell>
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

export default OutStationTable;

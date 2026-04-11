// ** React Imports
import { useState } from 'react';
import { useRouter } from 'next/router';

// ** MUI Imports
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import Chip from '@mui/material/Chip';
import { IconButton, Menu, MenuItem, Switch, Button, Box } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Confirmation from '../../components/Confirmation';
import {
  Stack,
  Typography,
  Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';

const statusObj = {
  inactive: { color: 'info' },
  No: { color: 'error' },
  current: { color: 'primary' },
  resigned: { color: 'warning' },
  active: { color: 'success' }
}

const TableBasicPagesSetup = (props) => {
  const {
    items = [],
    totalRecords,
    totalPages,
    currentPage,
    perPage,
    selected = [],
    onPageChange = () => {},
  } = props;

  const [adminId, setAdminId] = useState('');
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  let token;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token');
  }

  const handleClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedRowId(null);
  }

  const handleDelete = (id) => {
    setAnchorEl(null);
    setSelectedRowId(null);
    setAdminId(id);
    setIsDialogOpen(true);
  };

  const handleEdit = (id) => {
    setAnchorEl(null);
    setSelectedRowId(null);
    router.push('/pages-setup/edit?id=' + id);
  }

  const handlePageChange = (newPage) => {
    onPageChange(newPage);
    setPage(newPage);
  };

  const handlePrevPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      onPageChange(newPage);
      setPage(newPage); // Use functional update form to guarantee correct update
    }
  };
  
  const handleNextPage = () => {
    if (page < totalPages) {
      const newPage = page + 1;
      onPageChange(newPage);
      setPage(newPage); // Use functional update form to guarantee correct update
    }
  };

  // const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleConfirm = () => {
    setIsDialogOpen(false);
    props.onDelete(adminId,page);
  };

  const renderPageNumbers = () => {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
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

    if (startPage > 1) {
      pageNumbers.unshift(<Button key="start-ellipsis" disabled sx={{ mx: 0.5 }}>...</Button>);
    }
    if (endPage < totalPages) {
      pageNumbers.push(<Button key="end-ellipsis" disabled sx={{ mx: 0.5 }}>...</Button>);
    }

    return pageNumbers;
  };

  const handleToggleStatus = async (id, currentStatus) => {
  
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/employees/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      },
      body: JSON.stringify({ status: newStatus }),
    }).then(response => response.json())
      .then(data => {
        if (data.success) {
          setSuccessMessage('Status updated successfully');
          props.onUpdateStatus(id, newStatus);
        } else {
          setErrorMessage('Failed to update status');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setErrorMessage('Failed to update status');
      });
  };

  const mapStatusToLabel = (status) => {
    switch (status.toLowerCase()) {
      case 'active':

        return 'Avtive';
      case 'inactive':

        return 'InActive';
      default:
        
        return 'Unknown'; // Fallback label
    }
  };

  return (
    <>
      <Confirmation
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Delete"
        content="Are you sure you want to delete this employee?"
      />

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Action</TableCell>
              
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((page) => {
              const isSelected = selected.includes(page.id);

              return (
                <TableRow hover key={page.id} selected={isSelected}>
                  
                  <TableCell>
                    {page.title}
                  </TableCell>
                  <TableCell>
                    <div dangerouslySetInnerHTML={{ __html: page.description }} />
                  </TableCell>
              
                  {/* <TableCell>
                    <Chip
                      label={mapStatusToLabel(page.status)}
                      color={statusObj[page.status]?.color || 'default'}
                      sx={{
                        height: 24,
                        fontSize: '0.75rem',
                        textTransform: 'capitalize',
                        '& .MuiChip-label': { fontWeight: 500 }
                      }}
                    />
                  </TableCell> */}

                  <TableCell>
                 
                    <IconButton
                      aria-controls={`menu-${page.id}`}
                      aria-haspopup="true"
                      onClick={(event) => handleClick(event, page.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      id={`menu-${page.id}`}
                      anchorEl={anchorEl}
                      keepMounted
                      open={selectedRowId === page.id}
                      onClose={handleClose}
                    >
                      <MenuItem onClick={() => handleEdit(page.id)}>Edit</MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

      </TableContainer>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={() => setErrorMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setErrorMessage('')}
          severity="error"
        >
          {errorMessage}
        </MuiAlert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setSuccessMessage('')}
          severity="success"
        >
          {successMessage}
        </MuiAlert>
      </Snackbar>
    </>
  )
}

export default TableBasicPagesSetup

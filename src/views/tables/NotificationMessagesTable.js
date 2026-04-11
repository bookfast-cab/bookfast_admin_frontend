import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Paper, Table, TableRow, TableHead, TableBody, TableCell,
  TableContainer, IconButton, Button, Snackbar, Alert, Box,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import MuiAlert from '@mui/material/Alert';

const TableBasicPagesSetup = (props) => {
  const {
    items = [],
    totalRecords,
    totalPages,
    currentPage,
    perPage,
    onPageChange = () => {},
  } = props;

  const [page, setPage] = useState(currentPage || 1);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const router = useRouter();

  let token
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token')
  }

  const handleEdit = (id) => {
    router.push(`/notification-messages/edit?id=${id}`);
  };

  const handleDeleteClick = (id) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/notification-messages/delete/${selectedDeleteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message || 'Notification deleted successfully');
        // Optionally refresh the data here
        onPageChange(page); // Refresh current page
      } else {
        setErrorMessage(data.message || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      setErrorMessage('An error occurred while deleting. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedDeleteId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDeleteId(null);
  };

  const handlePageChange = (newPage) => {
    onPageChange(newPage);
    setPage(newPage);
  };

  const sendNotification = async (notificationId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/notification-messages/send/${notificationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const totalToShow = 5;
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

  const mapTypeToLabel = (type) => {
    const typeMap = { 1: 'Customer', 2: 'Driver' };
    return typeMap[type] || 'Vendor';
  };

  const handleCloseSnackbar = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>{mapTypeToLabel(item.type)}</TableCell>
                <TableCell>
                  <div dangerouslySetInnerHTML={{ __html: item.message }} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Send Notification" arrow>
                      <IconButton
                        onClick={() => sendNotification(item.id)}
                        sx={{
                          backgroundColor: '#f0f0f0',
                          borderRadius: '8px',
                          padding: '5px',
                          transition: '0.2s',
                          '&:hover': {
                            backgroundColor: '#e8f5e8',
                          },
                        }}
                      >
                        <SendIcon sx={{ color: '#2e7d32', fontSize: '20px' }} />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Edit" arrow>
                      <IconButton
                        onClick={() => handleEdit(item.id)}
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
                    
                    <Tooltip title="Delete" arrow>
                      <IconButton
                        onClick={() => handleDeleteClick(item.id)}
                        sx={{
                          backgroundColor: '#f0f0f0',
                          borderRadius: '8px',
                          padding: '5px',
                          transition: '0.2s',
                          '&:hover': {
                            backgroundColor: '#ffebee',
                          },
                        }}
                      >
                        <DeleteIcon sx={{ color: '#d32f2f', fontSize: '20px' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this notification? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            No
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

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

      <Box display="flex" justifyContent="center" my={2}>
        {renderPageNumbers()}
      </Box>
    </>
  );
};

export default TableBasicPagesSetup;
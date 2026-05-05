import React, { useState } from 'react';
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
  Box,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LaunchIcon from '@mui/icons-material/Launch';

const TutorialTable = ({ items = [], onDelete, onEdit, totalPages, currentPage, onPageChange = () => {} }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleEditAction = () => {
    onEdit(selectedItem);
    handleClose();
  };
  
  const handleDeleteAction = () => {
    if(window.confirm("Are you sure you want to delete this video?")) {
      onDelete(selectedItem.id);
    }
    handleClose();
  };
  
  const handlePageChange = (newPage) => {
    onPageChange(newPage);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const totalToShow = 5;
    let startPage = Math.max(currentPage - Math.floor(totalToShow / 2), 1);
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
          variant={i === currentPage ? 'contained' : 'outlined'}
          sx={{ mx: 0.5, minWidth: '40px' }}
        >
          {i}
        </Button>
      );
    }
  
    return (
      <Box display="flex" alignItems="center">
        <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} variant="outlined" sx={{ mx: 0.5 }}>Prev</Button>
        {pages}
        <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} variant="outlined" sx={{ mx: 0.5 }}>Next</Button>
      </Box>
    );
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>ID</TableCell>            
              <TableCell>Thumbnail</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Video Link</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {items.length > 0 ? items.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>{item.id}</TableCell>
                <TableCell>
                  <Box
                    component="img"
                    sx={{ width: 80, height: 45, borderRadius: 1, objectFit: 'cover', border: '1px solid #eee' }}
                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/tutorials/${item.thumbnail}`}
                    alt={item.title}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{item.title || 'N/A'}</TableCell>
                <TableCell>
                  <IconButton size="small" color="primary" href={item.video_url} target="_blank">
                    <LaunchIcon fontSize="small" />
                  </IconButton>
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={(event) => handleClick(event, item)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>No Tutorials Found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleEditAction}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteAction} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" my={4}>
          {renderPageNumbers()}
        </Box>
      )}
    </>
  );
};

export default TutorialTable;
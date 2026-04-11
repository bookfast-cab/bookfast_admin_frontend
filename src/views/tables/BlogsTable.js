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

const stripHtml = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "N/A";
};

const BlogTable = ({ items = [], onDelete,totalRecords, totalPages, currentPage, perPage, onPageChange = () => {} }) => {
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

  const handleEdit = (id) => {
    router.push(`/blogs/addBlog?id=${id}`);
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
              <TableCell>Id</TableCell>            
              <TableCell>Title</TableCell>
              <TableCell>Meta Title</TableCell>
              {/* <TableCell>Description</TableCell> */}
              <TableCell>Slug</TableCell>
              <TableCell>Content</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id || 'N/A'}</TableCell>
                <TableCell>{item.title || 'N/A'}</TableCell>
                <TableCell>{item.metaTitle || 'N/A'}</TableCell>
                {/* <TableCell>{item.metaDescription || 'N/A'}</TableCell> */}
                <TableCell>{item.page_slug || 'N/A'}</TableCell>
                <TableCell>
                  <div style={{
                      width:'600px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2, // Yahan 2 lines set kiya hai
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                  }}>
                    {stripHtml(item.content)}
                  </div>
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

export default BlogTable;

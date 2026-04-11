import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DataGrid } from '@mui/x-data-grid';
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
    Box, Avatar
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ProfileAvatar from 'src/layouts/components/ProfileAvatar';

const CommonDataTable = ({columns=[], items = [], onDelete, totalRecords, totalPages, currentPage, rowsPerPage, onPageSizeChange, onPageChange = () => { } }) => {

   
   // console.log( items , totalRecords, totalPages, currentPage, rowsPerPage, onPageSizeChange)
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

      const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10, // ✅ Default page size here
      });
  
      return (
        <>

            <div style={{ height: '100%', width: '100%' }}>
                <DataGrid
                  rows={items}
                  columns={columns}
                  pageSize={rowsPerPage}
                  rowCount={totalRecords} // Ensure total count is provided for server pagination
                  paginationMode="server"

                  //paginationModel={{ page: currentPage, pageSize: rowsPerPage }} // ✅ Use this only
                  
                  paginationModel={paginationModel} // ✅ Controlled model
                  onPaginationModelChange={(model) => {
                   
                    setPaginationModel(model); // update local state
                    onPageChange(model.page,model.pageSize); // your API call logic
                   // onPageSizeChange(model.pageSize);
                  }}
                  disableSelectionOnClick={true}
                  pageSizeOptions={[10, 20, 50, 100]} 
                  disableColumnMenu
                />

            </div>
        </>
    );
};

export default CommonDataTable;

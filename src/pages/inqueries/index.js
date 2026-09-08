import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import {
  IconButton, Box, TextField, Snackbar, MenuItem, Select, FormControl, InputLabel
} from '@mui/material'
import MuiAlert from '@mui/material/Alert'
import SearchIcon from '@mui/icons-material/Search'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import CommonDataTable from 'src/components/CommonDataTable'
import { formatDate } from 'src/utils/utils'
import axios from 'axios'
import getFingerprint from 'src/utils/Fingerprint'
import ExportButton from 'src/components/export'

const InquiriesTable = () => {
  const [data, setData] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  
  const [searchText, setSearchText] = useState("")
  const [filterType, setFilterType] = useState("") 
  const [loading, setLoading] = useState(false)

  const abortControllerRef = useRef(null)

  let token
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token')
  }

  const handleCloseSnackbar = () => {
    setErrorMessage('')
  }

  const fetchInquiries = async (page_num = 1) => {
    if (loading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);

    const queryParams = new URLSearchParams({ 
      page: page_num,
      limit: perPage,
      search: searchText,
      insurance_type: filterType
    }).toString()

    try {
      const device_id = await getFingerprint();
      
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/insurance-leads?${queryParams}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
          'x-device-id': device_id,
        }
      })
      
      const response = res.data;
      setData(
        response.data.map((item) => ({
          ...item,
          id: item.id
        }))
      )
      setTotalRecords(response.total)
      setTotalPages(response.totalPages || response.totalPa)
      setCurrentPage(response.page)
      setPerPage(response.limit)
    } catch (err) {
      if (axios.isCancel(err)) return;
      if (err.response && err.response.status === 401) {
        localStorage.clear();
        window.location.href = '/pages/login'; 
      }
      console.error('Error fetching inquiries:', err);
      setErrorMessage('Failed to load inquiries.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInquiries(1)
    
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
    
  }, [filterType]) 

  const handleSearchClick = () => {
    if (!loading) fetchInquiries(1);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'insurance_type', headerName: 'Insurance Type', width: 140 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'mobile_number', headerName: 'Mobile Number', width: 140 },
    { field: 'car_type', headerName: 'Car Type', width: 120 },
    { field: 'car_number', headerName: 'Car Number', width: 130 },
    { field: 'gender', headerName: 'Gender', width: 100 },
    { field: 'dob', headerName: 'DOB', width: 120 },
    { field: 'pincode', headerName: 'Pincode', width: 100 },
    { field: 'status', headerName: 'Status', width: 120 },
    {
      field: 'created_at',
      headerName: 'Created At',
      width: 180,
      renderCell: (params) => <span>{formatDate(params.row.created_at) || '-'}</span>
    }
  ]

  return (
    <Grid container spacing={4} sx={{ bgcolor: "white", padding: 3 }}>
      <Grid item xs={12}>
        <Typography variant="h5">Inquiries</Typography>
      </Grid>

      <Grid item xs={12} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, marginBottom: '16px' }}>
        <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, maxWidth: 600 }}>
          <TextField
            id="search-field"
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            fullWidth
            onKeyPress={(e) => e.key === 'Enter' && handleSearchClick()}
            InputProps={{ endAdornment: (<IconButton onClick={handleSearchClick}><SearchIcon /></IconButton>) }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="filter-type-label">Type</InputLabel>
            <Select
              labelId="filter-type-label"
              id="filter-type"
              value={filterType}
              label="Insurance Type"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Health">Health</MenuItem>
              <MenuItem value="Car">Car</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <ExportButton columns={columns} url={`insurance-leads`} />
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CommonDataTable
            columns={columns}
            items={data}
            totalRecords={totalRecords}
            totalPages={totalPages}
            currentPage={currentPage}
            rowsPerPage={perPage}
            onPageChange={fetchInquiries}
          />
        </Card>
      </Grid>

      <Snackbar open={!!errorMessage} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="error">
          {errorMessage}
        </MuiAlert>
      </Snackbar>
    </Grid>
  )
}

export default InquiriesTable

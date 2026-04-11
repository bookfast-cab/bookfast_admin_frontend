import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { Button, SvgIcon } from '@mui/material'
import TextField from '@mui/material/TextField';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import TableBasic from 'src/views/tables/DriversTable'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

import * as XLSX from 'xlsx';

const MUITable = () => {

  const [data, setData] = useState([])
  const [dataToExport, setDataToExport] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(0);

  let token
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token')
  }
  const router = useRouter()

  const handleCloseSnackbar = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  const exportToExcel = () => {
    const formattedData = dataToExport.map((item) => ({
      ID: item.id,
      Name: item.driverName || 'N/A',
      Email: item.email || 'N/A',
      Phone: item.phone_with_code || 'N/A',
      Gender: item.gender || 'N/A',
      'Date of Birth': item.date_of_birth || 'N/A',
      Address: item.address || 'N/A',
      'Owner Name': item.ownerName || 'N/A',
      'Owner Mobile': item.ownerMobileNo || 'N/A',
      Currency: item.currency || 'N/A',
      Wallet: item.wallet || 0,
      'Driver Hiring Status': item.driver_hiring_status ? 'Active' : 'Inactive',
      'Outstation Booking Status': item.outstation_booking_status ? 'Enabled' : 'Disabled',
      'Local Booking Status': item.local_booking_status ? 'Enabled' : 'Disabled',
      'Cab Attachment City': item.cabAttachmentCity || 'N/A',
      'Cab Category': item.cabCategory || 'N/A',
      Remarks: item.remarks || 'N/A',
      'Referral Code': item.referral_code || 'N/A',
      'Created At': item.created_at || 'N/A',
      'Updated At': item.updated_at || 'N/A',
      'Membership Plan': item.membership?.plan_name || 'N/A',
      'Membership Start Date': item.membership?.start_date || 'N/A',
      'Membership End Date': item.membership?.end_date || 'N/A',
      'Membership Status': item.membership?.status || 'N/A',
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
  
    // Set column widths
    const colWidths = [
      { wch: 10 }, // ID
      { wch: 20 }, // Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 10 }, // Gender
      { wch: 15 }, // Date of Birth
      { wch: 30 }, // Address
      { wch: 20 }, // Owner Name
      { wch: 20 }, // Owner Mobile
      { wch: 10 }, // Currency
      { wch: 10 }, // Wallet
      { wch: 20 }, // Driver Hiring Status
      { wch: 25 }, // Outstation Booking Status
      { wch: 25 }, // Local Booking Status
      { wch: 20 }, // Cab Attachment City
      { wch: 15 }, // Cab Category
      { wch: 30 }, // Remarks
      { wch: 15 }, // Referral Code
      { wch: 30 }, // Created At
      { wch: 30 }, // Updated At
      { wch: 25 }, // Membership Plan
      { wch: 25 }, // Membership Start Date
      { wch: 25 }, // Membership End Date
      { wch: 20 }, // Membership Status
    ];
  
    worksheet['!cols'] = colWidths;
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Drivers');
    XLSX.writeFile(workbook, 'Drivers.xlsx');
  };  

  const getDriversForExport = async () => {
    const queryParams = new URLSearchParams({
      page: 1,
      perPage: 100
    }).toString();
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/drivers?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setDataToExport(data.data);
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const downloadCSV = async (main_url, filename) => {
    const response = await fetch(main_url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'Donloaded_file';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };
 
  const getDrivers = async (page_num) => {
    const queryParams = new URLSearchParams({
      page: page_num
    }).toString();
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/drivers?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setData(data.data);
        setTotalRecords(data.totalRecords);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setPerPage(data.perPage);
      })
      .catch((err) => {
        console.log(err)
      })
  }

  useEffect(() => { 
    getDrivers(1);
    getDriversForExport();
  }, [])

  const searchDrivers = async (searchdata) => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/driver-search?search=${searchdata}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setData(data.data);
        setTotalRecords(data.totalRecords);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setPerPage(data.perPage);
      })
      .catch((err) => {
        console.log(err)
      })
  }
 

  const handleDelete = async (idToDelete) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/delete-driver/${idToDelete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setSuccessMessage('Driver deleted successfully!')
          getDrivers(1)
        } else {
          setErrorMessage(data.message)
        }
      })
      .catch(error => {
        console.error('Error:', error)
      })

  }

  const handleUpdateStatus = (id, newStatus) => {
    setData(data.map(notification =>
      notification.id === id ? { ...notification, status: newStatus } : notification
    ))
  }

  const handleSearchMethod=(searchdata)=>{
    searchDrivers(searchdata)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={6}>
        <Typography variant='h5'>
          Drivers
        </Typography>
      </Grid>

      <Grid
        item
        xs={12}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        {/* Search Field */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Search:</span>
          <TextField
            id="search-field"
            variant="outlined"
            size="small"
            placeholder="Search drivers"
            onChange={(e) => handleSearchMethod(e.target.value)}
            style={{ width: '300px' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
              variant="contained"
              onClick={() => downloadCSV(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/export-drivers`, 'drivers.csv')}
            >
            Export to Csv
          </Button>
          <Button
            variant="contained"
            onClick={() => router.push('/drivers/add')}
          >
            Add
          </Button>
        </div>
      </Grid>


      <Grid item xs={12}>
        <Card>
          <TableBasic
            items={data}
            onDelete={handleDelete}
            onUpdateStatus={handleUpdateStatus}
            totalRecords={totalRecords}
            totalPages={totalPages}
            currentPage={currentPage}
            perPage={perPage}
            onPageChange={getDrivers}
          />
        </Card>
      </Grid>

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

    </Grid>
  )
}

export default MUITable

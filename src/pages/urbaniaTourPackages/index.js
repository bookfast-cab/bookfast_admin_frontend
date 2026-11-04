import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { Button } from '@mui/material'
import TextField from '@mui/material/TextField'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import TableBasic from 'src/views/tables/TourPackageTable'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const UrbaniaTourPackagesPage = () => {
  const [data, setData] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [loadingExport, setLoadingExport] = useState(false)

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
    setLoadingExport(true)
    try {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/export-tourPackages?package_type=urbania`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`
        }
      })
        .then(response => response.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'urbaniaTourPackages.csv'
          document.body.appendChild(a)
          a.click()
          a.remove()
        })
        .catch(error => {
          console.error('Error exporting to Excel:', error)
        })
      setSuccessMessage('Export successful!')
    } catch (error) {
      setErrorMessage('Export failed. Please try again.')
    } finally {
      setLoadingExport(false)
    }
  }

  const getTourPackages = async (page_num, perPage = 10) => {
    const queryParams = new URLSearchParams({
      page: page_num,
      perPage,
      package_type: 'urbania'
    }).toString()
    console.log('Fetching data from:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/tour-packages?${queryParams}`)

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/tour-packages?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setData(data.data || [])
        setTotalRecords(data.totalRecords || 0)
        setTotalPages(data.totalPages || 0)
        setCurrentPage(data.currentPage || 1)
        setPerPage(data.perPage || perPage)
      })
      .catch(err => {
        console.log(err)
      })
  }

  useEffect(() => {
    getTourPackages(1)
  }, [])

  const searchTrips = async searchdata => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/package-search?search=${encodeURIComponent(
        searchdata
      )}&package_type=urbania`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`
        }
      }
    )
      .then(response => response.json())
      .then(data => {
        setData(data.data || [])
        setTotalRecords(data.totalRecords || (data.data ? data.data.length : 0))
        setTotalPages(data.totalPages || 1)
        setCurrentPage(data.currentPage || 1)
        setPerPage(data.perPage || 10)
      })
      .catch(err => {
        console.log(err)
      })
  }

  const handleDelete = async idToDelete => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/delete-package/${idToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`
        }
      })
      const resData = await response.json()
      if (resData.success) {
        setSuccessMessage('Urbania Tour Package deleted successfully!')
        getTourPackages(currentPage || 1)
      } else {
        setErrorMessage(resData.message)
      }
    } catch (error) {
      console.error('Error:', error)
      setErrorMessage('Failed to delete package')
    }
  }

  const handleUpdateStatus = (id, newStatus) => {
    setData(data.map(notification => (notification.id === id ? { ...notification, status: newStatus } : notification)))
  }

  const handleSearchMethod = searchdata => {
    if (!searchdata) {
      getTourPackages(1)
    } else {
      searchTrips(searchdata)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={6}>
        <Typography variant='h5'>Urbania Tour Packages</Typography>
      </Grid>

      <Grid
        item
        xs={12}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}
      >
        {/* Search Field */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Search:</span>
          <TextField
            id='search-field'
            variant='outlined'
            size='small'
            placeholder='Search Urbania Packages'
            onChange={e => handleSearchMethod(e.target.value)}
            style={{ width: '300px' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant='contained' onClick={() => router.push('/urbaniaTourPackages/add')}>
            Add Urbania Package
          </Button>
          <Button variant='outlined' onClick={() => exportToExcel()}>
            {loadingExport ? 'Processing...' : 'Export'}
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
            onPageChange={getTourPackages}
          />
        </Card>
      </Grid>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert elevation={6} variant='filled' onClose={handleCloseSnackbar} severity='error'>
          {errorMessage}
        </MuiAlert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert elevation={6} variant='filled' onClose={handleCloseSnackbar} severity='success'>
          {successMessage}
        </MuiAlert>
      </Snackbar>
    </Grid>
  )
}

export default UrbaniaTourPackagesPage


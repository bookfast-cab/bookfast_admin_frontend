import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SvgIcon,
  Snackbar,
  TextField
} from '@mui/material'
import MuiAlert from '@mui/material/Alert'
import PlusIcon from '@heroicons/react/24/solid/PlusIcon'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import CommonDataTable from 'src/components/CommonDataTable'

const KeywordsPage = () => {
  const [keywords, setKeywords] = useState([])
  const [filterType, setFilterType] = useState('all')
  const [newKeyword, setNewKeyword] = useState('')
  const [newType, setNewType] = useState('pos')
  const [editId, setEditId] = useState(null)
  const [editText, setEditText] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const router = useRouter()

  let token
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token')
  }

  const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin`

  const handleCloseSnackbar = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  // Fetch keywords
  const fetchKeywords = async () => {
    try {
      const res = await fetch(`${BASE_URL}/whatsappKeyword`, {
        headers: { Authorization: token }
      })
      const data = await res.json()
      setKeywords(data)
      setTotalRecords(data.length)
      setTotalPages(1)
    } catch (err) {
      console.error(err)
      setErrorMessage('Failed to fetch keywords.')
    }
  }

  useEffect(() => {
    fetchKeywords()
  }, [])

  // Add / Update keyword
  const handleAddOrUpdate = async () => {
    if (!(newKeyword.trim() || editText.trim())) {
      setErrorMessage('Keyword cannot be empty')

      return
    }

    try {
      if (editId) {
        // Update (delete and re-add, since your backend doesn’t support PUT)
        await fetch(`${BASE_URL}/whatsappKeyword/${editId}`, {
          method: 'DELETE',
          headers: { Authorization: token }
        })
        await fetch(`${BASE_URL}/whatsappKeyword`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token
          },
          body: JSON.stringify({ keyword: editText, type: newType })
        })
        setEditId(null)
        setEditText('')
        setSuccessMessage('Keyword updated successfully!')
      } else {
        const res = await fetch(`${BASE_URL}/whatsappKeyword`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token
          },
          body: JSON.stringify({ keyword: newKeyword, type: newType })
        })
        if(!res.ok) {
          const data = await res.json()
          setErrorMessage(data.message)
          
          return
        }
        setNewKeyword('')
        setSuccessMessage('Keyword added successfully!')
      }
      fetchKeywords()
    } catch (err) {
      console.error(err)
      setErrorMessage('Failed to save keyword.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this keyword?')) return

    try {
      const res = await fetch(`${BASE_URL}/whatsappKeyword/${id}`, {
        method: 'DELETE',
        headers: { Authorization: token }
      })
      const data = await res.json()
      if (res.ok) {
        setSuccessMessage('Keyword deleted successfully!')
        fetchKeywords()
      } else {
        setErrorMessage(data.message)
      }
    } catch (err) {
      console.error(err)
      setErrorMessage('Failed to delete keyword.')
    }
  }

  const filteredKeywords =
    filterType === 'all'
      ? keywords
      : keywords.filter((k) => k.type === filterType)

  // Columns for DataTable
  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'keyword', headerName: 'Keyword', width: 300 },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <span
          style={{
            color: params.row.type === 'pos' ? 'green' : 'red',
            fontWeight: 600
          }}
        >
          {params.row.type === 'pos' ? 'Positive' : 'Negative'}
        </span>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton
            color='primary'
            onClick={() => {
              setEditId(params.row.id)
              setEditText(params.row.keyword)
              setNewType(params.row.type)
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color='error'
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      )
    }
  ]

  return (
    <Grid container spacing={4} sx={{ bgcolor: 'white', padding: 3 }}>
      {/* Header */}
      <Grid item xs={6}>
        <Typography variant='h5'>Whatsapp Keywords</Typography>
      </Grid>

      {/* Filter + Add Section */}
      <Grid
        item
        xs={12}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <FormControl size='small' sx={{ minWidth: 200 }}>
          <InputLabel>Filter Type</InputLabel>
          <Select
            value={filterType}
            label='Filter Type'
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value='all'>All</MenuItem>
            <MenuItem value='pos'>Positive</MenuItem>
            <MenuItem value='neg'>Negative</MenuItem>
          </Select>
        </FormControl>

        <div style={{ display: 'flex', gap: '10px' }}>
          <TextField
            size='small'
            placeholder={
              editId ? 'Edit keyword...' : 'Enter new keyword...'
            }
            value={editId ? editText : newKeyword}
            onChange={(e) =>
              editId
                ? setEditText(e.target.value)
                : setNewKeyword(e.target.value)
            }
          />
          <FormControl size='small'>
            <Select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
            >
              <MenuItem value='pos'>Positive</MenuItem>
              <MenuItem value='neg'>Negative</MenuItem>
            </Select>
          </FormControl>

          <Button
            startIcon={
              <SvgIcon fontSize='small'>
                <PlusIcon />
              </SvgIcon>
            }
            variant='contained'
            onClick={handleAddOrUpdate}
          >
            {editId ? 'Update' : 'Add'}
          </Button>
          {editId && (
            <Button
              variant='outlined'
              color='secondary'
              onClick={() => {
                setEditId(null)
                setEditText('')
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </Grid>

      {/* Table */}
      <Grid item xs={12}>
        <Card>
          <CommonDataTable
            columns={columns}
            items={filteredKeywords}
            totalRecords={totalRecords}
            totalPages={totalPages}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={() => {}}
          />
        </Card>
      </Grid>

      {/* Snackbar Messages */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant='filled'
          onClose={handleCloseSnackbar}
          severity='error'
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
          variant='filled'
          onClose={handleCloseSnackbar}
          severity='success'
        >
          {successMessage}
        </MuiAlert>
      </Snackbar>
    </Grid>
  )
}

export default KeywordsPage

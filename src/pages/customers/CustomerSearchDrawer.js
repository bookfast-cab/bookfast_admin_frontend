// ** MUI Imports
import {
  Drawer,
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import { useState, useEffect } from 'react'

const CustomerSearchDrawer = ({ open, onClose, onSelectCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [token, setToken] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('access_token') || '')
    }
  }, [])

  const handleSearch = async searchText => {
    setSearchTerm(searchText)
    if (searchText.trim().length === 0) {
      setSearchResults([])
      
      return
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customer-search?search=${searchText}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
        }
      )

      const data = await response.json()
      if (data?.data) {
        setSearchResults(data.data)
      }
    } catch (error) {
      console.error('Search Error:', error)
    }
  }

  const handleSelectCustomer = customer => {
    if (onSelectCustomer) {
      onSelectCustomer(customer)
    }
    onClose()
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <Box sx={{ width: 400, padding: 4 }}>
        <Typography variant='h6' gutterBottom>
          Search Customer
        </Typography>

        <TextField
          fullWidth
          variant='outlined'
          placeholder='Search by name, phone...'
          value={searchTerm}
          onChange={e => handleSearch(e.target.value)}
        />

        <List sx={{ marginTop: 2 }}>
          {searchResults.map(customer => (
            <Box key={customer.id}>
              <ListItem button onClick={() => handleSelectCustomer(customer)}>
                <ListItemText
                  primary={customer.first_name}
                  secondary={customer.phone_number || customer.email}
                />
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}

export default CustomerSearchDrawer

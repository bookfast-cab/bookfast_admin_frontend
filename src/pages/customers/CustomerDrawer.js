// components/CustomerDrawer.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Avatar,
  Divider,
  Stack,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Tabs,
  Tab,
  Card,
  CardContent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getTrips } from 'src/apis/tripApis';
import { formatDate } from 'src/utils/utils';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { keyframes } from '@emotion/react';

const InfoRow = ({ label, value }) => (
  <Grid container spacing={1} sx={{ mb: 1 }}>
    <Grid item xs={5}>
      <Typography variant="body2" fontWeight="bold">{label}</Typography>
    </Grid>
    <Grid item xs={7}>
      <Typography variant="body2">{value ?? '—'}</Typography>
    </Grid>
  </Grid>
);

const CustomerDrawer = ({ open, onClose, data = {}, vehicleList = [] }) => {

  const customer = data || {};

  const fullName = `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim();
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const [bgColor, setBgColor] = useState('#ccc');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [tripData, setTripData] = useState([]);
  const [tripPage, setTripPage] = useState(0);
  useEffect(() => {
    if (open) {
      fetchTrips()
    }
  }, [open]);

  const fetchTrips = async () => {
   
    const result = await getTrips({ page: tripPage, perPage: 20, type: '', token ,customer_id:customer.id });
  
    if (result.success) {
      setTripData(result.data);
      
      // setTotalRecords(result.totalItems);
      // setTotalPages(result.totalPages);
      // setCurrentPage(result.currentPage);
      // setPerPage(result.perPage);

    } else {
      console.error(result.error);
    }
  };
  


  const handleCancelClick = () => setCancelDialogOpen(true);

  const handleDelete = async (idToDelete) => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/
    -trip/${idToDelete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setSuccessMessage('Trip deleted successfully!')
        } else {
          setErrorMessage(data.message)
        }
      })
      .catch(error => {
        console.error('Error:', error)
      })

  }



  const handleClose = () => {
    setReason('');
    setCancelDialogOpen(false);
  };

  const initials = fullName
    ? fullName.split(' ').map(word => word[0]).join('')
    : customer.phone_number?.slice(-4) ?? 'CU';

  const tripTypeMap = {
    1: "Local",
    2: "Rental",
    3: "Outstation",
  };

  const tripSubTypeMap = {
    1: "Oneway Trip",
    2: "Two Way Trip",
  };

  const getRandomColor = () => {
    const colors = [
      '#FFCDD2', '#F8BBD0', '#E1BEE7', '#D1C4E9',
      '#C5CAE9', '#BBDEFB', '#B3E5FC', '#B2EBF2',
      '#B2DFDB', '#C8E6C9', '#DCEDC8', '#F0F4C3',
      '#FFECB3', '#FFE0B2', '#FFCCBC'
    ];

    return colors[Math.floor(Math.random() * colors.length)];
  };



  useEffect(() => {
    if (open) {
      setBgColor(getRandomColor());
    }
  }, [open]);


  const handleSubmit = () => {

    // Submit reason to API here if needed

    handleClose();
  };

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_, newValue) => {
    setTabIndex(newValue);
  };

  const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

  const TripCard = ({ trip }) => {
    return (
      <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary">
            Trip ID: {trip.trip_id}
          </Typography>
  
          <Typography variant="body1" fontWeight="bold" mt={1}>
            Pickup:
          </Typography>
          <Typography variant="body2">{trip.pickup_address}</Typography>
  
          <Typography variant="body1" fontWeight="bold" mt={1}>
            Drop:
          </Typography>
          <Typography variant="body2">{trip.drop_address}</Typography>
  
          <Typography variant="body2" mt={1}>
            Date: {formatDate(trip.pickup_date)}
          </Typography>
  
          <Typography variant="body2">
            Distance: {trip.distance} km
          </Typography>
  
          <Typography variant="body2" fontWeight="bold" mt={1}>
            Total: ₹{trip.total}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  const renderTabContent = () => {
    switch (tabIndex) {
      case 0:
        return (
          <Box mt={2}>
            <Typography variant="subtitle1" gutterBottom>Personal Info</Typography>
            <Box>
              <InfoRow label="Phone" value={data.phone_with_code} />
              <InfoRow label="Email" value={data.email || 'N/A'} />
              <InfoRow label="Gender" value={data.gender || 'N/A'} />
              <InfoRow label="City" value={data.city || 'N/A'} />
              <InfoRow label="Referral Code" value={data.referral_code} />
              <InfoRow label="Status" value={data.status === 1 ? 'Active' : 'Inactive'} />
              <InfoRow label="Created At" value={new Date(data.created_at).toLocaleString()} />
            </Box>
          </Box>

        );
      case 1:
        return (
          <>
          </>
         
        );
      case 2:
        return (
          <>
          {tripData.length > 0 ? (
            tripData.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="200px"
              textAlign="center"
              color="text.secondary"
            >
              <InfoOutlinedIcon
                sx={{ fontSize: 50, animation: `${spin} 4s linear infinite`, mb: 1 }}
              />
              <Typography>This customer has not booked any trip.</Typography>
            </Box>
          )}
        </>
        );
      case 3:
        return (
          <Box mt={2}>
            <Typography variant="subtitle1">Customer Subscription History</Typography>
            {/* Replace with actual subscription table */}
            <Typography>Subscription history goes here...</Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 600 } }}>
      <Box sx={{ p: 3, position: 'relative', height: '100%', overflowY: 'auto' }}>
        {/* Close Button */}
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16 }}>
          <CloseIcon />
        </IconButton>

        {data ? (
          <>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Avatar
                src={data.profile_picture}
                sx={{ width: 56, height: 56 }}
              >
                {initials}
              </Avatar>
              <Box>
                <Typography variant="h6">{fullName || 'Customer'}</Typography>
                <Typography variant="body2">{data.phone_with_code}</Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 0 }} />

            {/* Tabs */}
            <Tabs value={tabIndex} onChange={handleTabChange} variant="scrollable" sx={{ px: 0, mx: -3 }}>
              <Tab label="Personal Info" />
              <Tab label="Wallet History" />
              <Tab label="Trips" />
              <Tab label="Subscription History" />
            </Tabs>

            {/* Tab Content */}
            <Box sx={{ mt: 0, px: 0, mx: 5 }}>
              {renderTabContent()}
            </Box>
          </>
        ) : (
          <Box mt={10} textAlign="center">
            <Typography variant="h6">Loading customer details...</Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default CustomerDrawer;

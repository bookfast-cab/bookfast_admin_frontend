// components/DutyDrawer.js
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
  Paper,
  Chip,
  Card
} from '@mui/material';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import ToastMessage from 'src/components/ToastMessage';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import PaymentIcon from '@mui/icons-material/Payment';

// BookFast brand colors - soft and professional
const BRAND_COLORS = {
  primary: '#2563eb',      // BookFast blue
  primaryLight: '#dbeafe', // Light blue background
  secondary: '#64748b',    // Soft gray
  success: '#10b981',      // Soft green
  warning: '#f59e0b',      // Soft orange
  error: '#ef4444',        // Soft red
  info: '#06b6d4',         // Soft cyan
  background: '#f8fafc',   // Very light gray
  paper: '#ffffff',        // White
  textPrimary: '#1e293b',  // Dark gray
  textSecondary: '#64748b', // Medium gray
  border: '#e2e8f0',       // Light border
  accent: '#8b5cf6',       // Soft purple
};

const getAdvanceBookingStatusLabel = (status) => {
  switch (status) {
    case '1': return { label: 'No driver accepted yet', color: BRAND_COLORS.warning };
    case '2': return { label: 'Booked', color: BRAND_COLORS.success };
    case '3': return { label: 'Cancelled', color: BRAND_COLORS.error };
    default: return { label: 'Unknown', color: BRAND_COLORS.secondary };
  }
};

const InfoRow = ({ label, value, highlight = false }) => (
  <Grid container spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
    <Grid item xs={5}>
      <Typography
        variant="body2"
        fontWeight={600}
        color={BRAND_COLORS.textSecondary}
        sx={{ whiteSpace: 'nowrap' }}
      >
        {label}:
      </Typography>
    </Grid>
    <Grid item xs={7}>
      <Typography
        variant="body2"
        color={highlight ? BRAND_COLORS.primary : BRAND_COLORS.textPrimary}
        fontWeight={highlight ? 600 : 400}
        sx={{ wordBreak: 'break-word' }}
      >
        {value ?? '—'}
      </Typography>
    </Grid>
  </Grid>
);

const DutyDrawer = ({ open, onClose, data = {} }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  const [bgColor, setBgColor] = useState(BRAND_COLORS.primaryLight);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [singleDriver, setSingleDriver] = useState({});
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');
  
  const { label: statusLabel, color: statusColor } = getAdvanceBookingStatusLabel(data?.status);

  const searchSingleDriver = async (searchPhone) => {
    const queryParams = new URLSearchParams({
      phone: searchPhone
    }).toString();

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/searchSingleDriver?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const { driver, membership, lastTrip } = data.data;
          setSingleDriver({ driver, membership, lastTrip });
          setErrorMessage('');
        } else {
          setSingleDriver({});
          setErrorMessage('Driver not found');
        }
      }).catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (searchText.length > 8) {
      searchSingleDriver(searchText);
    }
  }, [searchText]);



  const handleClose = () => {
    setReason('');
    setCancelDialogOpen(false);
  };

  // Generate initials from contact mobile for avatar
  const initials = data?.contact_mobile?.slice(-4) ?? 'AB';

  const getAvatarColors = () => {
    const avatarColors = [
      { bg: '#dbeafe', color: '#1e40af' }, // Blue
      { bg: '#dcfce7', color: '#16a34a' }, // Green
      { bg: '#fef3c7', color: '#d97706' }, // Orange
      { bg: '#ede9fe', color: '#7c3aed' }, // Purple
      { bg: '#fce7f3', color: '#be185d' }, // Pink
      { bg: '#e0f2fe', color: '#0369a1' }, // Cyan
    ];
    
    return avatarColors[Math.floor(Math.random() * avatarColors.length)];
  };

  useEffect(() => {
    if (open) {
      setBgColor(getAvatarColors());
    }
  }, [open]);

  const handleSubmit = () => {
    // Handle cancellation API call here
    handleClose();
  };

  const handleAssignClick = () => {
    setShowAssignPanel(true);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString();
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{ 
          sx: { 
            width: 750,
            backgroundColor: BRAND_COLORS.background,
          } 
        }}
      >
        <Box sx={{ p: 3, position: 'relative', height: '100%', overflowY: 'auto' }}>
          {/* Close Button */}
          <IconButton
            onClick={onClose}
            sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16,
              backgroundColor: BRAND_COLORS.paper,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: BRAND_COLORS.primaryLight,
              }
            }}
          >
            <CloseIcon />
          </IconButton>

          {data ? (
            <>
              {/* Customer Header */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  backgroundColor: BRAND_COLORS.paper,
                  border: `1px solid ${BRAND_COLORS.border}`,
                  borderRadius: 2
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  
                  <Box>
                    <Typography 
                      variant="h6" 
                      fontWeight={600}
                      color={BRAND_COLORS.textPrimary}
                    >
                      Driver Duty Booking
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={BRAND_COLORS.textSecondary}
                    >
                      {data.contact_mobile}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>


              {/* Booking Details Header */}
              <Paper 
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  backgroundColor: BRAND_COLORS.paper,
                  border: `1px solid ${BRAND_COLORS.border}`,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600} color={BRAND_COLORS.textPrimary} mb={2}>
                  Booking Details
                </Typography>
                
                {/* Date Information */}
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarMonthIcon sx={{ color: BRAND_COLORS.primary, fontSize: 20 }} />
                      <Typography variant="body2" fontWeight={600} color={BRAND_COLORS.textSecondary}>
                        Created:
                      </Typography>
                      <Typography variant="body2" color={BRAND_COLORS.textPrimary}>
                        {formatDateTime(data.createdAt)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarMonthIcon sx={{ color: BRAND_COLORS.warning, fontSize: 20 }} />
                      <Typography variant="body2" fontWeight={600} color={BRAND_COLORS.textSecondary}>
                        Pickup:
                      </Typography>
                      <Typography variant="body2" color={BRAND_COLORS.textPrimary}>
                        {formatDateTime(data.pickup_date)}
                      </Typography>
                    </Box>
                  </Grid>
                  {data.ride_accepted_time && (
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AccessTimeIcon sx={{ color: BRAND_COLORS.success, fontSize: 20 }} />
                        <Typography variant="body2" fontWeight={600} color={BRAND_COLORS.textSecondary}>
                          Accepted:
                        </Typography>
                        <Typography variant="body2" color={BRAND_COLORS.textPrimary}>
                          {formatDateTime(data.ride_accepted_time)}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>

              {/* Booking Information */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  backgroundColor: BRAND_COLORS.paper,
                  border: `1px solid ${BRAND_COLORS.border}`,
                  borderRadius: 2,
                }}
              >
                <Grid container spacing={2}>
                  {/* Booking ID and Status */}
                  <Grid item xs={12}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        p: 2,
                        backgroundColor: BRAND_COLORS.background,
                        borderRadius: 1,
                        border: `1px solid ${BRAND_COLORS.border}`,
                      }}
                    >
                      <Typography variant="body1" fontWeight={600} color={BRAND_COLORS.textPrimary}>
                        Booking ID: {data.notiId}
                      </Typography>
                      <Chip
                        label={statusLabel}
                        sx={{
                          backgroundColor: statusColor,
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Stack>
                  </Grid>

                  {data.title && (
                    <Grid item xs={12}>
                      <InfoRow label="Title" value={data.title} highlight={true} />
                    </Grid>
                  )}
                  {data.description && (
                    <Grid item xs={12}>
                      <InfoRow label="Description" value={data.description} />
                    </Grid>
                  )}

                  {/* Address Information */}
                  <Grid item xs={12}>
                    <InfoRow label="Pickup Address" value={data.pick_address} />
                    <InfoRow label="Drop Address" value={data.drop_address} />
                  </Grid>

                  {/* Trip Details Grid */}
                  <Grid item xs={6}>
                    <InfoRow label="Distance" value={data.distance} />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow label="Estimated Time" value={data.duration} />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow 
                      label="Vehicle Type" 
                      value={data?.vehicleDetail?.vehicle_type}
                      highlight={true}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow label="Pickup Date" value={formatTime(data.pickup_date)} />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow label="Contact Mobile" value={data.mobile} />
                  </Grid>
                    
                </Grid>
              </Paper>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                backgroundColor: BRAND_COLORS.paper,
                border: `1px solid ${BRAND_COLORS.border}`,
                borderRadius: 2,
              }}
            >
              <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 'bold', color: 'primary.main' }}
                  >
                    Created by driver
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <InfoRow label="Driver ID" value={data?.driver?.id} />
                    </Grid>
                    <Grid item xs={6}>
                      <InfoRow label="Driver Name" value={data?.driver?.driverName} />
                    </Grid>
                    <Grid item xs={6}>
                      <InfoRow label="Phone Number" value={data?.driver?.phone_number} />
                    </Grid>
                    <Grid item xs={6}>
                      <InfoRow label="Vehicle RC No" value={data?.driver?.vehicleRcNo} />
                    </Grid>
                  </Grid>
              </Grid>
            </Paper>

              {/* Pricing Information */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  backgroundColor: BRAND_COLORS.paper,
                  border: `1px solid ${BRAND_COLORS.border}`,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600} color={BRAND_COLORS.textPrimary} mb={2}>
                  Pricing Details
                </Typography>

                <Box>
                  <InfoRow label="Total Amount" value={`₹${data?.total_price || 0}`} />
                  <InfoRow label="Driver Earning" value={`₹${data?.driver_earning || 0}`} />
                  <InfoRow label="Commission" value={`₹${data?.commission || 0}`} />
                  <InfoRow label="Platform Fee" value={`₹${data?.platform_fee || 0}`} />

                  <Box 
                    sx={{ 
                      p: 2, 
                      backgroundColor: BRAND_COLORS.primaryLight,
                      borderRadius: 1,
                      textAlign: 'center',
                      mt: 2
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      fontWeight={700} 
                      color={BRAND_COLORS.primary}
                    >
                      Total Amount: ₹{data.total_price || 0}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Driver Information */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: BRAND_COLORS.paper,
                  border: `1px solid ${BRAND_COLORS.border}`,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600} color={BRAND_COLORS.textPrimary} mb={2}>
                  Booked by driver 
                </Typography>

                {data.driverDetailAccept ? (
                  <Box>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar 
                        sx={{ 
                          width: 48, 
                          height: 48,
                          bgcolor: BRAND_COLORS.primary,
                          color: 'white'
                        }}
                      >
                        {data.driverDetailAccept.driverName?.charAt(0) || 'D'}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={600} color={BRAND_COLORS.textPrimary}>
                          {data.driverDetailAccept.driverName}
                        </Typography>
                        <Typography variant="body2" color={BRAND_COLORS.textSecondary}>
                          {data.driverDetailAccept.phone_number}
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <InfoRow label="Driver ID" value={data?.driver_accept_id} />
                      </Grid>
                      <Grid item xs={6}>
                        <InfoRow label="Vehicle Name" value={data?.acpt_vehicle_name} />
                      </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <InfoRow label="Vehicle Type" value={data?.acpt_vehicle_type} />
                      </Grid>
                      <Grid item xs={6}>
                        <InfoRow label="RC Number" value={data?.acpt_vehicle_rc} />
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Typography variant="body2" color={BRAND_COLORS.textSecondary} textAlign="center" py={2}>
                    No driver assigned yet
                  </Typography>
                )}
              </Paper>

              {/* Cancel Dialog */}
              <Dialog
                open={cancelDialogOpen}
                onClose={handleClose}
                PaperProps={{
                  sx: { 
                    width: '400px',
                    borderRadius: 2,
                  }
                }}
              >
                <DialogTitle sx={{ color: BRAND_COLORS.textPrimary }}>
                  Cancel Advance Booking
                </DialogTitle>
                <DialogContent>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Enter cancellation reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    autoFocus
                    sx={{ mt: 1 }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="inherit">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    disabled={!reason.trim()}
                    sx={{
                      backgroundColor: BRAND_COLORS.error,
                      '&:hover': {
                        backgroundColor: '#dc2626',
                      },
                    }}
                  >
                    Submit
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          ) : (
            <Box mt={10} textAlign="center">
              <Typography variant="h6" color={BRAND_COLORS.textSecondary}>
                Loading booking details...
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>
      
      <ToastMessage
        open={toastOpen}
        message={toastMessage}
        severity={toastSeverity}
        onClose={() => setToastOpen(false)}
      />
    </>
  );
};

export default DutyDrawer;
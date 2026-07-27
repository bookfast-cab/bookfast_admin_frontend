// components/DriverDrawer.js
import React, { useEffect, useState } from 'react';
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
  DialogActions,
  Paper,
  Chip,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  TextField
} from '@mui/material';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import HighlightOff from '@mui/icons-material/HighlightOff';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import VerifiedIcon from '@mui/icons-material/Verified';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import ToastMessage from 'src/components/ToastMessage';
import AddMembershipDialog from '../drivers-membership/AddMembershipDialog';
import { Person, Smartphone } from '@mui/icons-material';

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

const InfoRow = ({ label, value, icon = null, highlight = false }) => (
  <Grid container spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
    <Grid item xs={5}>
      <Box display="flex" alignItems="center" gap={1}>
        {icon}
        <Typography
          variant="body2"
          fontWeight={600}
          color={BRAND_COLORS.textSecondary}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {label}:
        </Typography>
      </Box>
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

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`driver-tabpanel-${index}`}
    aria-labelledby={`driver-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const DriverDrawer = ({onDriverUpdate, open, onClose, data = {} }) => {
  const [tabValue, setTabValue] = useState(0);
  const [membershipDialogOpen, setMembershipDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');
  const [blockBy, setBlockBy] = useState('');
  const [blockRemarks, setBlockRemarks] = useState('');
  const [isEnableMode, setIsEnableMode] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const [vehicleData,setVehicleData] = useState([]);
  const [advanceTripData,setadvanceTripData] = useState({});
  const [DriversSelfPostData,setDriversSelfPostdata] = useState({});
  const [RealtimeBookingData,setRealtimeBookingData] = useState({});
  const [myPartnerDutyData,setMyPartnerDutyData] = useState({});
  const [walletHistory,setwalletHistory] = useState([]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

useEffect(()=>{
  setVehicleData(data?.driverVehicle ?? []);
  if(data?.id){
    if (data?.id) {
      if (tabValue === 5) {
        fetchDriverData('getDriverAdvanceTripLists', setadvanceTripData);
      } else if (tabValue === 6) {
        fetchDriverData('getDriverPartnerDutyLists', setDriversSelfPostdata);
      } else if (tabValue === 7) {
        fetchDriverData('getDriverRealTimeBookingsLists', setRealtimeBookingData);
      } else if (tabValue === 3) {
        fetchDriverData('getWalletHistoryByDriver', setwalletHistory);
      }
    }
  }
},[data])

const [actionDialog, setActionDialog] = useState({ open: false, vehicleId: null, status: '' });
const [rejectionReason, setRejectionReason] = useState('');

const handleVehicleAction = (vehicleId, status) => {
  if (status === 'rejected') {
    setActionDialog({ open: true, vehicleId, status });
  } else {
    // Approve ke liye direct API call
    submitVehicleAction(vehicleId, 'approved', '');
  }
};

const fetchDriverData = async (endpoint, setterFunction, page_num = 1, perPage_val = 10) => {
  const queryParams = new URLSearchParams({
    page: page_num,
    perPage: perPage_val,
    driverId: data.id
  }).toString();

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/${endpoint}?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
        },
      }
    );

    const result = await response.json();
    setterFunction(result); 
  } catch (err) {
    console.error("Error fetching data:", err);
  }
};


const submitVehicleAction = async (id, status, reason) => {
  try {
    if(status == 'rejected' && reason ==''){
      setToastMessage("Please provide rejection reason");
      setToastSeverity("error");
      setToastOpen(true);
      
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/changeStatusDriverVehicle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      },
      body: JSON.stringify({ id,status, rejection_reason: reason })
    });
    
    const result = await response.json();
    if (result.success) {
      setToastMessage(`Vehicle ${status} successfully`);
      setToastSeverity("success");
      setToastOpen(true);
      setActionDialog({ open: false, vehicleId: null, status: '' });
      setRejectionReason('');

      const updatedVehicles = vehicleData?.map(vehicle => {
        if (vehicle.id === id) {
          return { 
            ...vehicle, 
            status: status,
            rejection_reason: reason 
          };
        }
        
        return vehicle;
      });

      onDriverUpdate({
        ...data,
        driverVehicle: updatedVehicles
      });
      setVehicleData(updatedVehicles);
    }
  } catch (err) {
    setToastMessage("Error updating status");
    setToastSeverity("error");
    setToastOpen(true);
  }
};

  const handleDisableDriver = () => {
    if(data?.isBlocked == 1){
      setIsEnableMode(true);
    }else{
      setIsEnableMode(false);
    }
    setDisableDialogOpen(true);
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);

  // To open dialog:
  const handleAddMembership = (driverId) => {
    setSelectedDriverId(driverId);
    setDialogOpen(true);
  };

  const confirmDisableDriver = () => {
    if (!isEnableMode && (!blockBy || !blockRemarks)) {
      setToastMessage("Please fill in all fields!");
      setToastSeverity("error");
      setToastOpen(true);

      return;
    }
    
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/disableDriver`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      },
      body: JSON.stringify({
        driverId: data.id,
        isBlocked: data?.isBlocked == 1 ? 0 : 1,        
        block_by: isEnableMode ? "" : blockBy,      
        block_remark: isEnableMode ? "" : blockRemarks
      }),
    })
      .then((response) => response.json())
      .then((result) => {
       if (result.success) {
          if(data?.isBlocked == 0){ 
            setToastMessage("Driver disabled successfully!");
          }else{
            setToastMessage("Driver enabled successfully!");
          }
          
          if(result?.data) {
            onDriverUpdate({...result?.data,id:data?.id})
          }

          setToastSeverity("success");
          setToastOpen(true);
          setBlockBy(''); // Clear fields
          setBlockRemarks('');
          onClose(true); // Close drawer and refresh
        } else {
          setToastMessage(result.message || "Failed to disable driver!");
          setToastSeverity("error");
          setToastOpen(true);
        }
      })
      .catch((err) => {
        console.error(err);
        setToastMessage("Something went wrong!");
        setToastSeverity("error");
        setToastOpen(true);
      });

    setDisableDialogOpen(false);
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(word => word[0]).join('').toUpperCase() : 'DR';
  };

  const getProfileStatus = (profileApproved) => {
    switch (profileApproved) {
      case 1:
        return { label: 'Approved', color: BRAND_COLORS.success, icon: <VerifiedIcon sx={{ fontSize: 16 }} /> };
      case 0:
        return { label: 'Pending', color: BRAND_COLORS.warning, icon: <PendingIcon sx={{ fontSize: 16 }} /> };
      default:
        return { label: 'Rejected', color: BRAND_COLORS.error, icon: <CancelIcon sx={{ fontSize: 16 }} /> };
    }
  };

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

  const avatarColor = getAvatarColors();
  const profileStatus = getProfileStatus(data?.profileApproved);

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: 950,
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
              {/* Driver Header */}
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
                  <Avatar
                    src={data.driverProfile || ''}
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: avatarColor.bg,
                      color: avatarColor.color,
                      fontWeight: 700,
                      fontSize: '1.2rem'
                    }}
                  >
                    {getInitials(data.driverName)}
                  </Avatar>
                  <Box flex={1}>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color={BRAND_COLORS.textPrimary}
                    >
                      {data.driverName || 'Driver'}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={BRAND_COLORS.textSecondary}
                    >
                      {data.phone_number} • ID: {data.id}
                    </Typography>
                  </Box>
                  <Chip
                    label={profileStatus.label}
                    icon={profileStatus.icon}
                    sx={{
                      backgroundColor: profileStatus.color,
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </Stack>
              </Paper>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mb: 3 }}>
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<PersonAddIcon />}
                  onClick={() => handleAddMembership(data.id)}
                  sx={{
                    backgroundColor: BRAND_COLORS.primary,
                    '&:hover': {
                      backgroundColor: '#1d4ed8',
                    },
                    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                  }}
                >
                  Add Membership
                </Button>

                <Button
                  variant="outlined"
                  size="medium"
                  startIcon={data?.isBlocked == 1 ? <PersonAddIcon /> : <PersonOffIcon />}
                  onClick={handleDisableDriver}
                  sx={{
                    borderColor: BRAND_COLORS.error,
                    color: BRAND_COLORS.error,
                    '&:hover': {
                      borderColor: '#dc2626',
                      backgroundColor: '#fef2f2',
                    },
                  }}
                >
                 {data?.isBlocked == 1 ? "Enable Driver" : "Disable Driver"}
                </Button>
              </Box>

              {/* Tabs */}
              {data.isBlocked == 1 && (
                <Box sx={{ mb: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      backgroundColor: '#fef2f2', // Soft red background
                      border: `1px solid #fee2e2`,
                      borderRadius: 2,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Side decoration line */}
                    <Box sx={{ 
                      position: 'absolute', left: 0, top: 0, bottom: 0, 
                      width: 4, backgroundColor: BRAND_COLORS.error 
                    }} />

                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box 
                        sx={{ 
                          backgroundColor: '#fee2e2', 
                          p: 1, borderRadius: 1.5, 
                          display: 'flex', alignItems: 'center' 
                        }}
                      >
                        <PersonOffIcon sx={{ color: BRAND_COLORS.error }} />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700} color={BRAND_COLORS.error} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          Driver Disabled
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="textSecondary" display="block">
                              Blocked By :-
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color={BRAND_COLORS.textPrimary}>
                              {data.block_by || 'System Admin'}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="textSecondary" display="block">
                              Date & Time :-
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color={BRAND_COLORS.textPrimary}>
                              {data.block_date ? new Date(data.block_date).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'N/A'}
                            </Typography>
                          </Grid>

                          <Grid item xs={12}>
                            <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                            <Typography variant="caption" color="textSecondary" display="block">
                              Remarks :-
                            </Typography>
                            <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 0.5 }} color={BRAND_COLORS.textPrimary}>
                              "{data.block_remark || 'No remarks provided'}"
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Stack>
                  </Paper>
                </Box>
              )}
              <Paper
                elevation={0}
                sx={{
                  backgroundColor: BRAND_COLORS.paper,
                  border: `1px solid ${BRAND_COLORS.border}`,
                  borderRadius: 2,
                }}
              >
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="scrollable"          
                  scrollButtons="auto"          
                  allowScrollButtonsMobile
                  sx={{
                    px: 2,
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      minHeight: 48,
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: BRAND_COLORS.primary,
                    },
                   alignItems: 'center',
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: 48,
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: BRAND_COLORS.primary,
                    height: 3,
                    borderTopLeftRadius: 3,
                    borderTopRightRadius: 3,
                  },
                  
                  '& .MuiTabScrollButton-root': {
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: BRAND_COLORS.paper,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    color: BRAND_COLORS.textSecondary,
                    margin: '0 4px', 
                    transition: 'all 0.2s ease-in-out',
                    zIndex: 1,
                    '&:hover': {
                      backgroundColor: BRAND_COLORS.primaryLight,
                      color: BRAND_COLORS.primary,
                      transform: 'scale(1.05)',
                    },
                    '&.Mui-disabled': {
                      opacity: 0.3,
                      boxShadow: 'none',
                    }
                  }
                    
                  }}
                >
                  <Tab
                    label="Driver Details"
                    icon={<PersonIcon />}
                    iconPosition="start"
                    sx={{ color: BRAND_COLORS.textSecondary }}
                  />
                  <Tab
                    label="Documents"
                    icon={<DocumentScannerIcon />}
                    iconPosition="start"
                    sx={{ color: BRAND_COLORS.textSecondary }}
                  />
                  <Tab
                    label="Membership Plans"
                    icon={<CardMembershipIcon />}
                    iconPosition="start"
                    sx={{ color: BRAND_COLORS.textSecondary }}
                  />
                  <Tab
                    label="Wallet"
                    icon={<AccountBalanceWalletIcon />}
                    iconPosition="start"
                    onClick={() => fetchDriverData('getWalletHistoryByDriver', setwalletHistory)}
                    sx={{ color: BRAND_COLORS.textSecondary }}
                  />

                  <Tab
                    label="Driver Vehicles"
                    icon={<DirectionsCarIcon />}
                    iconPosition="start"
                    sx={{ color: BRAND_COLORS.textSecondary }}
                  />

                  <Tab
                    label="Advance Trips"
                    icon={<DirectionsCarIcon />}
                    iconPosition="start"
                    onClick={() => fetchDriverData('getDriverAdvanceTripLists', setadvanceTripData)}
                    sx={{ color: BRAND_COLORS.textSecondary }}
                  />

                  <Tab
                    label="Driver Self Posts"
                    icon={<DirectionsCarIcon />}
                    iconPosition="start"
                    onClick={() => fetchDriverData('getDriverPartnerDutyLists', setDriversSelfPostdata)}
                    sx={{ color: BRAND_COLORS.textSecondary }}
                  />

                  <Tab
                    label="Real Time Bookings"
                    icon={<DirectionsCarIcon />}
                    iconPosition="start"
                    onClick={() => fetchDriverData('getDriverRealTimeBookingsLists', setRealtimeBookingData)}
                    sx={{ color: BRAND_COLORS.textSecondary }}
                  />
                  <Tab
                    label="My Partner Duty"
                    icon={<DirectionsCarIcon />}
                    iconPosition="start"
                    onClick={() => fetchDriverData('getMyPartnerDuty', setMyPartnerDutyData)}
                    sx={{ color: BRAND_COLORS.textSecondary }}
                  />
                </Tabs>

                <Divider />

                <Box sx={{ p: 3 }}>
                  {/* Driver Details Tab */}
                  <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={3}>
                      {/* Personal Information */}
                      <Grid item xs={12}>
                        <Card variant="outlined" sx={{ mb: 3 }}>
                          <CardContent>
                            <Typography variant="h6" fontWeight={600} color={BRAND_COLORS.textPrimary} mb={2}>
                              Personal Information
                            </Typography>

                            <InfoRow
                              label="Full Name"
                              value={data.driverName}
                              icon={<PersonIcon sx={{ fontSize: 16, color: BRAND_COLORS.primary }} />}
                            />
                            <InfoRow
                              label="Phone Number"
                              value={data.phone_with_code}
                              icon={<PhoneIcon sx={{ fontSize: 16, color: BRAND_COLORS.primary }} />}
                            />
                            <InfoRow
                              label="Email"
                              value={data.email}
                              icon={<EmailIcon sx={{ fontSize: 16, color: BRAND_COLORS.primary }} />}
                            />
                            <InfoRow
                              label="Gender"
                              value={data.gender || 'Not specified'}
                            />
                            <InfoRow
                              label="Date of Birth"
                              value={data.date_of_birth ? new Date(data.date_of_birth).toLocaleDateString() : 'Not specified'}
                            />
                            <InfoRow
                              label="Address"
                              value={data.address || 'Not specified'}
                              icon={<LocationOnIcon sx={{ fontSize: 16, color: BRAND_COLORS.primary }} />}
                            />
                            <InfoRow
                              label="City"
                              value={data.city?.name}
                            />
                            <InfoRow
                              label="Referral Code"
                              value={data.referral_code}
                              highlight={true}
                            />
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Professional Information */}
                      <Grid item xs={12}>
                        <Card variant="outlined" sx={{ mb: 3 }}>
                          <CardContent>
                            <Typography variant="h6" fontWeight={600} color={BRAND_COLORS.textPrimary} mb={2}>
                              Professional Information
                            </Typography>

                            <InfoRow
                              label="Driving License"
                              value={data.drivingLicenseNumber}
                              icon={<DirectionsCarIcon sx={{ fontSize: 16, color: BRAND_COLORS.primary }} />}
                            />
                            <InfoRow
                              label="Vehicle RC No"
                              value={data.vehicleRcNo}
                            />
                            <InfoRow
                              label="Owner Name"
                              value={data.ownerName}
                            />
                            <InfoRow
                              label="Owner Mobile"
                              value={data.ownerMobileNo}
                            />
                            <InfoRow
                              label="Cab Category"
                              value={data.cabCategory}
                            />
                            <InfoRow
                              label="Documents Count"
                              value={`${data.docsCount} documents`}
                            />
                            <InfoRow
                              label="Remarks"
                              value={data.remarks}
                            />
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Status & Settings */}
                      <Grid item xs={12}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" fontWeight={600} color={BRAND_COLORS.textPrimary} mb={2}>
                              Status & Settings
                            </Typography>

                            <InfoRow
                              label="Wallet Balance"
                              value={`₹${data.wallet || 0}`}
                              icon={<AccountBalanceWalletIcon sx={{ fontSize: 16, color: BRAND_COLORS.primary }} />}
                              highlight={true}
                            />
                            <InfoRow
                              label="Profile Completed"
                              value={data.profileCompleted ? 'Yes' : 'No'}
                            />
                            <InfoRow
                              label="Hiring Status"
                              value={data.driver_hiring_status ? 'Available' : 'Not Available'}
                            />
                            <InfoRow
                              label="Outstation Booking"
                              value={data.outstation_booking_status ? 'Enabled' : 'Disabled'}
                            />
                            <InfoRow
                              label="Local Booking"
                              value={data.local_booking_status ? 'Enabled' : 'Disabled'}
                            />
                            <InfoRow
                              label="Joined Date"
                              value={new Date(data.created_at).toLocaleDateString()}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </TabPanel>

                  {/* Documents Tab */}
                  <TabPanel value={tabValue} index={1}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" fontWeight={600} color={BRAND_COLORS.textPrimary} mb={2}>
                          Document Status
                        </Typography>

                        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                          <Box textAlign="center">
                            <DocumentScannerIcon sx={{ fontSize: 48, color: BRAND_COLORS.secondary, mb: 2 }} />
                            <Typography variant="body1" color={BRAND_COLORS.textSecondary}>
                              {data.docsCount} documents uploaded
                            </Typography>
                            <Typography variant="body2" color={BRAND_COLORS.textSecondary}>
                              Document details will be loaded here
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </TabPanel>

                  {/* Membership Plans Tab */}
                  <TabPanel value={tabValue} index={2}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" fontWeight={600} color={BRAND_COLORS.textPrimary} mb={2}>
                          Current Membership
                        </Typography>

                        {data.membership && data.membership.length > 0 ? (
                          <List>
                            {data.membership.map((membership, index) => (
                              <ListItem key={index} sx={{ px: 0 }}>
                                <ListItemIcon>
                                  <CardMembershipIcon sx={{ color: BRAND_COLORS.primary }} />
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                      <Typography variant="body1" fontWeight={600}>
                                        {membership.plan_name}
                                      </Typography>
                                      <Chip
                                        label={membership.status}
                                        size="small"
                                        color={membership.status === 'active' ? 'success' : 'default'}
                                        variant="outlined"
                                      />
                                    </Box>
                                  }
                                  secondary={
                                    <Box>
                                      <Typography variant="body2" color={BRAND_COLORS.textSecondary}>
                                        Duration: {new Date(membership.start_date).toLocaleDateString()} - {new Date(membership.end_date).toLocaleDateString()}
                                      </Typography>
                                      <Typography variant="body2" color={BRAND_COLORS.textSecondary}>
                                        Price: ₹{membership.price}
                                      </Typography>
                                      {membership.plan_Remarks && (
                                        <Typography variant="body2" color={BRAND_COLORS.textSecondary}>
                                          {membership.plan_Remarks}
                                        </Typography>
                                      )}
                                      <Typography variant="body1" fontWeight={600}>
                                        By - {membership?.admin?.name}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                            <Box textAlign="center">
                              <CardMembershipIcon sx={{ fontSize: 48, color: BRAND_COLORS.secondary, mb: 2 }} />
                              <Typography variant="body1" color={BRAND_COLORS.textSecondary}>
                                No active membership plans
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </TabPanel>

                  {/* Wallet History Tab */}
                 
<TabPanel value={tabValue} index={3}>
  {/* Wallet Balance Card - Compact Hero Section */}
  <Card 
    variant="outlined" 
    sx={{ 
      mb: 3,
      background: `linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, #1d4ed8 100%)`,
      border: 'none',
      borderRadius: 2.5,
      overflow: 'hidden',
      position: 'relative',
    }}
  >
    <CardContent sx={{ p: 3 }}>
      {/* Subtle decorative circle */}
      <Box
        sx={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
        }}
      />

      <Box position="relative" zIndex={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <AccountBalanceWalletIcon sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.8)' }} />
              <Typography 
                variant="p" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                }}
              >
                Available Balance
              </Typography>
            </Stack>

            <Typography 
              variant="h4" 
              sx={{ 
                color: '#fff',
                fontWeight: 700,
                letterSpacing: '-0.5px',
                mb: 0.3,
              }}
            >
              ₹{parseFloat(data.wallet || 0).toFixed(2)}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </CardContent>
  </Card>

  {/* Transaction History */}
  <Card variant="outlined" sx={{ borderRadius: 2, border: `1px solid ${BRAND_COLORS.border}` }}>
    <CardContent sx={{ p: 0 }}>
      {/* Header */}
      <Box 
        sx={{ 
          px: 3, 
          py: 2.5, 
          borderBottom: `1px solid ${BRAND_COLORS.border}`,
          backgroundColor: BRAND_COLORS.background,
        }}
      >
        <Typography 
          variant="subtitle1" 
          fontWeight={600} 
          color={BRAND_COLORS.textPrimary}
        >
          Recent Transactions
        </Typography>
      </Box>

      {/* Transaction List */}
      {walletHistory?.data && walletHistory?.data?.length > 0 ? (
        <Box sx={{ maxHeight: 480, overflowY: 'auto' }}>
          <List sx={{ p: 0 }}>
            {walletHistory?.data?.map((transaction, index) => (
              <ListItem
                key={transaction.id}
                sx={{
                  px: 3,
                  py: 2.5,
                  borderBottom: index !== walletHistory?.data?.slice(0, 10).length - 1 
                    ? `1px solid ${BRAND_COLORS.border}` 
                    : 'none',
                  '&:hover': {
                    backgroundColor: BRAND_COLORS.background,
                  },
                  transition: 'background-color 0.2s',
                }}
              >

                <ListItemIcon sx={{ minWidth: 48 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      backgroundColor: transaction.action === 'cr'
                        ? '#dcfce7'
                        : '#fee2e2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {transaction.action === 'cr' ? (
                      <Box
                        sx={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: BRAND_COLORS.success,
                        }}
                      >
                        +
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: BRAND_COLORS.error,
                        }}
                      >
                        -
                      </Box>
                    )}
                  </Box>
                </ListItemIcon>

                {/* Transaction Details */}
                <ListItemText
                  primary={
                    <Typography 
                      variant="body2" 
                      fontWeight={600} 
                      color={BRAND_COLORS.textPrimary}
                      sx={{ mb: 0.3 }}
                    >
                     #{transaction.id} - {transaction.message || (transaction.action === 'cr' ? 'Money Added' : 'Payment Made')}
                    </Typography>
                  }
                  secondary={
                    <Typography 
                      variant="caption" 
                      color={BRAND_COLORS.textSecondary}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      {new Date(transaction.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  }
                />

                {/* Transaction Amount */}
                <Box textAlign="right" ml={2}>
                  <Typography
                    variant="p"
                    fontWeight={700}
                    color={transaction.action === 'cr'
                      ? BRAND_COLORS.success
                      : BRAND_COLORS.error
                    }
                    sx={{ mb: 0.3 }}
                  >
                    {transaction.action === 'cr' ? '+' : '-'} ₹{parseFloat(transaction.amount).toFixed(2)}
                  </Typography>
                  
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    fontSize: '0.65rem', 
                    color: 'text.secondary',
                    mt: -0.2,
                    fontWeight: 500,
                    fontSize:'12px !important'
                  }}
                >
                  Bal: ₹{parseFloat(transaction.closing_balance || 0).toFixed(2)}
                </Typography>
                </Box>
              </ListItem>
            ))}
          </List>

          {/* View More Footer */}
          {walletHistory?.data?.length > 10 && (
            <Box
              sx={{
                p: 2,
                textAlign: 'center',
                borderTop: `1px solid ${BRAND_COLORS.border}`,
                backgroundColor: BRAND_COLORS.background,
              }}
            >
              
            </Box>
          )}
        </Box>
      ) : (

        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          py={8}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: BRAND_COLORS.primaryLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <AccountBalanceWalletIcon 
              sx={{ 
                fontSize: 40, 
                color: BRAND_COLORS.primary,
                opacity: 0.6,
              }} 
            />
          </Box>
          <Typography 
            variant="body1" 
            fontWeight={600}
            color={BRAND_COLORS.textPrimary}
            mb={0.5}
          >
            No Transactions Yet
          </Typography>
          <Typography 
            variant="body2" 
            color={BRAND_COLORS.textSecondary}
            textAlign="center"
            sx={{ maxWidth: 280 }}
          >
            All wallet transactions will appear here
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
</TabPanel>

<TabPanel value={tabValue} index={4}>
  <Stack spacing={2}>
    {vehicleData?.map((vehicle) => (
      <Card variant="outlined" key={vehicle.id} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Box display="flex" alignItems="flex-start" gap={2}>
            {/* Left side: Vehicle Details */}
            <Box flexGrow={1}>
              <Typography variant="subtitle1" fontWeight={600}>
                {vehicle.vehicleName}
                <Chip 
                  label={vehicle.status?.toUpperCase()} 
                  color={vehicle.status === 'approved' ? 'success' : vehicle.status === 'rejected' ? 'error' : 'warning'} 
                  size="small" 
                  sx={{ fontSize: '0.65rem', height: 20, ml:2 }}
                />

              </Typography>
               <Typography variant="body2" color="text.secondary">
                Type: {vehicle?.vehicleCategory?.vehicle_type}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Number: {vehicle.vehicleNumber}
              </Typography>
            </Box>

            {/* Right side: Status and Actions (Compact) */}
          <Box display="flex" alignItems="center" gap={1}>
            {vehicle.status !== 'approved' && (
              <Button 
                variant="outlined" 
                color="success" 
                size="small" 
                startIcon={<CheckCircleOutline fontSize="small" />}
                onClick={() => handleVehicleAction(vehicle.id, 'approved')}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Approve
              </Button>
            )}
            {vehicle.status !== 'rejected' && (
              <Button 
                variant="outlined" 
                color="error" 
                size="small" 
                startIcon={<HighlightOff fontSize="small" />}
                onClick={() => handleVehicleAction(vehicle.id, 'rejected')}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Reject
              </Button>
            )}
          </Box>
          </Box>

          {/* Image Row */}
          <Box display="flex" gap={1} mt={2} overflow="auto">
            {[
              { label: 'RC Front', url: vehicle.rcFrontImage },
              { label: 'RC Back', url: vehicle.rcBackImage },
              { label: 'Vehicle', url: vehicle.vehicleFrontImage },
              { label: 'Insurance', url: vehicle.insuranceImage },
              { label: 'Affidavit', url: vehicle.faDebitImage },
            ].map((img, idx) => (img.url) && (
             <Box 
                key={idx} 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                sx={{ flexShrink: 0, width: 70 }} // Fixed width for alignment
              >
                <Box 
                  component="img" 
                  src={img.url} 
                  onClick={() => {
                      const newTab = window.open(img.url, '_blank');
                      if (newTab) {
                          newTab.document.write(`
                              <html>
                                  <head><title>BookFast ${img.label}</title></head>
                                  <body>
                                      <h1>${img.label}</h1>
                                      <img src="${img.url}" style="max-width: 100%;" />
                                  </body>
                              </html>
                          `);
                          newTab.document.close();
                      }
                  }}
                  sx={{ 
                    width: 65, 
                    height: 50, 
                    objectFit: 'cover', 
                    borderRadius: 1, 
                    border: '1px solid #ddd', 
                    cursor: 'pointer',
                    transition: '0.2s',
                    '&:hover': { borderColor: 'primary.main', transform: 'scale(1.05)' } 
                  }}
                />

                <Typography variant="body2" color="text.secondary">
                  {img.label}
                </Typography>
               
              </Box>
            ))}
            </Box>
            <Box>
            {vehicle.status === 'rejected' && vehicle.rejection_reason && (
              <Box mt={2} p={1.5} bgcolor="#fff5f5" borderRadius={1} border="1px solid #ffcdd2">
              <Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: 600, display: 'block', mb: 0.2 }}>
                REJECTION REASON:
              </Typography>
              <Typography variant="body2" sx={{ color: '#b71c1c' }}>
                {vehicle.rejection_reason}
              </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    ))}
  </Stack>
</TabPanel>


<TabPanel value={tabValue} index={5}>
  <Stack spacing={3}>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#f0fdf4', borderColor: '#bbf7d0', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#dcfce7', color: '#166534' }}> {/* Add an icon here if needed */} </Box>
          <Box>
            <Typography variant="caption" color="success.dark" sx={{ fontSize: '0.7rem !important', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Total Earning
            </Typography>
            <Typography variant="h6" fontWeight={700} color="success.main" sx={{ fontSize: '1.25rem' }}>
              ₹{(parseFloat(advanceTripData?.total_amount || 0) - parseFloat(advanceTripData?.total_commission || 0))
                  .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Card>
      </Grid>

      {/* Total Commission */}
      <Grid item xs={12} sm={4}>
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#fef2f2', borderColor: '#fecaca', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="error.dark" sx={{ fontSize: '0.7rem !important', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Total Commission
            </Typography>
            <Typography variant="h6" fontWeight={700} color="error.main" sx={{ fontSize: '1.25rem' }}>
              ₹{parseFloat(advanceTripData?.total_commission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Card>
      </Grid>

      {/* Total Accepted Booking */}
      <Grid item xs={12} sm={4}>
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#fff7ed', borderColor: '#fed7aa', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="warning.dark" sx={{ fontSize: '0.7rem !important', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Total Accepted Bookings
            </Typography>
            <Typography variant="h6" fontWeight={700} color="warning.main" sx={{ fontSize: '1.25rem' }}>
              {parseInt(advanceTripData?.count || 0)}
            </Typography>
          </Box>
        </Card>
      </Grid>
    </Grid>

    {advanceTripData?.data?.map((advanceTrip, index) => (
      <Grid item xs={12} key={advanceTrip.id || index}>
        {console.log(advanceTrip)}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: BRAND_COLORS.border,
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            backgroundColor: BRAND_COLORS.paper,
            overflow: 'hidden',
          }}
        >
          {/* --- HEADER --- */}
          <Box
            sx={{
              px: 3,
              py: 1.5,
              borderBottom: `1px solid ${BRAND_COLORS.border}`,
              backgroundColor: BRAND_COLORS.background,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="subtitle2" fontWeight={700} color={BRAND_COLORS.textSecondary} textTransform="uppercase">
                TRIP ID: <Box component="span" sx={{ color: BRAND_COLORS.primary, ml: 0.5 }}>#{advanceTrip.id || 'N/A'}</Box>
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
              {/* Displaying Pickup Date in Header for quick scanning */}
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {advanceTrip.pickup_date ? new Date(advanceTrip.pickup_date).toLocaleString('en-IN', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                }) : 'Schedule Pending'}
              </Typography>

              <Chip
                label={advanceTrip.status === 1 || advanceTrip.status === 3 ? 'Booked' : 'Cancelled'}
                color={advanceTrip.status === 1 || advanceTrip.status === 3 ? 'success' : 'error'}
                size="small"
                sx={{ fontSize: '0.7rem', height: 24, fontWeight: 700, borderRadius: 1.5 }}
              />
            </Stack>
          </Box>

          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <Grid container>
              
              <Grid item xs={12} md={6} sx={{ p: 3, borderRight: { md: `1px dashed ${BRAND_COLORS.border}`, xs: 'none' } }}>
                
                <Box sx={{ position: 'relative', ml: 1 }}>
                  <Box sx={{ position: 'absolute', top: 20, bottom: 20, left: 4, width: 2, backgroundColor: 'grey.300' }} />
                  
                  <Box sx={{ position: 'relative', pl: 4, mb: 3 }}>
                    <Box sx={{ position: 'absolute', left: 0, top: 4, width: 10, height: 10, borderRadius: '50%', backgroundColor: 'success.main', zIndex: 1 }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                      Pickup Location
                    </Typography>
                    <Typography variant="body1" fontWeight={500}  color="text.primary" sx={{ mt: 0.5, wordBreak: 'break-word',fontSize:'13px !important' }}>
                      {advanceTrip.pickup_address || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block',fontSize:'13px !important' }}>
                      {advanceTrip.pickup_date ? new Date(advanceTrip.pickup_date).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : '—'}
                    </Typography>
                  </Box>

                  <Box sx={{ position: 'relative', pl: 4 }}>
                    <Box sx={{ position: 'absolute', left: 0, top: 4, width: 10, height: 10, borderRadius: '50%', backgroundColor: 'error.main', zIndex: 1 }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                      Drop Location
                    </Typography>
                    <Typography variant="body1" fontWeight={500}  color="text.primary" sx={{ mt: 0.5, wordBreak: 'break-word',fontSize:'13px !important' }}>
                      {advanceTrip.drop_address || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block',fontSize:'13px !important' }}>
                      Distance: <Box component="span" fontWeight={600}>{advanceTrip.distance || '—'}</Box>
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  
                 <Grid container spacing={3} sx={{ mb: 'auto' }}>
  
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2.5}>
                      
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'grey.100', display: 'flex' }}>
                          <Person sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.2 }} color="text.secondary">
                            Agent Name
                          </Typography>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600 }} color="text.primary" noWrap>
                            {advanceTrip.agent_name || '—'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'grey.100', display: 'flex' }}>
                          <Smartphone sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.2 }} color="text.secondary">
                            Mobile
                          </Typography>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600 }} color="text.primary" display="block">
                            {advanceTrip.contact_mobile || '—'}
                          </Typography>
                        </Box>
                      </Box>

                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2.5}>
                      
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'grey.100', display: 'flex' }}>
                          <DirectionsCarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.2 }} color="text.secondary">
                            Vehicle Details
                          </Typography>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600 }} color="text.primary">
                            {advanceTrip.acpt_vehicle_type || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'grey.100', display: 'flex' }}>
                          <DirectionsCarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.2 }} color="text.secondary">
                            RC Number
                          </Typography>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }} color="text.primary" display="block">
                            {advanceTrip.acpt_vehicle_rc || '—'}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>

                  <Divider sx={{ my: 2.5 }} />

                  <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 2 }}>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Total Fare</Typography>
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                          ₹{parseFloat(advanceTrip.total_amount || 0).toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Commission</Typography>
                        <Typography variant="body2" fontWeight={600} color="error.main">
                          - ₹{parseFloat(advanceTrip.commission_amount || 0).toFixed(2)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                </Box>
              </Grid>
            </Grid>

            {/* --- FOOTER: System Timestamps --- */}
            <Box sx={{ backgroundColor: 'grey.50', px: 3, py: 1.5, borderTop: `1px solid ${BRAND_COLORS.border}` }}>
              <Stack direction="row" spacing={3} flexWrap="wrap">
                <Typography variant="caption" color="text.secondary">
                  <strong>Created:</strong> {advanceTrip.created_at ? new Date(advanceTrip.created_at).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                  }) : '—'}
                </Typography>
                
                {advanceTrip.ride_accepted_time && (
                  <Typography variant="caption" color="text.secondary">
                    <strong>Accepted:</strong> {new Date(advanceTrip.ride_accepted_time).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </Typography>
                )}
              </Stack>
            </Box>

          </CardContent>
        </Card>
      </Grid>
    ))}
  </Stack>
</TabPanel>



<TabPanel value={tabValue} index={6}>
  <Stack spacing={3}>
     <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#f0fdf4', borderColor: '#bbf7d0', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#dcfce7', color: '#166534' }}> {/* Add an icon here if needed */} </Box>
          <Box>
            <Typography variant="caption" color="success.dark" sx={{ fontSize: '0.7rem !important', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Total Earning
            </Typography>
            <Typography variant="h6" fontWeight={700} color="success.main" sx={{ fontSize: '1.25rem' }}>
              ₹{(parseFloat(DriversSelfPostData?.total_amount || 0) - parseFloat(DriversSelfPostData?.total_commission || 0))
                  .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Card>
      </Grid>

      {/* Total Commission */}
      <Grid item xs={12} sm={4}>
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#fef2f2', borderColor: '#fecaca', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="error.dark" sx={{ fontSize: '0.7rem !important', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Total Commission
            </Typography>
            <Typography variant="h6" fontWeight={700} color="error.main" sx={{ fontSize: '1.25rem' }}>
              ₹{parseFloat(DriversSelfPostData?.total_commission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Card>
      </Grid>

      {/* Total Accepted Booking */}
      <Grid item xs={12} sm={4}>
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#fff7ed', borderColor: '#fed7aa', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="warning.dark" sx={{ fontSize: '0.7rem !important', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Total Accepted Bookings
            </Typography>
            <Typography variant="h6" fontWeight={700} color="warning.main" sx={{ fontSize: '1.25rem' }}>
              {parseInt(DriversSelfPostData?.count || 0)}
            </Typography>
          </Box>
        </Card>
      </Grid>
    </Grid>
    

    {DriversSelfPostData?.data?.map((advanceTrip, index) => (
      <Grid item xs={12} key={advanceTrip.notiId || index}>
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: BRAND_COLORS.border,
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            backgroundColor: BRAND_COLORS.paper,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 1.5,
              borderBottom: `1px solid ${BRAND_COLORS.border}`,
              backgroundColor: BRAND_COLORS.background,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="subtitle2" fontWeight={700} color={BRAND_COLORS.textSecondary} textTransform="uppercase">
                ID: <Box component="span" sx={{ color: BRAND_COLORS.primary, ml: 0.5 }}>#{advanceTrip.notiId || 'N/A'}</Box>
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {advanceTrip.pickup_date ? new Date(advanceTrip.pickup_date).toLocaleString('en-IN', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                }) : 'Schedule Pending'}
              </Typography>

              <Chip
                label={advanceTrip.status === '2' ? 'Accepted' : 'Not Accepted'}
                color={advanceTrip.status === '2' ? 'success' : 'warning'}
                size="small"
                sx={{ fontSize: '0.7rem', height: 24, fontWeight: 700, borderRadius: 1.5 }}
              />
            </Stack>
          </Box>

          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <Grid container>
              
              <Grid item xs={12} md={6} sx={{ p: 3, borderRight: { md: `1px dashed ${BRAND_COLORS.border}`, xs: 'none' } }}>
                
                <Box sx={{ position: 'relative', ml: 1 }}>
                  <Box sx={{ position: 'absolute', top: 20, bottom: 20, left: 4, width: 2, backgroundColor: 'grey.300' }} />
                  
                  <Box sx={{ position: 'relative', pl: 4, mb: 3 }}>
                    <Box sx={{ position: 'absolute', left: 0, top: 4, width: 10, height: 10, borderRadius: '50%', backgroundColor: 'success.main', zIndex: 1 }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                      Pickup Location
                    </Typography>
                    <Typography variant="body1" fontWeight={500}  color="text.primary" sx={{ mt: 0.5, wordBreak: 'break-word',fontSize:'13px !important' }}>
                      {advanceTrip.pick_address || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block',fontSize:'13px !important' }}>
                      {advanceTrip.pickup_date ? new Date(advanceTrip.pickup_date).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : '—'}
                    </Typography>
                  </Box>

                  <Box sx={{ position: 'relative', pl: 4 }}>
                    <Box sx={{ position: 'absolute', left: 0, top: 4, width: 10, height: 10, borderRadius: '50%', backgroundColor: 'error.main', zIndex: 1 }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                      Drop Location
                    </Typography>
                    <Typography variant="body1" fontWeight={500}  color="text.primary" sx={{ mt: 0.5, wordBreak: 'break-word',fontSize:'13px !important' }}>
                      {advanceTrip.drop_address || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block',fontSize:'13px !important' }}>
                      Distance: <Box component="span" fontWeight={600}>{advanceTrip.distance || '—'}</Box> • Duration: <Box component="span" fontWeight={600}>{advanceTrip.duration || '—'}</Box>
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  
                 <Grid container spacing={3} sx={{ mb: 'auto' }}>
  
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2.5}>
                      
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'grey.100', display: 'flex' }}>
                          <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.2 }} color="text.secondary">
                            Posted By
                          </Typography>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600 }} color="text.primary" noWrap>
                            {advanceTrip.driverId || '—'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'grey.100', display: 'flex' }}>
                          <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.2 }} color="text.secondary">
                            Mobile
                          </Typography>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600 }} color="text.primary" display="block">
                            {advanceTrip.mobile || '—'}
                          </Typography>
                        </Box>
                      </Box>

                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2.5}>
                      
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'grey.100', display: 'flex' }}>
                          <DirectionsCarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.2 }} color="text.secondary">
                            Vehicle Name
                          </Typography>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600 }} color="text.primary">
                            {advanceTrip.acpt_vehicle_name || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>

                      {(advanceTrip.acpt_vehicle_rc || advanceTrip.acpt_vehicle_name) && (
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                          <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'grey.100', display: 'flex' }}>
                            <DirectionsCarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.2 }} color="text.secondary">
                              Vehicle RC
                            </Typography>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }} color="text.primary" display="block">
                              {advanceTrip.acpt_vehicle_name || advanceTrip.acpt_vehicle_type} ({advanceTrip.acpt_vehicle_rc || '—'})
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  </Grid>
                </Grid>

                  <Divider sx={{ my: 2.5 }} />

                  <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 2 }}>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Total Fare</Typography>
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                          ₹{parseFloat(advanceTrip.total_price || 0).toFixed(2)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Commission</Typography>
                        <Typography variant="body2" fontWeight={600} color="error.main">
                          - ₹{parseFloat(advanceTrip.commission || 0).toFixed(2)}
                        </Typography>
                      </Box>
                      <Divider sx={{ borderStyle: 'dashed' }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Driver Earning</Typography>
                        <Typography variant="subtitle2" fontWeight={700} color="success.main">
                          ₹{parseFloat(advanceTrip.driver_earning || 0).toFixed(2)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                </Box>
              </Grid>
            </Grid>

            {/* --- FOOTER: System Timestamps --- */}
            <Box sx={{ backgroundColor: 'grey.50', px: 3, py: 1.5, borderTop: `1px solid ${BRAND_COLORS.border}` }}>
              <Stack direction="row" spacing={3} flexWrap="wrap">
                <Typography variant="caption" color="text.secondary">
                  <strong>Created:</strong> {advanceTrip.createdAt ? new Date(advanceTrip.createdAt).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                  }) : '—'}
                </Typography>
                
                {advanceTrip.ride_accept_time && (
                  <Typography variant="caption" color="text.secondary">
                    <strong>Accepted:</strong> {new Date(advanceTrip.ride_accept_time).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </Typography>
                )}
              </Stack>
            </Box>

          </CardContent>
        </Card>
      </Grid>
    ))}
  </Stack>
</TabPanel>

<TabPanel value={tabValue} index={7}>
  <Stack spacing={3}>
     <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#f0fdf4', borderColor: '#bbf7d0', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#dcfce7', color: '#166534' }}> {/* Add an icon here if needed */} </Box>
          <Box>
            <Typography variant="caption" color="success.dark" sx={{ fontSize: '0.7rem !important', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Total Earning
            </Typography>
            <Typography variant="h6" fontWeight={700} color="success.main" sx={{ fontSize: '1.25rem' }}>
              ₹{parseFloat(RealtimeBookingData?.total_amount || 0)
                  .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Card>
      </Grid>

      {/* Total Commission */}
      <Grid item xs={12} sm={4}>
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#fef2f2', borderColor: '#fecaca', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="error.dark" sx={{ fontSize: '0.7rem !important', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Total Commission
            </Typography>
            <Typography variant="h6" fontWeight={700} color="error.main" sx={{ fontSize: '1.25rem' }}>
              ₹{parseFloat(RealtimeBookingData?.total_commission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Card>
      </Grid>

      {/* Total Accepted Booking */}
      <Grid item xs={12} sm={4}>
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#fff7ed', borderColor: '#fed7aa', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="warning.dark" sx={{ fontSize: '0.7rem !important', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Total Accepted Bookings
            </Typography>
            <Typography variant="h6" fontWeight={700} color="warning.main" sx={{ fontSize: '1.25rem' }}>
              {parseInt(RealtimeBookingData?.count || 0)}
            </Typography>
          </Box>
        </Card>
      </Grid>
    </Grid>
    

    {RealtimeBookingData?.data?.map((advanceTrip, index) => (
      <Grid item xs={12} key={advanceTrip.notiId || index}>
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: BRAND_COLORS.border,
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            backgroundColor: BRAND_COLORS.paper,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 1.5,
              borderBottom: `1px solid ${BRAND_COLORS.border}`,
              backgroundColor: BRAND_COLORS.background,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="subtitle2" fontWeight={700} color={BRAND_COLORS.textSecondary} textTransform="uppercase">
                ID: <Box component="span" sx={{ color: BRAND_COLORS.primary, ml: 0.5 }}>#{advanceTrip.trip_id || 'N/A'}</Box>
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {advanceTrip.pickup_date ? new Date(advanceTrip.pickup_date).toLocaleString('en-IN', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                }) : 'Schedule Pending'}
              </Typography>

              <Chip
                label={advanceTrip.status === 4 ? 'Accepted' : 'Not Accepted'}
                color={advanceTrip.status === 4 ? 'success' : 'warning'}
                size="small"
                sx={{ fontSize: '0.7rem', height: 24, fontWeight: 700, borderRadius: 1.5 }}
              />
            </Stack>
          </Box>

          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <Grid container>
              
              <Grid item xs={12} md={6} sx={{ p: 3, borderRight: { md: `1px dashed ${BRAND_COLORS.border}`, xs: 'none' } }}>
                
                <Box sx={{ position: 'relative', ml: 1 }}>
                  <Box sx={{ position: 'absolute', top: 20, bottom: 20, left: 4, width: 2, backgroundColor: 'grey.300' }} />
                  
                  <Box sx={{ position: 'relative', pl: 4, mb: 3 }}>
                    <Box sx={{ position: 'absolute', left: 0, top: 4, width: 10, height: 10, borderRadius: '50%', backgroundColor: 'success.main', zIndex: 1 }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                      Pickup Location
                    </Typography>
                    <Typography variant="body1" fontWeight={500}  color="text.primary" sx={{ mt: 0.5, wordBreak: 'break-word',fontSize:'13px !important' }}>
                      {advanceTrip.pickup_address || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block',fontSize:'13px !important' }}>
                      {advanceTrip.pickup_date ? new Date(advanceTrip.pickup_date).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : '—'}
                    </Typography>
                  </Box>

                  <Box sx={{ position: 'relative', pl: 4 }}>
                    <Box sx={{ position: 'absolute', left: 0, top: 4, width: 10, height: 10, borderRadius: '50%', backgroundColor: 'error.main', zIndex: 1 }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                      Drop Location
                    </Typography>
                    <Typography variant="body1" fontWeight={500}  color="text.primary" sx={{ mt: 0.5, wordBreak: 'break-word',fontSize:'13px !important' }}>
                      {advanceTrip.drop_address || '—'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  
                 <Grid container spacing={3} sx={{ mb: 'auto' }}>
  
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2.5}>
                      
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'grey.100', display: 'flex' }}>
                          <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.2 }} color="text.secondary">
                            Customer Name
                          </Typography>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600 }} color="text.primary" noWrap>
                            {advanceTrip.customer?.first_name ?? 'N/A'} {advanceTrip.customer?.last_name}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2.5}>
                      
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'grey.100', display: 'flex' }}>
                          <DirectionsCarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.2 }} color="text.secondary">
                            Ride Distance
                          </Typography>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600 }} color="text.primary">
                            {advanceTrip.distance || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>

                  <Divider sx={{ my: 2.5 }} />

                  <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 2 }}>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Total Fare</Typography>
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                          ₹{parseFloat(advanceTrip.total || 0).toFixed(2)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Commission</Typography>
                        <Typography variant="body2" fontWeight={600} color="error.main">
                          - ₹{parseFloat(advanceTrip.company_amount || 0).toFixed(2)}
                        </Typography>
                      </Box>
                      <Divider sx={{ borderStyle: 'dashed' }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Driver Earning</Typography>
                        <Typography variant="subtitle2" fontWeight={700} color="success.main">
                          ₹{parseFloat(advanceTrip.driver_earning || 0).toFixed(2)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                </Box>
              </Grid>
            </Grid>

            <Box sx={{ backgroundColor: 'grey.50', px: 3, py: 1.5, borderTop: `1px solid ${BRAND_COLORS.border}` }}>
              <Stack direction="row" spacing={3} flexWrap="wrap">
                <Typography variant="caption" color="text.secondary">
                  <strong>Created:</strong> {advanceTrip.created_at ? new Date(advanceTrip.created_at).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                  }) : '—'}
                </Typography>
                
                {advanceTrip.ride_accepted_time && (
                  <Typography variant="caption" color="text.secondary">
                    <strong>Accepted:</strong> {new Date(advanceTrip.ride_accepted_time).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </Typography>
                )}
              </Stack>
            </Box>

          </CardContent>
        </Card>
      </Grid>
    ))}
  </Stack>
</TabPanel>


<TabPanel value={tabValue} index={8}>
  <Stack spacing={3}>
     <Grid container spacing={2}>

      {/* Total Accepted Booking */}
      <Grid item xs={12} sm={3}>
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#fff7ed', borderColor: '#fed7aa', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="warning.dark" sx={{ fontSize: '0.7rem !important', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Total Bookings
            </Typography>
            <Typography variant="h6" fontWeight={700} color="warning.main" sx={{ fontSize: '1.25rem' }}>
              {parseInt(myPartnerDutyData?.count || 0)}
            </Typography>
          </Box>
        </Card>
      </Grid>
       <Grid item xs={12} sm={3}>
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#e1f5feff', borderColor: '#0ee1f2ff', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="#0ee1f2ff" sx={{ color:'#0ee1f2ff', fontSize: '0.7rem !important', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Accepted Bookings
            </Typography>
            <Typography variant="h6" fontWeight={700} color="#0ee1f2ff" sx={{ fontSize: '1.25rem' }}>
              {parseInt(myPartnerDutyData?.total_accepted || 0)}
            </Typography>
          </Box>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={3}>
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#f0fdf4', borderColor: '#bbf7d0', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#dcfce7', color: '#166534' }}> {/* Add an icon here if needed */} </Box>
          <Box>
            <Typography variant="caption" color="success.dark" sx={{ fontSize: '0.7rem !important', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Total Amount
            </Typography>
            <Typography variant="h6" fontWeight={700} color="success.main" sx={{ fontSize: '1.25rem' }}>
              ₹{(parseFloat(myPartnerDutyData?.total_amount || 0))
                  .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Card>
      </Grid>

      {/* Total Commission */}
      <Grid item xs={12} sm={3}>
        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#fef2f2', borderColor: '#fecaca', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="error.dark" sx={{ fontSize: '0.7rem !important', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Total Earning
            </Typography>
            <Typography variant="h6" fontWeight={700} color="error.main" sx={{ fontSize: '1.25rem' }}>
              ₹{parseFloat(myPartnerDutyData?.total_commission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Card>
      </Grid>

    </Grid>
    

    {myPartnerDutyData?.data?.map((advanceTrip, index) => (
      <Grid item xs={12} key={advanceTrip.notiId || index}>
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: BRAND_COLORS.border,
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            backgroundColor: BRAND_COLORS.paper,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 1.5,
              borderBottom: `1px solid ${BRAND_COLORS.border}`,
              backgroundColor: BRAND_COLORS.background,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="subtitle2" fontWeight={700} color={BRAND_COLORS.textSecondary} textTransform="uppercase">
                ID: <Box component="span" sx={{ color: BRAND_COLORS.primary, ml: 0.5 }}>#{advanceTrip.notiId || 'N/A'}</Box>
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {advanceTrip.pickup_date ? new Date(advanceTrip.pickup_date).toLocaleString('en-IN', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                }) : 'Schedule Pending'}
              </Typography>

              <Chip
                label={advanceTrip.status === '2' ? 'Accepted' : 'Not Accepted'}
                color={advanceTrip.status === '2' ? 'success' : 'warning'}
                size="small"
                sx={{ fontSize: '0.7rem', height: 24, fontWeight: 700, borderRadius: 1.5 }}
              />
            </Stack>
          </Box>

          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <Grid container>
              
              <Grid item xs={12} md={6} sx={{ p: 3, borderRight: { md: `1px dashed ${BRAND_COLORS.border}`, xs: 'none' } }}>
                
                <Box sx={{ position: 'relative', ml: 1 }}>
                  <Box sx={{ position: 'absolute', top: 20, bottom: 20, left: 4, width: 2, backgroundColor: 'grey.300' }} />
                  
                  <Box sx={{ position: 'relative', pl: 4, mb: 3 }}>
                    <Box sx={{ position: 'absolute', left: 0, top: 4, width: 10, height: 10, borderRadius: '50%', backgroundColor: 'success.main', zIndex: 1 }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                      Pickup Location
                    </Typography>
                    <Typography variant="body1" fontWeight={500}  color="text.primary" sx={{ mt: 0.5, wordBreak: 'break-word',fontSize:'13px !important' }}>
                      {advanceTrip.pick_address || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block',fontSize:'13px !important' }}>
                      {advanceTrip.pickup_date ? new Date(advanceTrip.pickup_date).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : '—'}
                    </Typography>
                  </Box>

                  <Box sx={{ position: 'relative', pl: 4 }}>
                    <Box sx={{ position: 'absolute', left: 0, top: 4, width: 10, height: 10, borderRadius: '50%', backgroundColor: 'error.main', zIndex: 1 }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                      Drop Location
                    </Typography>
                    <Typography variant="body1" fontWeight={500}  color="text.primary" sx={{ mt: 0.5, wordBreak: 'break-word',fontSize:'13px !important' }}>
                      {advanceTrip.drop_address || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block',fontSize:'13px !important' }}>
                      Distance: <Box component="span" fontWeight={600}>{advanceTrip.distance || '—'}</Box> • Duration: <Box component="span" fontWeight={600}>{advanceTrip.duration || '—'}</Box>
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  
                 <Grid container spacing={3} sx={{ mb: 'auto' }}>
  
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2.5}>
                      
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'grey.100', display: 'flex' }}>
                          <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.2 }} color="text.secondary">
                            Posted By
                          </Typography>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600 }} color="text.primary" noWrap>
                            {advanceTrip.driverId || '—'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'grey.100', display: 'flex' }}>
                          <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.2 }} color="text.secondary">
                            Mobile
                          </Typography>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600 }} color="text.primary" display="block">
                            {advanceTrip.mobile || '—'}
                          </Typography>
                        </Box>
                      </Box>

                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={2.5}>
                      
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'grey.100', display: 'flex' }}>
                          <DirectionsCarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.2 }} color="text.secondary">
                            Vehicle Name
                          </Typography>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600 }} color="text.primary">
                            {advanceTrip.acpt_vehicle_name || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>

                      {(advanceTrip.acpt_vehicle_rc || advanceTrip.acpt_vehicle_name) && (
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                          <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: 'grey.100', display: 'flex' }}>
                            <DirectionsCarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.2 }} color="text.secondary">
                              Vehicle RC
                            </Typography>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }} color="text.primary" display="block">
                              {advanceTrip.acpt_vehicle_name || advanceTrip.acpt_vehicle_type} ({advanceTrip.acpt_vehicle_rc || '—'})
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  </Grid>
                </Grid>

                  <Divider sx={{ my: 2.5 }} />

                  <Box sx={{ backgroundColor: 'grey.50', p: 2, borderRadius: 2 }}>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Total Fare</Typography>
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                          ₹{parseFloat(advanceTrip.total_price || 0).toFixed(2)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Commission</Typography>
                        <Typography variant="body2" fontWeight={600} color="error.main">
                          - ₹{parseFloat(advanceTrip.commission || 0).toFixed(2)}
                        </Typography>
                      </Box>
                      <Divider sx={{ borderStyle: 'dashed' }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Driver Earning</Typography>
                        <Typography variant="subtitle2" fontWeight={700} color="success.main">
                          ₹{parseFloat(advanceTrip.driver_earning || 0).toFixed(2)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                </Box>
              </Grid>
            </Grid>

            {/* --- FOOTER: System Timestamps --- */}
            <Box sx={{ backgroundColor: 'grey.50', px: 3, py: 1.5, borderTop: `1px solid ${BRAND_COLORS.border}` }}>
              <Stack direction="row" spacing={3} flexWrap="wrap">
                <Typography variant="caption" color="text.secondary">
                  <strong>Created:</strong> {advanceTrip.createdAt ? new Date(advanceTrip.createdAt).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                  }) : '—'}
                </Typography>
                
                {advanceTrip.ride_accept_time && (
                  <Typography variant="caption" color="text.secondary">
                    <strong>Accepted:</strong> {new Date(advanceTrip.ride_accept_time).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </Typography>
                )}
              </Stack>
            </Box>

          </CardContent>
        </Card>
      </Grid>
    ))}
  </Stack>
</TabPanel>
                </Box>
              </Paper>

              {/* Add Membership Dialog */}
              <AddMembershipDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                driverId={selectedDriverId}
              />
              {/* Disable Driver Dialog */}
              <Dialog
                open={disableDialogOpen}
                onClose={() => setDisableDialogOpen(false)}
                PaperProps={{
                  sx: {
                    width: '450px',
                    borderRadius: 2,
                  }
                }}
              >
                <DialogTitle sx={{ color: BRAND_COLORS.textPrimary, fontWeight: 600 }}>
                  {isEnableMode ? "Enable Driver Profile" : "Disable Driver Profile"}
                </DialogTitle>
                <DialogContent>
                  <Typography variant="body2" color={BRAND_COLORS.textSecondary} sx={{ mb: 3 }}>
                    {isEnableMode 
                        ? "Are you sure you want to enable this driver? They will be able to receive bookings again." 
                        : "Please provide the following details to restrict this driver's access."}
                    </Typography>
                  
                  {!isEnableMode && (
                    <Stack spacing={3}>
                      <TextField
                        label="Blocked By (Admin Name)"
                        variant="outlined"
                        fullWidth
                        required
                        value={blockBy}
                        onChange={(e) => setBlockBy(e.target.value)}
                        placeholder="Enter your name"
                        size="small"
                      />
                      <TextField
                        label="Block Remarks / Reason"
                        variant="outlined"
                        fullWidth
                        required
                        multiline
                        rows={3}
                        value={blockRemarks}
                        onChange={(e) => setBlockRemarks(e.target.value)}
                        placeholder="Reason for blocking..."
                        size="small"
                      />
                    </Stack>
                  )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                  <Button 
                    onClick={() => {
                      setDisableDialogOpen(false);
                      setBlockBy('');
                      setBlockRemarks('');
                    }} 
                    color="inherit"
                  >
                    Cancel
                  </Button> 
                  
                  <Button
                    onClick={confirmDisableDriver}
                    variant="contained"
                    disabled={!isEnableMode && (!blockBy || !blockRemarks)}
                    sx={{
                      backgroundColor: isEnableMode ? BRAND_COLORS.success : BRAND_COLORS.error,
                      px: 3,
                      '&:hover': {
                        backgroundColor: isEnableMode ? '#059669' : '#dc2626',
                      },
                    }}
                  >
                    {isEnableMode ? "Confirm Enable" : "Confirm Disable"}
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          ) : (
            <Box mt={10} textAlign="center">
              <Typography variant="h6" color={BRAND_COLORS.textSecondary}>
                Loading driver details...
              </Typography>
            </Box>
          )}
        </Box>
        <Dialog open={actionDialog.open} onClose={() => setActionDialog({ open: false, vehicleId: null, status: '' })}>
          <DialogTitle>Reject Vehicle Documents Reason</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Rejection Reason"
              fullWidth
              multiline
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialog({ open: false, vehicleId: null, status: '' })}>Cancel</Button>
            <Button 
              onClick={() => submitVehicleAction(actionDialog.vehicleId, 'rejected', rejectionReason)}
              variant="contained" 
              color="error"
            >
              Confirm Reject
            </Button>
          </DialogActions>
        </Dialog>
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

export default DriverDrawer;
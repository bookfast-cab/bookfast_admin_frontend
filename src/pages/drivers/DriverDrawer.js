// components/DriverDrawer.js
import React, { useState } from 'react';
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
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import VerifiedIcon from '@mui/icons-material/Verified';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import ToastMessage from 'src/components/ToastMessage';
import AddMembershipDialog from '../drivers-membership/AddMembershipDialog';

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
    // API call to disable driver
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

            <Typography 
              variant="p" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 400,
                fontSize: '0.7rem',
              }}
            >
              Last updated: {new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
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
      {data.walletHistory && data.walletHistory.length > 0 ? (
        <Box sx={{ maxHeight: 480, overflowY: 'auto' }}>
          <List sx={{ p: 0 }}>
            {data.walletHistory.map((transaction, index) => (
              <ListItem
                key={transaction.id}
                sx={{
                  px: 3,
                  py: 2.5,
                  borderBottom: index !== data.walletHistory.slice(0, 10).length - 1 
                    ? `1px solid ${BRAND_COLORS.border}` 
                    : 'none',
                  '&:hover': {
                    backgroundColor: BRAND_COLORS.background,
                  },
                  transition: 'background-color 0.2s',
                }}
              >
                {/* Transaction Icon */}
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
                          fontSize: 20,
                          fontWeight: 700,
                          color: BRAND_COLORS.success,
                        }}
                      >
                        ↓
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: BRAND_COLORS.error,
                        }}
                      >
                        ↑
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
                      {transaction.message || (transaction.action === 'cr' ? 'Money Added' : 'Payment Made')}
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
                    {transaction.action === 'cr' ? '+' : '-'}₹{parseFloat(transaction.amount).toFixed(2)}
                  </Typography>
                  {/* {(transaction.order_id && transaction.order_id !== 'null') && (
                    <Typography 
                      variant="caption" 
                      color={BRAND_COLORS.textSecondary}
                      sx={{ fontSize: '0.7rem' }}
                    >
                      #{transaction.order_id.slice(-6)}
                    </Typography>
                  )} */}
                </Box>
              </ListItem>
            ))}
          </List>

          {/* View More Footer */}
          {data.walletHistory.length > 10 && (
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
                    // Validation sirf disable mode mein
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
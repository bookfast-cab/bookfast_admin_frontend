import React, { useEffect, useState } from 'react';
import {
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
  TextField,
  CircularProgress
} from '@mui/material';
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
import { Person, Smartphone } from '@mui/icons-material';
import ToastMessage from 'src/components/ToastMessage';
import AddMembershipDialog from 'src/pages/drivers-membership/AddMembershipDialog';

// BookFast brand colors
const BRAND_COLORS = {
  primary: '#2563eb',
  primaryLight: '#dbeafe',
  secondary: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  background: '#f8fafc',
  paper: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  accent: '#8b5cf6',
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
    id={`global-driver-tabpanel-${index}`}
    aria-labelledby={`global-driver-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const DriverDetailsView = ({ data = {}, onDriverUpdate }) => {
  const [tabValue, setTabValue] = useState(0);
  const [membershipDialogOpen, setMembershipDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');
  const [blockBy, setBlockBy] = useState('');
  const [blockRemarks, setBlockRemarks] = useState('');
  const [isEnableMode, setIsEnableMode] = useState(false);

  const [vehicleData, setVehicleData] = useState([]);
  const [advanceTripData, setadvanceTripData] = useState({});
  const [DriversSelfPostData, setDriversSelfPostdata] = useState({});
  const [RealtimeBookingData, setRealtimeBookingData] = useState({});
  const [myPartnerDutyData, setMyPartnerDutyData] = useState({});
  const [walletHistory, setwalletHistory] = useState([]);
  const [walletView, setWalletView] = useState('wallet'); // 'wallet' or 'earning'
  const [loadingTab, setLoadingTab] = useState(false);

  const [actionDialog, setActionDialog] = useState({ open: false, vehicleId: null, status: '' });
  const [rejectionReason, setRejectionReason] = useState('');

  const getToken = () => {

    return typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    setVehicleData(data?.driverVehicle ?? []);
    if (data?.id) {
      if (tabValue === 3) {
        fetchDriverData('getWalletHistoryByDriver', setwalletHistory);
      } else if (tabValue === 5) {
        fetchDriverData('getDriverAdvanceTripLists', setadvanceTripData);
      } else if (tabValue === 6) {
        fetchDriverData('getDriverPartnerDutyLists', setDriversSelfPostdata);
      } else if (tabValue === 7) {
        fetchDriverData('getDriverRealTimeBookingsLists', setRealtimeBookingData);
      } else if (tabValue === 8) {
        fetchDriverData('getMyPartnerDuty', setMyPartnerDutyData);
      }
    }
  }, [data?.id, tabValue, walletView]);

  const fetchDriverData = async (endpoint, setterFunction, page_num = 1, perPage_val = 10) => {

    if (!data?.id) return;

    const queryParams = new URLSearchParams({
      page: page_num,
      perPage: perPage_val,
      driverId: data.id,
      type: walletView
    }).toString();

    setLoadingTab(true);
    try {
      const token = getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/${endpoint}?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
        }
      );

      const result = await response.json();
      setterFunction(result);
    } catch (err) {
      console.error('Error fetching driver tab data:', err);
    } finally {
      setLoadingTab(false);
    }
  };

  const handleVehicleAction = (vehicleId, status) => {
    if (status === 'rejected') {
      setActionDialog({ open: true, vehicleId, status });
    } else {
      submitVehicleAction(vehicleId, 'approved', '');
    }
  };

  const submitVehicleAction = async (id, status, reason) => {
    try {
      if (status === 'rejected' && !reason.trim()) {
        setToastMessage('Please provide rejection reason');
        setToastSeverity('error');
        setToastOpen(true);

        return;
      }

      const token = getToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/changeStatusDriverVehicle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({ id, status, rejection_reason: reason })
      });

      const result = await response.json();
      if (result.success) {
        setToastMessage(`Vehicle ${status} successfully`);
        setToastSeverity('success');
        setToastOpen(true);
        setActionDialog({ open: false, vehicleId: null, status: '' });
        setRejectionReason('');

        const updatedVehicles = vehicleData?.map(vehicle => {
          if (vehicle.id === id) {
            
            return {
              ...vehicle,
              status,
              rejection_reason: reason
            };
          }

          return vehicle;
        });

        if (typeof onDriverUpdate === 'function') {
          onDriverUpdate({
            ...data,
            driverVehicle: updatedVehicles
          });
        }
        setVehicleData(updatedVehicles);
      } else {
        setToastMessage(result.message || 'Error updating status');
        setToastSeverity('error');
        setToastOpen(true);
      }
    } catch (err) {
      setToastMessage('Error updating status');
      setToastSeverity('error');
      setToastOpen(true);
    }
  };

  const handleDisableDriver = () => {
    setIsEnableMode(data?.isBlocked == 1);
    setDisableDialogOpen(true);
  };

  const confirmDisableDriver = () => {
    if (!isEnableMode && (!blockBy || !blockRemarks)) {
      setToastMessage('Please fill in all fields!');
      setToastSeverity('error');
      setToastOpen(true);

      return;
    }

    const token = getToken();
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/disableDriver`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({
        driverId: data.id,
        isBlocked: data?.isBlocked == 1 ? 0 : 1,
        block_by: isEnableMode ? '' : blockBy,
        block_remark: isEnableMode ? '' : blockRemarks
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          setToastMessage(data?.isBlocked == 0 ? 'Driver disabled successfully!' : 'Driver enabled successfully!');
          setToastSeverity('success');
          setToastOpen(true);

          if (typeof onDriverUpdate === 'function') {
            onDriverUpdate({
              ...data,
              ...(result?.data || {}),
              id: data?.id,
              isBlocked: isEnableMode ? 0 : 1,
              block_by: isEnableMode ? '' : blockBy,
              block_remark: isEnableMode ? '' : blockRemarks
            });
          }

          setBlockBy('');
          setBlockRemarks('');
          setDisableDialogOpen(false);
        } else {
          setToastMessage(result.message || 'Failed to update driver status!');
          setToastSeverity('error');
          setToastOpen(true);
        }
      })
      .catch((err) => {
        console.error(err);
        setToastMessage('Something went wrong!');
        setToastSeverity('error');
        setToastOpen(true);
      });
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

  const profileStatus = getProfileStatus(data?.profileApproved);

  const docObj = Array.isArray(data?.documents) ? data.documents[0] : (data?.documents || {});

  const docList = [
    { label: 'Aadhar Card Front', url: docObj?.aadharCardImage, isApproved: docObj?.isAadharCardApproved },
    { label: 'Aadhar Card Back', url: docObj?.aadharCardBackImage, isApproved: docObj?.isAadharCardBackApproved },
    { label: 'Driving License Front', url: docObj?.licenseFrontImage, isApproved: docObj?.licenseFrontApproved || docObj?.isLicenseFrontApproved },
    { label: 'Driving License Back', url: docObj?.licenseBackImage, isApproved: docObj?.licenseBackApproved || docObj?.isLicenseBackApproved },
    { label: 'PAN Card', url: docObj?.panCardImage, isApproved: docObj?.panCardApproved || docObj?.isPanCardApproved },
    { label: 'Bank Passbook', url: docObj?.bankPassbookImage, isApproved: docObj?.bankPassbookApproved || docObj?.isBankPassbookApproved },
    { label: 'Vehicle Front', url: docObj?.vehicleFrontImage, isApproved: docObj?.vehicleFrontApproved || docObj?.isVehicleFrontApproved },
    { label: 'Vehicle Back', url: docObj?.vehicleBackImage, isApproved: docObj?.vehicleBackApproved || docObj?.isVehicleBackApproved },
    { label: 'Vehicle RC Front', url: docObj?.vehicleRcFrontImage, isApproved: docObj?.vehicleRcFrontApproved || docObj?.isVehicleRcFrontApproved },
    { label: 'Vehicle RC Back', url: docObj?.vehicleRcBackImage, isApproved: docObj?.vehicleRcBackApproved || docObj?.isVehicleRcBackApproved },
    { label: 'Vehicle Insurance', url: docObj?.vehicleInsurance, isApproved: docObj?.vehicleInsuranceApproved || docObj?.isVehicleInsuranceApproved },
    { label: 'National Permit', url: docObj?.vehiclePermitNational, isApproved: docObj?.vehiclePermitNationalApproved || docObj?.isVehiclePermitNationalApproved },
  ].filter(d => Boolean(d.url));

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
    

      {/* 2. Blocked Alert Banner if blocked */}
      {data.isBlocked == 1 && (
        <Box sx={{ mb: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              backgroundColor: '#fef2f2',
              border: `1px solid #fee2e2`,
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                backgroundColor: BRAND_COLORS.error
              }}
            />

            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Box
                sx={{
                  backgroundColor: '#fee2e2',
                  p: 1,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <PersonOffIcon sx={{ color: BRAND_COLORS.error }} />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} color={BRAND_COLORS.error} sx={{ mb: 1 }}>
                  Driver Disabled / Restricted Access
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Blocked By:
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color={BRAND_COLORS.textPrimary}>
                      {data.block_by || 'System Admin'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      Date & Time:
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color={BRAND_COLORS.textPrimary}>
                      {data.block_date
                        ? new Date(data.block_date).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                    <Typography variant="caption" color="textSecondary" display="block">
                      Remarks:
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

      {/* 3. Tabs Navigation Container */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: BRAND_COLORS.paper,
          border: `1px solid ${BRAND_COLORS.border}`,
          borderRadius: 2,
          overflow: 'hidden'
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
            borderBottom: `1px solid ${BRAND_COLORS.border}`,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 52,
              fontSize: '13.5px',
              color: BRAND_COLORS.textSecondary,
              '&.Mui-selected': {
                color: BRAND_COLORS.primary,
              }
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
              color: BRAND_COLORS.textSecondary,
              margin: '0 4px',
              '&:hover': {
                backgroundColor: BRAND_COLORS.primaryLight,
                color: BRAND_COLORS.primary,
              }
            }
          }}
        >
          <Tab label="Driver Details" icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label="Documents" icon={<DocumentScannerIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label="Membership Plans" icon={<CardMembershipIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab
            label="Wallet"
            icon={<AccountBalanceWalletIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            onClick={() => fetchDriverData('getWalletHistoryByDriver', setwalletHistory)}
          />
          <Tab label="Driver Vehicles" icon={<DirectionsCarIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab
            label="Advance Trips"
            icon={<DirectionsCarIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            onClick={() => fetchDriverData('getDriverAdvanceTripLists', setadvanceTripData)}
          />
          <Tab
            label="Driver Self Posts"
            icon={<DirectionsCarIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            onClick={() => fetchDriverData('getDriverPartnerDutyLists', setDriversSelfPostdata)}
          />
          <Tab
            label="Real Time Bookings"
            icon={<DirectionsCarIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            onClick={() => fetchDriverData('getDriverRealTimeBookingsLists', setRealtimeBookingData)}
          />
          <Tab
            label="My Partner Duty"
            icon={<DirectionsCarIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            onClick={() => fetchDriverData('getMyPartnerDuty', setMyPartnerDutyData)}
          />
        </Tabs>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {/* TAB 0: Driver Details */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
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
                      value={data.phone_with_code || data.phone_number}
                      icon={<PhoneIcon sx={{ fontSize: 16, color: BRAND_COLORS.primary }} />}
                    />
                    <InfoRow
                      label="Email"
                      value={data.email}
                      icon={<EmailIcon sx={{ fontSize: 16, color: BRAND_COLORS.primary }} />}
                    />
                    <InfoRow label="Gender" value={data.gender || 'Not specified'} />
                    <InfoRow
                      label="Date of Birth"
                      value={data.date_of_birth ? new Date(data.date_of_birth).toLocaleDateString() : 'Not specified'}
                    />
                    <InfoRow
                      label="Address"
                      value={data.address || 'Not specified'}
                      icon={<LocationOnIcon sx={{ fontSize: 16, color: BRAND_COLORS.primary }} />}
                    />
                    <InfoRow label="City" value={data.city?.name || data.cabAttachmentCity} />
                    <InfoRow label="Referral Code" value={data.referral_code} highlight={true} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Professional Information */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} color={BRAND_COLORS.textPrimary} mb={2}>
                      Professional Information
                    </Typography>
                    <InfoRow
                      label="Driving License"
                      value={data.drivingLicenseNumber}
                      icon={<DirectionsCarIcon sx={{ fontSize: 16, color: BRAND_COLORS.primary }} />}
                    />
                    <InfoRow label="Vehicle RC No" value={data.vehicleRcNo} />
                    <InfoRow label="Owner Name" value={data.ownerName} />
                    <InfoRow label="Owner Mobile" value={data.ownerMobileNo} />
                    <InfoRow
                      label="Cab Category"
                      value={data.vehicleCategory?.name || data.vehicleCategory?.vehicle_type || data.cabCategory}
                    />
                    <InfoRow label="Documents Count" value={`${data.docsCount ?? 0} documents`} />
                    <InfoRow label="Remarks" value={data.remarks} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Status & Settings */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
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
                      label="Commission Earning"
                      value={`₹${data.commision_earning || 0}`}
                      highlight={true}
                    />
                    <InfoRow label="Profile Status" value={data.profileApproved === 1 ? 'Approved' : 'Pending'} />
                    <InfoRow label="Profile Completed" value={data.profileCompleted ? 'Yes' : 'No'} />
                    <InfoRow label="Hiring Status" value={data.driver_hiring_status ? 'Available' : 'Not Available'} />
                    <InfoRow label="Outstation Booking" value={data.outstation_booking_status ? 'Enabled' : 'Disabled'} />
                    <InfoRow label="Local Booking" value={data.local_booking_status ? 'Enabled' : 'Disabled'} />
                    <InfoRow label="Withdraw Status" value={data.withdraw_disable === 1 ? 'Disabled' : 'Enabled'} />
                    <InfoRow
                      label="Joined Date"
                      value={data.created_at ? new Date(data.created_at).toLocaleDateString() : '—'}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Device Details */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} color={BRAND_COLORS.textPrimary} mb={2}>
                      Device & Location Details
                    </Typography>
                    <InfoRow label="Device ID" value={data?.devicedetail?.device_id} />
                    <InfoRow label="Device Brand" value={data?.devicedetail?.device_brand} />
                    <InfoRow label="Device Model" value={data?.devicedetail?.device_model} />
                    <InfoRow label="Device OS" value={data?.devicedetail?.device_os} />
                    <InfoRow label="App Version" value={data?.devicedetail?.app_version} />
                    <InfoRow label="Device IP" value={data?.devicedetail?.ip_address} />
                    <InfoRow
                      label="Last Location Update"
                      value={
                        data?.lastLocationUpdateAt
                          ? new Date(data.lastLocationUpdateAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })
                          : 'N/A'
                      }
                    />
                    {(data?.latitude || data?.devicedetail?.latitude) && (
                      <InfoRow
                        label="Coordinates"
                        value={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" color={BRAND_COLORS.textPrimary}>
                              {data?.latitude || data?.devicedetail?.latitude}, {data?.longitude || data?.devicedetail?.longitude}
                            </Typography>
                            <Button
                              size="small"
                              variant="text"
                              href={`https://www.google.com/maps?q=${data?.latitude || data?.devicedetail?.latitude},${data?.longitude || data?.devicedetail?.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ textTransform: 'none', p: 0, minWidth: 'auto', fontSize: '12px', color: BRAND_COLORS.primary, fontWeight: 600 }}
                            >
                              (View on Map)
                            </Button>
                          </Box>
                        }
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* TAB 1: Documents */}
          <TabPanel value={tabValue} index={1}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                  <Typography variant="h6" fontWeight={600} color={BRAND_COLORS.textPrimary}>
                    Uploaded Documents
                  </Typography>
                  <Chip
                    label={`${data?.docsCount ?? docList.length} Documents`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>

                {docList.length > 0 ? (
                  <Grid container spacing={2}>
                    {docList.map((docItem, idx) => (
                      <Grid item xs={12} sm={6} md={4} key={idx}>
                        <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle2" fontWeight={600} noWrap>
                              {docItem.label}
                            </Typography>
                            <Chip
                              label={docItem.isApproved ? 'Approved' : 'Pending'}
                              size="small"
                              color={docItem.isApproved ? 'success' : 'warning'}
                              sx={{ fontSize: '0.65rem', height: 20 }}
                            />
                          </Box>
                          <Box
                            component="img"
                            src={docItem.url}
                            alt={docItem.label}
                            onClick={() => {
                              const newTab = window.open(docItem.url, '_blank');
                              if (newTab) {
                                newTab.document.write(`
                                  <html>
                                    <head><title>BookFast - ${docItem.label}</title></head>
                                    <body style="margin:0;display:flex;align-items:center;justify-content:center;background:#0f172a;min-height:100vh;">
                                      <img src="${docItem.url}" style="max-width:95vw;max-height:95vh;object-fit:contain;border-radius:8px;" />
                                    </body>
                                  </html>
                                `);
                                newTab.document.close();
                              }
                            }}
                            sx={{
                              width: '100%',
                              height: 140,
                              objectFit: 'cover',
                              borderRadius: 1.5,
                              border: `1px solid ${BRAND_COLORS.border}`,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'scale(1.02)',
                                borderColor: BRAND_COLORS.primary,
                                boxShadow: '0 4px 12px rgba(37,99,235,0.15)'
                              }
                            }}
                          />
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" py={5}>
                    <Box textAlign="center">
                      <DocumentScannerIcon sx={{ fontSize: 48, color: BRAND_COLORS.secondary, mb: 1.5 }} />
                      <Typography variant="body1" color={BRAND_COLORS.textSecondary} fontWeight={600}>
                        {data?.docsCount ?? 0} documents uploaded
                      </Typography>
                      <Typography variant="body2" color={BRAND_COLORS.textSecondary}>
                        Document images will appear here once attached to the profile
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </TabPanel>

          {/* TAB 2: Membership Plans */}
          <TabPanel value={tabValue} index={2}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight={600} color={BRAND_COLORS.textPrimary}>
                    Current Membership Plans
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setMembershipDialogOpen(true)}
                    sx={{ textTransform: 'none', borderRadius: 1.5 }}
                  >
                    Add Plan
                  </Button>
                </Box>

                {data.membership && data.membership.length > 0 ? (
                  <List>
                    {data.membership.map((membership, index) => (
                      <ListItem key={index} sx={{ px: 0, borderBottom: `1px solid ${BRAND_COLORS.border}`, py: 2 }}>
                        <ListItemIcon>
                          <CardMembershipIcon sx={{ color: BRAND_COLORS.primary, fontSize: 32 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle1" fontWeight={700}>
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
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="body2" color={BRAND_COLORS.textSecondary}>
                                Duration: {new Date(membership.start_date).toLocaleDateString()} - {new Date(membership.end_date).toLocaleDateString()}
                              </Typography>
                              <Typography variant="body2" color={BRAND_COLORS.textSecondary}>
                                Price: ₹{membership.price}
                              </Typography>
                              {membership.plan_Remarks && (
                                <Typography variant="body2" color={BRAND_COLORS.textSecondary}>
                                  Remarks: {membership.plan_Remarks}
                                </Typography>
                              )}
                              {membership?.admin?.name && (
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                  Assigned By: {membership.admin.name}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" py={5}>
                    <Box textAlign="center">
                      <CardMembershipIcon sx={{ fontSize: 48, color: BRAND_COLORS.secondary, mb: 1.5 }} />
                      <Typography variant="body1" color={BRAND_COLORS.textSecondary} fontWeight={600}>
                        No active membership plans
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PersonAddIcon />}
                        onClick={() => setMembershipDialogOpen(true)}
                        sx={{ mt: 2, textTransform: 'none' }}
                      >
                        Assign Membership Now
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </TabPanel>

          {/* TAB 3: Wallet History */}
          <TabPanel value={tabValue} index={3}>
            {/* Wallet vs Earning Toggle */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                fullWidth
                variant={walletView === 'wallet' ? 'contained' : 'outlined'}
                onClick={() => setWalletView('wallet')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: walletView === 'wallet' ? 'transparent' : BRAND_COLORS.border,
                  color: walletView === 'wallet' ? '#fff' : BRAND_COLORS.textSecondary,
                  backgroundColor: walletView === 'wallet' ? BRAND_COLORS.primary : 'transparent',
                  '&:hover': {
                    backgroundColor: walletView === 'wallet' ? '#1d4ed8' : BRAND_COLORS.background,
                  }
                }}
              >
                Wallet History
              </Button>
              <Button
                fullWidth
                variant={walletView === 'earning' ? 'contained' : 'outlined'}
                onClick={() => setWalletView('earning')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: walletView === 'earning' ? 'transparent' : BRAND_COLORS.border,
                  color: walletView === 'earning' ? '#fff' : BRAND_COLORS.textSecondary,
                  backgroundColor: walletView === 'earning' ? BRAND_COLORS.primary : 'transparent',
                  '&:hover': {
                    backgroundColor: walletView === 'earning' ? '#1d4ed8' : BRAND_COLORS.background,
                  }
                }}
              >
                Earning History
              </Button>
            </Box>

            {/* Wallet Balance Hero Card */}
            <Card
              variant="outlined"
              sx={{
                mb: 3,
                background: `linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, #1d4ed8 100%)`,
                border: 'none',
                borderRadius: 2.5,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.85)' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
                    {walletView === 'wallet' ? 'Current Wallet Balance' : 'Total Commission Earnings'}
                  </Typography>
                </Stack>
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                  ₹{parseFloat((walletView === 'wallet' ? data.wallet : data.commision_earning) || 0).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>

            {/* Transactions List */}
            <Card variant="outlined" sx={{ borderRadius: 2, border: `1px solid ${BRAND_COLORS.border}` }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${BRAND_COLORS.border}`, bgcolor: BRAND_COLORS.background }}>
                  <Typography variant="subtitle2" fontWeight={600} color={BRAND_COLORS.textPrimary}>
                    {walletView === 'wallet' ? 'Recent Wallet Transactions' : 'Recent Earning Transactions'}
                  </Typography>
                </Box>

                {walletHistory?.data && walletHistory.data.length > 0 ? (
                  <List sx={{ p: 0, maxHeight: 480, overflowY: 'auto' }}>
                    {walletHistory.data.map((transaction, index) => (
                      <ListItem
                        key={transaction.id || index}
                        sx={{
                          px: 3,
                          py: 2,
                          borderBottom: index !== walletHistory.data.length - 1 ? `1px solid ${BRAND_COLORS.border}` : 'none',
                          '&:hover': { bgcolor: BRAND_COLORS.background }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 48 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              backgroundColor: transaction.action === 'cr' ? '#dcfce7' : '#fee2e2',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              color: transaction.action === 'cr' ? BRAND_COLORS.success : BRAND_COLORS.error
                            }}
                          >
                            {transaction.action === 'cr' ? '+' : '-'}
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={600} color={BRAND_COLORS.textPrimary}>
                              #{transaction.id} - {transaction.message || (transaction.action === 'cr' ? 'Money Added' : 'Payment Made')}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color={BRAND_COLORS.textSecondary}>
                              {new Date(transaction.created_at).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          }
                        />
                        <Box textAlign="right" ml={2}>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color={transaction.action === 'cr' ? BRAND_COLORS.success : BRAND_COLORS.error}
                          >
                            {transaction.action === 'cr' ? '+' : '-'} ₹{parseFloat(transaction.amount || 0).toFixed(2)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Bal: ₹{parseFloat(transaction.closing_balance || 0).toFixed(2)}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box display="flex" flexDirection="column" alignItems="center" py={6}>
                    <AccountBalanceWalletIcon sx={{ fontSize: 40, color: BRAND_COLORS.secondary, mb: 1, opacity: 0.5 }} />
                    <Typography variant="body2" fontWeight={600} color={BRAND_COLORS.textSecondary}>
                      No transactions recorded yet
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </TabPanel>

          {/* TAB 4: Driver Vehicles */}
          <TabPanel value={tabValue} index={4}>
            <Stack spacing={2}>
              {vehicleData?.length > 0 ? (
                vehicleData.map((vehicle) => (
                  <Card variant="outlined" key={vehicle.id} sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ pb: '16px !important' }}>
                      <Box display="flex" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={2}>
                        <Box>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Typography variant="subtitle1" fontWeight={700}>
                              {vehicle.vehicleName || 'Vehicle'}
                            </Typography>
                            <Chip
                              label={vehicle.status?.toUpperCase()}
                              color={vehicle.status === 'approved' ? 'success' : vehicle.status === 'rejected' ? 'error' : 'warning'}
                              size="small"
                              sx={{ fontSize: '0.65rem', height: 20 }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Type: {vehicle?.vehicleCategory?.vehicle_type || 'N/A'} • Number: {vehicle.vehicleNumber}
                          </Typography>
                        </Box>

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

                      {/* Image row */}
                      <Box display="flex" gap={1.5} mt={2} overflow="auto">
                        {[
                          { label: 'RC Front', url: vehicle.rcFrontImage },
                          { label: 'RC Back', url: vehicle.rcBackImage },
                          { label: 'Vehicle', url: vehicle.vehicleFrontImage },
                          { label: 'Insurance', url: vehicle.insuranceImage },
                          { label: 'Affidavit', url: vehicle.faDebitImage },
                        ].map((img, idx) => img.url && (
                          <Box key={idx} display="flex" flexDirection="column" alignItems="center" sx={{ flexShrink: 0, width: 75 }}>
                            <Box
                              component="img"
                              src={img.url}
                              alt={img.label}
                              onClick={() => {
                                const newTab = window.open(img.url, '_blank');
                                if (newTab) {
                                  newTab.document.write(`
                                    <html>
                                      <head><title>BookFast - ${img.label}</title></head>
                                      <body style="margin:0;display:flex;align-items:center;justify-content:center;background:#0f172a;min-height:100vh;">
                                        <img src="${img.url}" style="max-width:95vw;max-height:95vh;object-fit:contain;border-radius:8px;" />
                                      </body>
                                    </html>
                                  `);
                                  newTab.document.close();
                                }
                              }}
                              sx={{
                                width: 70,
                                height: 52,
                                objectFit: 'cover',
                                borderRadius: 1,
                                border: '1px solid #ddd',
                                cursor: 'pointer',
                                transition: '0.2s',
                                '&:hover': { borderColor: 'primary.main', transform: 'scale(1.05)' }
                              }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontSize: '11px' }}>
                              {img.label}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

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
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Box textAlign="center" py={5}>
                  <DirectionsCarIcon sx={{ fontSize: 48, color: BRAND_COLORS.secondary, mb: 1, opacity: 0.5 }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    No registered vehicles found for this driver
                  </Typography>
                </Box>
              )}
            </Stack>
          </TabPanel>

          {/* TAB 5: Advance Trips */}
          <TabPanel value={tabValue} index={5}>
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                    <Typography variant="caption" color="success.dark" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                      Total Earning
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="success.main" sx={{ mt: 0.5 }}>
                      ₹{(parseFloat(advanceTripData?.total_amount || 0) - parseFloat(advanceTripData?.total_commission || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#fef2f2', borderColor: '#fecaca' }}>
                    <Typography variant="caption" color="error.dark" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                      Total Commission
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="error.main" sx={{ mt: 0.5 }}>
                      ₹{parseFloat(advanceTripData?.total_commission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#fff7ed', borderColor: '#fed7aa' }}>
                    <Typography variant="caption" color="warning.dark" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                      Total Accepted Bookings
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="warning.main" sx={{ mt: 0.5 }}>
                      {parseInt(advanceTripData?.count || 0)}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              {advanceTripData?.data?.map((trip, idx) => (
                <Card variant="outlined" key={trip.id || idx} sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
                  <Box sx={{ px: 3, py: 1.5, borderBottom: `1px solid ${BRAND_COLORS.border}`, bgcolor: BRAND_COLORS.background, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700} color={BRAND_COLORS.textSecondary}>
                      TRIP ID: <Box component="span" sx={{ color: BRAND_COLORS.primary }}>#{trip.id || 'N/A'}</Box>
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {trip.pickup_date ? new Date(trip.pickup_date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                      </Typography>
                      <Chip
                        label={trip.status === 1 || trip.status === 3 ? 'Booked' : 'Cancelled'}
                        color={trip.status === 1 || trip.status === 3 ? 'success' : 'error'}
                        size="small"
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                    </Stack>
                  </Box>

                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ borderLeft: '2px solid #cbd5e1', pl: 2, ml: 1 }}>
                          <Typography variant="caption" color="success.main" fontWeight={700} display="block">
                            PICKUP LOCATION
                          </Typography>
                          <Typography variant="body2" fontWeight={500} sx={{ mb: 2 }}>
                            {trip.pickup_address || '—'}
                          </Typography>
                          <Typography variant="caption" color="error.main" fontWeight={700} display="block">
                            DROP LOCATION
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {trip.drop_address || '—'}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Stack spacing={1}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">Agent / Mobile:</Typography>
                            <Typography variant="caption" fontWeight={600}>{trip.agent_name || '—'} ({trip.contact_mobile || '—'})</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">Vehicle / RC:</Typography>
                            <Typography variant="caption" fontWeight={600}>{trip.acpt_vehicle_type || '—'} ({trip.acpt_vehicle_rc || '—'})</Typography>
                          </Box>
                          <Divider sx={{ my: 1 }} />
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">Total Fare:</Typography>
                            <Typography variant="body2" fontWeight={700}>₹{parseFloat(trip.total_amount || 0).toFixed(2)}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" color="error.main">Commission:</Typography>
                            <Typography variant="body2" fontWeight={600} color="error.main">- ₹{parseFloat(trip.commission_amount || 0).toFixed(2)}</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </TabPanel>

          {/* TAB 6: Driver Self Posts */}
          <TabPanel value={tabValue} index={6}>
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                    <Typography variant="caption" color="success.dark" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                      Total Earning
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="success.main" sx={{ mt: 0.5 }}>
                      ₹{(parseFloat(DriversSelfPostData?.total_amount || 0) - parseFloat(DriversSelfPostData?.total_commission || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#fef2f2', borderColor: '#fecaca' }}>
                    <Typography variant="caption" color="error.dark" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                      Total Commission
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="error.main" sx={{ mt: 0.5 }}>
                      ₹{parseFloat(DriversSelfPostData?.total_commission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#fff7ed', borderColor: '#fed7aa' }}>
                    <Typography variant="caption" color="warning.dark" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                      Total Accepted Bookings
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="warning.main" sx={{ mt: 0.5 }}>
                      {parseInt(DriversSelfPostData?.count || 0)}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              {DriversSelfPostData?.data?.map((post, idx) => (
                <Card variant="outlined" key={post.notiId || idx} sx={{ borderRadius: 2.5 }}>
                  <Box sx={{ px: 3, py: 1.5, borderBottom: `1px solid ${BRAND_COLORS.border}`, bgcolor: BRAND_COLORS.background, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700} color={BRAND_COLORS.textSecondary}>
                      POST ID: <Box component="span" sx={{ color: BRAND_COLORS.primary }}>#{post.notiId || 'N/A'}</Box>
                    </Typography>
                    <Chip
                      label={post.status === '2' ? 'Accepted' : 'Not Accepted'}
                      color={post.status === '2' ? 'success' : 'warning'}
                      size="small"
                      sx={{ fontSize: '0.7rem', height: 22 }}
                    />
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="caption" color="success.main" fontWeight={700} display="block">PICKUP</Typography>
                        <Typography variant="body2" sx={{ mb: 1.5 }}>{post.pick_address || '—'}</Typography>
                        <Typography variant="caption" color="error.main" fontWeight={700} display="block">DROP</Typography>
                        <Typography variant="body2">{post.drop_address || '—'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Total Fare:</Typography>
                          <Typography variant="body2" fontWeight={700}>₹{parseFloat(post.total_price || 0).toFixed(2)}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="error.main">Commission:</Typography>
                          <Typography variant="body2" color="error.main">- ₹{parseFloat(post.commission || 0).toFixed(2)}</Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" fontWeight={600}>Driver Earning:</Typography>
                          <Typography variant="subtitle2" fontWeight={700} color="success.main">₹{parseFloat(post.driver_earning || 0).toFixed(2)}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </TabPanel>

          {/* TAB 7: Real Time Bookings */}
          <TabPanel value={tabValue} index={7}>
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                    <Typography variant="caption" color="success.dark" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                      Total Earning
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="success.main" sx={{ mt: 0.5 }}>
                      ₹{parseFloat(RealtimeBookingData?.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#fef2f2', borderColor: '#fecaca' }}>
                    <Typography variant="caption" color="error.dark" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                      Total Commission
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="error.main" sx={{ mt: 0.5 }}>
                      ₹{parseFloat(RealtimeBookingData?.total_commission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#fff7ed', borderColor: '#fed7aa' }}>
                    <Typography variant="caption" color="warning.dark" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                      Total Accepted Bookings
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="warning.main" sx={{ mt: 0.5 }}>
                      {parseInt(RealtimeBookingData?.count || 0)}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              {RealtimeBookingData?.data?.map((booking, idx) => (
                <Card variant="outlined" key={booking.trip_id || idx} sx={{ borderRadius: 2.5 }}>
                  <Box sx={{ px: 3, py: 1.5, borderBottom: `1px solid ${BRAND_COLORS.border}`, bgcolor: BRAND_COLORS.background, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700} color={BRAND_COLORS.textSecondary}>
                      RIDE ID: <Box component="span" sx={{ color: BRAND_COLORS.primary }}>#{booking.trip_id || 'N/A'}</Box>
                    </Typography>
                    <Chip
                      label={booking.status === 4 ? 'Accepted' : 'Not Accepted'}
                      color={booking.status === 4 ? 'success' : 'warning'}
                      size="small"
                      sx={{ fontSize: '0.7rem', height: 22 }}
                    />
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="caption" color="success.main" fontWeight={700} display="block">PICKUP</Typography>
                        <Typography variant="body2" sx={{ mb: 1.5 }}>{booking.pickup_address || '—'}</Typography>
                        <Typography variant="caption" color="error.main" fontWeight={700} display="block">DROP</Typography>
                        <Typography variant="body2">{booking.drop_address || '—'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="caption" color="text.secondary">Customer:</Typography>
                          <Typography variant="caption" fontWeight={600}>{booking.customer?.first_name} {booking.customer?.last_name || ''}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Total Fare:</Typography>
                          <Typography variant="body2" fontWeight={700}>₹{parseFloat(booking.total || 0).toFixed(2)}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="error.main">Commission:</Typography>
                          <Typography variant="body2" color="error.main">- ₹{parseFloat(booking.company_amount || 0).toFixed(2)}</Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" fontWeight={600}>Driver Earning:</Typography>
                          <Typography variant="subtitle2" fontWeight={700} color="success.main">₹{parseFloat(booking.driver_earning || 0).toFixed(2)}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </TabPanel>

          {/* TAB 8: My Partner Duty */}
          <TabPanel value={tabValue} index={8}>
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#fff7ed', borderColor: '#fed7aa' }}>
                    <Typography variant="caption" color="warning.dark" sx={{ fontWeight: 800 }}>TOTAL BOOKINGS</Typography>
                    <Typography variant="h6" fontWeight={700} color="warning.main" sx={{ mt: 0.5 }}>{parseInt(myPartnerDutyData?.count || 0)}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#e0f2fe', borderColor: '#7dd3fc' }}>
                    <Typography variant="caption" color="info.dark" sx={{ fontWeight: 800 }}>ACCEPTED BOOKINGS</Typography>
                    <Typography variant="h6" fontWeight={700} color="info.main" sx={{ mt: 0.5 }}>{parseInt(myPartnerDutyData?.total_accepted || 0)}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                    <Typography variant="caption" color="success.dark" sx={{ fontWeight: 800 }}>TOTAL AMOUNT</Typography>
                    <Typography variant="h6" fontWeight={700} color="success.main" sx={{ mt: 0.5 }}>₹{parseFloat(myPartnerDutyData?.total_amount || 0).toFixed(2)}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#fef2f2', borderColor: '#fecaca' }}>
                    <Typography variant="caption" color="error.dark" sx={{ fontWeight: 800 }}>TOTAL EARNING</Typography>
                    <Typography variant="h6" fontWeight={700} color="error.main" sx={{ mt: 0.5 }}>₹{parseFloat(myPartnerDutyData?.total_commission || 0).toFixed(2)}</Typography>
                  </Card>
                </Grid>
              </Grid>

              {myPartnerDutyData?.data?.map((duty, idx) => (
                <Card variant="outlined" key={duty.notiId || idx} sx={{ borderRadius: 2.5 }}>
                  <Box sx={{ px: 3, py: 1.5, borderBottom: `1px solid ${BRAND_COLORS.border}`, bgcolor: BRAND_COLORS.background, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700} color={BRAND_COLORS.textSecondary}>
                      DUTY ID: <Box component="span" sx={{ color: BRAND_COLORS.primary }}>#{duty.notiId || 'N/A'}</Box>
                    </Typography>
                    <Chip
                      label={duty.status === '2' ? 'Accepted' : 'Not Accepted'}
                      color={duty.status === '2' ? 'success' : 'warning'}
                      size="small"
                      sx={{ fontSize: '0.7rem', height: 22 }}
                    />
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="caption" color="success.main" fontWeight={700} display="block">PICKUP</Typography>
                        <Typography variant="body2" sx={{ mb: 1.5 }}>{duty.pick_address || '—'}</Typography>
                        <Typography variant="caption" color="error.main" fontWeight={700} display="block">DROP</Typography>
                        <Typography variant="body2">{duty.drop_address || '—'}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Total Fare:</Typography>
                          <Typography variant="body2" fontWeight={700}>₹{parseFloat(duty.total_price || 0).toFixed(2)}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="error.main">Commission:</Typography>
                          <Typography variant="body2" color="error.main">- ₹{parseFloat(duty.commission || 0).toFixed(2)}</Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" fontWeight={600}>Driver Earning:</Typography>
                          <Typography variant="subtitle2" fontWeight={700} color="success.main">₹{parseFloat(duty.driver_earning || 0).toFixed(2)}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </TabPanel>
        </Box>
      </Paper>

      {/* Dialogs */}
      <AddMembershipDialog
        open={membershipDialogOpen}
        onClose={() => setMembershipDialogOpen(false)}
        driverId={data.id}
      />

      {/* Disable Driver Dialog */}
      <Dialog
        open={disableDialogOpen}
        onClose={() => setDisableDialogOpen(false)}
        PaperProps={{ sx: { width: '450px', borderRadius: 2 } }}
      >
        <DialogTitle sx={{ color: BRAND_COLORS.textPrimary, fontWeight: 600 }}>
          {isEnableMode ? 'Enable Driver Profile' : 'Disable Driver Profile'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color={BRAND_COLORS.textSecondary} sx={{ mb: 3 }}>
            {isEnableMode
              ? 'Are you sure you want to enable this driver? They will be able to receive bookings again.'
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
          <Button onClick={() => setDisableDialogOpen(false)} color="inherit">
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
            {isEnableMode ? 'Confirm Enable' : 'Confirm Disable'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Vehicle Dialog */}
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

      <ToastMessage
        open={toastOpen}
        message={toastMessage}
        severity={toastSeverity}
        onClose={() => setToastOpen(false)}
      />
    </Box>
  );
};

export default DriverDetailsView;

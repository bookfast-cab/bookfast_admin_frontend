import React, { useEffect, useState, useMemo } from 'react';
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
  TextField,
  CircularProgress,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import VerifiedIcon from '@mui/icons-material/Verified';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { getTrips } from 'src/apis/tripApis';
import { formatDate } from 'src/utils/utils';
import ToastMessage from 'src/components/ToastMessage';

// BookFast Brand Design Palette
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
  accent: '#8b5cf6'
};

const InfoRow = ({ label, value, icon = null, highlight = false, isCopyable = false, onCopy = null }) => (
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
      <Box display="flex" alignItems="center" gap={0.5}>
        <Typography
          variant="body2"
          color={highlight ? BRAND_COLORS.primary : BRAND_COLORS.textPrimary}
          fontWeight={highlight ? 600 : 400}
          sx={{ wordBreak: 'break-word' }}
        >
          {value ?? '—'}
        </Typography>
        {isCopyable && value && value !== '—' && (
          <Tooltip title={`Copy ${label}`}>
            <IconButton size="small" onClick={() => onCopy && onCopy(value)} sx={{ p: 0.2 }}>
              <ContentCopyIcon sx={{ fontSize: 14, color: BRAND_COLORS.textSecondary }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Grid>
  </Grid>
);

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`customer-tabpanel-${index}`}
    aria-labelledby={`customer-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const CustomerDetailsView = ({ data = {}, onCustomerUpdate }) => {
  const [tabValue, setTabValue] = useState(0);
  const [customerData, setCustomerData] = useState(data || {});

  // Dialog States
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // Edit Customer Form State
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    gender: '',
    city: '',
    status: 1
  });

  // Data Collections (Trips)
  const [tripData, setTripData] = useState([]);
  const [tripFilter, setTripFilter] = useState('all'); // all, completed, cancelled, ongoing
  const [loadingTrips, setLoadingTrips] = useState(false);

  // Toast State
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');

  const getToken = () => {
    
    return typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';
  };

  const showToast = (message, severity = 'success') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleCopy = (text) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(String(text));
      showToast('Copied to clipboard!', 'info');
    }
  };

  // Sync state when props data changes
  useEffect(() => {
    if (data && data.id) {
      setCustomerData(data);
      setEditFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone_number: data.phone_number || '',
        email: data.email || '',
        gender: data.gender || '',
        city: data.city || '',
        status: data.status !== undefined ? data.status : 1
      });
    }
  }, [data]);

  // Fetch full customer details
  const fetchFreshCustomerDetails = async () => {
    if (!customerData?.id) return;
    try {
      const token = getToken();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customer/${customerData.id}`, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json'
        }
      });
      const result = await res.json();
      if (result.success && result.data) {
        setCustomerData(result.data);
        if (onCustomerUpdate) {
          onCustomerUpdate(result.data);
        }
        showToast('Customer data refreshed!', 'success');
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
    }
  };

  // Fetch customer trips from API
  const fetchCustomerTrips = async () => {
    if (!customerData?.id) return;
    setLoadingTrips(true);
    try {
      const token = getToken();

      const result = await getTrips({
        page: 0,
        perPage: 50,
        type: '',
        token,
        customer_id: customerData.id
      });
      if (result.success && Array.isArray(result.data)) {
        setTripData(result.data);
      } else {
        setTripData([]);
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    } finally {
      setLoadingTrips(false);
    }
  };

  // Initial load of trips
  useEffect(() => {
    if (customerData?.id) {
      fetchCustomerTrips();
    }
  }, [customerData?.id]);

  // Handle Edit Submit
  const handleSaveCustomer = async () => {
    if (!customerData?.id) return;
    try {
      const token = getToken();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customers/${customerData.id}`, {
        method: 'PUT',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });
      const result = await res.json();
      if (result.success) {
        showToast('Customer profile updated successfully!', 'success');
        setCustomerData((prev) => ({ ...prev, ...editFormData }));
        if (onCustomerUpdate) {
          onCustomerUpdate(editFormData);
        }
        setEditDialogOpen(false);
      } else {
        showToast(result.message || 'Failed to update customer', 'error');
      }
    } catch (err) {
      console.error('Save customer error:', err);
      showToast('Error updating customer', 'error');
    }
  };

  // Handle Toggle Status
  const handleToggleStatus = async () => {
    if (!customerData?.id) return;
    const newStatus = customerData.status === 1 ? 0 : 1;
    try {
      const token = getToken();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customers/${customerData.id}`, {
        method: 'PUT',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await res.json();
      if (result.success) {
        showToast(`Customer ${newStatus === 1 ? 'activated' : 'deactivated'} successfully!`, 'success');
        setCustomerData((prev) => ({ ...prev, status: newStatus }));
        if (onCustomerUpdate) {
          onCustomerUpdate({ status: newStatus });
        }
        setStatusDialogOpen(false);
      } else {
        showToast(result.message || 'Failed to change status', 'error');
      }
    } catch (err) {
      console.error('Status toggle error:', err);
      showToast('Error updating status', 'error');
    }
  };

  const fullName = `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() || 'Customer';

  const initials = fullName
    ? fullName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'CU';

  // Dynamic calculations from real trips data
  const tripMetrics = useMemo(() => {
    const total = tripData.length;
    const completed = tripData.filter((t) => t.status === 5).length;
    const cancelled = tripData.filter((t) => t.status === 6).length;
    const ongoing = tripData.filter((t) => [1, 2, 3, 4, 7, 8].includes(t.status)).length;

    const totalSpent = tripData
      .filter((t) => t.status === 5)
      .reduce((sum, t) => sum + parseFloat(t.total || 0), 0);

    return { total, completed, cancelled, ongoing, totalSpent };
  }, [tripData]);

  // Filtered trips
  const filteredTrips = useMemo(() => {
    if (tripFilter === 'completed') return tripData.filter((t) => t.status === 5);
    if (tripFilter === 'cancelled') return tripData.filter((t) => t.status === 6);
    if (tripFilter === 'ongoing') return tripData.filter((t) => [1, 2, 3, 4, 7, 8].includes(t.status));

    return tripData;
  }, [tripData, tripFilter]);

  // Trip type map
  const tripTypeLabel = (type) => {
    const map = { 1: 'Local Ride', 2: 'Rental Trip', 3: 'Outstation' };

    return map[type] || 'Standard Ride';
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {/* ----------------- TOP HEADER CARD ----------------- */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 2.5,
          border: `1px solid ${BRAND_COLORS.border}`,
          backgroundColor: BRAND_COLORS.paper,
          mb: 3
        }}
      >
        <Grid container spacing={2.5} alignItems="center">
          {/* Avatar & Basic Info */}
          <Grid item xs={12} md={7}>
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Avatar
                src={
                  customerData.profile_picture
                    ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''}/${customerData.profile_picture}`
                    : ''
                }
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: BRAND_COLORS.primary,
                  color: '#ffffff',
                  fontSize: 24,
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                }}
              >
                {initials}
              </Avatar>

              <Box>
                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                  <Typography variant="h5" fontWeight={700} color={BRAND_COLORS.textPrimary}>
                    {fullName}
                  </Typography>

                  <Chip
                    size="small"
                    label={customerData.status === 1 ? 'Active' : 'Inactive'}
                    color={customerData.status === 1 ? 'success' : 'default'}
                    icon={
                      customerData.status === 1 ? (
                        <CheckCircleOutline sx={{ fontSize: 14 }} />
                      ) : (
                        <CancelIcon sx={{ fontSize: 14 }} />
                      )
                    }
                    sx={{ fontWeight: 600, fontSize: 12 }}
                  />

                  <Chip
                    size="small"
                    variant="outlined"
                    label={`ID: #${customerData.id || '—'}`}
                    sx={{
                      borderColor: BRAND_COLORS.border,
                      color: BRAND_COLORS.textSecondary,
                      fontWeight: 600
                    }}
                  />

                  {customerData.wallet != null && (
                    <Chip
                      size="small"
                      icon={<AccountBalanceWalletIcon sx={{ fontSize: 14 }} />}
                      label={`Wallet: ₹${parseFloat(customerData.wallet).toFixed(2)}`}
                      sx={{
                        borderColor: BRAND_COLORS.primaryLight,
                        bgcolor: BRAND_COLORS.primaryLight,
                        color: BRAND_COLORS.primary,
                        fontWeight: 700
                      }}
                    />
                  )}
                </Stack>

                <Stack direction="row" spacing={2} mt={1} flexWrap="wrap" alignItems="center">
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <PhoneIcon sx={{ fontSize: 16, color: BRAND_COLORS.textSecondary }} />
                    <Typography variant="body2" color={BRAND_COLORS.textSecondary} fontWeight={500}>
                      {customerData.phone_with_code || customerData.phone_number || '—'}
                    </Typography>
                    {(customerData.phone_with_code || customerData.phone_number) && (
                      <Tooltip title="Copy Phone">
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(customerData.phone_with_code || customerData.phone_number)}
                          sx={{ p: 0.2 }}
                        >
                          <ContentCopyIcon sx={{ fontSize: 13, color: BRAND_COLORS.textSecondary }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>

                  {customerData.email && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <EmailIcon sx={{ fontSize: 16, color: BRAND_COLORS.textSecondary }} />
                      <Typography variant="body2" color={BRAND_COLORS.textSecondary}>
                        {customerData.email}
                      </Typography>
                    </Box>
                  )}

                  {customerData.city && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <LocationOnIcon sx={{ fontSize: 16, color: BRAND_COLORS.textSecondary }} />
                      <Typography variant="body2" color={BRAND_COLORS.textSecondary}>
                        {customerData.city}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Grid>

          {/* Quick Header Action Buttons */}
          {/* <Grid item xs={12} md={5}>
            <Stack
              direction="row"
              spacing={1}
              justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
              flexWrap="wrap"
            >
              <Button
                variant="outlined"
                size="small"
                color={customerData.status === 1 ? 'error' : 'success'}
                onClick={() => setStatusDialogOpen(true)}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
              >
                {customerData.status === 1 ? 'Deactivate' : 'Activate'}
              </Button>

              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setEditDialogOpen(true)}
                sx={{
                  borderColor: BRAND_COLORS.border,
                  color: BRAND_COLORS.textPrimary,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2
                }}
              >
                Edit
              </Button>

              <Tooltip title="Refresh Customer Data">
                <IconButton
                  size="small"
                  onClick={fetchFreshCustomerDetails}
                  sx={{
                    border: `1px solid ${BRAND_COLORS.border}`,
                    borderRadius: 2,
                    color: BRAND_COLORS.textSecondary
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid> */}
        </Grid>
      </Paper>

      {/* ----------------- 2 TABS NAVIGATION: INFO & TRIPS ----------------- */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: `1px solid ${BRAND_COLORS.border}`,
          backgroundColor: BRAND_COLORS.paper,
          p: { xs: 2, md: 3 }
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(_, val) => setTabValue(val)}
          sx={{
            borderBottom: `1px solid ${BRAND_COLORS.border}`,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.92rem',
              minHeight: 48,
              color: BRAND_COLORS.textSecondary,
              '&.Mui-selected': {
                color: BRAND_COLORS.primary
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: BRAND_COLORS.primary,
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Personal Info" />
          <Tab
            icon={<DirectionsCarIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={`Trips (${tripData.length})`}
          />
        </Tabs>

        {/* ============================================================== */}
        {/* TAB 0: PERSONAL INFO                                           */}
        {/* ============================================================== */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* 1. Personal & Contact Details Card */}
            <Grid item xs={12} md={6}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: BRAND_COLORS.border,
                  height: '100%',
                  boxShadow: 'none'
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: BRAND_COLORS.primaryLight,
                        color: BRAND_COLORS.primary
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={700} color={BRAND_COLORS.textPrimary}>
                      Personal & Contact Details
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <InfoRow label="First Name" value={customerData.first_name || '—'} />
                  <InfoRow label="Last Name" value={customerData.last_name || '—'} />
                  <InfoRow
                    label="Phone Number"
                    value={customerData.phone_with_code || customerData.phone_number || '—'}
                    icon={<PhoneIcon sx={{ fontSize: 16 }} />}
                    isCopyable
                    onCopy={handleCopy}
                  />
                  <InfoRow
                    label="Email Address"
                    value={customerData.email || '—'}
                    icon={<EmailIcon sx={{ fontSize: 16 }} />}
                    isCopyable
                    onCopy={handleCopy}
                  />
                  <InfoRow
                    label="Gender"
                    value={
                      customerData.gender
                        ? customerData.gender.charAt(0).toUpperCase() + customerData.gender.slice(1)
                        : '—'
                    }
                  />
                  <InfoRow
                    label="City"
                    value={customerData.city || '—'}
                    icon={<LocationOnIcon sx={{ fontSize: 16 }} />}
                  />
                  <InfoRow label="Country Code" value={customerData.country_code || '—'} />
                  <InfoRow label="Country ID" value={customerData.country_id || '—'} />
                </CardContent>
              </Card>
            </Grid>

            {/* 2. Account & Registration Details Card */}
            <Grid item xs={12} md={6}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: BRAND_COLORS.border,
                  height: '100%',
                  boxShadow: 'none'
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: '#fef3c7',
                        color: BRAND_COLORS.warning
                      }}
                    >
                      <VerifiedIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={700} color={BRAND_COLORS.textPrimary}>
                      Account & App Details
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <InfoRow
                    label="Customer ID"
                    value={customerData.id}
                    highlight
                    isCopyable
                    onCopy={handleCopy}
                  />
                  <InfoRow
                    label="Account Status"
                    value={customerData.status === 1 ? 'Active' : 'Inactive'}
                    highlight={customerData.status === 1}
                  />
                  <InfoRow
                    label="Wallet Balance"
                    value={
                      customerData.wallet != null
                        ? `₹${parseFloat(customerData.wallet).toFixed(2)}`
                        : '₹0.00'
                    }
                    icon={<AccountBalanceWalletIcon sx={{ fontSize: 16 }} />}
                  />
                  <InfoRow
                    label="Referral Code"
                    value={customerData.referral_code || '—'}
                    highlight
                    isCopyable
                    onCopy={handleCopy}
                  />
                  <InfoRow label="Referred By" value={customerData.refered_by || '—'} />
                  <InfoRow
                    label="Joining Date"
                    value={
                      customerData.created_at
                        ? new Date(customerData.created_at).toLocaleString('en-GB')
                        : '—'
                    }
                    icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />}
                  />
                  <InfoRow
                    label="Last Updated"
                    value={
                      customerData.updated_at
                        ? new Date(customerData.updated_at).toLocaleString('en-GB')
                        : '—'
                    }
                  />
                  <InfoRow
                    label="FCM Push Token"
                    value={customerData.fcm_token ? 'Available' : '—'}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* ============================================================== */}
        {/* TAB 1: TRIPS                                                   */}
        {/* ============================================================== */}
        <TabPanel value={tabValue} index={1}>
          {/* Summary Metric Cards */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: BRAND_COLORS.border }}>
                <Typography variant="caption" color={BRAND_COLORS.textSecondary} fontWeight={600}>
                  TOTAL BOOKINGS
                </Typography>
                <Typography variant="h5" fontWeight={700} color={BRAND_COLORS.primary} mt={0.5}>
                  {tripMetrics.total}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: BRAND_COLORS.border }}>
                <Typography variant="caption" color={BRAND_COLORS.textSecondary} fontWeight={600}>
                  COMPLETED RIDES
                </Typography>
                <Typography variant="h5" fontWeight={700} color={BRAND_COLORS.success} mt={0.5}>
                  {tripMetrics.completed}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: BRAND_COLORS.border }}>
                <Typography variant="caption" color={BRAND_COLORS.textSecondary} fontWeight={600}>
                  CANCELLED RIDES
                </Typography>
                <Typography variant="h5" fontWeight={700} color={BRAND_COLORS.error} mt={0.5}>
                  {tripMetrics.cancelled}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: BRAND_COLORS.border }}>
                <Typography variant="caption" color={BRAND_COLORS.textSecondary} fontWeight={600}>
                  TOTAL SPENT ON RIDES
                </Typography>
                <Typography variant="h5" fontWeight={700} color={BRAND_COLORS.textPrimary} mt={0.5}>
                  ₹{tripMetrics.totalSpent.toFixed(2)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Filter Chips Bar */}
          <Stack direction="row" spacing={1} mb={2.5} flexWrap="wrap">
            <Chip
              label={`All (${tripData.length})`}
              color={tripFilter === 'all' ? 'primary' : 'default'}
              variant={tripFilter === 'all' ? 'filled' : 'outlined'}
              onClick={() => setTripFilter('all')}
              sx={{ fontWeight: 600, cursor: 'pointer' }}
            />
            <Chip
              label={`Completed (${tripMetrics.completed})`}
              color={tripFilter === 'completed' ? 'success' : 'default'}
              variant={tripFilter === 'completed' ? 'filled' : 'outlined'}
              onClick={() => setTripFilter('completed')}
              sx={{ fontWeight: 600, cursor: 'pointer' }}
            />
            <Chip
              label={`Cancelled (${tripMetrics.cancelled})`}
              color={tripFilter === 'cancelled' ? 'error' : 'default'}
              variant={tripFilter === 'cancelled' ? 'filled' : 'outlined'}
              onClick={() => setTripFilter('cancelled')}
              sx={{ fontWeight: 600, cursor: 'pointer' }}
            />
            <Chip
              label={`Ongoing (${tripMetrics.ongoing})`}
              color={tripFilter === 'ongoing' ? 'info' : 'default'}
              variant={tripFilter === 'ongoing' ? 'filled' : 'outlined'}
              onClick={() => setTripFilter('ongoing')}
              sx={{ fontWeight: 600, cursor: 'pointer' }}
            />
          </Stack>

          {/* Trips List */}
          {loadingTrips ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress size={36} />
            </Box>
          ) : filteredTrips.length > 0 ? (
            <Stack spacing={2}>
              {filteredTrips.map((trip) => {
                const isCompleted = trip.status === 5;
                const isCancelled = trip.status === 6;

                return (
                  <Card
                    key={trip.id}
                    variant="outlined"
                    sx={{
                      borderRadius: 2.5,
                      borderColor: BRAND_COLORS.border,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: BRAND_COLORS.primary,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      {/* Top Row: Trip ID, Type, Date, Status */}
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={1}
                        mb={1.5}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="small"
                            label={trip.trip_id || `ID: #${trip.id}`}
                            sx={{ fontWeight: 700, bgcolor: BRAND_COLORS.primaryLight, color: BRAND_COLORS.primary }}
                          />
                          <Chip
                            size="small"
                            variant="outlined"
                            label={tripTypeLabel(trip.trip_type)}
                            sx={{ fontWeight: 600, borderColor: BRAND_COLORS.border }}
                          />
                        </Stack>

                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Typography variant="caption" color={BRAND_COLORS.textSecondary}>
                            {trip.pickup_date ? formatDate(trip.pickup_date) : '—'}
                          </Typography>

                          <Chip
                            size="small"
                            label={
                              isCompleted
                                ? 'Completed'
                                : isCancelled
                                ? 'Cancelled'
                                : trip.status === 2
                                ? 'Accepted'
                                : trip.status === 4
                                ? 'In Progress'
                                : 'Pending'
                            }
                            color={isCompleted ? 'success' : isCancelled ? 'error' : 'info'}
                            sx={{ fontWeight: 600 }}
                          />
                        </Stack>
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      {/* Middle: Pickup & Drop Route */}
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                          {/* Pickup */}
                          <Box display="flex" alignItems="flex-start" gap={1.5} mb={1}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: BRAND_COLORS.success,
                                mt: 0.6,
                                flexShrink: 0
                              }}
                            />
                            <Box>
                              <Typography variant="caption" color={BRAND_COLORS.textSecondary} fontWeight={600}>
                                PICKUP LOCATION
                              </Typography>
                              <Typography variant="body2" color={BRAND_COLORS.textPrimary} fontWeight={500}>
                                {trip.pickup_address || '—'}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Drop */}
                          <Box display="flex" alignItems="flex-start" gap={1.5}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: BRAND_COLORS.error,
                                mt: 0.6,
                                flexShrink: 0
                              }}
                            />
                            <Box>
                              <Typography variant="caption" color={BRAND_COLORS.textSecondary} fontWeight={600}>
                                DROP LOCATION
                              </Typography>
                              <Typography variant="body2" color={BRAND_COLORS.textPrimary} fontWeight={500}>
                                {trip.drop_address || '—'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Right: Distance, Driver, Fare */}
                        <Grid item xs={12} md={4}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: BRAND_COLORS.background,
                              border: `1px solid ${BRAND_COLORS.border}`
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                              <Typography variant="caption" color={BRAND_COLORS.textSecondary}>
                                Distance:
                              </Typography>
                              <Typography variant="caption" fontWeight={700} color={BRAND_COLORS.textPrimary}>
                                {trip.distance ? `${trip.distance} km` : '—'}
                              </Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                              <Typography variant="caption" color={BRAND_COLORS.textSecondary}>
                                Total Fare:
                              </Typography>
                              <Typography variant="subtitle2" fontWeight={800} color={BRAND_COLORS.primary}>
                                {trip.total != null ? `₹${trip.total}` : '—'}
                              </Typography>
                            </Box>

                            {trip.driver ? (
                              <Box display="flex" justifyContent="space-between" mt={0.5}>
                                <Typography variant="caption" color={BRAND_COLORS.textSecondary}>
                                  Driver:
                                </Typography>
                                <Typography variant="caption" fontWeight={600} color={BRAND_COLORS.textPrimary}>
                                  {trip.driver.driverName || 'Assigned'}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="caption" color={BRAND_COLORS.textSecondary} display="block" mt={0.5}>
                                Driver: Not Assigned
                              </Typography>
                            )}

                            {isCancelled && (
                              <Typography
                                variant="caption"
                                color={BRAND_COLORS.error}
                                display="block"
                                mt={0.5}
                                fontWeight={600}
                              >
                                Reason: {trip.cancelledReason || `Cancelled by ${trip.cancelledBy || 'system'}`}
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: 2,
                borderColor: BRAND_COLORS.border,
                bgcolor: BRAND_COLORS.background
              }}
            >
              <DirectionsCarIcon sx={{ fontSize: 48, color: BRAND_COLORS.textSecondary, mb: 1, opacity: 0.6 }} />
              <Typography variant="h6" fontWeight={600} color={BRAND_COLORS.textPrimary}>
                No Trips Found
              </Typography>
              <Typography variant="body2" color={BRAND_COLORS.textSecondary} mt={0.5}>
                {tripFilter !== 'all'
                  ? `No ${tripFilter} rides found for this customer.`
                  : 'This customer has not booked any rides yet.'}
              </Typography>
            </Paper>
          )}
        </TabPanel>
      </Paper>

      {/* ----------------- DIALOG: EDIT CUSTOMER ----------------- */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Customer Details</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="First Name"
                value={editFormData.first_name}
                onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Last Name"
                value={editFormData.last_name}
                onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Phone Number"
                value={editFormData.phone_number}
                onChange={(e) => setEditFormData({ ...editFormData, phone_number: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Email Address"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="edit-gender-label">Gender</InputLabel>
                <Select
                  labelId="edit-gender-label"
                  label="Gender"
                  value={editFormData.gender || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                >
                  <MenuItem value="">Not Specified</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="transgender">Transgender</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="City"
                value={editFormData.city}
                onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveCustomer}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* ----------------- DIALOG: TOGGLE STATUS ----------------- */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {customerData.status === 1 ? 'Deactivate Customer' : 'Activate Customer'}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Are you sure you want to {customerData.status === 1 ? 'deactivate' : 'activate'}{' '}
            <strong>{fullName}</strong> (ID: #{customerData.id})?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={customerData.status === 1 ? 'error' : 'success'}
            onClick={handleToggleStatus}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <ToastMessage
        open={toastOpen}
        message={toastMessage}
        severity={toastSeverity}
        onClose={() => setToastOpen(false)}
      />
    </Box>
  );
};

export default CustomerDetailsView;

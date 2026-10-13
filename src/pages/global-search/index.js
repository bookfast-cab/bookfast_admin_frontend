import React, { useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import getFingerprint from 'src/utils/Fingerprint';
import DriverDetailsView from 'src/views/global-search/DriverDetailsView';
import CustomerDetailsView from 'src/views/global-search/CustomerDetailsView';
import TripDrawer from '../trips/TripDrawer';

const safeFormatDate = (dateStr, onlyDate = false) => {
  if (!dateStr || dateStr === '0000-00-00' || dateStr === '0000-00-00 00:00:00') return '-';
  if (typeof dateStr === 'object' && !(dateStr instanceof Date)) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    if (onlyDate) {

      return d.toLocaleDateString('en-GB'); // DD/MM/YYYY

    }

    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch {

    return String(dateStr);
  }
};

const formatDisplayValue = (val) => {
  if (val === null || val === undefined || val === '') return '-';
  if (React.isValidElement(val)) return val;
  if (typeof val === 'object') {
    if (Array.isArray(val)) {
      if (val.length === 0) return '-';

      return val.map((item) => formatDisplayValue(item)).join(', ') || '-';
    }
    if (val.name !== undefined && val.name !== null && val.name !== '') return String(val.name);
    if (val.vehicle_type !== undefined && val.vehicle_type !== null && val.vehicle_type !== '') return String(val.vehicle_type);
    if (val.title !== undefined && val.title !== null && val.title !== '') return String(val.title);
    if (val.label !== undefined && val.label !== null && val.label !== '') return String(val.label);
    if (val.id !== undefined && val.id !== null && val.id !== '') return String(val.id);
    try {
      const json = JSON.stringify(val);

      return json === '{}' ? '-' : json;
    } catch {

      return '-';
    }
  }

  return val;
};

const KeyValueRow = ({ label, value, isGreen, isLink, onEdit, editTooltip }) => {
  const displayVal = formatDisplayValue(value);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', py: 0.6 }}>
      <Typography
        sx={{
          width: '52%',
          fontSize: '13.5px',
          color: '#475467',
          fontWeight: 500,
          pr: 1
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ width: '4%', fontSize: '13.5px', color: '#667085', fontWeight: 600 }}>
        :
      </Typography>
      <Box sx={{ width: '44%', display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {isGreen ? (
          <Typography sx={{ fontSize: '13.5px', color: '#16a34a', fontWeight: 600 }}>
            {displayVal}
          </Typography>
        ) : isLink ? (
          <Typography
            component="a"
            href={isLink}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontSize: '13.5px',
              color: '#1976d2',
              fontWeight: 500,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            {displayVal}
          </Typography>
        ) : (
          <Typography sx={{ fontSize: '13.5px', color: '#101828', fontWeight: 500, wordBreak: 'break-word' }}>
            {displayVal}
          </Typography>
        )}
        {onEdit && (
          <Tooltip title={editTooltip || "Edit"}>
            <IconButton size="small" onClick={onEdit} sx={{ p: 0.2, ml: 0.5, color: '#475467' }}>
              <EditIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

const GlobalSearch = () => {
  // Customer Search states
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSearchType, setCustomerSearchType] = useState('mobile');
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerResults, setCustomerResults] = useState([]);

  // Driver Search states
  const [driverSearch, setDriverSearch] = useState('');
  const [driverSearchType, setDriverSearchType] = useState('driver_number');
  const [driverLoading, setDriverLoading] = useState(false);
  const [driverResults, setDriverResults] = useState([]);

  // Ride Search states
  const [tripSearch, setTripSearch] = useState('');
  const [tripSearchType, setTripSearchType] = useState('trip_id');
  const [tripLoading, setTripLoading] = useState(false);
  const [tripResults, setTripResults] = useState([]);

  // Active Selected Detail states
  const [activeType, setActiveType] = useState(null); // 'user' | 'driver' | 'ride'
  const [activeRecord, setActiveRecord] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Drawer states
  const [driverDrawerOpen, setDriverDrawerOpen] = useState(false);
  const [tripDrawerOpen, setTripDrawerOpen] = useState(false);

  // Edit DOB states
  const [dobDialogOpen, setDobDialogOpen] = useState(false);
  const [editingDob, setEditingDob] = useState('');

  // Toast notification
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const showToast = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const getToken = () => {
    if (typeof window !== 'undefined') {

      return localStorage.getItem('access_token') || '';

    }

    return '';
  };

  // 1. Search Customer / User
  const handleCustomerSearch = async () => {
    if (!customerSearch.trim()) {
      showToast('Please enter a User ID, Email, or Phone number', 'warning');

      return;
    }

    setCustomerLoading(true);
    try {
      const token = getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customer-search?search=${encodeURIComponent(customerSearch.trim())}&searchType=${customerSearchType}`,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );
      const data = await response.json();
      const list = Array.isArray(data.data) ? data.data : (data.data ? [data.data] : []);

      if (list.length > 0) {
        setCustomerResults(list);
        setSelectedIndex(0);

        let mainCustomer = list[0];
        try {
          const detailRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customer/${mainCustomer.id}`, {
            headers: {
              Authorization: token,
              'Content-Type': 'application/json'
            }
          });
          const detailData = await detailRes.json();
          if (detailData.success && detailData.data) {
            mainCustomer = { ...mainCustomer, ...detailData.data };
          }
        } catch (detailErr) {
          console.warn('Could not fetch full customer details', detailErr);
        }

        setActiveRecord(mainCustomer);
        setActiveType('user');
        showToast(`Found ${list.length} user record(s)`, 'success');
      } else {
        setCustomerResults([]);
        showToast('No user found matching search query', 'error');
      }
    } catch (err) {
      console.error('Customer search error', err);
      showToast('Error searching customer', 'error');
    } finally {
      setCustomerLoading(false);
    }
  };

  // 2. Search Driver
  const handleDriverSearch = async () => {
    if (!driverSearch.trim()) {
      showToast('Please enter Driver ID, Phone, or Vehicle No', 'warning');

      return;
    }

    setDriverLoading(true);
    try {
      const token = getToken();
      const deviceId = await getFingerprint().catch(() => '');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/drivers?page=1&perPage=10&search=${encodeURIComponent(driverSearch.trim())}&searchType=${driverSearchType}&sort=DESC&sortColumn=id`,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
            'x-device-id': deviceId
          }
        }
      );
      const data = await response.json();
      const list = Array.isArray(data.data) ? data.data : (data.data ? [data.data] : []);

      if (list.length > 0) {
        setDriverResults(list);
        setSelectedIndex(0);

        // Fetch detailed driver data to get device and full profile
        let mainDriver = list[0];
        try {
          const detailRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/driver/${mainDriver.id}`, {
            headers: {
              Authorization: token,
              'Content-Type': 'application/json',
              'x-device-id': deviceId
            }
          });
          const detailData = await detailRes.json();
          if (detailData.success && detailData.data) {
            mainDriver = { ...mainDriver, ...detailData.data };
          }
        } catch (detailErr) {
          console.warn('Could not fetch full driver details', detailErr);
        }

        setActiveRecord(mainDriver);
        setActiveType('driver');
        showToast(`Found ${list.length} driver record(s)`, 'success');
      } else {
        setDriverResults([]);
        showToast('No driver found matching search query', 'error');
      }
    } catch (err) {
      console.error('Driver search error', err);
      showToast('Error searching driver', 'error');
    } finally {
      setDriverLoading(false);
    }
  };

  // 3. Search Ride / Trip
  const handleTripSearch = async () => {
    if (!tripSearch.trim()) {
      showToast('Please enter a Ride ID or Engagement ID', 'warning');

      return;
    }

    setTripLoading(true);
    try {
      const token = getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/ride-search/${encodeURIComponent(tripSearch.trim())}`,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );
      const data = await response.json();
      const list = Array.isArray(data.data) ? data.data : (data.data ? [data.data] : []);

      if (list.length > 0) {
        setTripResults(list);
        setActiveRecord(list[0]);
        setSelectedIndex(0);
        setActiveType('ride');
        showToast(`Found ${list.length} ride record(s)`, 'success');
      } else {
        setTripResults([]);
        showToast('No ride found matching search query', 'error');
      }
    } catch (err) {
      console.error('Trip search error', err);
      showToast('Error searching ride', 'error');
    } finally {
      setTripLoading(false);
    }
  };

  const handleSelectRecord = async (record, index) => {
    setSelectedIndex(index);
    if (activeType === 'driver' && record.id) {
      try {
        const token = getToken();
        const deviceId = await getFingerprint().catch(() => '');

        const detailRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/driver/${record.id}`, {
          headers: { Authorization: token, 'Content-Type': 'application/json', 'x-device-id': deviceId }
        });

        const detailData = await detailRes.json();
        
        if (detailData.success && detailData.data) {
          setActiveRecord({ ...record, ...detailData.data });

          return;

        }
      } catch (e) {
        console.warn(e);
      }
    } else if (activeType === 'user' && record.id) {
      try {
        const token = getToken();

        const detailRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customer/${record.id}`, {
          headers: { Authorization: token, 'Content-Type': 'application/json' }
        });

        const detailData = await detailRes.json();

        if (detailData.success && detailData.data) {
          setActiveRecord({ ...record, ...detailData.data });

          return;
        }
      } catch (e) {
        console.warn(e);
      }
    }
    setActiveRecord(record);
  };

  const handleOpenDobDialog = () => {
    const currentDob = activeRecord?.date_of_birth || activeRecord?.dob || '';
    setEditingDob(currentDob ? new Date(currentDob).toISOString().split('T')[0] : '');
    setDobDialogOpen(true);
  };

  // Save DOB
  const handleSaveDob = async () => {
    if (!editingDob) {
      showToast('Please select a date', 'warning');

      return;
    }

    const token = getToken();
    try {
      if (activeType === 'driver' && activeRecord?.id) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/drivers/${activeRecord.id}`, {
          method: 'PUT',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ date_of_birth: editingDob })
        });
        const resData = await res.json();
        if (resData.success) {
          setActiveRecord({ ...activeRecord, date_of_birth: editingDob });
          showToast('Driver Date of Birth updated successfully!', 'success');
          setDobDialogOpen(false);
        } else {
          showToast(resData.message || 'Failed to update DOB', 'error');
        }
      } else {
        setActiveRecord({ ...activeRecord, dob: editingDob, date_of_birth: editingDob });
        showToast('Date of Birth updated!', 'success');
        setDobDialogOpen(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating DOB', 'error');
    }
  };

  // Driver details calculations
  const driverStatusLabel =
    activeRecord?.isBlocked === 1
      ? 'Blocked'
      : activeRecord?.profileApproved === 1 || activeRecord?.status === 1 || activeRecord?.status === 'Active'
      ? 'Active'
      : 'Inactive';

  const driverLat = activeRecord?.latitude || activeRecord?.devicedetail?.latitude;
  const driverLng = activeRecord?.longitude || activeRecord?.devicedetail?.longitude;

  const driverMapUrl =
    driverLat && driverLng ? `https://www.google.com/maps?q=${driverLat},${driverLng}` : null;

  return (
    <>
      <Head>
        <title>Global Search | BookFast</title>
      </Head>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
          px: { xs: 2, sm: 3 },
          minHeight: '100vh',
          backgroundColor: '#f8fafc'
        }}
      >
        <Container maxWidth="xl" disableGutters>
          {/* Top Search 3-Column Panel (Exact Replica of Reference Design) */}
          <Paper
            elevation={0}
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              mb: 4,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <Grid container>
              {/* Column 1: User Details */}
              <Grid
                item
                xs={12}
                md={4}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRight: { md: '1px solid #e2e8f0' },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: '#1e293b',
                    fontSize: '16px',
                    mb: 2,
                    textAlign: 'center'
                  }}
                >
                  User Details
                </Typography>

                {/* Input with flag prefix */}
                <TextField
                  fullWidth
                  size="small"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomerSearch()}
                  placeholder={
                    customerSearchType === 'mobile'
                      ? '9000000001'
                      : customerSearchType === 'id'
                      ? 'Enter User ID'
                      : 'Enter Email'
                  }
                  InputProps={{
                    startAdornment: customerSearchType === 'mobile' && (
                      <InputAdornment position="start" sx={{ mr: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, userSelect: 'none' }}>
                          <span style={{ fontSize: '18px', lineHeight: 1 }}>🇮🇳</span>
                          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                            -
                          </Typography>
                        </Box>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    mb: 1.5,
                    '& .MuiOutlinedInput-root': {
                      height: '38px',
                      borderRadius: '4px',
                      backgroundColor: '#ffffff',
                      '& fieldset': { borderColor: '#d1d5db' },
                      '&:hover fieldset': { borderColor: '#9ca3af' },
                      '&.Mui-focused fieldset': { borderColor: '#00a8e8' }
                    }
                  }}
                />

                {/* Radio Options: User ID, Email, Phone */}
                <RadioGroup
                  row
                  value={customerSearchType}
                  onChange={(e) => setCustomerSearchType(e.target.value)}
                  sx={{
                    justifyContent: 'center',
                    mb: 2.5,
                    width: '100%',
                    '& .MuiFormControlLabel-root': {
                      mx: 0.8
                    },
                    '& .MuiTypography-root': {
                      fontSize: '13px',
                      color: '#475467',
                      fontWeight: 500
                    }
                  }}
                >
                  <FormControlLabel
                    value="id"
                    control={<Radio size="small" sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#00a8e8' } }} />}
                    label="User ID"
                  />
                  <FormControlLabel
                    value="email"
                    control={<Radio size="small" sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#00a8e8' } }} />}
                    label="Email"
                  />
                  <FormControlLabel
                    value="mobile"
                    control={<Radio size="small" sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#00a8e8' } }} />}
                    label="Phone"
                  />
                </RadioGroup>

                {/* User Details Action Button */}
                <Button
                  variant="contained"
                  onClick={handleCustomerSearch}
                  disabled={customerLoading}
                  startIcon={customerLoading && <CircularProgress size={16} color="inherit" />}
                  sx={{
                    backgroundColor: '#1aa1e5',
                    color: '#ffffff',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '13.5px',
                    px: 3.5,
                    py: 0.7,
                    borderRadius: '4px',
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: '#0288d1',
                      boxShadow: '0 2px 8px rgba(2, 136, 209, 0.25)'
                    }
                  }}
                >
                  User Details
                </Button>
              </Grid>

              {/* Column 2: Driver Details */}
              <Grid
                item
                xs={12}
                md={4}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRight: { md: '1px solid #e2e8f0' },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: '#1e293b',
                    fontSize: '16px',
                    mb: 2,
                    textAlign: 'center'
                  }}
                >
                  Driver Details
                </Typography>

                {/* Input with flag prefix */}
                <TextField
                  fullWidth
                  size="small"
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDriverSearch()}
                  placeholder={
                    driverSearchType === 'driver_number'
                      ? '8000000001'
                      : driverSearchType === 'driver_id'
                      ? 'Enter Driver ID'
                      : 'Enter Vehicle No'
                  }
                  InputProps={{
                    startAdornment: driverSearchType === 'driver_number' && (
                      <InputAdornment position="start" sx={{ mr: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, userSelect: 'none' }}>
                          <span style={{ fontSize: '18px', lineHeight: 1 }}>🇮🇳</span>
                          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                            -
                          </Typography>
                        </Box>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    mb: 1.5,
                    '& .MuiOutlinedInput-root': {
                      height: '38px',
                      borderRadius: '4px',
                      backgroundColor: '#ffffff',
                      '& fieldset': { borderColor: '#d1d5db' },
                      '&:hover fieldset': { borderColor: '#9ca3af' },
                      '&.Mui-focused fieldset': { borderColor: '#00a8e8' }
                    }
                  }}
                />

                {/* Radio Options: ID, Phone, Vehicle No */}
                <RadioGroup
                  row
                  value={driverSearchType}
                  onChange={(e) => setDriverSearchType(e.target.value)}
                  sx={{
                    justifyContent: 'center',
                    mb: 2.5,
                    width: '100%',
                    '& .MuiFormControlLabel-root': {
                      mx: 0.8
                    },
                    '& .MuiTypography-root': {
                      fontSize: '13px',
                      color: '#475467',
                      fontWeight: 500
                    }
                  }}
                >
                  <FormControlLabel
                    value="driver_id"
                    control={<Radio size="small" sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#00a8e8' } }} />}
                    label="ID"
                  />
                  <FormControlLabel
                    value="driver_number"
                    control={<Radio size="small" sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#00a8e8' } }} />}
                    label="Phone"
                  />
                  <FormControlLabel
                    value="vehicle_number"
                    control={<Radio size="small" sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#00a8e8' } }} />}
                    label="Vehicle No"
                  />
                </RadioGroup>

                {/* Driver Details Action Button */}
                <Button
                  variant="contained"
                  onClick={handleDriverSearch}
                  disabled={driverLoading}
                  startIcon={driverLoading && <CircularProgress size={16} color="inherit" />}
                  sx={{
                    backgroundColor: '#1aa1e5',
                    color: '#ffffff',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '13.5px',
                    px: 3.5,
                    py: 0.7,
                    borderRadius: '4px',
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: '#0288d1',
                      boxShadow: '0 2px 8px rgba(2, 136, 209, 0.25)'
                    }
                  }}
                >
                  Driver Details
                </Button>
              </Grid>

              {/* Column 3: Ride Details */}
              <Grid
                item
                xs={12}
                md={4}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: '#1e293b',
                    fontSize: '16px',
                    mb: 2,
                    textAlign: 'center'
                  }}
                >
                  Ride Details
                </Typography>

                {/* Input for Ride ID */}
                <TextField
                  fullWidth
                  size="small"
                  value={tripSearch}
                  onChange={(e) => setTripSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTripSearch()}
                  placeholder="Enter Engagement /Ride ID"
                  sx={{
                    mb: 1.5,
                    '& .MuiOutlinedInput-root': {
                      height: '38px',
                      borderRadius: '4px',
                      backgroundColor: '#ffffff',
                      '& fieldset': { borderColor: '#d1d5db' },
                      '&:hover fieldset': { borderColor: '#9ca3af' },
                      '&.Mui-focused fieldset': { borderColor: '#00a8e8' }
                    }
                  }}
                />

                {/* Radio Options: Ride ID */}
                <RadioGroup
                  row
                  value={tripSearchType}
                  onChange={(e) => setTripSearchType(e.target.value)}
                  sx={{
                    justifyContent: 'center',
                    mb: 2.5,
                    width: '100%',
                    '& .MuiFormControlLabel-root': {
                      mx: 0.8
                    },
                    '& .MuiTypography-root': {
                      fontSize: '13px',
                      color: '#475467',
                      fontWeight: 500
                    }
                  }}
                >
                  <FormControlLabel
                    value="trip_id"
                    control={<Radio size="small" sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#00a8e8' } }} />}
                    label="Ride ID"
                  />
                </RadioGroup>

                {/* Ride Details Action Button */}
                <Button
                  variant="contained"
                  onClick={handleTripSearch}
                  disabled={tripLoading}
                  startIcon={tripLoading && <CircularProgress size={16} color="inherit" />}
                  sx={{
                    backgroundColor: '#1aa1e5',
                    color: '#ffffff',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '13.5px',
                    px: 3.5,
                    py: 0.7,
                    borderRadius: '4px',
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: '#0288d1',
                      boxShadow: '0 2px 8px rgba(2, 136, 209, 0.25)'
                    }
                  }}
                >
                  Ride Details
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Multiple Results Selector (if search returned more than 1 item) */}
          {activeType === 'driver' && driverResults.length > 1 && (
            <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#475467' }}>
                Found {driverResults.length} drivers:
              </Typography>
              {driverResults.map((driver, idx) => (
                <Chip
                  key={driver.id || idx}
                  label={`ID: ${driver.id} • ${driver.driverName || 'Driver'} (${driver.phone_number || ''})`}
                  onClick={() => handleSelectRecord(driver, idx)}
                  color={selectedIndex === idx ? 'primary' : 'default'}
                  variant={selectedIndex === idx ? 'filled' : 'outlined'}
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          )}

          {activeType === 'user' && customerResults.length > 1 && (
            <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#475467' }}>
                Found {customerResults.length} users:
              </Typography>
              {customerResults.map((cust, idx) => (
                <Chip
                  key={cust.id || idx}
                  label={`ID: ${cust.id} • ${cust.first_name || ''} ${cust.last_name || ''} (${cust.phone_number || cust.phone_with_code || ''})`}
                  onClick={() => handleSelectRecord(cust, idx)}
                  color={selectedIndex === idx ? 'primary' : 'default'}
                  variant={selectedIndex === idx ? 'filled' : 'outlined'}
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          )}

          {activeType === 'ride' && tripResults.length > 1 && (
            <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#475467' }}>
                Found {tripResults.length} rides:
              </Typography>
              {tripResults.map((trip, idx) => (
                <Chip
                  key={trip.id || idx}
                  label={`Ride: ${trip.trip_id || trip.id} • ${trip.status || ''}`}
                  onClick={() => handleSelectRecord(trip, idx)}
                  color={selectedIndex === idx ? 'primary' : 'default'}
                  variant={selectedIndex === idx ? 'filled' : 'outlined'}
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          )}

          {/* Bottom Results Panel */}
          {activeRecord ? (
            activeType === 'driver' ? (
              <DriverDetailsView
                data={activeRecord}
                onDriverUpdate={(updated) => setActiveRecord((prev) => ({ ...prev, ...updated }))}
              />
            ) : activeType === 'user' ? (
              <CustomerDetailsView
                data={activeRecord}
                onCustomerUpdate={(updated) => setActiveRecord((prev) => ({ ...prev, ...updated }))}
              />
            ) : (
              <Paper
                elevation={0}
                sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  p: { xs: 2.5, md: 4 },
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                {/* Header: Title Centered with dark underline */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    mb: 4
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '17px',
                      fontWeight: 700,
                      color: '#111827',
                      borderBottom: '2.5px solid #111827',
                      pb: 0.5,
                      letterSpacing: '0.2px'
                    }}
                  >
                    Ride Details
                  </Typography>
                </Box>

              {/* ----------------- RIDE / TRIP DETAILS VIEW ----------------- */}
              {activeType === 'ride' && (
                <Grid container spacing={{ xs: 2, md: 4 }}>
                  {/* Ride Column 1 */}
                  <Grid item xs={12} md={4}>
                    <KeyValueRow label="Ride ID" value={activeRecord.trip_id || activeRecord.id} />
                    <KeyValueRow
                      label="Pickup Date & Time"
                      value={safeFormatDate(activeRecord.pickup_date || activeRecord.created_at)}
                    />
                    <KeyValueRow
                      label="Ride Status"
                      value={
                        activeRecord.status === 4 || activeRecord.status === 'Completed'
                          ? 'Completed'
                          : activeRecord.status === 5 || activeRecord.status === 'Cancelled'
                          ? 'Cancelled'
                          : activeRecord.status === 1
                          ? 'Accepted by Driver'
                          : activeRecord.status === 3
                          ? 'Started'
                          : activeRecord.status || 'New Trip'
                      }
                      isGreen={activeRecord.status === 4 || activeRecord.status === 'Completed'}
                    />
                    <KeyValueRow
                      label="Trip Type"
                      value={activeRecord.trip_type || '-'}
                    />
                    <KeyValueRow
                      label="Vehicle Type"
                      value={
                        activeRecord.vehicleCategory?.name || 
                        activeRecord.vehicleCategory?.vehicle_type || 
                        activeRecord.vehicle_type || 
                        '-'
                      }
                    />
                    <KeyValueRow
                      label="Ride Distance"
                      value={activeRecord.distance ? `${activeRecord.distance} km` : '-'}
                    />
                    <KeyValueRow label="OTP" value={activeRecord.otp || '-'} />
                    <KeyValueRow label="Scheduled Ride" value={activeRecord.isScheduled === 1 ? 'Yes' : 'No'} />
                  </Grid>

                  {/* Ride Column 2 */}
                  <Grid item xs={12} md={4}>
                    <KeyValueRow
                      label="Customer ID"
                      value={activeRecord.customer?.id || activeRecord.customer_id || '-'}
                    />
                    <KeyValueRow
                      label="Customer Name"
                      value={
                        activeRecord.customer
                          ? `${activeRecord.customer.first_name || ''} ${activeRecord.customer.last_name || ''}`.trim()
                          : '-'
                      }
                    />
                    <KeyValueRow
                      label="Customer Phone"
                      value={activeRecord.customer?.phone_number || '-'}
                    />
                    <KeyValueRow
                      label="Driver ID"
                      value={activeRecord.driver?.id || activeRecord.driver_id || '-'}
                    />
                    <KeyValueRow
                      label="Driver Name"
                      value={activeRecord.driver?.driverName || '-'}
                    />
                    <KeyValueRow
                      label="Driver Phone"
                      value={activeRecord.driver?.phone_number || '-'}
                    />
                    <KeyValueRow
                      label="Vehicle No (RC)"
                      value={activeRecord.driver?.vehicleRcNo || '-'}
                    />
                    <KeyValueRow
                      label="Cancelled By"
                      value={activeRecord.cancelledBy || '-'}
                    />
                  </Grid>

                  {/* Ride Column 3 */}
                  <Grid item xs={12} md={4}>
                    <KeyValueRow label="Pickup Location" value={activeRecord.pickup_address || '-'} />
                    <KeyValueRow label="Drop Location" value={activeRecord.drop_address || '-'} />
                    <KeyValueRow
                      label="Sub Total"
                      value={`₹${activeRecord.sub_total || 0}`}
                    />
                    <KeyValueRow 
                      label="Tax / Toll Tax" 
                      value={`₹${activeRecord.tax || 0} / ₹${activeRecord.tollTax || 0}`} 
                    />
                    <KeyValueRow 
                      label="Total Amount" 
                      value={`₹${activeRecord.total || 0}`} 
                      isGreen={true}
                    />
                    <KeyValueRow
                      label="Driver Earning"
                      value={`₹${activeRecord.driver_earning || 0}`}
                    />
                    <KeyValueRow
                      label="Company Earning"
                      value={`₹${activeRecord.company_amount || 0}`}
                    />
                    <KeyValueRow
                      label="Payment Method"
                      value={activeRecord.payment_method === 1 ? 'Cash' : activeRecord.payment_method === 2 ? 'Online' : activeRecord.payment_method || '-'}
                    />
                  </Grid>
                </Grid>
              )}
            </Paper>
          )
        ) : (

            /* Clean Empty State */
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                px: 2,
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px dashed #cbd5e1'
              }}
            >
              <Typography variant="h6" sx={{ color: '#475467', fontWeight: 600, mb: 1 }}>
                Quick 360° Search
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', maxWidth: 450, mx: 'auto' }}>
                Search by User ID/Phone/Email, Driver ID/Phone/Vehicle No, or Ride ID in the panels above to inspect comprehensive real-time details.
              </Typography>
            </Box>
          )}
        </Container>

        {/* Edit DOB Dialog */}
       



        {/* Full Trip Drawer */}
        {tripDrawerOpen && activeRecord && (
          <TripDrawer
            open={tripDrawerOpen}
            onClose={() => setTripDrawerOpen(false)}
            data={activeRecord}
          />
        )}

        {/* Feedback Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{ width: '100%', boxShadow: 3 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default GlobalSearch;

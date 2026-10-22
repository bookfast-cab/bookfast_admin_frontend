import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import {
  Box,
  Card,
  Grid,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Tooltip,
  Avatar,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

// ** Icons
import AlertOctagon from 'mdi-material-ui/AlertOctagon';
import Magnify from 'mdi-material-ui/Magnify';
import Refresh from 'mdi-material-ui/Refresh';
import MapMarkerRadius from 'mdi-material-ui/MapMarkerRadius';
import Phone from 'mdi-material-ui/Phone';
import VolumeHigh from 'mdi-material-ui/VolumeHigh';
import VolumeOff from 'mdi-material-ui/VolumeOff';
import StopCircleOutline from 'mdi-material-ui/StopCircleOutline';
import CheckCircle from 'mdi-material-ui/CheckCircle';
import CloseCircle from 'mdi-material-ui/CloseCircle';
import AccountAlert from 'mdi-material-ui/AccountAlert';
import Car from 'mdi-material-ui/Car';
import OpenInNew from 'mdi-material-ui/OpenInNew';
import InformationOutline from 'mdi-material-ui/InformationOutline';

import { useSos } from 'src/contexts/SosContext';
import { useSocket, useSocketStatus } from 'src/contexts/SocketContext';
import getFingerprint from 'src/utils/Fingerprint';
import { toast } from 'react-toastify';

// ** Pulsing Stat Card for Active Alerts
const PulsingCard = styled(Card)(({ theme, isactive }) => ({
  transition: 'all 0.3s ease',
  borderRadius: 12,
  padding: theme.spacing(3),
  boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
  ...(isactive === 'true' && {
    border: '2px solid #ef4444',
    animation: 'statPulse 1.8s infinite ease-in-out',
    '@keyframes statPulse': {
      '0%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)' },
      '70%': { boxShadow: '0 0 0 10px rgba(239, 68, 68, 0)' },
      '100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' }
    }
  })
}));

const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  
return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return `${Math.max(seconds, 0)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  
return `${days}d ago`;
};

const SosSectionPage = () => {
  const socket = useSocket();
  const isSocketConnected = useSocketStatus();
  const { activeCount, isAlarmPlaying, muteAlarm, playAlarm, stopSos: globalStopSos } = useSos();

  // Table state
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [statusTab, setStatusTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Stop Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSos, setSelectedSos] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Info Note Dialog state
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedInfoSos, setSelectedInfoSos] = useState(null);

  // Fetch list from backend
  const fetchSosList = useCallback(async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        setLoading(false);
        
return;
      }

      const deviceId = await getFingerprint();

      const queryParams = new URLSearchParams({
        page: page.toString(),
        perPage: perPage.toString(),
        status: statusTab,
        ...(searchQuery ? { search: searchQuery } : {})
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/sos/list?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'x-device-id': deviceId
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch SOS list');
      }

      const result = await res.json();
      if (result.success) {
        setSosList(result.data || []);
        setTotalCount(result.totalCount || 0);
      }
    } catch (err) {
      console.warn('Error fetching SOS list:', err);
      toast.error('Failed to load SOS records');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, statusTab, searchQuery]);

  useEffect(() => {
    fetchSosList();
  }, [fetchSosList]);

  // Real-time listener: refresh table on any socket event
  useEffect(() => {
    if (!socket) return;

    const handleRefresh = () => {
      fetchSosList();
    };

    socket.on('sosAlert', handleRefresh);
    socket.on('sos_alert', handleRefresh);
    socket.on('sosCancelled', handleRefresh);
    socket.on('sosStopped', handleRefresh);
    socket.on('sosStatusUpdate', handleRefresh);

    return () => {
      socket.off('sosAlert', handleRefresh);
      socket.off('sos_alert', handleRefresh);
      socket.off('sosCancelled', handleRefresh);
      socket.off('sosStopped', handleRefresh);
      socket.off('sosStatusUpdate', handleRefresh);
    };
  }, [socket, fetchSosList]);

  const handleTabChange = (event, newValue) => {
    setStatusTab(newValue);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenStop = (sos) => {
    setSelectedSos(sos);
    setRemarks('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSos(null);
    setRemarks('');
  };

  const handleOpenInfo = (sos) => {
    setSelectedInfoSos(sos);
    setInfoDialogOpen(true);
  };

  const handleCloseInfoDialog = () => {
    setInfoDialogOpen(false);
    setSelectedInfoSos(null);
  };

  const handleConfirmStop = async () => {
    if (!selectedSos) return;
    setSubmitting(true);
    const res = await globalStopSos(selectedSos.id, remarks);
    setSubmitting(false);

    if (res.success) {
      handleCloseDialog();
      fetchSosList();
    }
  };

  const openGoogleMaps = (lat, lng) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank', 'noopener,noreferrer');
    }
  };

  // Stats calculation
  const activeCountDisplay = activeCount;
  const stoppedCountDisplay = sosList.filter(s => s.status === 'stopped' || s.status === 'resolved').length;
  const cancelledCountDisplay = sosList.filter(s => s.status === 'cancelled').length;

  return (
    <>
      <Head>
        <title>Emergency SOS Alerts | BookFast Admin</title>
      </Head>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Top Header Row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 4
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Emergency SOS Management
              </Typography>
              {activeCountDisplay > 0 && (
                <Chip
                  color="error"
                  icon={<AlertOctagon />}
                  label={`${activeCountDisplay} ACTIVE EMERGENCY`}
                  sx={{ fontWeight: 800, animation: 'bounce 1s infinite' }}
                />
              )}
            </Box>
            {/* <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Live real-time monitoring and resolution for passenger & driver emergency requests
            </Typography> */}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Socket status badge */}
            <Chip
              size="small"
              variant="outlined"
              color={isSocketConnected ? 'success' : 'default'}
              label={isSocketConnected ? '● Live Socket Connected' : '○ Socket Reconnecting...'}
              sx={{ fontWeight: 600, height: 26 }}
            />

            {/* Alarm Sound Controller */}
            {/* {isAlarmPlaying ? (
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={muteAlarm}
                startIcon={<VolumeOff />}
                sx={{ fontWeight: 700, textTransform: 'none' }}
              >
                Mute Siren
              </Button>
            ) : (
              <Tooltip title="Test / Preview Alarm Tone">
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={() => playAlarm(false)}
                  startIcon={<VolumeHigh />}
                  sx={{ textTransform: 'none' }}
                >
                  Test Tone
                </Button>
              </Tooltip>
            )} */}

            {/* Refresh Button */}
            <Tooltip title="Refresh SOS List">
              <IconButton onClick={fetchSosList} color="primary" sx={{ border: theme => `1px solid ${theme.palette.divider}` }}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* KPI Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Active Emergencies */}
          <Grid item xs={12} sm={6} md={3}>
            <PulsingCard isactive={activeCountDisplay > 0 ? 'true' : 'false'}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>
                    Active Emergencies
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: activeCountDisplay > 0 ? '#dc2626' : 'text.primary', mt: 0.5 }}>
                    {activeCountDisplay}
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: activeCountDisplay > 0 ? '#fee2e2' : '#f3f4f6', color: '#dc2626', width: 48, height: 48 }}>
                  <AlertOctagon sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </PulsingCard>
          </Grid>

          {/* Total SOS */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>
                    Total SOS History
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                    {totalCount}
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: '#e0e7ff', color: '#4338ca', width: 48, height: 48 }}>
                  <AccountAlert sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </Card>
          </Grid>

          {/* Stopped by Admin */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>
                    Stopped by Admin
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#16a34a', mt: 0.5 }}>
                    {stoppedCountDisplay}
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: '#dcfce7', color: '#16a34a', width: 48, height: 48 }}>
                  <CheckCircle sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </Card>
          </Grid>

          {/* Cancelled by Customer */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>
                    Cancelled by User
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.secondary', mt: 0.5 }}>
                    {cancelledCountDisplay}
                  </Typography>
                </Box>
                <Avatar sx={{ backgroundColor: '#f3f4f6', color: '#6b7280', width: 48, height: 48 }}>
                  <CloseCircle sx={{ fontSize: 28 }} />
                </Avatar>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Card: Tabs, Search & Table */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          {/* Header Controls: Tabs + Search */}
          <Box
            sx={{
              p: 2.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              borderBottom: theme => `1px solid ${theme.palette.divider}`
            }}
          >
            <Tabs
              value={statusTab}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              sx={{ minHeight: 40 }}
            >
              <Tab label="All Alerts" value="all" sx={{ minHeight: 40, fontWeight: 600, textTransform: 'none' }} />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    Active
                    {activeCountDisplay > 0 && (
                      <Chip
                        size="small"
                        color="error"
                        label={activeCountDisplay}
                        sx={{ height: 18, fontSize: '0.7rem', fontWeight: 700 }}
                      />
                    )}
                  </Box>
                }
                value="active"
                sx={{ minHeight: 40, fontWeight: 600, textTransform: 'none' }}
              />
              <Tab label="Stopped / Resolved" value="stopped" sx={{ minHeight: 40, fontWeight: 600, textTransform: 'none' }} />
              <Tab label="Cancelled" value="cancelled" sx={{ minHeight: 40, fontWeight: 600, textTransform: 'none' }} />
            </Tabs>

            <TextField
              size="small"
              placeholder="Search Trip ID, User ID, Driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Magnify fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
              sx={{ width: { xs: '100%', sm: 280 } }}
            />
          </Box>

          {loading && <LinearProgress color="error" />}

          {/* Table Container */}
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ backgroundColor: theme => theme.palette.action.hover }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ID / Trip</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer Details</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Driver Details</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Emergency Location</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Triggered Time</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sosList && sosList.length > 0 ? (
                  sosList.map((sos) => {
                    const isActive = sos.status === 'active';
                    const isStopped = sos.status === 'stopped' || sos.status === 'resolved';
                    const isCancelled = sos.status === 'cancelled';

                    const customerName = sos.customer
                      ? `${sos.customer.first_name || ''} ${sos.customer.last_name || ''}`.trim()
                      : `User #${sos.user_id}`;
                    const customerPhone = sos.customer?.phone_number || '';
                    const customerEmail = sos.customer?.email || '';

                    const driverName = sos.driver?.driverName || `Driver #${sos.driver_id || 'N/A'}`;
                    const driverPhone = sos.driver?.phone_number || '';
                    const vehicleRc = sos.driver?.vehicleRcNo || '';

                    return (
                      <TableRow
                        key={sos.id}
                        hover
                        sx={{
                          backgroundColor: isActive ? 'rgba(254, 242, 242, 0.45)' : 'inherit',
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        {/* ID / Trip */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            #{sos.id}
                          </Typography>
                          <Chip
                            size="small"
                            color={isActive ? 'error' : 'default'}
                            label={`Trip #${sos.trip_id}`}
                            sx={{ mt: 0.5, fontWeight: 700, height: 22 }}
                          />
                        </TableCell>

                        {/* Customer */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {customerName}
                          </Typography>
                          {customerPhone && (
                            <Typography
                              variant="caption"
                              component="a"
                              href={`tel:${customerPhone}`}
                              sx={{
                                color: 'primary.main',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                mt: 0.25
                              }}
                            >
                              <Phone sx={{ fontSize: 13 }} /> {customerPhone}
                            </Typography>
                          )}
                          {customerEmail && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              {customerEmail}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Driver */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {driverName}
                          </Typography>
                          {driverPhone && (
                            <Typography
                              variant="caption"
                              component="a"
                              href={`tel:${driverPhone}`}
                              sx={{
                                color: 'text.secondary',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                mt: 0.25
                              }}
                            >
                              <Phone sx={{ fontSize: 13 }} /> {driverPhone}
                            </Typography>
                          )}
                          {vehicleRc && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Car sx={{ fontSize: 13 }} /> RC: {vehicleRc}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Location */}
                        <TableCell>
                          {sos.latitude && sos.longitude ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box>
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                                  {Number(sos.latitude).toFixed(4)}, {Number(sos.longitude).toFixed(4)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  GPS Coordinates
                                </Typography>
                              </Box>
                              <Tooltip title="View Live Location on Google Maps">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => openGoogleMaps(sos.latitude, sos.longitude)}
                                  sx={{ backgroundColor: '#fee2e2' }}
                                >
                                  <MapMarkerRadius fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                              Not Available
                            </Typography>
                          )}
                        </TableCell>

                        {/* Time */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatDateTime(sos.created_at)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: isActive ? '#dc2626' : 'text.secondary', fontWeight: isActive ? 700 : 400 }}>
                            {formatTimeAgo(sos.created_at)}
                          </Typography>
                          {sos.cancelled_at && (
                            <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', mt: 0.25 }}>
                              Ended: {formatDateTime(sos.cancelled_at)}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          {isActive && (
                            <Chip
                              size="small"
                              label="ACTIVE SOS"
                              sx={{
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                fontWeight: 800,
                                border: '1px solid #ef4444',
                                animation: 'pulse 1.5s infinite'
                              }}
                            />
                          )}
                          {isStopped && (
                            <Chip
                              size="small"
                              label="Stopped / Resolved"
                              color="success"
                              variant="outlined"
                              sx={{ fontWeight: 700 }}
                            />
                          )}
                          {isCancelled && (
                            <Chip
                              size="small"
                              label="Cancelled by User"
                              sx={{ backgroundColor: '#f3f4f6', color: '#6b7280', fontWeight: 600 }}
                            />
                          )}
                        </TableCell>

                        {/* Action Column */}
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            {isActive ? (
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={() => handleOpenStop(sos)}
                                startIcon={<StopCircleOutline />}
                                sx={{
                                  fontWeight: 700,
                                  textTransform: 'none',
                                  borderRadius: 2,
                                  boxShadow: '0 3px 10px rgba(220, 38, 38, 0.35)',
                                  '&:hover': { backgroundColor: '#b91c1c' }
                                }}
                              >
                                Stop SOS
                              </Button>
                            ) : (
                              <Chip
                                size="small"
                                label="Closed"
                                sx={{ backgroundColor: 'transparent', color: 'text.disabled' }}
                              />
                            )}

                            {sos.remarks && (
                              <Tooltip title="View Resolution Note">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenInfo(sos)}
                                  sx={{
                                    backgroundColor: '#eff6ff',
                                    color: '#0284c7',
                                    border: '1px solid #bae6fd',
                                    '&:hover': { backgroundColor: '#e0f2fe' }
                                  }}
                                >
                                  <InformationOutline fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ py: 6, textAlign: 'center' }}>
                      <CheckCircle sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        No SOS Records Found
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {statusTab !== 'all' ? `No ${statusTab} SOS records matching current filter.` : 'No emergency requests recorded.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={totalCount}
            rowsPerPage={perPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Box>

      {/* Stop SOS Action Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertOctagon /> Stop Emergency SOS Alert
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to stop the SOS alert for <strong>Trip #{selectedSos?.trip_id}</strong>?
            This will mark the emergency as resolved and alert all systems.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Resolution Remarks / Notes (Optional)"
            placeholder="e.g. Spoke with passenger, driver verified, situation resolved"
            fullWidth
            multiline
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} disabled={submitting} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmStop}
            variant="contained"
            color="error"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <StopCircleOutline />}
          >
            {submitting ? 'Stopping...' : 'Confirm & Stop SOS'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Resolution Note / Remark Dialog */}
      <Dialog open={infoDialogOpen} onClose={handleCloseInfoDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, color: '#0284c7' }}>
          <InformationOutline /> Resolution Remarks
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2.5 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
              Trip ID
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              #{selectedInfoSos?.trip_id || 'N/A'}
            </Typography>
          </Box>
          {selectedInfoSos?.cancelled_at && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                Resolved Time
              </Typography>
              <Typography variant="body2">
                {formatDateTime(selectedInfoSos?.cancelled_at)} ({formatTimeAgo(selectedInfoSos?.cancelled_at)})
              </Typography>
            </Box>
          )}
          <Box sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 700 }}>
              Note / Remark:
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#1e293b', fontWeight: 500, lineHeight: 1.5 }}>
              {selectedInfoSos?.remarks || 'No remarks recorded.'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={handleCloseInfoDialog} variant="contained" size="small" sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SosSectionPage;

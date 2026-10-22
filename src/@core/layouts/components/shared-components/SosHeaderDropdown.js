// ** React Imports
import { useState, Fragment } from 'react'
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import MuiMenu from '@mui/material/Menu'
import MuiMenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Badge from '@mui/material/Badge'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'

// ** Icons Imports
import AlertOctagon from 'mdi-material-ui/AlertOctagon'
import VolumeHigh from 'mdi-material-ui/VolumeHigh'
import VolumeOff from 'mdi-material-ui/VolumeOff'
import MapMarkerRadius from 'mdi-material-ui/MapMarkerRadius'
import Phone from 'mdi-material-ui/Phone'
import AccountAlert from 'mdi-material-ui/AccountAlert'
import CheckCircleOutline from 'mdi-material-ui/CheckCircleOutline'
import StopCircleOutline from 'mdi-material-ui/StopCircleOutline'

// ** Third Party Components
import PerfectScrollbarComponent from 'react-perfect-scrollbar'
import { useSos } from 'src/contexts/SosContext'

// ** Styled Menu
const Menu = styled(MuiMenu)(({ theme }) => ({
  '& .MuiMenu-paper': {
    width: 390,
    overflow: 'hidden',
    marginTop: theme.spacing(4),
    borderRadius: 12,
    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  '& .MuiMenu-list': {
    padding: 0
  }
}))

// ** Styled MenuItem
const MenuItem = styled(MuiMenuItem)(({ theme }) => ({
  paddingTop: theme.spacing(2.5),
  paddingBottom: theme.spacing(2.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start'
}))

// ** Styled PerfectScrollbar
const PerfectScrollbar = styled(PerfectScrollbarComponent)({
  maxHeight: 380
})

// ** Pulsing SOS Button
const PulsingSosButton = styled(Button)(({ theme, isactive }) => ({
  borderRadius: 20,
  padding: '4px 12px',
  fontWeight: 700,
  fontSize: '0.8rem',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  ...(isactive === 'true'
    ? {
        backgroundColor: '#dc2626',
        color: '#ffffff',
        animation: 'sosPulse 1.4s infinite ease-in-out',
        '&:hover': {
          backgroundColor: '#b91c1c'
        },
        '@keyframes sosPulse': {
          '0%': {
            boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.7)'
          },
          '70%': {
            boxShadow: '0 0 0 10px rgba(220, 38, 38, 0)'
          },
          '100%': {
            boxShadow: '0 0 0 0 rgba(220, 38, 38, 0)'
          }
        }
      }
    : {
        color: theme.palette.text.primary,
        '&:hover': {
          backgroundColor: theme.palette.action.hover
        }
      })
}))

const formatDistance = (dateString) => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return `${Math.max(seconds, 0)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  
return `${days}d ago`;
};

const SosHeaderDropdown = () => {
  const router = useRouter();
  const { activeCount, activeSosList, isAlarmPlaying, muteAlarm, stopSos } = useSos();

  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSos, setSelectedSos] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'));

  const handleDropdownOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const handleOpenStopDialog = (sos, e) => {
    if (e) e.stopPropagation();
    setSelectedSos(sos);
    setRemarks('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSos(null);
    setRemarks('');
  };

  const handleConfirmStop = async () => {
    if (!selectedSos) return;
    setSubmitting(true);
    await stopSos(selectedSos.id, remarks);
    setSubmitting(false);
    handleCloseDialog();
    if (activeSosList.length <= 1) {
      handleDropdownClose();
    }
  };

  const openGoogleMaps = (lat, lng, e) => {
    if (e) e.stopPropagation();
    if (lat && lng) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleNavigateToSosPage = () => {
    handleDropdownClose();
    router.push('/sos');
  };

  return (
    <Fragment>
      {/* SOS Header Button / Trigger */}
      <Tooltip title={activeCount > 0 ? `🚨 ${activeCount} Active Emergency SOS!` : 'SOS Alerts'}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', mr: 2 }}>
          {activeCount > 0 ? (
            <PulsingSosButton
              isactive="true"
              onClick={handleDropdownOpen}
              startIcon={<AlertOctagon sx={{ color: '#fff' }} />}
            >
              SOS ({activeCount})
            </PulsingSosButton>
          ) : (
            <IconButton color='inherit' onClick={handleDropdownOpen} aria-label='SOS Alerts'>
              <Badge badgeContent={0} color='error'>
                <AlertOctagon sx={{ color: 'text.secondary' }} />
              </Badge>
            </IconButton>
          )}

          {/* Mute button when alarm is playing */}
          {/* {isAlarmPlaying && (
            <Tooltip title="Mute Alarm Sound">
              <IconButton
                size="small"
                onClick={muteAlarm}
                sx={{
                  ml: 0.5,
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  '&:hover': { backgroundColor: '#fecaca' }
                }}
              >
                <VolumeOff fontSize="small" />
              </IconButton>
            </Tooltip>
          )} */}
        </Box>
      </Tooltip>

      {/* SOS Menu Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleDropdownClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {/* Menu Header */}
        <Box
          sx={{
            py: 3,
            px: 4,
            backgroundColor: activeCount > 0 ? '#b91c1c' : 'primary.main',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AlertOctagon />
            <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700 }}>
              {activeCount > 0 ? 'Active SOS Emergencies' : 'Emergency SOS'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {activeCount > 0 && (
              <Chip
                size="small"
                label={`${activeCount} Active`}
                sx={{ backgroundColor: '#fff', color: '#b91c1c', fontWeight: 800, height: 22 }}
              />
            )}
            {isAlarmPlaying && (
              <Tooltip title="Mute Alarm Sound">
                <IconButton size="small" onClick={muteAlarm} sx={{ color: '#fff' }}>
                  <VolumeOff fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* List of Active SOS */}
        <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
          {activeSosList && activeSosList.length > 0 ? (
            activeSosList.map((sos) => {
              const customerName = sos.customer
                ? `${sos.customer.first_name || ''} ${sos.customer.last_name || ''}`.trim()
                : `User #${sos.user_id}`;
              const customerPhone = sos.customer?.phone_number || '';
              const driverName = sos.driver?.driverName || `Driver #${sos.driver_id || 'N/A'}`;
              const driverPhone = sos.driver?.phone_number || '';

              return (
                <MenuItem key={sos.id} disableRipple>
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        size="small"
                        color="error"
                        label={`Trip #${sos.trip_id}`}
                        sx={{ fontWeight: 700, height: 22 }}
                      />
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {formatDistance(sos.created_at)}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label="ACTIVE"
                      sx={{
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        height: 20
                      }}
                    />
                  </Box>

                  {/* Customer Info */}
                  <Box sx={{ width: '100%', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountAlert fontSize="small" sx={{ color: '#dc2626' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {customerName}
                    </Typography>
                    {customerPhone && (
                      <Typography
                        variant="caption"
                        component="a"
                        href={`tel:${customerPhone}`}
                        sx={{ color: 'primary.main', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                      >
                        <Phone sx={{ fontSize: 13, mr: 0.5 }} /> {customerPhone}
                      </Typography>
                    )}
                  </Box>

                  {/* Driver Info */}
                  <Box sx={{ width: '100%', mb: 1, pl: 3.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Driver: {driverName} {driverPhone ? `(${driverPhone})` : ''}
                    </Typography>
                  </Box>

                  {/* Actions Row */}
                  <Box sx={{ width: '100%', display: 'flex', gap: 1, mt: 1, pt: 1, borderTop: theme => `1px dashed ${theme.palette.divider}` }}>
                    {sos.latitude && sos.longitude && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        startIcon={<MapMarkerRadius fontSize="small" />}
                        onClick={(e) => openGoogleMaps(sos.latitude, sos.longitude, e)}
                        sx={{ fontSize: '0.75rem', py: 0.5 }}
                      >
                        Map
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      startIcon={<StopCircleOutline fontSize="small" />}
                      onClick={(e) => handleOpenStopDialog(sos, e)}
                      sx={{ fontSize: '0.75rem', py: 0.5, flex: 1 }}
                    >
                      Stop SOS
                    </Button>
                  </Box>
                </MenuItem>
              );
            })
          ) : (
            <Box sx={{ py: 6, px: 4, textAlign: 'center' }}>
              <CheckCircleOutline sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                No Active Emergencies
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                All SOS alerts are currently stopped or resolved.
              </Typography>
            </Box>
          )}
        </PerfectScrollbar>

        {/* Footer */}
        <Box sx={{ p: 2, borderTop: theme => `1px solid ${theme.palette.divider}` }}>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            onClick={handleNavigateToSosPage}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Go to SOS Section
          </Button>
        </Box>
      </Menu>

      {/* Stop SOS Confirmation Dialog */}
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
            placeholder="e.g. Spoke with customer, driver arrived, false alarm"
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
    </Fragment>
  );
};

export default SosHeaderDropdown;

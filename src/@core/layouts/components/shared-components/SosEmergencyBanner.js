import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import AlertOctagon from 'mdi-material-ui/AlertOctagon';
import VolumeOff from 'mdi-material-ui/VolumeOff';
import Close from 'mdi-material-ui/Close';
import StopCircleOutline from 'mdi-material-ui/StopCircleOutline';
import { useRouter } from 'next/router';
import { useSos } from 'src/contexts/SosContext';

const SosEmergencyBanner = () => {
  const router = useRouter();
  const { activeCount, activeSosList, isAlarmPlaying, muteAlarm, stopSos, bannerDismissed, setBannerDismissed } = useSos();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSos, setSelectedSos] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (activeCount === 0 || bannerDismissed) return null;

  const currentAlert = activeSosList[0];
  const tripId = currentAlert?.trip_id || 'N/A';

  const customerName = currentAlert?.customer
    ? `${currentAlert.customer.first_name || ''} ${currentAlert.customer.last_name || ''}`.trim()
    : `User #${currentAlert?.user_id || ''}`;
  const phone = currentAlert?.customer?.phone_number || '';

  const handleOpenStop = () => {
    setSelectedSos(currentAlert);
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
  };

  return (
    <>
      <Box
        sx={{
          width: '100%',
          backgroundColor: '#dc2626',
          color: '#ffffff',
          px: 3,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)',
          position: 'relative',
          zIndex: 10000,
          animation: 'emergencyFlash 2s infinite ease-in-out',
          '@keyframes emergencyFlash': {
            '0%': { backgroundColor: '#dc2626' },
            '50%': { backgroundColor: '#b91c1c' },
            '100%': { backgroundColor: '#dc2626' }
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: '1 1 300px' }}>
          <AlertOctagon sx={{ fontSize: 24, animation: 'bounce 1s infinite' }} />
          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700, letterSpacing: '0.3px' }}>
            🚨 EMERGENCY SOS ACTIVE ({activeCount}): Trip #{tripId} | Customer: {customerName} {phone ? `(${phone})` : ''}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* {isAlarmPlaying && (
            <Button
              size="small"
              variant="outlined"
              onClick={muteAlarm}
              startIcon={<VolumeOff fontSize="small" />}
              sx={{
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.7)',
                backgroundColor: 'rgba(0,0,0,0.15)',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.3)', borderColor: '#fff' },
                fontSize: '0.75rem',
                textTransform: 'none',
                py: 0.25
              }}
            >
              Mute Sound
            </Button>
          )} */}

          <Button
            size="small"
            variant="contained"
            onClick={handleOpenStop}
            startIcon={<StopCircleOutline fontSize="small" />}
            sx={{
              backgroundColor: '#fff',
              color: '#dc2626',
              fontWeight: 800,
              fontSize: '0.75rem',
              textTransform: 'none',
              py: 0.25,
              '&:hover': { backgroundColor: '#fef2f2' }
            }}
          >
            Stop SOS
          </Button>

          <Button
            size="small"
            variant="text"
            onClick={() => router.push('/sos')}
            sx={{
              color: '#fff',
              textDecoration: 'underline',
              fontSize: '0.75rem',
              textTransform: 'none',
              py: 0.25,
              '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
            }}
          >
            View Panel
          </Button>

          <IconButton
            size="small"
            onClick={() => setBannerDismissed(true)}
            sx={{ color: '#fff', ml: 0.5 }}
            title="Dismiss banner"
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Stop SOS Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertOctagon /> Stop Emergency SOS Alert
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to stop the SOS alert for <strong>Trip #{selectedSos?.trip_id}</strong>?
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Resolution Remarks / Notes (Optional)"
            placeholder="e.g. Verified with driver/customer, situation handled"
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
    </>
  );
};

export default SosEmergencyBanner;

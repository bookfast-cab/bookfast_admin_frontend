import React, { useEffect, useState } from 'react';
import { Grid, Typography, Box, CircularProgress, Button, Snackbar, Alert } from '@mui/material';

const WhatsappWeb = () => {
  const [status, setStatus] = useState('Checking...');
  const [isConnected, setIsConnected] = useState(false);
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // ✅ Function to check WhatsApp connection status
  const checkStatus = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/whatsCon/whatsapp/qr`);
      const data = await res.json();

      setStatus(data.status);
      setQr(data.qr || null);
      setIsConnected(data.status === 'authenticated' || data.status === 'ready');
    } catch (error) {
      setStatus('API Error');
      setIsConnected(false);
      setQr(null);
    }
  };

  //  Function to clear WhatsApp cache
  const clearCache = async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      setSnackbar({ open: true, message: 'Access token not found in localStorage', severity: 'error' });
      
      return;

    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/clear-cache`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      const result = await res.json();
      setSnackbar({ open: true, message: result.message || 'Cache cleared successfully!', severity: 'success' });

      setTimeout(checkStatus, 3000);
    } catch (error) {
      console.error('Clear Cache Error:', error);
      setSnackbar({ open: true, message: 'Failed to clear cache or restart backend.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <Grid container spacing={6}>
      {/* Title */}
      <Grid item xs={6}>
        <Typography variant="h5">WhatsApp Integration</Typography>
      </Grid>

      {/* Connection Status + Clear Cache Button */}
      <Grid
        item
        xs={6}
        sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}
      >
        <Box
          sx={{
            backgroundColor: isConnected ? 'green' : 'red',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '16px',
            fontWeight: 'bold',
          }}
        >
          {isConnected ? 'WhatsApp Connected' : 'Waiting for Scan'}
        </Box>

        {/* ✅ Clear Cache Button */}
  
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={clearCache}
            disabled={loading}
          >
            {loading ? 'Clearing...' : 'Clear Cache'}
          </Button>
      </Grid>

      {/* QR Section */}
      <Grid item xs={12} sx={{ textAlign: 'center' }}>
        {!isConnected && status === 'pending' && qr && (
          <>
            <img src={qr} alt="WhatsApp QR" style={{ height: 200, marginTop: 10 }} />
            <Typography variant="body2" sx={{ marginTop: 1 }}>
              Scan the QR Code using your WhatsApp
            </Typography>
          </>
        )}

        {!isConnected && status === 'initializing' && (
          <Box sx={{ marginTop: 2 }}>
            <CircularProgress size={30} />
            <Typography variant="body2" sx={{ marginTop: 1 }}>
              Initializing WhatsApp...
            </Typography>
          </Box>
        )}

        {!isConnected && status === 'API Error' && (
          <Typography color="error" variant="body2" sx={{ marginTop: 2 }}>
            Failed to fetch QR code. Please check backend.
          </Typography>
        )}
      </Grid>

      {/* ✅ Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default WhatsappWeb;

import React, { useEffect, useState } from 'react';
import { Typography, CircularProgress } from '@mui/material';
import { useSocket } from 'src/contexts/SocketContext';

const WhatsAppQR = () => {
  const socket = useSocket();
  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState('Waiting for WhatsApp...');

  useEffect(() => {
    if (!socket) return;

    socket.on('whatsapp:qr', (data) => {
      setQr(data);
      setStatus('Scan the QR Code using WhatsApp');
    });

    socket.on('whatsapp:ready', (msg) => setStatus(msg));
    socket.on('whatsapp:authenticated', (msg) => setStatus(msg));
    socket.on('whatsapp:auth_failure', (msg) => setStatus(msg));
    socket.on('whatsapp:disconnected', (msg) => setStatus(msg));

    return () => {
      socket.off('whatsapp:qr');
      socket.off('whatsapp:ready');
      socket.off('whatsapp:authenticated');
      socket.off('whatsapp:auth_failure');
      socket.off('whatsapp:disconnected');
    };
  }, [socket]);

  return (
    <div style={{ textAlign: 'center', marginTop: 30 }}>
      <Typography variant="h6">WhatsApp Connection</Typography>
      {qr ? (
        <img src={qr} alt="QR Code" style={{ marginTop: 10, height: 200 }} />
      ) : (
        <div style={{ marginTop: 10 }}>
          <CircularProgress size={30} />
          <Typography variant="body2" style={{ marginTop: 10 }}>
            {status}
          </Typography>
        </div>
      )}
      <Typography variant="body2" style={{ marginTop: 10 }}>
        {status}
      </Typography>
    </div>
  );
};

export default WhatsAppQR;

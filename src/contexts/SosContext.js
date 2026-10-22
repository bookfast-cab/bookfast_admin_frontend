import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { toast } from 'react-toastify';
import getFingerprint from 'src/utils/Fingerprint';

const SosContext = createContext(null);

let audioInstance = null;

const getSosAudio = () => {
  if (typeof window === 'undefined') return null;
  if (!audioInstance) {
    audioInstance = new Audio('/sos.mp3');
    audioInstance.loop = true;
  }
  audioInstance.volume = 1.0;
  audioInstance.muted = false;
  return audioInstance;
};

export const SosProvider = ({ children }) => {
  const socket = useSocket();
  const [activeCount, setActiveCount] = useState(0);
  const [activeSosList, setActiveSosList] = useState([]);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [latestAlert, setLatestAlert] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const pendingPlayRef = useRef(false);
  const isEmergencyAlarmRef = useRef(false);
  const userMutedRef = useRef(false);
  const prevActiveCountRef = useRef(0);

  const playAlarm = useCallback((isEmergency = false) => {
    isEmergencyAlarmRef.current = isEmergency === true;
    try {
      const audio = getSosAudio();
      if (!audio) return;

      audio.volume = 1.0;
      audio.muted = false;
      audio.currentTime = 0;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            pendingPlayRef.current = false;
            setIsAlarmPlaying(true);
          })
          .catch(err => {
            console.warn('Autoplay blocked or play error:', err);
            // If browser blocked socket/poll-triggered autoplay, mark pending so first user click starts it
            pendingPlayRef.current = true;
            setIsAlarmPlaying(true);
          });
      } else {
        setIsAlarmPlaying(true);
      }
    } catch (err) {
      console.error('Error playing SOS alarm:', err);
    }
  }, []);

  const muteAlarm = useCallback(() => {
    userMutedRef.current = true;
    pendingPlayRef.current = false;
    isEmergencyAlarmRef.current = false;
    try {
      const audio = getSosAudio();
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    } catch (err) {
      console.error('Error muting SOS alarm:', err);
    }
    setIsAlarmPlaying(false);
  }, []);

  // When an alarm was blocked by browser autoplay policy, play it as soon as the user interacts with the page
  useEffect(() => {
    const handleUserInteraction = () => {
      if (pendingPlayRef.current && !userMutedRef.current) {
        playAlarm(isEmergencyAlarmRef.current);
      }
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [playAlarm]);

  // Fetch active SOS list from API
  const fetchActiveSos = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) return;

      const deviceId = await getFingerprint();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/sos/list?status=active&perPage=50`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'x-device-id': deviceId
        }
      });

      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const count = data.data.length;
        setActiveSosList(data.data);
        setActiveCount(count);

        if (count > 0) {
          // If a new emergency appeared (count increased), reset any previous user mute
          if (count > prevActiveCountRef.current) {
            userMutedRef.current = false;
          }

          // If there are active SOS records and user hasn't explicitly muted this session: PLAY ALARM!
          if (!userMutedRef.current) {
            playAlarm(true);
          }
        } else {
          // No active emergencies: reset user mute flag and stop alarm
          userMutedRef.current = false;
          if (isEmergencyAlarmRef.current) {
            muteAlarm();
          }
        }

        prevActiveCountRef.current = count;
      }
    } catch (err) {
      console.warn('Error fetching active SOS list:', err);
    }
  }, [playAlarm, muteAlarm]);

  // Stop / Resolve SOS
  const stopSos = useCallback(async (id, remarks = '') => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) throw new Error('Not authenticated');

      const deviceId = await getFingerprint();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/sos/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'x-device-id': deviceId
        },
        body: JSON.stringify({ id, remarks })
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to stop SOS');
      }

      toast.success(`SOS Alert #${id} successfully stopped and resolved.`);
      setActiveSosList(prev => {
        const next = prev.filter(item => item.id !== id);
        if (next.length === 0 && isEmergencyAlarmRef.current) {
          muteAlarm();
        }
        setActiveCount(next.length);
        
return next;
      });

      return { success: true, data: result.data };
    } catch (err) {
      toast.error(err.message || 'Failed to stop SOS alert');
      
return { success: false, error: err.message };
    }
  }, [muteAlarm]);

  // Initial load & Polling fallback every 30s
  useEffect(() => {
    fetchActiveSos();
    const timer = setInterval(fetchActiveSos, 30000);
    
return () => clearInterval(timer);
  }, [fetchActiveSos]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleSosAlert = (data) => {
      console.log('🚨 SOS Alert received via socket:', data);
      userMutedRef.current = false;
      setLatestAlert(data);
      setBannerDismissed(false);
      playAlarm(true);

      const tripId = data?.tripId || data?.trip_id || 'N/A';
      toast.error(
        `🚨 EMERGENCY SOS TRIGGERED!\nTrip #${tripId}\n${data?.message || 'Emergency assistance requested!'}`,
        {
          autoClose: 15000,
          theme: 'colored',
          position: 'top-center'
        }
      );

      fetchActiveSos();
    };

    const handleSosCancelled = (data) => {
      console.log('ℹ️ SOS Cancelled by customer via socket:', data);
      const tripId = data?.tripId || data?.trip_id || 'N/A';
      toast.info(`SOS for Trip #${tripId} was cancelled by the customer.`);
      fetchActiveSos();
    };

    const handleSosStopped = (data) => {
      console.log('✅ SOS Stopped via socket:', data);
      fetchActiveSos();
    };

    const handleSosStatusUpdate = (data) => {
      console.log('🔄 SOS Status updated via socket:', data);
      fetchActiveSos();
    };

    socket.on('sosAlert', handleSosAlert);
    socket.on('sos_alert', handleSosAlert);
    socket.on('sosCancelled', handleSosCancelled);
    socket.on('sos_cancelled', handleSosCancelled);
    socket.on('sosStopped', handleSosStopped);
    socket.on('sos_stopped', handleSosStopped);
    socket.on('sosStatusUpdate', handleSosStatusUpdate);

    return () => {
      socket.off('sosAlert', handleSosAlert);
      socket.off('sos_alert', handleSosAlert);
      socket.off('sosCancelled', handleSosCancelled);
      socket.off('sos_cancelled', handleSosCancelled);
      socket.off('sosStopped', handleSosStopped);
      socket.off('sos_stopped', handleSosStopped);
      socket.off('sosStatusUpdate', handleSosStatusUpdate);
    };
  }, [socket, playAlarm, fetchActiveSos]);

  return (
    <SosContext.Provider
      value={{
        activeCount,
        activeSosList,
        isAlarmPlaying,
        latestAlert,
        bannerDismissed,
        setBannerDismissed,
        playAlarm,
        muteAlarm,
        fetchActiveSos,
        stopSos
      }}
    >
      {children}
    </SosContext.Provider>
  );
};

export const useSos = () => useContext(SosContext);

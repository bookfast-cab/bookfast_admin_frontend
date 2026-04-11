import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);
const SocketStatusContext = createContext(false);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    if (!token) {
      console.warn("⚠️ No token found in localStorage");
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

    if (!socketUrl) {
      console.error("❌ Missing NEXT_PUBLIC_SOCKET_URL in .env");
      return;
    }


   const s = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}/adminSocket`, {
    transports: ['websocket'],
    auth: { token },
    withCredentials: true,
    reconnection: true,
    timeout: 20000,
    autoConnect: true,
  });

    s.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    s.on('connect_error', (err) => {
      console.error('🚨 Socket connection error:', err);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      <SocketStatusContext.Provider value={isConnected}>
        {children}
      </SocketStatusContext.Provider>
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export const useSocketStatus = () => useContext(SocketStatusContext);

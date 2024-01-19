import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001/api/socketio');

type SocketIOContextType = {
  isConnected: boolean;
  clientType: 'client' | 'sd';
};

const defaultValue: SocketIOContextType = {
  isConnected: false,
  clientType: 'client',
};

const SocketIOContext = createContext<SocketIOContextType>(defaultValue);
export const useSocketIO = () => useContext(SocketIOContext);

export function SocketIOProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<SocketIOContextType>({
    isConnected: socket.connected,
    clientType: 'client',
  });

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // TODO: Build on these events based on python server
    socket.on('connect', () => {
      console.log('connected');
      setValue((val) => ({ ...val, isConnected: true }));
    });

    socket.on('disconnect', () => {
      setValue((val) => ({ ...val, isConnected: false }));
    });

    socket.on('error', (err) => {
      console.log('error', err.msg);
      socket.disconnect();
      setValue((val) => ({ ...val, isConnected: false }));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('error');
    };
  }, []);

  return <SocketIOContext.Provider value={value}>{children}</SocketIOContext.Provider>;
}

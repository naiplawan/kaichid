import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  joinRoom: (roomCode: string) => void;
  leaveRoom: () => void;
  sendMessage: (event: string, data: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl);

    newSocket.on('connect', () => {
      setConnected(true);
      console.log('Connected to socket server');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from socket server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinRoom = (roomCode: string) => {
    if (socket && user) {
      socket.emit('join_room', { roomCode, userId: user.uid });
    }
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit('leave_room');
    }
  };

  const sendMessage = (event: string, data: any) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  const value = {
    socket,
    connected,
    joinRoom,
    leaveRoom,
    sendMessage,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeContextType {
  channel: RealtimeChannel | null;
  connected: boolean;
  joinRoom: (roomCode: string) => void;
  leaveRoom: () => void;
  sendMessage: (event: string, data: any) => void;
  subscribeToRoom: (roomCode: string, callback: (payload: any) => void) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

// For backward compatibility, export as useSocket
export const useSocket = useRealtime;

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setConnected(true);
    } else {
      setConnected(false);
      if (channel) {
        channel.unsubscribe();
        setChannel(null);
      }
    }
  }, [user, channel]);

  const joinRoom = (roomCode: string) => {
    if (user && !channel) {
      const newChannel = supabase.channel(`room-${roomCode}`, {
        config: {
          broadcast: { self: true },
          presence: { key: user.id },
        },
      });

      newChannel
        .on('presence', { event: 'sync' }, () => {
          console.log('Presence synced');
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
        })
        .on('broadcast', { event: 'game-event' }, (payload) => {
          console.log('Game event received:', payload);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Track user presence
            await newChannel.track({
              user_id: user.id,
              username: user.email?.split('@')[0] || 'Anonymous',
              online_at: new Date().toISOString(),
            });
          }
        });

      setChannel(newChannel);
    }
  };

  const leaveRoom = () => {
    if (channel) {
      channel.unsubscribe();
      setChannel(null);
    }
  };

  const sendMessage = (event: string, data: any) => {
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'game-event',
        payload: { event, data, user_id: user?.id },
      });
    }
  };

  const subscribeToRoom = (roomCode: string, callback: (payload: any) => void) => {
    if (user) {
      const roomChannel = supabase.channel(`room-${roomCode}`);

      roomChannel.on('broadcast', { event: 'game-event' }, callback).subscribe();

      return () => roomChannel.unsubscribe();
    }
  };

  const value = {
    channel,
    connected,
    joinRoom,
    leaveRoom,
    sendMessage,
    subscribeToRoom,
  };

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
};

// For backward compatibility, export as SocketProvider
export const SocketProvider = RealtimeProvider;

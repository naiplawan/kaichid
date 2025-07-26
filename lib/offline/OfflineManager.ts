import { useState, useEffect, useCallback } from 'react';

// Offline state interface
export interface OfflineState {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineTime: Date | null;
  offlineDuration: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
}

// Offline data storage interface
interface OfflineData {
  id: string;
  type: 'response' | 'action' | 'gameState';
  data: unknown;
  timestamp: number;
  sessionId?: string;
  priority: 'high' | 'medium' | 'low';
}

// Offline manager class
export class OfflineManager {
  private static instance: OfflineManager;
  private offlineQueue: OfflineData[] = [];
  private storageKey = 'kaichid_offline_queue';
  private listeners: Array<(state: OfflineState) => void> = [];
  private state: OfflineState = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    lastOnlineTime: null,
    offlineDuration: 0,
    connectionQuality: 'excellent',
  };

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadOfflineQueue();
      this.setupEventListeners();
      this.startConnectionMonitoring();
    }
  }

  private setupEventListeners(): void {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  private handleOnline(): void {
    const now = new Date();
    const offlineDuration = this.state.lastOnlineTime 
      ? now.getTime() - this.state.lastOnlineTime.getTime() 
      : 0;

    this.state = {
      ...this.state,
      isOnline: true,
      wasOffline: offlineDuration > 0,
      offlineDuration,
      lastOnlineTime: now,
    };

    this.notifyListeners();
    this.processOfflineQueue();
  }

  private handleOffline(): void {
    this.state = {
      ...this.state,
      isOnline: false,
      lastOnlineTime: new Date(),
      connectionQuality: 'offline',
    };

    this.notifyListeners();
  }

  private startConnectionMonitoring(): void {
    // Monitor connection quality
    setInterval(() => {
      this.checkConnectionQuality();
    }, 5000);
  }

  private async checkConnectionQuality(): Promise<void> {
    if (!this.state.isOnline) {
      this.state.connectionQuality = 'offline';
      return;
    }

    try {
      const start = performance.now();
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      const end = performance.now();
      const latency = end - start;

      if (response.ok) {
        if (latency < 100) {
          this.state.connectionQuality = 'excellent';
        } else if (latency < 300) {
          this.state.connectionQuality = 'good';
        } else {
          this.state.connectionQuality = 'poor';
        }
      } else {
        this.state.connectionQuality = 'poor';
      }
    } catch (error) {
      this.state.connectionQuality = 'poor';
    }

    this.notifyListeners();
  }

  public subscribe(listener: (state: OfflineState) => void): () => void {
    this.listeners.push(listener);
    // Immediately call with current state
    listener(this.state);

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  public getState(): OfflineState {
    return { ...this.state };
  }

  // Queue management
  public queueOfflineData(data: Omit<OfflineData, 'id' | 'timestamp'>): void {
    const offlineItem: OfflineData = {
      ...data,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    this.offlineQueue.push(offlineItem);
    this.saveOfflineQueue();
  }

  private loadOfflineQueue(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.offlineQueue = [];
    }
  }

  private saveOfflineQueue(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;

    // Sort by priority and timestamp
    const sortedQueue = [...this.offlineQueue].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });

    const processed: string[] = [];

    for (const item of sortedQueue) {
      try {
        await this.processOfflineItem(item);
        processed.push(item.id);
      } catch (error) {
        console.error('Failed to process offline item:', error);
        // Keep item in queue for retry
      }
    }

    // Remove processed items
    this.offlineQueue = this.offlineQueue.filter(
      item => !processed.includes(item.id)
    );
    this.saveOfflineQueue();
  }

  private async processOfflineItem(item: OfflineData): Promise<void> {
    switch (item.type) {
      case 'response':
        await this.processOfflineResponse(item);
        break;
      case 'action':
        await this.processOfflineAction(item);
        break;
      case 'gameState':
        await this.processOfflineGameState(item);
        break;
    }
  }

  private async processOfflineResponse(item: OfflineData): Promise<void> {
    const responseData = item.data as {
      sessionId: string;
      questionId: string;
      responseText: string;
      roundNumber: number;
    };

    // Simulate API call to submit response
    const response = await fetch('/api/sessions/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responseData),
    });

    if (!response.ok) {
      throw new Error('Failed to submit offline response');
    }
  }

  private async processOfflineAction(item: OfflineData): Promise<void> {
    const actionData = item.data as {
      type: string;
      payload: unknown;
    };

    // Process different types of actions
    console.log('Processing offline action:', actionData);
  }

  private async processOfflineGameState(item: OfflineData): Promise<void> {
    const gameStateData = item.data as {
      sessionId: string;
      state: unknown;
    };

    // Sync game state
    console.log('Processing offline game state:', gameStateData);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  public clearOfflineQueue(): void {
    this.offlineQueue = [];
    this.saveOfflineQueue();
  }

  public getQueueSize(): number {
    return this.offlineQueue.length;
  }

  public getQueueItems(): OfflineData[] {
    return [...this.offlineQueue];
  }
}

// React hook for offline state
export function useOfflineState() {
  const [state, setState] = useState<OfflineState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    lastOnlineTime: null,
    offlineDuration: 0,
    connectionQuality: 'excellent',
  });

  useEffect(() => {
    const offlineManager = OfflineManager.getInstance();
    const unsubscribe = offlineManager.subscribe(setState);
    return unsubscribe;
  }, []);

  const queueOfflineData = useCallback((data: Omit<OfflineData, 'id' | 'timestamp'>) => {
    const offlineManager = OfflineManager.getInstance();
    offlineManager.queueOfflineData(data);
  }, []);

  const clearQueue = useCallback(() => {
    const offlineManager = OfflineManager.getInstance();
    offlineManager.clearOfflineQueue();
  }, []);

  const getQueueSize = useCallback(() => {
    const offlineManager = OfflineManager.getInstance();
    return offlineManager.getQueueSize();
  }, []);

  return {
    ...state,
    queueOfflineData,
    clearQueue,
    getQueueSize,
  };
}

// Offline-aware fetch wrapper
export async function offlineFetch(
  url: string,
  options: RequestInit = {},
  fallbackData?: unknown
): Promise<Response> {
  const offlineManager = OfflineManager.getInstance();
  const state = offlineManager.getState();

  if (!state.isOnline) {
    // Return cached data if available
    if (fallbackData) {
      return new Response(JSON.stringify(fallbackData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    throw new Error('Network unavailable and no cached data');
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok && options.method === 'POST') {
      // Queue POST requests for retry
      offlineManager.queueOfflineData({
        type: 'action',
        data: { url, options },
        priority: 'high',
      });
    }
    
    return response;
  } catch (error) {
    if (options.method === 'POST') {
      // Queue failed POST requests
      offlineManager.queueOfflineData({
        type: 'action',
        data: { url, options },
        priority: 'high',
      });
    }
    throw error;
  }
}

export default OfflineManager;
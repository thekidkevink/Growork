import { useState, useCallback, useEffect } from 'react';
import { storage, StorageKeys } from '@/utils/storage';
import { useNetworkStatus } from './useNetworkStatus';

interface QueuedAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [processing, setProcessing] = useState(false);
  const { isConnected } = useNetworkStatus();

  // Load queue from storage on mount
  useEffect(() => {
    loadQueue();
  }, []);

  // Process queue when coming back online
  useEffect(() => {
    if (isConnected && queue.length > 0 && !processing) {
      processQueue();
    }
  }, [isConnected, queue.length, processing]);

  const loadQueue = useCallback(async () => {
    try {
      const savedQueue = await storage.get<QueuedAction[]>(StorageKeys.OFFLINE_QUEUE);
      if (savedQueue) {
        setQueue(savedQueue);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
  }, []);

  const saveQueue = useCallback(async (newQueue: QueuedAction[]) => {
    try {
      await storage.set(StorageKeys.OFFLINE_QUEUE, newQueue);
      setQueue(newQueue);
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }, []);

  const addToQueue = useCallback(async (type: string, data: any) => {
    const action: QueuedAction = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    const newQueue = [...queue, action];
    await saveQueue(newQueue);
    
    return action.id;
  }, [queue, saveQueue]);

  const removeFromQueue = useCallback(async (id: string) => {
    const newQueue = queue.filter(action => action.id !== id);
    await saveQueue(newQueue);
  }, [queue, saveQueue]);

  const processQueue = useCallback(async () => {
    if (processing || !isConnected || queue.length === 0) return;

    setProcessing(true);
    const actionsToProcess = [...queue];

    for (const action of actionsToProcess) {
      try {
        // Process the action based on its type
        await processAction(action);
        
        // Remove successful action from queue
        await removeFromQueue(action.id);
      } catch (error) {
        console.error('Error processing queued action:', error);
        
        // Increment retry count
        const updatedAction = {
          ...action,
          retryCount: action.retryCount + 1,
        };

        // Remove if max retries reached (3 attempts)
        if (updatedAction.retryCount >= 3) {
          await removeFromQueue(action.id);
        } else {
          // Update the action in queue
          const newQueue = queue.map(a => 
            a.id === action.id ? updatedAction : a
          );
          await saveQueue(newQueue);
        }
      }
    }

    setProcessing(false);
  }, [processing, isConnected, queue, removeFromQueue, saveQueue]);

  const processAction = async (action: QueuedAction) => {
    // This would be implemented based on your specific action types
    // For example:
    switch (action.type) {
      case 'LIKE_POST':
        // await likePost(action.data.postId);
        break;
      case 'BOOKMARK_POST':
        // await bookmarkPost(action.data.postId);
        break;
      case 'CREATE_POST':
        // await createPost(action.data);
        break;
      default:
        console.warn('Unknown action type:', action.type);
    }
  };

  const clearQueue = useCallback(async () => {
    await storage.remove(StorageKeys.OFFLINE_QUEUE);
    setQueue([]);
  }, []);

  return {
    queue,
    addToQueue,
    removeFromQueue,
    processQueue,
    clearQueue,
    processing,
    queueSize: queue.length,
  };
}

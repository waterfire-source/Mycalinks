import { SSEClient } from '@/api/frontend/sse';
import { useStore } from '@/contexts/StoreContext';
import {
  useMemo,
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from 'react';
import { useAlert } from '@/contexts/AlertContext';

type EventSubscriber<T = any> = {
  id: string;
  eventType: string;
  callback: (data: T) => void;
};

type StoreEventContextValue = {
  subscribe: <T = any>(
    eventType: string,
    callback: (data: T) => void,
  ) => () => void;
};

const StoreEventContext = createContext<StoreEventContextValue>({
  subscribe: () => () => {},
});

export const StoreEventContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const [subscribers, setSubscribers] = useState<
    Map<string, EventSubscriber[]>
  >(new Map());
  const subscriberIdRef = useState(0);

  const handleMessage = useCallback(
    (type: string, data: Record<string, unknown>) => {
      if (!data || !type || typeof data !== 'object') {
        return;
      }

      const eventType = type;
      const eventSubscribers = subscribers.get(eventType);

      if (eventSubscribers) {
        eventSubscribers.forEach((subscriber) => {
          try {
            subscriber.callback(data);
          } catch (error) {
            console.error(`Error in event subscriber for ${eventType}:`, error);
          }
        });
      }
    },
    [subscribers],
  );

  const sseClient = useMemo(
    () =>
      new SSEClient({
        url: `/api/store/${store.id}/subscribe-event`,
        onMessage: handleMessage,
        setAlertState: setAlertState,
        errorMessage:
          '通信エラーが発生しました。店舗情報のリアルタイムでの取得ができません。',
      }),
    [handleMessage, setAlertState, store.id],
  );

  useEffect(() => {
    sseClient.connect();
    return () => {
      sseClient.close();
    };
  }, [sseClient]);

  const subscribe = useCallback(
    <T = any,>(eventType: string, callback: (data: T) => void) => {
      const id = `subscriber-${subscriberIdRef[0]++}`;
      const subscriber: EventSubscriber<T> = {
        id,
        eventType,
        callback,
      };

      setSubscribers((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(eventType) || [];
        newMap.set(eventType, [...existing, subscriber]);
        return newMap;
      });

      return () => {
        setSubscribers((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(eventType) || [];
          const filtered = existing.filter((s) => s.id !== id);
          if (filtered.length === 0) {
            newMap.delete(eventType);
          } else {
            newMap.set(eventType, filtered);
          }
          return newMap;
        });
      };
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      subscribe,
    }),
    [subscribe],
  );

  return (
    <StoreEventContext.Provider value={contextValue}>
      {children}
    </StoreEventContext.Provider>
  );
};

//特定のイベントタイプをサブスクライブできるカスタムフック
export const useStoreEvent = <T = any,>(
  eventType: string,
  callback: (data: T) => void,
) => {
  const { subscribe } = useContext(StoreEventContext);

  useEffect(() => {
    const unsubscribe = subscribe<T>(eventType, callback);
    return unsubscribe;
  }, [subscribe, eventType, callback]);
};

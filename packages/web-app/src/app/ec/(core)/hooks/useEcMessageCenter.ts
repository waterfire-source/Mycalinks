'use client';

import { useCallback, useState } from 'react';
import { ecImplement } from '@/api/frontend/ec/implement';
import { EcAPI } from '@/api/frontend/ec/api';
import { CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';

export type MessageCenter = {
  id: number;
  title: string;
  content: string | null;
  read_at: Date | null;
  created_at: Date;
  kind: string | null;
  order_store: {
    code: string;
    store: {
      display_name: string | null;
    };
  } | null;
};

export const useEcMessageCenter = () => {
  const { setAlertState } = useAlert();
  const [loading, setLoading] = useState(false);

  /**
   * メッセージセンターの一覧を取得する
   */
  const getMessageCenters = useCallback(
    async (
      request?: EcAPI['getEcMessageCenter']['request'],
    ): Promise<MessageCenter[] | null> => {
      setLoading(true);
      try {
        const response = await ecImplement().getEcMessageCenter(
          request || { id: undefined, take: undefined, skip: undefined },
        );

        if (response instanceof CustomError) {
          setAlertState({
            message: response.message,
            severity: 'error',
          });
          return null;
        }

        // API レスポンスをアプリ用形式に変換
        const messageCenters: MessageCenter[] = response.messageCenters.map(
          (item) => ({
            id: item.id,
            title: item.title,
            content: item.content,
            read_at: item.read_at,
            created_at: item.created_at,
            kind: item.kind,
            order_store: item.order_store,
          }),
        );

        return messageCenters;
      } catch (error) {
        console.error('Failed to fetch message centers:', error);
        setAlertState({
          message: 'メッセージの取得に失敗しました' + error,
          severity: 'error',
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setAlertState],
  );

  /**
   * メッセージを既読にする
   */
  const markAsRead = useCallback(
    async (messageId: number): Promise<boolean> => {
      try {
        const response = await ecImplement().readEcMessageCenter({
          message_id: messageId,
        });

        if (response instanceof CustomError) {
          setAlertState({
            message: 'メッセージの既読処理に失敗しました' + response.message,
            severity: 'error',
          });
          return false;
        }

        return true;
      } catch (error) {
        console.error('Failed to mark message as read:', error);
        setAlertState({
          message: 'メッセージの既読処理に失敗しました' + error,
          severity: 'error',
        });
        return false;
      }
    },
    [setAlertState],
  );

  /**
   * 特定のメッセージを取得する（詳細表示用）
   */
  const getMessageDetail = useCallback(
    async (messageId: number): Promise<MessageCenter | null> => {
      setLoading(true);
      try {
        const response = await ecImplement().getEcMessageCenter({
          id: messageId,
          take: undefined,
          skip: undefined,
        });

        if (response instanceof CustomError) {
          setAlertState({
            message: 'メッセージの詳細取得に失敗しました' + response.message,
            severity: 'error',
          });
          return null;
        }

        // 指定したIDのメッセージのみを取得
        const message = response.messageCenters.find(
          (item) => item.id === messageId,
        );

        if (!message) {
          setAlertState({
            message: 'メッセージが見つかりませんでした',
            severity: 'error',
          });
          return null;
        }

        return {
          id: message.id,
          title: message.title,
          content: message.content,
          read_at: message.read_at,
          created_at: message.created_at,
          kind: message.kind,
          order_store: message.order_store,
        };
      } catch (error) {
        console.error('Failed to fetch message detail:', error);
        setAlertState({
          message: 'メッセージの詳細取得に失敗しました' + error,
          severity: 'error',
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setAlertState],
  );

  /**
   * 未読メッセージ数を取得する
   */
  const getUnreadCount = useCallback(async (): Promise<number> => {
    try {
      const response = await ecImplement().getEcMessageCenter({
        id: undefined,
        take: undefined,
        skip: undefined,
      });

      if (response instanceof CustomError) {
        return 0;
      }

      // 未読メッセージ（read_at が null）の数をカウント
      const unreadCount = response.messageCenters.filter(
        (message) => message.read_at === null,
      ).length;

      return unreadCount;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      return 0;
    }
  }, []);

  return {
    loading,
    getMessageCenters,
    markAsRead,
    getMessageDetail,
    getUnreadCount,
  };
};

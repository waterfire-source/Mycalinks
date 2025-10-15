import { useMemo, useCallback, useState } from 'react';

import { createClientAPI, CustomError } from '@/api/implement';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { EcOrderContactStatus } from '@prisma/client';
import { StoreApiRes } from '@/api/frontend/store/api';
import {
  OrderBy,
  OrderKind,
  OrderKindSortOptions,
} from '@/feature/ec/inquiry/const';

type GetEcOrderStoreContactRes = StoreApiRes['getEcOrderStoreContact'];

export interface Inquiry {
  orderContacts: Array<
    {
      id: number;
      lastSentAt: Date | null;
      status: EcOrderContactStatus;
      orderId: number;
      storeId: number;
      kind: string;
      title: string;
      mycaUserId: number;
      mycaUserLastReadAt: Date;
      createdAt: Date;
      updatedAt: Date;
    } & {
      orderStore: {
        order: {
          id: number;
          code: string;
        };
        code: string;
      };
      messages: Array<{
        id: number;
        content?: string;
        createdAt: Date;
        mycaUserId: number | null;
        staffAccountId: number | null;
      }>;
    }
  >;
}

export const useInquiry = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const [inquiries, setInquiries] = useState<Inquiry>();
  const [isLoading, setIsLoading] = useState(false);

  const convertInquiryBackToFront = (
    backInquiry: GetEcOrderStoreContactRes,
  ) => {
    const frontInquiry: Inquiry = {
      orderContacts: backInquiry['orderContacts'].map((inquiry) => ({
        id: inquiry.id,
        lastSentAt: inquiry.last_sent_at,
        status: inquiry.status,
        orderId: inquiry.order_id,
        storeId: inquiry.store_id,
        kind: inquiry.kind,
        title: inquiry.title,
        mycaUserId: inquiry.myca_user_id,
        mycaUserLastReadAt: inquiry.myca_user_last_read_at,
        createdAt: inquiry.created_at,
        updatedAt: inquiry.updated_at,
        orderStore: {
          order: {
            id: inquiry.order_store.order.id,
            code: inquiry.order_store.order.code,
          },
          code: inquiry.order_store.code,
        },
        messages: inquiry.messages.map((message) => ({
          id: message.id,
          content: message.content,
          createdAt: message.created_at,
          mycaUserId: message.myca_user_id,
          staffAccountId: message.staff_account_id,
        })),
      })),
    };
    return frontInquiry;
  };

  // 全てのお問い合わせを取得
  const fetchAllInquiry = useCallback(
    async (orderBy?: OrderBy, includesMessages?: true) => {
      setIsLoading(true);
      const response = await clientAPI.store.getEcOrderStoreContact({
        storeId: store.id,
        query: {
          orderBy: orderBy,
          includesMessages: includesMessages,
        },
      });
      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        setIsLoading(false);
        throw response;
      }
      const frontInquiry = convertInquiryBackToFront(response);
      setInquiries(frontInquiry);
      setIsLoading(false);
      return frontInquiry;
    },
    [clientAPI.store, setAlertState, store.id],
  );

  // 条件指定でお問い合わせを取得
  const fetchInquiry = useCallback(
    async (
      orderId?: number,
      code?: string,
      kind?: OrderKind,
      skip?: number,
      take?: number,
      orderBy?: OrderBy,
      status?: EcOrderContactStatus,
      includesMessages?: true,
    ) => {
      setIsLoading(true);
      const response = await clientAPI.store.getEcOrderStoreContact({
        storeId: store.id,
        query: {
          orderId: orderId,
          code: code,
          kind: kind ? OrderKindSortOptions[kind] : undefined,
          skip: skip,
          take: take,
          orderBy: orderBy,
          status: status,
          includesMessages: includesMessages,
        },
      });

      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        setIsLoading(false);
        throw response;
      }
      const frontInquiry = convertInquiryBackToFront(response);
      setInquiries(frontInquiry);
      setIsLoading(false);
      return frontInquiry;
    },
    [clientAPI.store, setAlertState, store.id],
  );

  // お問い合わせへの返信と、状態の更新
  const replyAndUpdateStatus = useCallback(
    async ({
      orderId,
      content,
      status,
    }: {
      orderId: number;
      content?: string;
      status?: EcOrderContactStatus;
    }) => {
      if (!content && !status) {
        setAlertState({
          message: '返信内容または状態を指定してください',
          severity: 'error',
        });
        throw new CustomError('INVALID_PARAMETER', 400);
      }
      setIsLoading(true);
      const response = await clientAPI.store.replyEcOrderStoreContact({
        storeId: store.id,
        orderId: orderId,
        body: {
          content: content,
          status: status,
        },
      });
      if (response instanceof CustomError) {
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        setIsLoading(false);
        throw response;
      }
      if (status) {
        setAlertState({
          message: `状態を更新しました`,
          severity: 'success',
        });
      } else {
        setAlertState({
          message: '返信しました',
          severity: 'success',
        });
      }
      setIsLoading(false);
      return response;
    },
    [clientAPI.store, setAlertState, store.id],
  );

  return {
    inquiries,
    isLoading,
    convertInquiryBackToFront,
    fetchAllInquiry,
    fetchInquiry,
    replyAndUpdateStatus,
  };
};

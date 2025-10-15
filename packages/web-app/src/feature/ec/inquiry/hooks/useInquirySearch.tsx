import { useCallback, useState } from 'react';

import { EcOrderContactStatus } from '@prisma/client';
import { useInquiry } from '@/feature/ec/inquiry/hooks/useInquiry';
import { OrderBy, OrderKind } from '@/feature/ec/inquiry/const';

export interface InquirySearchState {
  orderId?: number;
  code?: string;
  kind?: OrderKind;
  skip?: number;
  take?: number; // 2025/04/17現在、仕様に取得件数がないため、対応するコードは未作成.
  orderBy?: OrderBy;
  status?: EcOrderContactStatus;
  includesMessages?: true;
  isLoading: boolean;
}

export const useInquirySearch = () => {
  const { inquiries, fetchInquiry } = useInquiry();
  const [searchState, setSearchState] = useState<InquirySearchState>({
    orderId: undefined,
    code: undefined,
    kind: undefined,
    skip: undefined,
    take: undefined,
    orderBy: 'last_sent_at',
    status: undefined,
    includesMessages: true,
    isLoading: false,
  });

  const performSearch = useCallback(async () => {
    setSearchState((prev) => ({ ...prev, isLoading: true }));
    await fetchInquiry(
      searchState.orderId,
      searchState.code,
      searchState.kind,
      searchState.skip,
      searchState.take,
      searchState.orderBy,
      searchState.status,
      searchState.includesMessages,
    );
    setSearchState((prev) => ({ ...prev, isLoading: false }));
  }, [
    searchState.orderId,
    searchState.code,
    searchState.kind,
    searchState.skip,
    searchState.take,
    searchState.orderBy,
    searchState.status,
    searchState.includesMessages,
    fetchInquiry,
  ]);

  return {
    inquiries,
    searchState,
    setSearchState,
    performSearch,
  };
};

import { useCallback, useState } from 'react';
import { CustomError, createClientAPI } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { Register_Cash_History } from '@prisma/client';
import { RegisterCashHistorySourceKind } from '@prisma/client';
import { getRegisterCashHistoryDef } from '@/app/api/store/[store_id]/register/def';
import dayjs from 'dayjs';

export interface CashHistorySearchState {
  sourceKind: Array<Register_Cash_History['source_kind']>;
  startAt: string;
  endAt: string;
  // staff_id: number | null;
  searchResults: typeof getRegisterCashHistoryDef.response.history;
  isLoading: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
}

// レジ履歴の絞り込みと取得を行うカスタムフック
export const useCashHistorySearch = (storeId: number) => {
  const { setAlertState } = useAlert();
  const [searchState, setSearchState] = useState<CashHistorySearchState>({
    sourceKind: [
      RegisterCashHistorySourceKind['import'],
      RegisterCashHistorySourceKind['export'],
    ],
    startAt: '',
    endAt: dayjs().format('YYYY-MM-DD'),
    // staff_id: null,
    searchResults: [] as typeof getRegisterCashHistoryDef.response.history,
    isLoading: false,
    totalCount: 0,
    page: 1,
    pageSize: 20,
  });

  // 検索を実行する関数
  const performSearch = useCallback(async () => {
    setSearchState((prevState) => ({
      ...prevState,
      isLoading: true,
    }));
    const startAt = Date.parse(searchState.startAt)
      ? (() => {
          const date = new Date(searchState.startAt);
          date.setHours(0, 0, 0, 0);
          return date;
        })()
      : undefined;

    const endAt = Date.parse(searchState.endAt)
      ? (() => {
          const date = new Date(searchState.endAt);
          date.setHours(23, 59, 59, 999);
          return date;
        })()
      : undefined;

    const query = {
      ...(searchState.sourceKind && {
        source_kind: searchState.sourceKind,
      }),
      ...(startAt && {
        startAt: startAt,
      }),
      ...(endAt && {
        endAt: endAt,
      }),
      take: searchState.pageSize,
      skip: (searchState.page - 1) * searchState.pageSize,
    };
    const clientAPI = createClientAPI();

    const response = await clientAPI.store.listRegisterCashHistory({
      storeID: storeId,
      query: query,
    });

    if (response instanceof CustomError) {
      setAlertState({ message: response.message, severity: 'error' });
      setSearchState((prevState) => ({
        ...prevState,
        isLoading: false,
      }));
      return;
    }
    setSearchState((prevState) => ({
      ...prevState,
      searchResults: response.history,
      totalCount: (response as any).totalCount || 0,
      isLoading: false,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchState.sourceKind,
    searchState.startAt,
    searchState.endAt,
    searchState.page,
    searchState.pageSize,
    storeId,
  ]);

  return {
    searchState,
    setSearchState,
    performSearch,
  };
};

import { ItemAPI } from '@/api/frontend/item/api';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { TransactionKind } from '@prisma/client';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';

const getTransactionKind = (value: string | null): TransactionKind | '' => {
  return value === TransactionKind.buy || value === TransactionKind.sell
    ? (value as TransactionKind)
    : '';
};

export interface ItemWithTransactionSearchState {
  itemId?: number;
  searchCurrentPage: number;
  searchItemPerPage: number;
  searchProductName?: string;
  searchCategoryId?: number;
  searchGenreId?: number;
  searchProductRarity?: string;
  searchProductNumber?: string;
  searchProductExpansion?: string;
  searchProductTag?: string;
  transactionKind: TransactionKind | '';
  orderBy?: string[];
  includesTransactions: boolean;
  customerId?: number;
}

export const useListItemsWithTransaction = (
  storeId: number,
  canGetTotal: boolean,
  includesSummary: boolean,
  isShow = true,
  searchParams?: URLSearchParams,
) => {
  const transactionKindParams = searchParams?.get('transaction_kind') ?? null;

  const customerIdParam = searchParams?.get('customer_id');

  // クエリパラメータがあればそれを優先し、なければ本日の日付を設定
  const startDateParam = searchParams?.get('startDate');
  const endDateParam = searchParams?.get('endDate');

  const [items, setItems] = useState<
    Exclude<
      ItemAPI['listItemWithTransaction']['response'],
      CustomError
    >['items']
  >([]);
  const [searchTotalCount, setSearchTotalCount] = useState<number>(0);
  // const [searchDate, setSearchDate] = useState({
  //   startDate: isShow
  //     ? dayjs().startOf('day').format('YYYY/MM/DD HH:mm:ss')
  //     : '', // 現在の日の00:00:00を初期値として設定
  //   endDate: dayjs().endOf('day').format('YYYY/MM/DD HH:mm:ss'),
  // });
  const [searchDate, setSearchDate] = useState({
    startDate:
      startDateParam ||
      (isShow ? dayjs().startOf('day').format('YYYY/MM/DD HH:mm:ss') : ''),
    endDate: endDateParam || dayjs().endOf('day').format('YYYY/MM/DD HH:mm:ss'),
  });
  const [totalAmount, setTotalAmount] = useState({
    buy: 0,
    sell: 0,
  });
  const { setAlertState } = useAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);
  const [isLoading, setIsLoading] = useState(false);

  const [searchState, setSearchState] =
    useState<ItemWithTransactionSearchState>({
      itemId: undefined,
      searchCurrentPage: 0,
      searchItemPerPage: 30,
      searchProductName: undefined,
      searchCategoryId: undefined,
      searchGenreId: undefined,
      searchProductRarity: undefined,
      searchProductNumber: undefined,
      searchProductExpansion: undefined,
      searchProductTag: undefined,
      transactionKind: getTransactionKind(transactionKindParams),
      orderBy: undefined,
      includesTransactions: false,
      customerId: customerIdParam ? Number(customerIdParam) : undefined,
    });

  const fetchItemsWithTransaction = useCallback(async () => {
    setIsLoading(true);
    const response = await clientAPI.item.listItemWithTransaction({
      storeId: storeId,
      itemId: searchState.itemId,
      skip: searchState.searchCurrentPage * searchState.searchItemPerPage,
      take: searchState.searchItemPerPage,
      transactionFinishedAtGte:
        searchDate.startDate === ''
          ? undefined
          : new Date(searchDate.startDate),
      transactionFinishedAtLt:
        searchDate.endDate === '' ? undefined : new Date(searchDate.endDate),
      displayName: searchState.searchProductName,
      ...(searchState.searchCategoryId !== 0 && {
        categoryId: searchState.searchCategoryId,
      }),
      ...(searchState.searchGenreId !== 0 && {
        genreId: searchState.searchGenreId,
      }),
      rarity: searchState.searchProductRarity,
      cardnumber: searchState.searchProductNumber,
      ...(searchState.searchProductExpansion !== '' && {
        expansion: searchState.searchProductExpansion,
      }),
      ...(searchState.transactionKind !== '' && {
        transactionKind: searchState.transactionKind,
      }),
      ...(searchState.searchProductTag !== '' && {
        productsTagName: searchState.searchProductTag,
      }),
      ...(searchState.searchProductExpansion !== '' && {
        expansion: searchState.searchProductExpansion,
      }),
      ...(searchState.orderBy && searchState.orderBy.length > 0
        ? { orderBy: searchState.orderBy }
        : {}),
      includesTransactions: searchState.includesTransactions,
      includesSummary: includesSummary,
      ...(searchState.customerId && { customerId: searchState.customerId }),
    });

    if (response instanceof CustomError) {
      setAlertState({
        message: `${response.status}:${response.message}`,
        severity: 'error',
      });
      setIsLoading(false);
      return;
    }

    setItems(response.items);

    if (response.summary) {
      setSearchTotalCount(response.summary.totalCount ?? 0);

      if (canGetTotal) {
        setTotalAmount({
          buy: response.summary.totalBuyPrice ?? 0,
          sell: response.summary.totalSellPrice ?? 0,
        });
      }
    } else {
      setTotalAmount({ buy: 0, sell: 0 });
    }

    setIsLoading(false);
  }, [
    clientAPI.item,
    storeId,
    searchState.itemId,
    searchDate.endDate,
    searchDate.startDate,
    searchState.searchProductName,
    searchState.searchCategoryId,
    searchState.searchGenreId,
    searchState.searchProductRarity,
    searchState.searchProductNumber,
    searchState.searchProductExpansion,
    searchState.searchProductTag,
    searchState.transactionKind,
    searchState.orderBy,
    searchState.searchCurrentPage,
    searchState.searchItemPerPage,
    searchState.includesTransactions,
    searchState.customerId,
    includesSummary,
    canGetTotal,
    setAlertState,
  ]);

  return {
    items,
    searchState,
    searchTotalCount,
    totalAmount,
    searchDate,
    setSearchDate,
    setSearchState,
    fetchItemsWithTransaction,
    isLoading,
  };
};

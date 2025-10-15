import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ItemWithEcOrderSearchState,
  ListItemWithEcOrderResponse,
} from '@/feature/ec/hooks/type';

type Props = {
  storeId: number;
  includesSummary?: boolean;
  includesEcOrders?: boolean;
};

/**ECの在庫別取引一覧取得 */
export const useListItemWithEcOrder = ({
  storeId,
  includesSummary = false,
  includesEcOrders = false,
}: Props) => {
  const searchParams = useSearchParams();
  const { setAlertState } = useAlert();
  const clientAPI = useMemo(() => createClientAPI(), []);

  // 取引一覧
  const [items, setItems] = useState<ListItemWithEcOrderResponse['items']>([]);
  const [isLoading, setIsLoading] = useState(false);
  // 取引総数
  const [searchTotalCount, setSearchTotalCount] = useState<number>(0);
  // 取引販売合計
  const [totalAmount, setTotalAmount] = useState(0);

  // 検索条件(日付) (初回レンダリング時に query を考慮)
  const [searchDate, setSearchDate] = useState(() => {
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    return {
      startDate:
        startDateParam || dayjs().startOf('day').format('YYYY/MM/DD HH:mm:ss'),
      endDate:
        endDateParam || dayjs().endOf('day').format('YYYY/MM/DD HH:mm:ss'),
    };
  });

  const [searchState, setSearchState] = useState<ItemWithEcOrderSearchState>({
    displayName: undefined,
    itemId: undefined,
    rarity: undefined,
    genreId: undefined,
    orderCreatedAtGte: undefined,
    orderCreatedAtLt: undefined,
    orderBy: undefined,
    searchCurrentPage: 0,
    searchItemPerPage: 30,
  });

  const fetchItemsWithEcOrder = useCallback(async () => {
    setIsLoading(true);
    const response = await clientAPI.ec.listItemWithEcOrder({
      storeId: storeId,
      displayName: searchState.displayName,
      itemId: searchState.itemId,
      rarity: searchState.rarity,
      genreId: searchState.genreId,
      orderCreatedAtGte:
        searchDate.startDate === ''
          ? undefined
          : new Date(searchDate.startDate),
      orderCreatedAtLt:
        searchDate.endDate === '' ? undefined : new Date(searchDate.endDate),
      orderBy: searchState.orderBy,
      includesSummary: includesSummary,
      includesEcOrders: includesEcOrders,
      skip: searchState.searchCurrentPage * searchState.searchItemPerPage,
      take: searchState.searchItemPerPage,
    });
    setIsLoading(false);

    if (response instanceof CustomError) {
      setAlertState({
        message: `${response.status}:${response.message}`,
        severity: 'error',
      });
      return;
    }

    setItems(response.items);

    if (response.summary) {
      setSearchTotalCount(response.summary.totalCount ?? 0);
      setTotalAmount(response.summary.totalSellPrice ?? 0);
    }
  }, [clientAPI.ec, storeId, searchState, searchDate, setAlertState]);

  return {
    items,
    searchState,
    searchTotalCount,
    totalAmount,
    searchDate,
    setSearchDate,
    setSearchState,
    fetchItemsWithEcOrder,
    isLoading,
  };
};

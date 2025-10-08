'use client';

import { useEffect, useState } from 'react';
import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { z } from 'zod';
import { getStatsApi } from '@api-defs/stats/def';
import { MycaPosApiClient } from 'api-generator/client';
import { formatISO } from 'date-fns';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { CustomError } from '@/api/implement';

type StatsResponse = z.infer<typeof getStatsApi.response>;
type StatsItem = StatsResponse['data'][number];
type FilterType = 'genre' | 'condition' | 'specialty' | 'category';

interface FilterOption {
  value: FilterType;
  label: string;
}

const filterOptions: FilterOption[] = [
  { value: 'genre', label: 'ジャンル別' },
  { value: 'condition', label: '状態別' },
  { value: 'specialty', label: '特殊状態別' },
  { value: 'category', label: 'カテゴリ別' },
];

interface DetailAnalyticsModalProps {
  open: boolean;
  onClose: () => void;
  storeId: number;
  selectedStats?: StatsItem | null;
  selectedDate?: string;
  isTaxIncluded: boolean;
  type: 'sell' | 'buy' | 'stock';
}

interface ModalConfig {
  title: string;
  analysisLabel: string;
  fetchData: (
    apiClient: MycaPosApiClient,
    storeId: number,
    start: Date,
    end: Date,
    filterType: FilterType,
  ) => Promise<any>;
  getDataArray: (data: any, filterType: FilterType) => any[];
  columns: (
    filterType: FilterType,
    getRawPrice: (price: number) => number,
    getDisplayPrice: (price: number) => string,
    getDisplayName: (item: any) => string,
  ) => ColumnDef<any>[];
}

const modalConfigs: Record<string, ModalConfig> = {
  sell: {
    title: '売上分析：販売',
    analysisLabel: '売上分析',
    fetchData: async (apiClient, storeId, start, end, filterType) => {
      const params = {
        storeId,
        kind: 'SELL' as const,
        dataDayGte: formatISO(start),
        dataDayLte: formatISO(end),
      };

      switch (filterType) {
        case 'genre':
          return await apiClient.stats.getTransactionStatsByGenre(params);
        case 'condition':
          return await apiClient.stats.getTransactionStatsByCondition(params);
        case 'specialty':
          return await apiClient.stats.getTransactionStatsBySpecialty(params);
        case 'category':
          return await apiClient.stats.getTransactionStatsByCategory(params);
      }
    },
    getDataArray: (data, filterType) => {
      if (!data) return [];
      switch (filterType) {
        case 'genre':
          return data.summaryByGenres || [];
        case 'condition':
          return data.summaryByConditions || [];
        case 'specialty':
          return data.summaryBySpecialties || [];
        case 'category':
          return data.summaryByCategories || [];
        default:
          return [];
      }
    },
    columns: (filterType, getRawPrice, getDisplayPrice, getDisplayName) => [
      {
        header:
          filterOptions
            .find((opt) => opt.value === filterType)
            ?.label.replace('別', '') || '',
        render: (data) => getDisplayName(data),
      },
      {
        header: '販売合計',
        render: (data) => getDisplayPrice(data.total_price || 0),
      },
      {
        header: '原価',
        render: (data) => getDisplayPrice(data.total_wholesale_price || 0),
      },
      {
        header: '粗利益',
        render: (data) => {
          const profit =
            getRawPrice(data.total_price || 0) -
            getRawPrice(data.total_wholesale_price || 0);
          return `${profit.toLocaleString()}円`;
        },
      },
      {
        header: '粗利率',
        render: (data) => {
          const price = getRawPrice(data.total_price || 0);
          const wholesale = getRawPrice(data.total_wholesale_price || 0);
          const profit = price - wholesale;
          const rate = price > 0 ? (profit / price) * 100 : 0;
          return `${rate.toFixed(1)}%`;
        },
      },
      {
        header: '客数',
        render: (data) => `${(data.total_count || 0).toLocaleString()}人`,
      },
      {
        header: '客単価',
        render: (data) => {
          const price = getRawPrice(data.total_price || 0);
          const value =
            (data.total_count || 0) > 0
              ? Math.round(price / (data.total_count || 1))
              : 0;
          return `${value.toLocaleString()}円`;
        },
      },
      {
        header: '販売点数',
        render: (data) => `${(data.total_item_count || 0).toLocaleString()}点`,
      },
      {
        header: '1点単価',
        render: (data) => {
          const price = getRawPrice(data.total_price || 0);
          const value =
            (data.total_item_count || 0) > 0
              ? Math.round(price / (data.total_item_count || 1))
              : 0;
          return `${value.toLocaleString()}円`;
        },
      },
    ],
  },
  buy: {
    title: '買取分析：買取',
    analysisLabel: '買取分析',
    fetchData: async (apiClient, storeId, start, end, filterType) => {
      const params = {
        storeId,
        kind: 'BUY' as const,
        dataDayGte: formatISO(start),
        dataDayLte: formatISO(end),
      };

      switch (filterType) {
        case 'genre':
          return await apiClient.stats.getTransactionStatsByGenre(params);
        case 'condition':
          return await apiClient.stats.getTransactionStatsByCondition(params);
        case 'specialty':
          return await apiClient.stats.getTransactionStatsBySpecialty(params);
        case 'category':
          return await apiClient.stats.getTransactionStatsByCategory(params);
      }
    },
    getDataArray: (data, filterType) => {
      if (!data) return [];
      switch (filterType) {
        case 'genre':
          return data.summaryByGenres || [];
        case 'condition':
          return data.summaryByConditions || [];
        case 'specialty':
          return data.summaryBySpecialties || [];
        case 'category':
          return data.summaryByCategories || [];
        default:
          return [];
      }
    },
    columns: (filterType, getRawPrice, getDisplayPrice, getDisplayName) => [
      {
        header:
          filterOptions
            .find((opt) => opt.value === filterType)
            ?.label.replace('別', '') || '',
        render: (data) => getDisplayName(data),
      },
      {
        header: '買取合計',
        render: (data) => getDisplayPrice(data.total_price || 0),
      },
      {
        header: '原価',
        render: (data) => '-',
      },
      {
        header: '粗利益',
        render: (data) => {
          return '-';
        },
      },
      {
        header: '粗利率',
        render: (data) => {
          return '-';
        },
      },
      {
        header: '客数',
        render: (data) => `${(data.total_count || 0).toLocaleString()}人`,
      },
      {
        header: '客単価',
        render: (data) => {
          const price = getRawPrice(data.total_price || 0);
          const value =
            (data.total_count || 0) > 0
              ? Math.round(price / (data.total_count || 1))
              : 0;
          return `${value.toLocaleString()}円`;
        },
      },
      {
        header: '買取点数',
        render: (data) => `${(data.total_item_count || 0).toLocaleString()}点`,
      },
      {
        header: '1点単価',
        render: (data) => {
          const price = getRawPrice(data.total_price || 0);
          const value =
            (data.total_item_count || 0) > 0
              ? Math.round(price / (data.total_item_count || 1))
              : 0;
          return `${value.toLocaleString()}円`;
        },
      },
    ],
  },
  stock: {
    title: '在庫分析：在庫',
    analysisLabel: '在庫分析',
    fetchData: async (apiClient, storeId, start, end, filterType) => {
      const params = {
        storeId,
        dataDayGte: formatISO(start),
        dataDayLte: formatISO(end),
      };

      switch (filterType) {
        case 'genre':
          return await apiClient.stats.getProductStatsByGenre(params);
        case 'condition':
          return await apiClient.stats.getProductStatsByCondition(params);
        case 'specialty':
          return await apiClient.stats.getProductStatsBySpecialty(params);
        case 'category':
          return await apiClient.stats.getProductStatsByCategory(params);
      }
    },
    getDataArray: (data, filterType) => {
      if (!data) return [];
      switch (filterType) {
        case 'genre':
          return data.summaryByGenres || [];
        case 'condition':
          return data.summaryByConditions || [];
        case 'specialty':
          return data.summaryBySpecialties || [];
        case 'category':
          return data.summaryByCategories || [];
        default:
          return [];
      }
    },
    columns: (filterType, getRawPrice, getDisplayPrice, getDisplayName) => [
      {
        header:
          filterOptions
            .find((opt) => opt.value === filterType)
            ?.label.replace('別', '') || '',
        render: (data) => getDisplayName(data),
      },
      {
        header: '在庫総額',
        render: (data) => getDisplayPrice(data.total_wholesale_price || 0),
      },
      {
        header: '売価高',
        render: (data) => getDisplayPrice(data.total_sale_price || 0),
      },
      {
        header: '在庫数',
        render: (data) =>
          `${(data.total_stock_number || 0).toLocaleString()}点`,
      },
      {
        header: '平均仕入単価',
        render: (data) => {
          const avgPrice =
            (data.total_stock_number || 0) > 0
              ? getRawPrice(data.total_wholesale_price || 0) /
                (data.total_stock_number || 1)
              : 0;
          return `${Math.round(avgPrice).toLocaleString()}円`;
        },
      },
      {
        header: '平均売価',
        render: (data) => {
          const avgPrice =
            (data.total_stock_number || 0) > 0
              ? getRawPrice(data.total_sale_price || 0) /
                (data.total_stock_number || 1)
              : 0;
          return `${Math.round(avgPrice).toLocaleString()}円`;
        },
      },
      {
        header: '粗利率',
        render: (data) => {
          const salePrice = getRawPrice(data.total_sale_price || 0);
          const wholeSalePrice = getRawPrice(data.total_wholesale_price || 0);
          const profit = salePrice - wholeSalePrice;
          const rate = salePrice > 0 ? (profit / salePrice) * 100 : 0;
          return `${rate.toFixed(1)}%`;
        },
      },
    ],
  },
};

export const DetailAnalyticsModal = ({
  open,
  onClose,
  storeId,
  selectedStats,
  selectedDate,
  isTaxIncluded,
  type,
}: DetailAnalyticsModalProps) => {
  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });
  const { handleError } = useErrorAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('genre');
  const [data, setData] = useState<any>();

  const config = modalConfigs[type];

  const fetchData = async (start: Date, end: Date, filterType: FilterType) => {
    setIsLoading(true);

    try {
      const res = await config.fetchData(
        apiClient,
        storeId,
        start,
        end,
        filterType,
      );
      if (res instanceof CustomError) throw res;
      setData(res);
    } catch (e) {
      handleError(e);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (!selectedStats) return;
    fetchData(
      new Date(selectedStats.start_day),
      new Date(selectedStats.end_day),
      selectedFilter,
    );
  }, [selectedStats, storeId, selectedFilter, type]);

  const getRawPrice = (price: number): number => {
    return isTaxIncluded ? price : Math.round(price / 1.1);
  };

  const getDisplayPrice = (price: number): string => {
    return `${getRawPrice(price).toLocaleString()}円`;
  };

  const getDisplayName = (item: any): string => {
    switch (selectedFilter) {
      case 'genre':
        return item.genre_display_name || '';
      case 'condition':
        return item.condition_display_name || '';
      case 'specialty':
        return item.specialty_display_name || '特殊状態なし';
      case 'category':
        return item.category_display_name || '';
      default:
        return '';
    }
  };

  const dataArray = config.getDataArray(data, selectedFilter);
  const columns = config.columns(
    selectedFilter,
    getRawPrice,
    getDisplayPrice,
    getDisplayName,
  );
  const selectedFilterLabel =
    filterOptions.find((opt) => opt.value === selectedFilter)?.label || '';

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title={`${config.title} ${selectedDate || ''}`}
      width="90%"
      height="90%"
      cancelButtonText="閉じる"
    >
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ color: 'black' }}>表示方法</InputLabel>
          <Select
            value={selectedFilter}
            label="表示方法"
            onChange={(e) => setSelectedFilter(e.target.value as FilterType)}
            sx={{
              color: 'black',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.23)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.87)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }}
          >
            {filterOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Typography variant="h6" sx={{ mb: 1 }}>
        {selectedFilterLabel}
        {config.analysisLabel}
      </Typography>

      <CustomTable<any>
        columns={columns}
        rows={dataArray}
        rowKey={(row) => getDisplayName(row)}
        isLoading={isLoading}
        sx={{ borderTop: '8px solid', borderTopColor: 'primary.main' }}
      />
    </CustomModalWithIcon>
  );
};

'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAlert } from '@/contexts/AlertContext';
import { z } from 'zod';
import { getStatsApi, getProductStatsApi } from '@api-defs/stats/def';
import { ApiError, MycaPosApiClient } from 'api-generator/client';
import { formatISO } from 'date-fns';

// 型定義を Zod スキーマから抽出
type StatsResponse = z.infer<typeof getStatsApi.response>;
type StatsItem = StatsResponse['data'][number];
type ProductStatsResponse = z.infer<typeof getProductStatsApi.response>;

export interface StockDetailContentProps {
  storeId: number;
  selectedStats?: StatsItem | null;
  isTaxIncluded: boolean;
}

export function StockDetailContent({
  storeId,
  selectedStats,
  isTaxIncluded,
}: StockDetailContentProps) {
  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });
  const { setAlertState } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [statsProduct, setStatsProduct] = useState<ProductStatsResponse>();

  // 売上分析の詳細データをAPIから取得する
  const fetchProductStats = async (start: Date, end: Date) => {
    setIsLoading(true);

    try {
      const res = await apiClient.stats.getProductStats({
        storeId: storeId,
        dataDayGte: formatISO(start),
        dataDayLte: formatISO(end),
      });

      const converted = {
        ...res,
        start_day: res.start_day ? new Date(res.start_day) : null,
        end_day: res.end_day ? new Date(res.end_day) : null,
        summary: {
          total_sell_price: res.summary.total_sell_price
            ? BigInt(res.summary.total_sell_price)
            : 0n,
          total_wholesale_price: res.summary.total_wholesale_price
            ? BigInt(res.summary.total_wholesale_price)
            : 0n,
          total_stock_number: res.summary.total_stock_number,
        },
      };

      setStatsProduct(converted);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setAlertState({
          message: '売上分析のデータが見つかりませんでした。',
          severity: 'error',
        });
        const nothingData = {
          start_day: selectedStats?.start_day || null,
          end_day: selectedStats?.end_day || null,
          summary: {
            total_sell_price: 0n,
            total_wholesale_price: 0n,
            total_stock_number: 0,
          },
        };
        setStatsProduct(nothingData);
        setIsLoading(false);
        return;
      } else {
        setAlertState({
          message: '売上分析の取得に失敗しました。',
          severity: 'error',
        });
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (!selectedStats) return;
    fetchProductStats(
      new Date(selectedStats.start_day),
      new Date(selectedStats.end_day),
    );
  }, [selectedStats, storeId]);

  // レコードが選択されていない場合は、詳細は表示しない
  if (!selectedStats) {
    return (
      <Typography
        sx={{
          textAlign: 'center', // 水平中央
          justifyContent: 'center', // 垂直中央
        }}
      >
        クリックして詳細を表示
      </Typography>
    );
  }

  // 詳細データ取得中はローディングアイコンを表示する
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  // 金額の税込・税別の変換処理
  const getDisplayBigPrice = (price: bigint | undefined): string => {
    if (price === undefined) return '-';
    const raw = Number(price);
    const displayPrice = isTaxIncluded ? raw : Math.round(raw / 1.1);
    return `${displayPrice.toLocaleString()}円`;
  };

  return (
    <Box>
      <Box
        sx={{
          p: 2,
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 400px)',
        }}
      >
        {/* 総在庫金額 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            borderBottom: '1px solid #ccc',
          }}
        >
          <Typography variant="h1" sx={{ minWidth: 170 }}>
            総在庫金額
          </Typography>
          <Typography variant="h1" sx={{ textAlign: 'right', flexGrow: 1 }}>
            {getDisplayBigPrice(statsProduct?.summary.total_wholesale_price)}
          </Typography>
        </Box>

        {/* 売価高 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            borderBottom: '1px solid #ccc',
          }}
        >
          <Typography variant="body1" sx={{ minWidth: 170 }}>
            売価高
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'right', flexGrow: 1 }}>
            {getDisplayBigPrice(statsProduct?.summary.total_sell_price)}
          </Typography>
        </Box>

        {/* 在庫点数 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            borderBottom: '1px solid #ccc',
          }}
        >
          <Typography variant="body1" sx={{ minWidth: 170 }}>
            在庫点数
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'right', flexGrow: 1 }}>
            {`${
              statsProduct?.summary.total_stock_number.toLocaleString() || '-'
            }点`}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column', // 縦並びにする
          alignItems: 'center', // 中央揃え
          gap: 2, // ボタン間の余白
          px: 2,
          pt: 2,
          width: '100%',
        }}
      ></Box>
    </Box>
  );
}

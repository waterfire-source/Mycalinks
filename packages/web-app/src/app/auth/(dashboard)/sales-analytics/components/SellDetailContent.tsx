'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useAlert } from '@/contexts/AlertContext';
import { z } from 'zod';
import { getStatsApi, getTransactionStatsApi } from '@api-defs/stats/def';
import { MycaPosApiClient } from 'api-generator/client';
import { formatISO } from 'date-fns';
import { TransactionKindEnum } from '@/app/auth/(dashboard)/sales-analytics/page';
import { RowItem } from '@/app/auth/(dashboard)/sales-analytics/components/DetailContent';
import { TaxCalculator } from '@/constants/tax';

// 型定義を Zod スキーマから抽出
type StatsResponse = z.infer<typeof getStatsApi.response>;
type StatsItem = StatsResponse['data'][number];
type TransactionStatsResponse = z.infer<typeof getTransactionStatsApi.response>;

export interface SellDetailContentProps {
  storeId: number;
  selectedStats?: StatsItem | null;
  isTaxIncluded: boolean;
}

export function SellDetailContent({
  storeId,
  selectedStats,
  isTaxIncluded,
}: SellDetailContentProps) {
  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });
  const { setAlertState } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<RowItem[]>([]);
  const [statsTransaction, setStatsTransaction] =
    useState<TransactionStatsResponse>();

  // 売上分析の詳細データをAPIから取得する
  const fetchTransactionStats = async (start: Date, end: Date) => {
    setIsLoading(true);

    try {
      const res = await apiClient.stats.getTransactionStats({
        storeId: storeId,
        kind: TransactionKindEnum.SELL,
        dataDayGte: formatISO(start),
        dataDayLte: formatISO(end),
      });

      const converted = {
        ...res,
        start_day: res.start_day ? new Date(res.start_day) : null,
        end_day: res.end_day ? new Date(res.end_day) : null,
      };

      setStatsTransaction(converted);
    } catch (e) {
      setAlertState({
        message: '売上分析の取得に失敗しました。',
        severity: 'error',
      });
      console.error('売上分析の取得に失敗しました', e);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (!selectedStats) return;
    fetchTransactionStats(
      new Date(selectedStats.start_day),
      new Date(selectedStats.end_day),
    );
  }, [selectedStats, storeId]);

  useEffect(() => {
    if (statsTransaction) {
      APIDataToRows(statsTransaction);
    }
  }, [isTaxIncluded, statsTransaction]);

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

  const APIDataToRows = (APIData: TransactionStatsResponse) => {
    const sellData = APIData.summary.sell;

    //正の値が返ってくるが、表記的にはマイナスで表示する値のフォーマット関数
    const forMinusValue = (value: number, suffix: string = '円') => {
      if (value === 0) {
        return format(value, suffix);
      } else {
        if (suffix === '円') {
          return `-${getDisplayPrice(value)}`;
        } else {
          return `-${value.toLocaleString()}${suffix}`;
        }
      }
    };

    const taxCalculator = new TaxCalculator();
    //税別と税込の価格表示を切り替える関数
    const getDisplayPrice = (price: number): string => {
      if (isTaxIncluded) {
        return `${price.toLocaleString()}円`;
      } else {
        const taxExcluded = taxCalculator.getPriceWithoutTax(price);
        return `${taxExcluded.toLocaleString()}円`;
      }
    };

    //値から「~円」や「~ポイント」という文字列にする関数
    const format = (
      value: number | undefined | null,
      suffix: string = '円',
    ) => {
      if (value !== undefined && value !== null) {
        if (suffix === '円') {
          return getDisplayPrice(value);
        } else {
          return `${value.toLocaleString()}${suffix}`;
        }
      }
      return `-${suffix}`;
    };

    const data: RowItem[] = [
      {
        label: '純売上',
        value: format(sellData.pure_sales),
        children: [
          {
            label: '総売上',
            value: format(sellData.total_sales),
          },
          {
            label: '全体割引合計額',
            value: format(sellData.total_discount_price),
            children: [
              {
                label: '手動全体割引額',
                value: format(sellData.discount_price),
              },
              {
                label: 'セット割引合計',
                value: format(sellData.set_deal_discount_price),
              },
            ],
          },
          {
            label: '個別割引合計額',
            value: format(sellData.product_total_discount_price),
            children: [
              {
                label: '手動個別割引額',
                value: format(sellData.product_discount_price),
              },
              {
                label: 'セール割引合計',
                value: format(sellData.sale_discount_price),
              },
            ],
          },
          {
            label: '返品額',
            value: forMinusValue(sellData.return_price),
          },
          {
            label: '使用ポイント',
            value: forMinusValue(sellData.used_point, 'ポイント'),
          },
        ],
      },
      {
        label: '原価',
        value: format(
          APIData.summary.sell.wholesale_price +
            APIData.summary.sell.loss_wholesale_price,
        ),
        children: [
          {
            label: '売上原価',
            value: format(APIData.summary.sell.wholesale_price),
          },
          {
            label: 'ロス原価',
            value: format(APIData.summary.sell.loss_wholesale_price),
          },
        ],
      },
      {
        label: '粗利益',
        value: format(APIData.summary.sell.gross_profit),
      },
      {
        label: '粗利率',
        value: format(APIData.summary.sell.gross_profit_rate, '%'),
      },
      {
        label: '客単価',
        value: format(APIData.summary.sell.avg_spend_per_customer),
        children: [
          {
            label: '客数',
            value: format(APIData.summary.sell.count, '名'),
          },
        ],
      },
      {
        label: '１点単価',
        value: format(APIData.summary.sell.avg_price_per_item),
        children: [
          {
            label: '販売点数',
            value: format(APIData.summary.sell.item_count, '点'),
          },
        ],
      },
      {
        label: '返品取引数',
        value: format(APIData.summary.sell.return_count, '件'),
      },
      {
        label: '付与ポイント',
        value: format(APIData.summary.sell.given_point, 'ポイント'),
      },
    ];

    setRows(data);
  };

  const renderRows = (items: RowItem[], depth: number = 0): JSX.Element[] => {
    const widths = ['100%', '90%', '80%'];
    const margins = [0, 2, 4];
    const fontSize = [16, 14, 12];

    return items.flatMap((item, index) => {
      const width = widths[depth] ?? '80%';
      const ml = margins[depth] ?? 4;
      const fz = fontSize[depth] ?? 14;

      return [
        <Box
          key={`${depth}-${index}-${item.label}`}
          display="flex"
          justifyContent="space-between"
          width={width}
          ml={ml}
          py={0.5}
          borderBottom={depth !== 2 ? '1px solid #ddd' : undefined}
        >
          <Typography fontSize={fz}>{item.label}</Typography>
          <Typography fontSize={fz}>{item.value}</Typography>
        </Box>,
        ...(item.children ? renderRows(item.children, depth + 1) : []),
      ];
    });
  };

  return (
    <Box sx={{ maxHeight: '100%', overflowY: 'auto' }}>
      <Stack alignItems="flex-end">{renderRows(rows)}</Stack>
    </Box>
  );
}

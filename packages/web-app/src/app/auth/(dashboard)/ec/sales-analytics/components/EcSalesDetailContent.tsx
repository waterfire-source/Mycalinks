'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useAlert } from '@/contexts/AlertContext';
import {
  EcSalesStat,
  useListSalesStats,
  EcSalesDetail,
} from '@/feature/ec/hooks/useListSalesStats';
import { DetailCard } from '@/components/cards/DetailCard';
import { customDayjs } from 'common';

// 詳細表示用の行データ型
export interface RowItem {
  label: string;
  value: string;
  children?: RowItem[];
}

export interface EcSalesDetailContentProps {
  selectedStats?: EcSalesStat | null;
  isTaxIncluded?: boolean;
}

export const EcSalesDetailContent = ({
  selectedStats,
  isTaxIncluded = true,
}: EcSalesDetailContentProps) => {
  const { setAlertState } = useAlert();
  const { fetchingDetail, findEcSalesDetail } = useListSalesStats();
  const [rows, setRows] = useState<RowItem[]>([]);
  const [detailData, setDetailData] = useState<EcSalesDetail | null>(null);

  // EC売上詳細データをAPIから取得する
  const fetchEcSalesDetail = async (start: Date, end: Date) => {
    const res = await findEcSalesDetail({
      dataDayGte: customDayjs(start).format('YYYY-MM-DD'),
      dataDayLte: customDayjs(end).format('YYYY-MM-DD'),
    });

    if (!res)
      return setAlertState({
        message: 'EC売上詳細の取得に失敗しました。',
        severity: 'error',
      });

    setDetailData(res);
  };

  useEffect(() => {
    if (selectedStats) {
      fetchEcSalesDetail(selectedStats.start_day, selectedStats.end_day);
    }
  }, [selectedStats]);

  useEffect(() => {
    if (detailData) {
      convertToRowData(detailData);
    }
  }, [detailData, isTaxIncluded]);

  const convertToRowData = (data: EcSalesDetail) => {
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

    //価格表示関数（税込/税別切り替え対応）
    const getDisplayPrice = (price: number): string => {
      const displayPrice = isTaxIncluded ? price : Math.round(price / 1.1);
      return `${displayPrice.toLocaleString()}円`;
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

    const summary = data.summary;

    const rowData: RowItem[] = [
      {
        label: '実売上',
        value: format(summary.actual_sales),
        children: [
          {
            label: '総売上',
            value: format(summary.net_sales),
            children: [
              {
                label: '商品売上',
                value: format(summary.product_sales),
              },
              {
                label: '送料合計',
                value: format(summary.shipping_fee),
              },
            ],
          },
          {
            label: 'Mall手数料',
            value: forMinusValue(summary.mall_commission),
          },
        ],
      },
      {
        label: '原価',
        value: format(summary.wholesale_price),
      },
      {
        label: '粗利益',
        value: format(summary.gross_profit),
      },
      {
        label: '粗利率',
        value: format(summary.gross_rate, '%'),
      },
      {
        label: '注文単価',
        value: format(summary.complete_unit_price),
        children: [
          {
            label: '確定注文数',
            value: format(summary.completed_count, '件'),
          },
          {
            label: 'キャンセル率',
            value: format(summary.cancel_rate, '%'),
          },
          {
            label: 'キャンセル数',
            value: format(summary.canceled_count, '件'),
          },
        ],
      },
      {
        label: '1点単価',
        value: format(summary.sales_unit_price),
        children: [
          {
            label: '販売点数',
            value: format(summary.sales_item_count, '点'),
          },
        ],
      },
      {
        label: '欠品報告回数',
        value: format(summary.change_count, '件'),
      },
    ];

    setRows(rowData);
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
    <DetailCard
      title={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            height: '41px',
          }}
        >
          <Box>
            <Typography variant="h1" color="text.secondary">
              {selectedStats
                ? customDayjs(selectedStats.start_day).format('YYYY/MM/DD') +
                  (customDayjs(selectedStats.start_day).format('YYYY/MM/DD') !==
                  customDayjs(selectedStats.end_day).format('YYYY/MM/DD')
                    ? ` - ${customDayjs(selectedStats.end_day).format(
                        'YYYY/MM/DD',
                      )}`
                    : '')
                : ''}
            </Typography>
          </Box>
        </Box>
      }
      titleTextColor="text.secondary"
      titleBackgroundColor="secondary.main"
      titleSx={{ borderRadius: 0 }}
      containerSx={{
        border: '1px solid #fff',
      }}
      content={
        selectedStats ? (
          <Box sx={{ maxHeight: '100%', overflowY: 'auto' }}>
            {fetchingDetail ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack alignItems="flex-end">{renderRows(rows)}</Stack>
            )}
          </Box>
        ) : (
          <Typography
            sx={{
              textAlign: 'center',
              justifyContent: 'center',
              py: 4,
            }}
          >
            左の行をクリックして詳細を表示
          </Typography>
        )
      }
    ></DetailCard>
  );
};

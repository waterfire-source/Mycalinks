'use client';
import { ShipmentInfo } from '@/app/auth/(dashboard)/store-shipment/hooks/useGetShipmentInfo';
import { ShipmentProduct } from '@/app/auth/(dashboard)/store-shipment/register/page';
import { ShipmentDateFilter } from '@/app/auth/(dashboard)/store-shipment/components/ShipmentDateFilter';
import { StaffFilter } from '@/app/auth/(dashboard)/store-shipment/components/StaffFilter';
import { Chip } from '@/components/chips/Chip';
import {
  ColumnDef,
  CustomTabTable,
  TabDef,
} from '@/components/tabs/CustomTabTable';
import { Box, Stack, Typography } from '@mui/material';
import { customDayjs } from 'common';

type Props = {
  rows: ShipmentInfo['storeShipments'];
  allProducts: ShipmentProduct[];
  allStores: { id: number; display_name: string | null }[];
  handleClickRow: (shipmentId: number) => void;
};

export const StoreShipmentTabTableContent = ({
  rows,
  allProducts,
  allStores,
  handleClickRow,
}: Props) => {
  const columns: ColumnDef<ShipmentInfo['storeShipments'][number]>[] = [
    {
      header: 'ステータス',
      render: (item) => {
        const getStatusConfig = (status: string) => {
          switch (status) {
            case 'SHIPPED':
              return { text: '出荷済み', variant: 'primary' as const };
            case 'NOT_YET':
              return { text: '下書き', variant: 'secondary' as const };
            case 'FINISHED':
              return { text: '納品済み', variant: 'third' as const };
            case 'CANCELED':
              return { text: 'キャンセル', variant: 'fourth' as const };
            case 'ROLLBACK':
              return { text: 'キャンセル', variant: 'fourth' as const };
            default:
              return { text: 'その他', variant: 'secondary' as const };
          }
        };

        const statusConfig = getStatusConfig(item.status);
        return (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 60,
            }}
          >
            <Chip
              text={statusConfig.text}
              variant={statusConfig.variant}
            ></Chip>
          </Box>
        );
      },
    },
    {
      header: <Box sx={{ textAlign: 'left', width: '100%' }}>商品</Box>,
      render: (item) => {
        if (!Array.isArray(allProducts)) return;
        const firstProduct = allProducts.find(
          (p) => p.id === item.products[0].product_id,
        );
        const productCount = item.products.length;

        return (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'left',
              alignItems: 'center',
            }}
          >
            <Stack sx={{ width: '100%', alignItems: 'start' }}>
              <Typography>{firstProduct?.display_name}</Typography>
              {item.products.length > 1 && (
                <Chip text={`他${productCount - 1}商品`} variant="secondary" />
              )}
            </Stack>
          </Box>
        );
      },
    },
    {
      header: '合計仕入れ値',
      render: (item) => {
        return (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography>
              {item.total_wholesale_price?.toLocaleString() || '-'}円
            </Typography>
          </Box>
        );
      },
    },
    {
      header: '出荷日',
      render: (item) => {
        const display = customDayjs(item.shipment_date)
          .tz()
          .format('YYYY/MM/DD');
        return (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography>{display}</Typography>
          </Box>
        );
      },
    },
    {
      header: '納品日',
      render: (item) => {
        const display = item.finished_at
          ? customDayjs(item.finished_at).tz().format('YYYY/MM/DD')
          : '-';
        return (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography>{display}</Typography>
          </Box>
        );
      },
    },
    {
      header: '出荷先',
      render: (item) => {
        const targetStore = allStores.find((s) => s.id === item.to_store_id);
        return (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography>{targetStore?.display_name || '-'}</Typography>
          </Box>
        );
      },
    },
    {
      header: '作成日',
      key: 'created_at',
      isSortable: true,
      isHideColumn: true,
      render: (item) => {
        const display = customDayjs(item.created_at).tz().format('YYYY/MM/DD');
        return (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography>{display}</Typography>
          </Box>
        );
      },
    },
  ];

  // タブ定義（今回は全件表示のため単一タブ）
  const tabs: TabDef<ShipmentInfo['storeShipments'][number]>[] = [
    {
      label: 'すべて',
      filterFn: (data) => data,
    },
    {
      label: '下書き',
      filterFn: (data) => data.filter((item) => item.status === 'NOT_YET'),
    },
    {
      label: '出荷済み',
      filterFn: (data) => data.filter((item) => item.status === 'SHIPPED'),
    },
    {
      label: '納品済み',
      filterFn: (data) => data.filter((item) => item.status === 'FINISHED'),
    },
    {
      label: 'キャンセル',
      filterFn: (data) =>
        data.filter(
          (item) => item.status === 'CANCELED' || item.status === 'ROLLBACK',
        ),
    },
  ];

  // フィルタコンポーネント
  const filterComponent = (
    <Box display="flex" gap={2} alignItems="center">
      <ShipmentDateFilter />
      <StaffFilter />
    </Box>
  );

  return (
    <Box mt={2}>
      <CustomTabTable<ShipmentInfo['storeShipments'][number]>
        data={rows}
        columns={columns}
        tabs={tabs}
        rowKey={(item) => item.id.toString()}
        onRowClick={(item) => handleClickRow(item.id)}
        addFilter={filterComponent}
        isSingleSortMode
      />
    </Box>
  );
};

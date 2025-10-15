'use client';

import { Box, Stack, Typography } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ItemText } from '@/feature/item/components/ItemText';
import { z } from 'zod';
import { getAppraisalApi } from '@api-defs/appraisal/def';
import { CustomTabTable, TabDef } from '@/components/tabs/CustomTabTable';
import { ColumnDef } from '@/components/tables/CustomTable';
import { Chip } from '@/components/chips/Chip';

// 型定義
type AppraisalResponse = z.infer<typeof getAppraisalApi.response>;
type AppraisalItem = AppraisalResponse['appraisals'][number];
type ProductItem = AppraisalItem['products'][number];

interface PsaTableContentProps {
  appraisals: AppraisalItem[];
  isLoading: boolean;
  handleInputResult: (appraisalId: number) => void;
  onRowClick: (appraisalId: number) => void;
}

export const PsaTableContent = ({
  appraisals,
  isLoading,
  handleInputResult,
  onRowClick,
}: PsaTableContentProps) => {
  const columns: ColumnDef<AppraisalItem>[] = [
    {
      header: '商品名',
      key: 'productName',
      sx: { width: '35%', minWidth: 200 },
      render: (params) => {
        const products = params.products ?? [];
        if (products.length === 0) {
          return <Typography>商品なし</Typography>;
        }
        if (products.length === 1) {
          return <ItemText text={products[0].product.display_name} />;
        }
        return (
          <Stack>
            <ItemText text={products[0].product.display_name} />
            <Chip variant="secondary" text={`他${products.length - 1}商品`} />
          </Stack>
        );
      },
    },
    {
      header: '商品数',
      key: 'quantity',
      sx: { width: '10%', minWidth: 80 },
      render: (params) => <Typography>{params.products.length}</Typography>,
    },
    {
      header: '発送日',
      key: 'shippingDate',
      sx: { width: '15%', minWidth: 120 },
      render: (params) => (
        <Typography>
          {new Date(params.shipping_date).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      header: '合計仕入値',
      key: 'totalPurchaseValue',
      sx: { width: '15%', minWidth: 120 },
      render: (params) => {
        const total = params.products.reduce(
          (sum: number, p: ProductItem) => sum + (p.wholesale_price || 0),
          0,
        );
        return <Typography>{total.toLocaleString()}円</Typography>;
      },
    },
    {
      header: '鑑定費用',
      key: 'appraisalFee',
      sx: { width: '10%', minWidth: 100 },
      render: (params) => (
        <Typography>{params.appraisal_fee.toLocaleString()}円</Typography>
      ),
    },
    {
      header: '',
      key: 'Button',
      sx: { width: '15%', minWidth: 140 },
      render: (params) =>
        !params.finished && (
          <PrimaryButton onClick={() => handleInputResult(params.id)}>
            <Typography sx={{ whiteSpace: 'nowrap' }}>鑑定結果入力</Typography>
          </PrimaryButton>
        ),
    },
  ];

  const tabs: TabDef<AppraisalItem>[] = [
    {
      label: 'すべて',
      value: 'all',
      filterFn: (data) => data,
    },
    {
      label: '提出中',
      value: 'unsubmitted',
      filterFn: (data) => data.filter((item) => !item.finished),
    },
    {
      label: '返却済み',
      value: 'submitted',
      filterFn: (data) => data.filter((item) => item.finished),
    },
  ];

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <CustomTabTable<AppraisalItem>
        data={appraisals}
        columns={columns}
        isLoading={isLoading}
        onRowClick={(item) => onRowClick(item.id)}
        tabs={tabs}
        rowKey={(item) => item.id}
        tableContainerSx={{
          maxHeight: 'calc(100vh - 200px)',
          overflow: 'auto',
        }}
      />
    </Box>
  );
};

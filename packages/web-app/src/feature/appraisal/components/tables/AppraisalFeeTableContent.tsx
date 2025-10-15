import React from 'react';
import { Box, TextField, Stack } from '@mui/material';
import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { AppraisalFeeData } from '@/feature/appraisal/components/tables/AppraisalFeeTable';
import NumericTextField from '@/components/inputFields/NumericTextField';

type Props = {
  feeData: AppraisalFeeData;
  updateFeeData: <K extends keyof AppraisalFeeData>(
    key: K,
    value: AppraisalFeeData[K],
  ) => void;
  applyFeeData: () => void;
};

interface FeeDataRow extends AppraisalFeeData {
  id: number;
}

export const AppraisalFeeTableContent: React.FC<Props> = ({
  feeData,
  updateFeeData,
  applyFeeData,
}) => {
  // 1行のデータとして扱う
  const rows: FeeDataRow[] = [
    {
      id: 1,
      ...feeData,
    },
  ];

  const columns: ColumnDef<FeeDataRow>[] = [
    {
      header: '送料(税込み)',
      render: (item: FeeDataRow) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            py: 1,
          }}
        >
          <NumericTextField
            value={item.shippingFee}
            onChange={(value) => updateFeeData('shippingFee', value)}
            variant="outlined"
            size="small"
            fullWidth
            min={0}
            onBlur={applyFeeData}
            InputProps={{
              endAdornment: '円',
            }}
          />
        </Box>
      ),
      sx: { width: '150px' },
    },
    {
      header: '保険料(税込み)',
      render: (item: FeeDataRow) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            py: 1,
          }}
        >
          <NumericTextField
            value={item.insuranceFee}
            onChange={(value) => updateFeeData('insuranceFee', value)}
            variant="outlined"
            size="small"
            fullWidth
            min={0}
            onBlur={applyFeeData}
            InputProps={{
              endAdornment: '円',
            }}
          />
        </Box>
      ),
      sx: { width: '150px' },
    },
    {
      header: '事務手数料(税込み)',
      render: (item: FeeDataRow) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            py: 1,
          }}
        >
          <NumericTextField
            value={item.handlingFee}
            onChange={(value) => updateFeeData('handlingFee', value)}
            variant="outlined"
            size="small"
            fullWidth
            min={0}
            onBlur={applyFeeData}
            InputProps={{
              endAdornment: '円',
            }}
          />
        </Box>
      ),
      sx: { width: '150px' },
    },
    {
      header: 'その他手数料(税込み)',
      render: (item: FeeDataRow) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            py: 1,
          }}
        >
          <NumericTextField
            value={item.otherFee}
            onChange={(value) => updateFeeData('otherFee', value)}
            variant="outlined"
            size="small"
            fullWidth
            min={0}
            onBlur={applyFeeData}
            InputProps={{
              endAdornment: '円',
            }}
          />
        </Box>
      ),
      sx: { width: '150px' },
    },
    {
      header: '備考',
      render: (item: FeeDataRow) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            py: 1,
          }}
        >
          <TextField
            value={item.description}
            onChange={(e) => updateFeeData('description', e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
            multiline
            onBlur={applyFeeData}
            rows={2}
          />
        </Box>
      ),
      sx: { width: '300px' },
    },
  ];

  return (
    <Stack
      sx={{
        flex: 1,
        overflow: 'hidden',
        borderTop: '8px solid',
        borderTopColor: 'primary.main',
      }}
    >
      <CustomTable
        columns={columns}
        rows={rows}
        isLoading={false}
        rowKey={(item) => item.id}
        sx={{
          width: '100%',
          flex: 1,
          minHeight: 0,
        }}
      />
    </Stack>
  );
};

import React from 'react';
import {
  Box,
  MenuItem,
  Select,
  TextField,
  Checkbox,
  Stack,
} from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import DataTable from '@/components/tables/DataTable';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { CardConditions } from '@/app/auth/(dashboard)/appraisal/[PSAID]/page';
import z from 'zod';
import { getAppraisalApi } from '@api-defs/appraisal/def';
import { ItemImage } from '@/feature/item/components/ItemImage';

type AppraisalResponse = z.infer<typeof getAppraisalApi.response>;
type AppraisalItem = AppraisalResponse['appraisals'][number];
type AppraisalProductItem = AppraisalItem['products'][number];

interface UserInput {
  sell_price?: number;
  condition_option_id?: number;
  appraisal_number?: string;
  specialty_id?: number;
  appraisal_fee?: number;
  check?: boolean;
}

interface PsaRegisterTableContentProps {
  appraisal: AppraisalItem;
  cardConditions: CardConditions;
  isFetching: boolean;
  isSubmitting: boolean;
  userInputs: { [appraisalId: number]: UserInput };
  specialties: Array<{ id: number; display_name: string }>;
  onInputChange: (
    productId: number,
    field: keyof UserInput,
    value: any,
  ) => void;
  onSubmit: () => Promise<void>;
  isAllInputsValid: boolean;
}

export const PsaRegisterTableContent: React.FC<
  PsaRegisterTableContentProps
> = ({
  appraisal,
  cardConditions,
  isFetching,
  isSubmitting,
  userInputs,
  specialties,
  onInputChange,
  onSubmit,
  isAllInputsValid,
}) => {
  console.log(userInputs);
  const columns: GridColDef<AppraisalProductItem>[] = [
    {
      field: 'image',
      headerName: '画像',
      headerAlign: 'center',
      align: 'center',
      minWidth: 80,
      flex: 0.1,
      renderCell: (params: GridRenderCellParams<AppraisalProductItem>) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <ItemImage imageUrl={params.row.product.image_url}></ItemImage>
        </Box>
      ),
    },
    {
      field: 'product',
      headerName: '商品名',
      headerAlign: 'center',
      align: 'center',
      minWidth: 150,
      flex: 0.35,
      renderCell: (params: GridRenderCellParams<AppraisalProductItem>) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          {params.value.displayNameWithMeta || params.value.display_name}
        </Box>
      ),
    },
    {
      field: 'wholesale_price',
      headerName: '仕入れ値',
      headerAlign: 'center',
      align: 'center',
      minWidth: 100,
      flex: 0.15,
      renderCell: (params: GridRenderCellParams<AppraisalProductItem>) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          {params.row.wholesale_price}
        </Box>
      ),
    },
    {
      field: 'appraisal_fee',
      headerName: '鑑定費用',
      headerAlign: 'center',
      align: 'center',
      minWidth: 100,
      flex: 0.15,
      renderCell: (params: GridRenderCellParams<AppraisalProductItem>) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <TextField
            type="number"
            value={userInputs[params.row.id]?.appraisal_fee ?? 0}
            onChange={(e) =>
              onInputChange(
                params.row.id,
                'appraisal_fee',
                Number(e.target.value) || 0,
              )
            }
            variant="outlined"
            size="small"
            fullWidth
          />
        </Box>
      ),
    },
    {
      field: 'check',
      headerName: '諸経費の割り当て',
      headerAlign: 'center',
      align: 'center',
      minWidth: 100,
      flex: 0.1,
      renderCell: (params: GridRenderCellParams<AppraisalProductItem>) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Checkbox
            checked={userInputs[params.row.id]?.check ?? false}
            onChange={(e) =>
              onInputChange(params.row.id, 'check', e.target.checked)
            }
            color="primary"
          />
        </Box>
      ),
    },
    {
      field: 'specialty',
      headerName: '鑑定結果',
      headerAlign: 'center',
      align: 'center',
      minWidth: 100,
      flex: 0.15,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Select
            value={userInputs[params.row.id]?.specialty_id || 0}
            size="small"
            onChange={(e) => {
              onInputChange(params.row.id, 'specialty_id', e.target.value);
            }}
          >
            <MenuItem value={0}>なし</MenuItem>
            {specialties.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.display_name}
              </MenuItem>
            ))}
          </Select>
        </Box>
      ),
    },
    {
      field: 'condition_option_id',
      headerName: '状態',
      headerAlign: 'center',
      align: 'center',
      minWidth: 100,
      flex: 0.15,
      renderCell: (params: GridRenderCellParams<AppraisalProductItem>) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Select
            value={
              userInputs[params.row.id]?.condition_option_id ||
              cardConditions[0]?.id
            }
            onChange={(e) =>
              onInputChange(
                params.row.id,
                'condition_option_id',
                Number(e.target.value),
              )
            }
            variant="outlined"
            size="small"
            fullWidth
          >
            {cardConditions.map((cond) => (
              <MenuItem key={cond.id} value={cond.id}>
                {cond.display_name}
              </MenuItem>
            ))}
          </Select>
        </Box>
      ),
    },
    {
      field: 'appraisal_number',
      headerName: '管理番号',
      headerAlign: 'center',
      align: 'center',
      minWidth: 100,
      flex: 0.15,
      renderCell: (params: GridRenderCellParams<AppraisalProductItem>) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <TextField
            onChange={(e) =>
              onInputChange(params.row.id, 'appraisal_number', e.target.value)
            }
            variant="outlined"
            size="small"
            fullWidth
          />
        </Box>
      ),
    },
    {
      field: 'sell_price',
      headerName: '販売価格',
      headerAlign: 'center',
      align: 'center',
      minWidth: 100,
      flex: 0.15,
      renderCell: (params: GridRenderCellParams<AppraisalProductItem>) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <TextField
            type="number"
            value={userInputs[params.row.id]?.sell_price}
            onChange={(e) =>
              onInputChange(
                params.row.id,
                'sell_price',
                Number(e.target.value) || 0,
              )
            }
            variant="outlined"
            size="small"
            fullWidth
          />
        </Box>
      ),
    },
  ];

  return (
    <Stack
      sx={{
        flex: 1,
        height: '100%',
        overflow: 'hidden',
      }}
      spacing={2}
    >
      <DataTable
        columns={columns}
        rows={appraisal.products}
        rowSelection={false}
        isLoading={isFetching}
        sx={{
          width: '100%',
          flex: 1,
          minHeight: 0,
          '& .MuiDataGrid-columnHeader': {
            '&:focus': {
              outline: 'none',
            },
          },
          '& .MuiDataGrid-columnSeparator': {
            display: 'none',
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
        }}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          width: '100%',
          flexShrink: 0,
        }}
      >
        <PrimaryButton
          onClick={onSubmit}
          disabled={!isAllInputsValid || isFetching}
          loading={isSubmitting}
        >
          鑑定結果登録
        </PrimaryButton>
      </Box>
    </Stack>
  );
};

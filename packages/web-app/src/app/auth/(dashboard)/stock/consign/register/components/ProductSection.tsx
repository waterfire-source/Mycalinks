'use client';

import { GridColDef } from '@mui/x-data-grid';
import { Box, IconButton, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Image from 'next/image';
import { ItemText } from '@/feature/item/components/ItemText';
import { ConsignmentProductSearchType } from '@/feature/consign/components/register/searchModal/type';
import { ProductSectionContent } from '@/app/auth/(dashboard)/stock/consign/register/components/ProductSectionContent';

interface ProductSectionProps {
  products: ConsignmentProductSearchType[];
  onEdit: (
    id: string,
    key: 'consignmentPrice' | 'consignmentCount',
    value: number,
  ) => void;
  onDelete: (id: string) => void;
  onAddProduct: () => void;
}

export function ProductSection({
  products,
  onEdit,
  onDelete,
  onAddProduct,
}: ProductSectionProps) {
  const columns: GridColDef[] = [
    {
      field: 'image_url',
      headerName: '画像',
      flex: 0.2,
      minWidth: 70,
      headerAlign: 'center',
      renderCell: (params) => (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
          height="100%"
        >
          {params.value ? (
            <Image
              src={params.value}
              alt={params.row.display_name}
              width={50}
              height={65}
            />
          ) : (
            <Box
              sx={{
                width: '50px',
                height: '65px',
                border: '1px dashed gray',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'gray',
              }}
            >
              No Image
            </Box>
          )}
        </Box>
      ),
    },
    {
      field: 'displayNameWithMeta',
      headerName: '商品名',
      flex: 0.4,
      minWidth: 150,
      renderCell: (params) => <ItemText text={params.value} />,
    },
    {
      field: 'consignmentPrice',
      headerName: '販売価格',
      flex: 0.2,
      minWidth: 100,
      renderCell: (params) => (
        <TextField
          size="small"
          type="number"
          value={params.value || ''}
          onChange={(e) =>
            onEdit(
              params.row.customId,
              'consignmentPrice',
              Number(e.target.value),
            )
          }
          InputProps={{
            endAdornment: <Typography>円</Typography>,
          }}
          sx={{ width: '100px' }}
        />
      ),
    },
    {
      field: 'consignmentCount',
      headerName: '委託商品数',
      flex: 0.2,
      minWidth: 100,
      renderCell: (params) => (
        <TextField
          size="small"
          type="number"
          value={params.value || ''}
          onChange={(e) =>
            onEdit(
              params.row.customId,
              'consignmentCount',
              Number(e.target.value),
            )
          }
          InputProps={{
            endAdornment: <Typography>点</Typography>,
          }}
          sx={{ width: '100px' }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: '',
      flex: 0.1,
      minWidth: 50,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <IconButton onClick={() => onDelete(params.row.customId)}>
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <ProductSectionContent
      products={products}
      columns={columns}
      onAddProduct={onAddProduct}
    />
  );
}

'use client';

import { Stack, Box } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { jaJP } from '@mui/x-data-grid/locales';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ConsignmentProductSearchType } from '@/feature/consign/components/register/searchModal/type';

interface ProductSectionContentProps {
  products: ConsignmentProductSearchType[];
  columns: GridColDef[];
  onAddProduct: () => void;
}

export function ProductSectionContent({
  products,
  columns,
  onAddProduct,
}: ProductSectionContentProps) {
  return (
    <Stack
      sx={{
        height: '100%',
        position: 'relative',
      }}
    >
      {products.length > 0 ? (
        <DataGrid
          rows={products}
          columns={columns}
          getRowId={(row) => row.customId}
          localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
          rowHeight={80}
          disableColumnMenu
          disableRowSelectionOnClick
          sx={{
            height: '100%',
            width: '100%',
            backgroundColor: 'white',
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: 'white',
              position: 'relative',
              '&:before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '5px',
                backgroundColor: '#b82a2a',
              },
            },
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'white',
            },
            '& .MuiDataGrid-row': {
              backgroundColor: 'white',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: 'white',
            },
            '& .MuiDataGrid-virtualScroller': {
              backgroundColor: 'white',
            },
            boxShadow: 1,
          }}
        />
      ) : (
        <Box
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '1px solid #e0e0e0',
            position: 'relative',
            boxShadow: 1,
            backgroundColor: 'white',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '5px',
              backgroundColor: '#b82a2a',
            },
          }}
        >
          <PrimaryButton onClick={onAddProduct}>商品追加</PrimaryButton>
        </Box>
      )}
    </Stack>
  );
}

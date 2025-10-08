import { Stack, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { BackendStockingAPI } from '@/app/api/store/[store_id]/stocking/api';
import { jaJP } from '@mui/x-data-grid/locales';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { useFetchProducts } from '@/feature/arrival/hooks/useFetchProducts';
import { useUpdateProduct } from '@/feature/products/hooks/useUpdateProduct';
import { Product } from 'backend-core';
import { EditManagementNumberField } from '@/components/inputFields/EditManagementNumberField';

interface Props {
  stocking: BackendStockingAPI[5]['response']['200'][0];
  setStocking: Dispatch<
    SetStateAction<BackendStockingAPI[5]['response']['200'][0]>
  >;
}

export const StockingRegisterTable = ({ stocking, setStocking }: Props) => {
  const { fetchProducts, isLoading } = useFetchProducts();
  const { updateProduct, isLoadingUpdateProduct } = useUpdateProduct();

  const handleEdit = (id: number, key: string, value: number) => {
    setStocking((prev) => {
      const updatedProducts = prev.stocking_products.map((product) =>
        product.id === id ? { ...product, [key]: value } : product,
      );
      return { ...prev, stocking_products: updatedProducts };
    });
  };

  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    const fetch = async () => {
      const productsData = await fetchProducts(stocking);
      if (!productsData) return;
      setProducts(productsData.products);
    };
    fetch();
  }, [stocking.stocking_products]);

  const columns: GridColDef[] = [
    {
      field: 'image_url',
      headerName: '商品画像',
      flex: 0.2,
      minWidth: 70,
      headerAlign: 'center',
      renderCell: (params) => <ItemImage imageUrl={params.value} />,
    },
    {
      field: 'product__displayNameWithMeta',
      headerName: '商品名',
      flex: 0.4,
      minWidth: 150,
      renderCell: (params) => (
        <ItemText text={params.value} sx={{ whiteSpace: 'break-spaces' }} />
      ),
    },
    {
      field: 'unit_price',
      headerName: '仕入れ値',
      flex: 0.2,
      minWidth: 120,
      renderCell: (params) => (
        <Typography>{`${params.value.toLocaleString()}円`}</Typography>
      ),
    },
    {
      field: 'planned_item_count',
      headerName: '入荷予定数量',
      flex: 0.2,
      minWidth: 120,
      renderCell: (params) => <Typography>{`${params.value}点`}</Typography>,
    },
    {
      field: 'actual_item_count',
      headerName: '納品数量/管理番号',
      flex: 0.3,
      minWidth: 120,
      renderCell: (params) => {
        const targetProduct = products.find(
          (p) => p.id === params.row.product_id,
        );
        if (!targetProduct) return null;
        if (targetProduct.management_number === null) {
          return (
            <TextField
              size="small"
              type="number"
              label="納品数"
              value={params.row.actual_item_count}
              InputLabelProps={{
                shrink: true,
                sx: {
                  color: 'grey.700', // フォーカスしてないときの色
                },
              }}
              onChange={(e) => {
                handleEdit(
                  params.row.id,
                  'actual_item_count',
                  Number(e.target.value),
                );
              }}
              InputProps={{
                endAdornment: <Typography>点</Typography>,
              }}
              sx={{ width: '100px' }}
            />
          );
        } else {
          return (
            <EditManagementNumberField
              initValue={targetProduct.management_number}
              productId={params.row.product_id}
              updateProduct={updateProduct}
              loading={isLoadingUpdateProduct}
            />
          );
        }
      },
    },
  ];

  return (
    <Stack flex={1} height="100%" p={2}>
      <DataGrid
        rows={stocking.stocking_products}
        columns={columns}
        getRowId={(row) => row.id}
        localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
        pageSizeOptions={[30, 50, 100]}
        rowHeight={80}
        disableColumnMenu
        disableRowSelectionOnClick
        loading={isLoading}
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
              backgroundColor: 'primary.main',
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
        }}
      />
    </Stack>
  );
};
function uuidv4() {
  throw new Error('Function not implemented.');
}

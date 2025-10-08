import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import {
  Typography,
  FormControl,
  IconButton,
  TextField,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ShelfProduct } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/page';
import PrimaryButton from '@/components/buttons/PrimaryButton';

type Props = {
  shelfProducts: ShelfProduct[];
  deleteShelfProduct: (shelfItemId: string) => void;
  handleQuantityChange: (shelfItemId: string, newValue: number) => void;
  handleSubmitProducts: () => void;
  loading: boolean;
  submitLoading: boolean;
  rows: ShelfProduct[];
};

export const InventoryProductEditTableContent = ({
  shelfProducts,
  deleteShelfProduct,
  handleQuantityChange,
  handleSubmitProducts,
  loading,
  submitLoading,
  rows,
}: Props) => {
  const columns: GridColDef<ShelfProduct>[] = [
    {
      field: 'image_url',
      headerName: '商品画像',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      renderCell: (params) => (
        <ItemImage imageUrl={params.row.image_url} height={70} />
      ),
    },
    {
      field: 'displayNameWithMeta',
      headerName: '商品名',
      headerAlign: 'center',
      align: 'center',
      flex: 2.5,
      renderCell: (params) => (
        <ItemText text={params.row.displayNameWithMeta ?? '-'} />
      ),
    },
    {
      field: 'condition',
      headerName: '状態',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      renderCell: (params) => (
        <Typography>
          {params.row.condition_option_display_name ?? '-'}
        </Typography>
      ),
    },
    {
      field: 'sell_price',
      headerName: '販売価格',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      renderCell: (params) => (
        <Typography>
          {params.row.sell_price
            ? `${params.row.sell_price.toLocaleString()}円`
            : '-'}
        </Typography>
      ),
    },
    {
      field: 'product__average_wholesale_price',
      headerName: '平均仕入れ値',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      renderCell: (params) => (
        <Typography>
          {params.row.average_wholesale_price
            ? `${params.row.average_wholesale_price.toLocaleString()}円`
            : '-'}
        </Typography>
      ),
    },
    {
      field: 'current_stock_number',
      headerName: '理論在庫総数',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      renderCell: (params) => (
        <Typography>{params.row.stock_number ?? 0}</Typography>
      ),
    },
    {
      field: 'stock_number',
      headerName: '総登録数',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      renderCell: (params) => {
        // 同じ商品IDの全ての行の数量を合計
        const currentProductRows = shelfProducts.filter(
          (product) => product.id === params.row.id,
        );
        const totalItemCount = currentProductRows.reduce(
          (sum, product) => sum + (product.item_count || 0),
          0,
        );
        const itemCountInOther = params.row.item_count_in_other_shelf;
        return <Typography>{totalItemCount + itemCountInOther}</Typography>;
      },
    },
    {
      field: 'stock_difference',
      headerName: '在庫差異',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      renderCell: (params) => {
        // 同じ商品IDの全ての行の数量を合計して差異を計算
        const currentProductRows = shelfProducts.filter(
          (product) => product.id === params.row.id,
        );
        const totalItemCount = currentProductRows.reduce(
          (sum, product) => sum + (product.item_count || 0),
          0,
        );
        const totalRegisteredCount =
          totalItemCount + (params.row.item_count_in_other_shelf || 0);
        const diff = totalRegisteredCount - (params.row.stock_number ?? 0);
        const sign = diff === 0 ? '±' : diff > 0 ? '+' : '-';
        const padded = Math.abs(diff).toString().padStart(2, '0');
        const formatted = `${sign}${padded}`;

        let color = 'black';
        if (diff > 0) color = '#2570ba'; // 青
        else if (diff < 0) color = '#b82a2a'; // 赤

        return <Typography sx={{ color }}>{formatted}</Typography>;
      },
    },
    {
      field: 'shelf_stock_number',
      headerName: 'この棚の登録数',
      headerAlign: 'center',
      align: 'center',
      flex: 1,
      renderCell: (params) => (
        <FormControl size="small" sx={{ width: '100%' }}>
          <TextField
            type="number"
            value={params.row.item_count}
            onChange={(e) =>
              handleQuantityChange(
                params.row.shelf_item_id,
                Number(e.target.value),
              )
            }
            sx={{ width: '80%', height: '50px' }}
          />
        </FormControl>
      ),
    },
    {
      field: 'delete',
      headerName: '',
      headerAlign: 'center',
      align: 'center',
      flex: 0.5,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          onClick={() => deleteShelfProduct(params.row.shelf_item_id)}
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.shelf_item_id}
        localeText={{
          noRowsLabel: 'スキャンまたは検索で商品を登録してください',
        }}
        hideFooterPagination
        hideFooterSelectedRowCount
        disableRowSelectionOnClick
        disableColumnSorting
        disableColumnResize
        disableColumnMenu
        rowHeight={100}
        loading={loading}
        slots={{
          footer: () => (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'right',
                p: '10px',
                borderTop: '1px solid #ddd',
              }}
            >
              <PrimaryButton
                onClick={() => {
                  handleSubmitProducts();
                }}
                loading={submitLoading}
              >
                商品を棚卸する
              </PrimaryButton>
            </Box>
          ),
        }}
        sx={{
          width: '100%',
          minHeight: '100%',
          '& .MuiDataGrid-columnHeaders': {
            color: 'grey',
          },
          '& .MuiDataGrid-cell': {
            whiteSpace: 'normal',
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiDataGrid-footerContainer': {
            position: 'sticky',
            bottom: 0,
            backgroundColor: '#fff',
            zIndex: 1,
            borderTop: '1px solid #ddd',
          },
        }}
      />
    </Box>
  );
};

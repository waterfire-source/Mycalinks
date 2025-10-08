import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { useStore } from '@/contexts/StoreContext';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { useProducts } from '@/feature/products/hooks/useProducts';
import { useProductStockHistory } from '@/feature/stock/hooks/useProductStockHistory';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { Product_Stock_History } from '@prisma/client';
import React, { useEffect, useState } from 'react';

interface Props {
  productId: number;
  isComposing: boolean;
}

// 在庫変動ログの方向
enum ProductTransferKind {
  FROM = 'FROM',
  TO = 'TO',
}

// 在庫変動ログの並び替え
enum ProductTransferOrderBy {
  DESC = '-datetime',
  ASC = 'datetime',
}

// 表示する在庫変換ログリストの型
interface FormattedData {
  id: Product_Stock_History['id'];
  image_url: string | null;
  display_name: string;
  condition_display_name: string;
  changedAtDate: Product_Stock_History['datetime'];
  changedStockNumber: Product_Stock_History['item_count'];
}

const columns: ColumnDef<FormattedData>[] = [
  {
    header: '商品画像',
    render: (data) => <ItemImage imageUrl={data?.image_url} />,
  },
  {
    header: '商品名',
    render: (data) => <ItemText text={data?.display_name ?? '-'} />,
  },
  {
    header: '状態',
    render: (data) => data?.condition_display_name ?? '-',
  },
  {
    header: '変更日時',
    render: (data) => new Date(data.changedAtDate).toLocaleString() ?? '-',
  },
  {
    header: '変更数',
    render: (data) => data?.changedStockNumber ?? '-',
  },
];

export const StockChangeHistoryProductList: React.FC<Props> = ({
  productId,
  isComposing,
}) => {
  const { store } = useStore();
  const [kind, setKind] = useState<ProductTransferKind>(
    ProductTransferKind.FROM,
  );
  const [orderBy, setOrderBy] = useState<ProductTransferOrderBy>(
    ProductTransferOrderBy.DESC,
  );
  const { productStockHistoryList, fetchProductStockHistoryList } =
    useProductStockHistory(productId, kind, orderBy);
  const { products, listProductsByProductIDs } = useProducts();
  const [formattedData, setFormattedData] = useState<FormattedData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // カスタムフックからのfetch処理
  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      if (store) {
        await fetchProductStockHistoryList();
      }
    };

    fetchData();
    return () => {
      setIsLoading(false);
    };
  }, [store, kind, orderBy, fetchProductStockHistoryList]);

  // カスタムフックのuseProductStockHistoryから取得された履歴に対するproductを取得する
  useEffect(() => {
    if (productStockHistoryList.length > 0) {
      setIsLoading(true);
      const extractedSourceIds = productStockHistoryList
        .map((history) => history.source_id)
        .filter((num): num is number => num !== null);

      if (extractedSourceIds.length === 0) {
        setIsLoading(false);
        return;
      }

      // 履歴のproduct_idからそのプロダクトの情報を取得
      const fetchProducts = async () => {
        if (store) {
          await listProductsByProductIDs(store.id, extractedSourceIds);
        }
        setIsLoading(false);
      };
      fetchProducts();
    }
    return () => {
      setIsLoading(false);
    };
  }, [productStockHistoryList, listProductsByProductIDs, store]);

  // 取得した在庫変換ログに対して、商品画像, 商品名, 状態のカラムを割り当てる
  useEffect(() => {
    if (productStockHistoryList.length === 0) {
      setFormattedData([]);
      return;
    }
    if (productStockHistoryList.length > 0 && (products?.length ?? 0) > 0) {
      const formatted = productStockHistoryList.map((history) => {
        const product = products?.find((p) => p.id === history.source_id) || {
          image_url: null,
          display_name: '-',
          condition_option_display_name: '-',
        };

        return {
          id: history.id,
          image_url: product.image_url,
          display_name: product.display_name,
          condition_display_name: product.condition_option_display_name,
          changedAtDate: new Date(history.datetime),
          changedStockNumber: Math.abs(history.item_count),
        };
      });

      setFormattedData(formatted);
    }
  }, [productStockHistoryList, listProductsByProductIDs, products]);

  return (
    <Box
      sx={{
        borderTop: '8px solid',
        borderTopColor: 'primary.main',
        height: '152px',
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          py: 1,
          px: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'common.white',
          borderBottom: '1px solid',
          borderBottomColor: 'grey.300',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              py: 1,
              px: 2,
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'common.white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor:
                    kind === ProductTransferKind.FROM ? '#4A4A4A' : '#D3D3D3',
                  color: 'white',
                  '&:hover': {
                    backgroundColor:
                      kind === ProductTransferKind.FROM ? '#3A3A3A' : '#C0C0C0',
                  },
                }}
                onClick={() => setKind(ProductTransferKind.FROM)}
              >
                この在庫から
              </Button>

              <Button
                variant="contained"
                sx={{
                  backgroundColor:
                    kind === ProductTransferKind.TO ? '#4A4A4A' : '#D3D3D3',
                  color: 'white',
                  '&:hover': {
                    backgroundColor:
                      kind === ProductTransferKind.TO ? '#3A3A3A' : '#C0C0C0',
                  },
                }}
                onClick={() => setKind(ProductTransferKind.TO)}
              >
                この在庫へ
              </Button>
            </Box>
          </Box>
        </Box>
        {/* ソート部 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="sort-filter-label" sx={{ color: 'text.primary' }}>
              並び替え
            </InputLabel>
            <Select<ProductTransferOrderBy>
              labelId="sort-label"
              label="並び替え"
              value={orderBy}
              onChange={(event) =>
                setOrderBy(event.target.value as ProductTransferOrderBy)
              }
            >
              <MenuItem value={ProductTransferOrderBy.DESC}>
                変更日時遅い順
              </MenuItem>
              <MenuItem value={ProductTransferOrderBy.ASC}>
                変更日時早い順
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      {formattedData.length === 0 && !isLoading ? (
        <Typography
          sx={{
            textAlign: 'center',
            padding: 2,
            fontSize: '1rem',
            color: 'gray',
          }}
        >
          行がありません
        </Typography>
      ) : (
        <CustomTable<FormattedData>
          columns={columns}
          rows={formattedData}
          isLoading={isLoading || isComposing}
          rowKey={(product) => product.id}
          sx={{
            borderBottomRightRadius: '8px',
            borderBottomLeftRadius: '8px',
          }}
        />
      )}
    </Box>
  );
};

import { InventoryAPIRes } from '@/api/frontend/inventory/api';
import { CountableProductType } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryCount';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { DetailCard } from '@/components/cards/DetailCard';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { ShelfSelect } from '@/feature/inventory-count/components/edit/ShelfSelect';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { Delete } from '@mui/icons-material';
import {
  Box,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';

interface SelectedProductsProps {
  shelfs: InventoryAPIRes['getShelfs']['shelfs'];
  selectedShelf: InventoryAPIRes['getShelfs']['shelfs'][number] | null;
  setSelectedShelf: Dispatch<
    SetStateAction<InventoryAPIRes['getShelfs']['shelfs'][number] | null>
  >;
  products: CountableProductType[];
  onRemoveProduct: (productId: number) => void;
  handleAddProducts: (productId: number, newStock: number) => void;
  handleAddProductsByShelf: () => void;
  handleEditInventory: () => void;
  isPostLoading?: boolean;
}

export const SelectedProducts = ({
  shelfs,
  selectedShelf,
  setSelectedShelf,
  products,
  onRemoveProduct,
  handleAddProducts,
  handleAddProductsByShelf,
  handleEditInventory,
  isPostLoading,
}: SelectedProductsProps) => {
  // 商品追加時のオートフォーカス処理
  const lastRowRef = useRef<HTMLTableRowElement | null>(null);
  const prevLengthRef = useRef<number>(products.length);
  const searchParams = useSearchParams();
  const shelfId = searchParams.get('shelf');
  const isEdit = searchParams.get('edit');
  const shelfName = shelfs.find((shelf) => shelf.id === Number(shelfId))
    ?.display_name;

  useEffect(() => {
    // 商品の削除時には発火しないように、直前の商品リストの数と比較して増えている場合のみ下までスクロールする
    if (products.length > prevLengthRef.current && lastRowRef.current) {
      lastRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    prevLengthRef.current = products.length; // 比較用に現在の商品リスト数を保存
  }, [products.length]);

  return (
    <DetailCard
      containerSx={{
        marginBottom: '8px',
        height: '580px',
      }}
      title={
        <Stack
          direction="row"
          width="100%"
          gap={1}
          sx={{
            bgcolor: 'primary.white',
            height: '40px',
            minHeight: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'left',
          }}
        >
          {shelfName ? (
            <Typography variant="h1" color="text.primary">
              {shelfName}
            </Typography>
          ) : (
            <ShelfSelect
              shelfs={shelfs}
              selectedShelf={selectedShelf || shelfs[0]}
              onShelfChange={setSelectedShelf}
            />
          )}
          <Typography variant="h1" color="text.primary">
            の棚卸結果
          </Typography>
        </Stack>
      }
      content={
        <TableContainer
          sx={{
            flexGrow: 1,
            backgroundColor: 'white',
            paddingX: 2,
          }}
        >
          <Table stickyHeader>
            <TableBody>
              {products.map((product, index) => (
                <TableRow
                  key={product.id}
                  ref={index === products.length - 1 ? lastRowRef : null}
                  sx={{
                    paddingX: 1,
                  }}
                >
                  {/* 商品画像 */}
                  <TableCell sx={{ width: 60, padding: 1 }}>
                    <ItemImage imageUrl={product.image_url} height={72} />
                  </TableCell>
                  {/* 商品詳細情報 */}
                  <TableCell sx={{ padding: 1 }}>
                    {/* 商品名とカード番号 */}
                    <ItemText
                      text={product.displayNameWithMeta}
                      sx={{
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        paddingBottom: '5px',
                      }}
                    />
                    {/* レアリティ（存在する場合のみ表示） */}
                    {product.rarity && (
                      <Typography
                        sx={{
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          textAlign: 'left',
                          fontSize: '0.8rem',
                          paddingBottom: '5px',
                        }}
                      >
                        レアリティ：{product.rarity}
                      </Typography>
                    )}
                    {/* 商品の状態 */}
                    <Typography
                      sx={{
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        paddingBottom: '5px',
                      }}
                    >
                      状態：
                      {product.condition.displayName}
                    </Typography>
                    {/* 販売価格 */}
                    <Typography
                      sx={{
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        textAlign: 'left',
                        fontSize: '0.8rem',
                        paddingBottom: '5px',
                      }}
                    >
                      ¥
                      {product.specific_sell_price?.toLocaleString() ||
                        product.sell_price?.toLocaleString()}
                    </Typography>
                  </TableCell>
                  {/* 在庫数入力と削除ボタン */}
                  <TableCell
                    sx={{
                      width: '20%',
                      minWidth: '100px',
                      padding: '8px',
                      position: 'relative',
                      verticalAlign: 'bottom',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        gap: '2px',
                      }}
                    >
                      {/* 在庫数入力フィールド */}
                      <NumericTextField
                        value={product.stock_number}
                        onChange={(e) => {
                          if (handleAddProducts) {
                            handleAddProducts(product.id, e ?? 0);
                          }
                        }}
                        label="登録数"
                      />
                    </Box>
                    {/* 削除ボタン */}
                    <IconButton
                      onClick={() => onRemoveProduct(product.id)}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        padding: '4px',
                      }}
                      size="small"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      }
      bottomContent={
        <Stack width="100%" direction="row" spacing={2} justifyContent="right">
          <PrimaryButtonWithIcon
            onClick={shelfId ? handleAddProductsByShelf : handleEditInventory}
            loading={isPostLoading}
          >
            {isEdit ? '棚卸の編集' : '商品を登録'}
          </PrimaryButtonWithIcon>
        </Stack>
      }
    />
  );
};

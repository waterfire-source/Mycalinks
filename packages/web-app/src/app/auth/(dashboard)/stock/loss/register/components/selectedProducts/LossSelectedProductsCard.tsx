import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  IconButton,
  SxProps,
  Theme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { LossRegisterProductType } from '@/app/auth/(dashboard)/stock/loss/register/components/LossProductType';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { QuantityControlField } from '@/components/inputFields/QuantityControlField';
import { ItemText } from '@/feature/item/components/ItemText';
// コンポーネントのプロップス型定義
interface Props {
  lossProducts: LossRegisterProductType[];
  title?: string;
  height?: string;
  sx?: SxProps<Theme>;
  setLossProducts: Dispatch<SetStateAction<LossRegisterProductType[]>>;
}

// LossSelectedProductsCardコンポーネント
export const LossSelectedProductsCard: React.FC<Props> = ({
  lossProducts,
  title,
  sx,
  setLossProducts,
}) => {
  const handleRemoveProduct = (productId: number) => {
    setLossProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== productId),
    );
  };
  const handleAddProducts = (productId: number, newStock: number) => {
    setLossProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, count: newStock } : product,
      ),
    );
  };

  // 商品追加時のオートフォーカス処理
  const lastProductRef = useRef<HTMLTableRowElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const prevLengthRef = useRef<number>(lossProducts.length);
  useEffect(() => {
    if (
      lossProducts.length > prevLengthRef.current &&
      lastProductRef.current &&
      scrollContainerRef.current
    ) {
      scrollContainerRef.current.scrollTo({
        top: lastProductRef.current.offsetTop,
        behavior: 'smooth',
      });
    }
    prevLengthRef.current = lossProducts.length;
  }, [lossProducts.length]);

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'grey.300',
        overflow: 'hidden',
        ...sx,
      }}
    >
      {/* ヘッダー部分 */}
      {title && (
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            backgroundColor: 'white',
            color: 'black',
            height: '50px',
            minHeight: '50px',
            display: 'flex',
            alignItems: 'center',
            p: 2,
            fontSize: '1rem',
            borderColor: 'grey.300',
            boxShadow: 1,
          }}
        >
          {title}
        </Typography>
      )}
      {lossProducts ? (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'grey.300',
              paddingX: 2,
              paddingY: 1,
              height: '35px',
            }}
          >
            <Typography variant="body1">
              合計{' '}
              <Typography
                variant="h6"
                component="span"
                sx={{ fontSize: '1rem' }}
              >
                {lossProducts.reduce(
                  (total, product) => total + (product.count || 0),
                  0,
                )}
                点（{lossProducts.length}商品）
              </Typography>
            </Typography>
            <Typography variant="body1">
              合計金額{' '}
              <Typography
                variant="h6"
                component="span"
                sx={{ fontSize: '1rem' }}
              >
                ￥
                {lossProducts
                  .reduce(
                    (total, product) =>
                      total +
                      (product.specificSellPrice
                        ? product.specificSellPrice
                        : product.buyPrice || 0) *
                        (product.count ?? 0),
                    0,
                  )
                  .toLocaleString()}
              </Typography>
            </Typography>
          </Box>
        </>
      ) : null}

      {/* 商品リスト部分 */}
      <TableContainer
        ref={scrollContainerRef}
        sx={{
          flexGrow: 1,
          backgroundColor: 'white',
          paddingX: 2,
          height: '100px',
        }}
      >
        <Table stickyHeader>
          <TableBody>
            {lossProducts.map((product, index) => (
              <TableRow
                key={product.id}
                ref={index === lossProducts.length - 1 ? lastProductRef : null}
              >
                {/* 商品画像 */}
                <TableCell sx={{ width: 30, padding: 1 }}>
                  <ItemImage imageUrl={product.imageUrl} height={40} />
                </TableCell>
                {/* 商品詳細情報 */}
                <TableCell sx={{ padding: 0.5 }}>
                  {/* 商品名とカード番号 */}
                  <ItemText
                    text={product.displayNameWithMeta ?? '-'}
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
                      {product.rarity}
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
                      minWidth: '100px',
                    }}
                  >
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
                    仕入れ値：
                    {product.arrivalPrice
                      ? `¥${product.arrivalPrice.toLocaleString()}`
                      : '指定なし'}
                  </Typography>
                </TableCell>
                {/* 在庫数入力と削除ボタン */}
                <TableCell
                  sx={{
                    width: '20%',
                    minWidth: '80px',
                    padding: '4px',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {/* カウンターUI */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '2px 4px',
                      }}
                    >
                      {/* マイナスボタン */}
                      <QuantityControlField
                        quantity={product.count ?? 0}
                        onQuantityChange={(e) => {
                          handleAddProducts(product.id, e ?? 0);
                        }}
                        maxQuantity={product.stockNumber ?? undefined}
                      />
                    </Box>
                    {/* 削除ボタン */}
                    <IconButton
                      onClick={() => handleRemoveProduct(product.id)}
                      sx={{
                        top: 0,
                        right: 0,
                        padding: '2px',
                      }}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

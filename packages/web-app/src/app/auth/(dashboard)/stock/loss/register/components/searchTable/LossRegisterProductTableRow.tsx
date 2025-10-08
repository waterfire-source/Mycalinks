import { Dispatch, FC, SetStateAction, useState } from 'react';
import {
  TableRow,
  TableCell,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { ItemImage } from '@/feature/item/components/ItemImage';
import NumericTextField from '@/components/inputFields/NumericTextField';
import {
  LossRegisterItemType,
  LossRegisterProductType,
} from '@/app/auth/(dashboard)/stock/loss/register/components/LossProductType';
import { styled } from '@mui/material/styles';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ItemText } from '@/feature/item/components/ItemText';

interface Props {
  item: LossRegisterItemType;
  setLossRegisterItems: Dispatch<SetStateAction<LossRegisterItemType[]>>;
  setLossProducts: Dispatch<SetStateAction<LossRegisterProductType[]>>;
}

// スタイル付きコンポーネントの定義
const StyledTableCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== 'isExpanded' && prop !== 'isLastRow',
})<{ isExpanded?: boolean; isLastRow?: boolean }>(
  ({ theme, isExpanded, isLastRow }) => ({
    borderBottom:
      !isExpanded || isLastRow
        ? `1px solid ${theme.palette.grey[200]}`
        : 'none',
  }),
);

export const LossRegisterProductTableRow: FC<Props> = ({
  item,
  setLossRegisterItems,
  setLossProducts,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const productsToShow = isExpanded
    ? item.products
    : item.products?.slice(0, 1);

  // 数量変更ハンドラ
  const handleQuantityChange = (
    itemId: number,
    productId: number,
    newQuantity: number,
  ) => {
    setLossRegisterItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              products: item.products?.map((product) =>
                product.id === productId
                  ? { ...product, count: newQuantity }
                  : product,
              ),
            }
          : item,
      ),
    );
  };

  // 商品追加のハンドラー
  const handleAddProducts = (addProduct: LossRegisterProductType) => {
    setLossProducts((prevProducts) => {
      // 既存の商品リストから同じIDの商品を探す
      const isProductExists = prevProducts.some(
        (prevProduct) => prevProduct.id === addProduct.id,
      );

      // 商品が存在しない場合は新規追加
      if (!isProductExists && item.products) {
        return [...prevProducts, addProduct];
      }

      // 商品が存在する場合は更新
      return prevProducts.map((prevProduct) => {
        if (prevProduct.id === addProduct.id) {
          return {
            ...prevProduct,
            count: addProduct.count,
            arrivalPrice: addProduct.arrivalPrice,
          };
        }
        return prevProduct;
      });
    });
  };

  return (
    <>
      {productsToShow?.map((product, index) => (
        <TableRow key={`${item.id}-${product.id}`}>
          {index === 0 && (
            <>
              {/* 商品画像 */}
              <TableCell rowSpan={isExpanded ? item.products?.length : 1}>
                <Box>
                  <ItemImage imageUrl={item.imageUrl} height={70} />
                </Box>
              </TableCell>
              {/* 商品名 */}
              <TableCell rowSpan={isExpanded ? item.products?.length : 1}>
                <ItemText
                  text={product.displayNameWithMeta || '-'}
                  sx={{ maxWidth: '300px' }}
                />
              </TableCell>
            </>
          )}
          <StyledTableCell
            isExpanded={isExpanded}
            isLastRow={index === (item.products?.length || 1) - 1}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '100%',
                minWidth: 100,
                maxWidth: 150,
              }}
            >
              <Typography sx={{ flexGrow: 1, textAlign: 'left' }}>
                {product.condition.displayName || '-'}
              </Typography>
              {index === 0 && item.products && item.products.length > 1 ? (
                <IconButton
                  onClick={() => setIsExpanded(!isExpanded)}
                  sx={{ ml: 'auto' }}
                >
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              ) : (
                <Box sx={{ ml: 'auto', width: 40, height: 40 }} />
              )}
            </Box>
          </StyledTableCell>
          {/* 在庫数 */}
          <StyledTableCell
            isExpanded={isExpanded}
            isLastRow={index === (item.products?.length || 1) - 1}
          >
            {product.stockNumber
              ? `${product.stockNumber.toLocaleString()}`
              : '-'}
          </StyledTableCell>
          {/* ロス数 */}
          <StyledTableCell
            isExpanded={isExpanded}
            isLastRow={index === (item.products?.length || 1) - 1}
          >
            <Box sx={{ display: 'flex', alignItems: 'left', gap: 1 }}>
              <NumericTextField
                value={product.count}
                onChange={(e) =>
                  handleQuantityChange(item.id, product.id, e ?? 0)
                }
                sx={{ minWidth: '50px' }}
                max={product.stockNumber ?? undefined}
                endSuffix="点"
              />
            </Box>
          </StyledTableCell>
          {/* 登録ボタン */}
          <StyledTableCell
            isExpanded={isExpanded}
            isLastRow={index === (item.products?.length || 1) - 1}
          >
            <PrimaryButton
              onClick={() => handleAddProducts(product)}
              disabled={product.count === undefined}
            >
              追加
            </PrimaryButton>
          </StyledTableCell>
        </TableRow>
      ))}
    </>
  );
};

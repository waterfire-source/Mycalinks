import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import DeleteIcon from '@mui/icons-material/Delete';
import { CountableProductType } from '@/feature/stock/bundle/components/ProductCountSearchTable';
import AddRemoveNumericText from '@/feature/stock/bundle/components/SelectedProductsCard/components/AddRemoveNumericText';

interface Props {
  handleAddProducts?: (productId: number, newStock: number) => void;
  canEditProducts?: boolean;
  onRemoveProduct?: (productId: number) => void;
  products: CountableProductType[];
}

export const CardTable: React.FC<Props> & { propTypes?: any } = ({
  handleAddProducts,
  canEditProducts,
  onRemoveProduct,
  products,
}) => {
  // 商品追加時のオートフォーカス処理
  const lastRowRef = useRef<HTMLTableRowElement | null>(null);
  const prevLengthRef = useRef<number>(products.length);
  useEffect(() => {
    // 商品の削除時には発火しないように、直前の商品リストの数と比較して増えている場合のみ下までスクロールする
    if (products.length > prevLengthRef.current && lastRowRef.current) {
      lastRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    prevLengthRef.current = products.length; // 比較用に現在の商品リスト数を保存
  }, [products.length]);

  return (
    <TableContainer
      sx={{
        flexGrow: 1,
        backgroundColor: 'grey.50',
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
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    width={50}
                    height={72}
                    style={{
                      objectFit: 'cover',
                    }}
                    alt={product.display_name || ''}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                    }}
                  />
                )}
              </TableCell>
              {/* 商品詳細情報 */}
              <TableCell sx={{ padding: 1 }}>
                {/* 商品名とカード番号 */}
                <Typography
                  sx={{
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    textAlign: 'left',
                    fontSize: '0.8rem',
                    paddingBottom: '5px',
                  }}
                >
                  {product.displayNameWithMeta}
                </Typography>
                {/* 商品の状態 */}
                <Typography
                  sx={{
                    fontSize: '0.8rem',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    textAlign: 'center',
                    backgroundColor: '#b82a2a', // 背景色を赤に設定
                    color: 'white', // 文字色を白に設定
                    borderRadius: '4px', // 角を丸くする
                    maxWidth: '100px', // 幅を狭める
                  }}
                >
                  {product.condition.displayName &&
                  product.isSpecialPriceProduct
                    ? '特価在庫'
                    : product.condition.displayName}
                </Typography>
                {/* 販売価格 */}
                <Typography
                  sx={{
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    textAlign: 'left',
                    fontSize: '0.8rem',
                    paddingTop: '5px',
                    fontWeight: 'bold',
                  }}
                >
                  販売価格：
                  {product.specific_sell_price?.toLocaleString() ||
                    product.sell_price?.toLocaleString()}
                  円
                </Typography>
              </TableCell>
              {/* 在庫数入力と削除ボタン */}
              <TableCell
                sx={{
                  width: '25%',
                  minWidth: '100px',
                  padding: '8px',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '8px',
                  }}
                >
                  {/* 在庫数入力フィールド */}
                  <AddRemoveNumericText
                    value={product.stock_number}
                    onChange={(e) => {
                      if (handleAddProducts && canEditProducts) {
                        handleAddProducts(product.id, e ?? 0);
                      }
                    }}
                    isReadOnly={!canEditProducts}
                    maxValue={product.real_stock_number}
                  />
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  width: '5%',
                  minWidth: '10px',
                  padding: '2px',
                  position: 'relative',
                }}
              >
                {/* 削除ボタン */}
                {canEditProducts && onRemoveProduct && (
                  <IconButton
                    onClick={() => onRemoveProduct(product.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

CardTable.propTypes = {
  handleAddProducts: PropTypes.func,
  canEditProducts: PropTypes.bool,
  onRemoveProduct: PropTypes.func,
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      image_url: PropTypes.string,
      display_name: PropTypes.string,
      displayNameWithMeta: PropTypes.string,
      condition: PropTypes.shape({
        displayName: PropTypes.string,
      }),
      specific_sell_price: PropTypes.number,
      sell_price: PropTypes.number,
      stock_number: PropTypes.number.isRequired,
    }),
  ).isRequired,
};

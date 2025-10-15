import NumericTextField from '@/components/inputFields/NumericTextField';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  Typography,
  Stack,
} from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ArrivalProductSearchType } from '@/feature/arrival/register/searchModal/type';
import { ItemText } from '@/feature/item/components/ItemText';

interface Props {
  products: ArrivalProductSearchType[];
  setProducts: Dispatch<SetStateAction<ArrivalProductSearchType[]>>;
}
export const ArrivalItemList = ({ products, setProducts }: Props) => {
  const { palette } = useTheme();
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ backgroundColor: palette.grey[600] }}>
          <TableRow sx={{ textAlign: 'center' }}>
            <TableCell
              sx={{ textAlign: 'center', width: '10%', color: 'white' }}
            >
              画像
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center', width: '20%', color: 'white' }}
            >
              商品番号/JANコード
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center', width: '25%', color: 'white' }}
            >
              商品名
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center', width: '20%', color: 'white' }}
            >
              入荷数量
            </TableCell>
            <TableCell
              sx={{ textAlign: 'center', width: '15%', color: 'white' }}
            >
              仕入れ値
            </TableCell>
            <TableCell sx={{ textAlign: 'center', width: '10%' }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* 商品一覧をマッピング */}
          {products.map((p) => (
            <TableRow key={`${p.id}_${p.arrivalPrice}`}>
              {/* 商品画像 */}
              <TableCell sx={{ textAlign: 'center' }}>
                <ItemImage imageUrl={p.image_url} />
              </TableCell>
              {/* 商品コード */}
              <TableCell sx={{ textAlign: 'center' }}>
                {p.product_code}
              </TableCell>
              {/* 商品名 */}
              <TableCell>
                <ItemText text={p.displayNameWithMeta} />
              </TableCell>
              {/* 入荷数量入力フィールド */}
              <TableCell>
                <NumericTextField
                  value={p.arrivalCount}
                  onChange={(newValue) => {
                    setProducts((prev) =>
                      prev.map((el) => {
                        // 対象の商品のみ数量を更新
                        if (
                          el.id === p.id &&
                          el.arrivalPrice === p.arrivalPrice
                        ) {
                          return { ...el, arrivalCount: newValue };
                        }
                        return el;
                      }),
                    );
                  }}
                  suffix="個"
                />
              </TableCell>
              <TableCell>
                <Stack direction="row" gap="12px" alignItems="end">
                  <NumericTextField
                    value={p.arrivalPrice}
                    onChange={(newValue) => {
                      setProducts((prev) =>
                        prev.map((el) => {
                          if (
                            el.id === p.id &&
                            el.arrivalPrice === p.arrivalPrice
                          ) {
                            return { ...el, arrivalPrice: newValue };
                          }
                          return el;
                        }),
                      );
                    }}
                    suffix="円"
                  />
                </Stack>
              </TableCell>
              <TableCell
                onClick={() => {
                  // 選択された商品を削除する
                  // 商品IDと仕入れ価格が一致する商品のみを削除し、それ以外の商品は残す
                  setProducts((prev) =>
                    prev.filter(
                      (p2) =>
                        !(p2.id === p.id && p2.arrivalPrice === p.arrivalPrice),
                    ),
                  );
                }}
              >
                <Typography color={palette.primary.main}>削除</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

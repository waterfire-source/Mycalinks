import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import type { mycaItem } from '@/app/api/store/[store_id]/myca-item/api';

type Props = {
  item: mycaItem;
};

/**
 * 商品詳細情報テーブル
 * @param item - 商品情報
 */
export const ItemInfoTable = ({ item }: Props) => {
  // nullチェックを行い、デフォルト値を設定
  const displayCardNumber = item.cardnumber ?? '-';
  const displayRarity = item.rarity ?? '-';
  const displayType = item.type ?? '-';
  const displayExpansion = item.pack ?? '-';
  const displayReleaseDate = item.release_date ?? '-';

  return (
    <TableContainer
      sx={{
        borderRadius: 2,
        border: 1,
        borderColor: 'grey.400',
      }}
    >
      <Table
        size="small"
        sx={{
          borderCollapse: 'collapse',
          borderStyle: 'hidden',
          '& td, & th': {
            border: 1,
            borderColor: 'grey.400',
            py: '10px',
          },
          '.MuiTableBody-root .MuiTableCell-root': {
            bgcolor: 'transparent',
            backgroundColor: 'transparent',
          },
        }}
      >
        <TableBody>
          <TableRow>
            <TableCell
              component="th"
              sx={{
                bgcolor: '#eee !important',
                width: '30%',
              }}
            >
              カード番号
            </TableCell>
            <TableCell>
              {item.expansion && item.cardnumber
                ? `${item.expansion} ${item.cardnumber}`
                : '-'}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              component="th"
              sx={{ bgcolor: '#eee !important', width: '30%' }}
            >
              レアリティ
            </TableCell>
            <TableCell>{displayRarity}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              component="th"
              sx={{ bgcolor: '#eee !important', width: '30%' }}
            >
              タイプ
            </TableCell>
            <TableCell>{displayType}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              component="th"
              sx={{ bgcolor: '#eee !important', width: '30%' }}
            >
              封入パック
            </TableCell>
            <TableCell>{displayExpansion}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              component="th"
              sx={{ bgcolor: '#eee !important', width: '30%' }}
            >
              発売日
            </TableCell>
            <TableCell>{displayReleaseDate}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

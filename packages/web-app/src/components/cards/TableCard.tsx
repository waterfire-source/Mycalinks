import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';

interface Props {
  data: Array<{
    stockNumber: number;
    productId: any;
    id: number;
    productName: string;
    displayNameWithMeta: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    category: string;
    discount: number;
  }>;
  setTableData: React.Dispatch<React.SetStateAction<any[]>>;
}

const TableCard: React.FC<Props> = ({ data, setTableData }: Props) => {
  //数量を増やす
  //テーブルに追加時にstockNumberを保持している
  const handleIncrement = (row: any) => {
    setTableData((prevData) =>
      prevData.map((item) =>
        item.id === row.id && item.quantity + 1 <= item.stockNumber
          ? {
              ...item,
              quantity: item.quantity + 1,
              totalPrice:
                (item.unitPrice - item.discount) * (item.quantity + 1),
            }
          : item,
      ),
    );
  };
  //数量を減らす
  const handleDecrement = (id: number) => {
    setTableData((prevData) =>
      prevData
        .map((row) =>
          row.id === id && row.quantity > 1
            ? {
                ...row,
                quantity: row.quantity - 1,
                totalPrice: (row.unitPrice - row.discount) * (row.quantity - 1),
              }
            : row,
        )
        .filter((row) => row.id !== id || row.quantity > 0),
    );
  };
  //行削除
  const handleDeleteRow = (id: number) => {
    setTableData((prevData) => prevData.filter((row) => row.id !== id));
  };

  return (
    <TableContainer component={Paper} sx={{ height: '100%', boxShadow: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                width: '5%',
                backgroundColor: 'grey.700',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              No.
            </TableCell>
            <TableCell
              sx={{
                width: '10%',
                backgroundColor: 'grey.700',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              区分
            </TableCell>
            <TableCell
              sx={{
                width: '30%',
                backgroundColor: 'grey.700',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              商品名
            </TableCell>
            <TableCell
              sx={{
                width: '15%',
                backgroundColor: 'grey.700',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              単価
            </TableCell>
            <TableCell
              sx={{
                width: '10%',
                backgroundColor: 'grey.700',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              数量
            </TableCell>
            {/* <TableCell
              sx={{
                width: '10%',
                backgroundColor: 'grey.700',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              割引額
            </TableCell> */}
            <TableCell
              sx={{
                width: '10%',
                backgroundColor: 'grey.700',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              合計金額
            </TableCell>
            <TableCell
              sx={{
                width: '10%',
                backgroundColor: 'grey.700',
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              削除
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={row.id}
              sx={{
                backgroundColor: index % 2 === 0 ? 'common.white' : 'grey.100',
              }}
            >
              <TableCell sx={{ color: 'text.primary', textAlign: 'center' }}>
                {row.id}
              </TableCell>
              <TableCell sx={{ color: 'text.primary', textAlign: 'center' }}>
                {row.category}
              </TableCell>
              <TableCell sx={{ color: 'text.primary', textAlign: 'center' }}>
                {row.displayNameWithMeta}
              </TableCell>
              <TableCell sx={{ color: 'text.primary', textAlign: 'center' }}>
                {row.unitPrice}
              </TableCell>
              <TableCell sx={{ color: 'text.primary', textAlign: 'center' }}>
                <IconButton
                  onClick={() => handleDecrement(row.id)}
                  size="small"
                >
                  <Remove />
                </IconButton>
                {row.quantity}
                <IconButton onClick={() => handleIncrement(row)} size="small">
                  <Add />
                </IconButton>
              </TableCell>
              {/* <TableCell sx={{ color: 'text.primary', textAlign: 'center' }}>
                {row.discount}
              </TableCell> */}
              <TableCell sx={{ color: 'text.primary', textAlign: 'center' }}>
                {row.totalPrice}
              </TableCell>
              <TableCell sx={{ color: 'text.primary', textAlign: 'center' }}>
                <IconButton
                  onClick={() => handleDeleteRow(row.id)}
                  size="small"
                >
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableCard;

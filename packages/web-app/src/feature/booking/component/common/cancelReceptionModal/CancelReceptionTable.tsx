import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ReceptionType } from '@/feature/booking';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

interface Props {
  reservationReceptionProducts: ReceptionType[];
  repayments: ReceptionType[];
  handleAddRepayment: (reception: ReceptionType) => void;
  handleToggleAllRepayment: () => void;
}

export const CancelReceptionTable = ({
  reservationReceptionProducts,
  repayments,
  handleAddRepayment,
  handleToggleAllRepayment,
}: Props) => {
  return (
    <Box sx={{ border: 1, my: 2, width: '500px' }}>
      <TableContainer
        sx={{
          maxHeight: '400px',
          overflowY: 'auto',
          m: 1,
          width: 'auto',
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '45%' }}>商品名</TableCell>
              <TableCell>点数</TableCell>
              <TableCell>前金合計</TableCell>
              <TableCell>
                <PrimaryButton
                  variant="contained"
                  color="primary"
                  onClick={handleToggleAllRepayment}
                >
                  全選択
                </PrimaryButton>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservationReceptionProducts.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Typography>
                    {item.reservation.product.displayNameWithMeta}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography>{item.item_count}点</Typography>
                </TableCell>
                <TableCell>
                  <Typography>
                    {(
                      item.reservation.deposit_price * item.item_count
                    ).toLocaleString()}
                    円
                  </Typography>
                </TableCell>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Checkbox
                        sx={{
                          '& .MuiSvgIcon-root': { color: 'primary.main' },
                        }}
                        checked={repayments.some((r) => r.id === item.id)}
                        onChange={() => handleAddRepayment(item)}
                      />
                    }
                    labelPlacement="start"
                    label="返金"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

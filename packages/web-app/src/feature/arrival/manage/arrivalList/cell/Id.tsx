import { TableCell, Typography, useTheme } from '@mui/material';
import { StockingStatus } from '@prisma/client';

interface Props {
  id: number;
  status: StockingStatus;
  hasMultipleStore: boolean;
}
export const ArrivalIdCell = ({ id, status, hasMultipleStore }: Props) => {
  const { palette } = useTheme();
  return (
    <TableCell
      sx={{ textAlign: 'center', width: hasMultipleStore ? '5%' : '7%' }}
    >
      <Typography
        textAlign="center"
        color={
          status === StockingStatus.NOT_YET
            ? palette.primary.main
            : palette.text.primary
        }
      >
        {id}
      </Typography>
    </TableCell>
  );
};

import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { ConsignmentProduct } from '@/feature/consign/hooks/useConsignment';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

interface Props {
  selectedProducts?: ConsignmentProduct[];
  detailData?: BackendProductAPI[0]['response']['200']['products'][0][];
  cancelCount:
    | {
        id: number;
        cancelCount: number;
      }[]
    | null;
  handleChangeCancelCount: (id: number, value: number) => void;
}

export const CancelConsignmentModalTable = ({
  selectedProducts,
  detailData,
  cancelCount,
  handleChangeCancelCount,
}: Props) => {
  return (
    <Box sx={{ border: 1, my: 2, width: '700px' }}>
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
              <TableCell sx={{ width: '25%' }}>委託者</TableCell>
              <TableCell>商品名</TableCell>
              <TableCell sx={{ width: '15%', textAlign: 'center' }}>
                在庫数
              </TableCell>
              <TableCell sx={{ width: '20%', textAlign: 'center' }}>
                取消数
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedProducts &&
              selectedProducts.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Typography>
                      {item.consignment_client?.full_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>{item.displayNameWithMeta}</Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Typography>{item.stock_number}点</Typography>
                  </TableCell>
                  <TableCell sx={{ alignItems: 'center' }}>
                    <NumericTextField
                      value={
                        cancelCount?.find((i) => i.id === item.id)
                          ?.cancelCount ?? undefined
                      }
                      onChange={(value) =>
                        handleChangeCancelCount(item.id, value)
                      }
                      max={item.stock_number}
                      min={0}
                      size="small"
                      endSuffix="点"
                    />
                  </TableCell>
                </TableRow>
              ))}
            {detailData && (
              <TableRow>
                <TableCell>
                  <Typography>
                    {detailData[0]?.consignment_client__full_name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography>{detailData[0]?.displayNameWithMeta}</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Typography>{detailData[0]?.stock_number}点</Typography>
                </TableCell>
                <TableCell sx={{ alignItems: 'center' }}>
                  <NumericTextField
                    value={
                      cancelCount?.find((i) => i.id === detailData[0]?.id)
                        ?.cancelCount ?? undefined
                    }
                    onChange={(value) =>
                      handleChangeCancelCount(detailData[0]?.id, value)
                    }
                    max={detailData[0]?.stock_number}
                    min={0}
                    size="small"
                    endSuffix="点"
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

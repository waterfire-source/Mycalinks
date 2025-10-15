import { BackendStockingAPI } from '@/app/api/store/[store_id]/stocking/api';
import { SupplierSelect } from '@/feature/arrival/components/SupplierSelect';
import { calcArrivalPricesByStockingProduct } from '@/feature/arrival/utils';
import { Stack, TextField, Typography } from '@mui/material';
import { StockingStatus } from '@prisma/client';
import dayjs from 'dayjs';
import { Dispatch, ReactNode, SetStateAction } from 'react';

interface Props {
  isFromStoreShipment: boolean;
  editStocking: BackendStockingAPI[5]['response']['200'][0];
  setEditStocking: Dispatch<
    SetStateAction<BackendStockingAPI[5]['response']['200'][0]>
  >;
}

export const LeftEditContent = ({
  isFromStoreShipment,
  editStocking,
  setEditStocking,
}: Props) => {
  const {
    totalArrivalPrice,
    tax,
    expectedProfit,
    expectedSales,
    isTaxIncludedInput,
  } = calcArrivalPricesByStockingProduct(editStocking.stocking_products);
  // 仕入れ値の入力が税込だったか税抜きだったか表示
  const isTaxIncludedInputDisplay = isTaxIncludedInput ? '(税込)' : '(税抜)';

  return (
    <Stack flexDirection="column" width="400px" gap={2}>
      <SpacingFormItem
        title="仕入れ先"
        node={
          <SupplierSelect
            supplierID={editStocking.supplier_id}
            isReadOnly={editStocking.status !== StockingStatus.NOT_YET}
            disabled={isFromStoreShipment}
            setSupplierID={(id) =>
              setEditStocking((prev) => {
                return {
                  ...prev,
                  supplier_id: id,
                };
              })
            }
          />
        }
      />
      <SpacingFormItem
        title="入荷店舗"
        node={<Data title="" data={editStocking.store_name ?? ''} />}
      />
      <SpacingFormItem
        title="入荷予定日"
        node={
          <TextField
            type="date"
            size="small"
            disabled={
              editStocking.status !== StockingStatus.NOT_YET ||
              isFromStoreShipment
            }
            value={dayjs(editStocking.planned_date).format('YYYY-MM-DD')}
            onChange={(e) => {
              setEditStocking((prev) => {
                return {
                  ...prev,
                  planned_date: dayjs(e.target.value).format('YYYY-MM-DD'),
                };
              });
            }}
            sx={{ width: 150, backgroundColor: 'white' }}
            InputLabelProps={{
              shrink: true,
              sx: {
                color: 'black',
              },
            }}
          />
        }
      />
      <PriceDisplayItem
        title={`仕入れ合計${isTaxIncludedInputDisplay}`}
        price={totalArrivalPrice}
      />
      <PriceDisplayItem title={'消費税'} price={tax} />
      <PriceDisplayItem title={`見込み売上(税込)`} price={expectedSales} />
      <PriceDisplayItem title={`見込み利益(税込)`} price={expectedProfit} />
    </Stack>
  );
};

interface DataProps {
  title: string;
  data: string;
}
const Data = ({ title, data }: DataProps) => {
  return (
    <Stack direction="row" alignItems="center">
      <Typography width="100px" variant="body1">
        {title}
      </Typography>
      <Typography variant="body1">{data}</Typography>
    </Stack>
  );
};

interface SpacingFormItemProps {
  title: string;
  node: ReactNode;
}
const SpacingFormItem = ({ title, node }: SpacingFormItemProps) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
    >
      <Typography width="100px" variant="body1">
        {title}
      </Typography>
      {node}
    </Stack>
  );
};

interface PriceDisplayItemProps {
  title: string;
  price: number | null;
}

const PriceDisplayItem = ({ title, price }: PriceDisplayItemProps) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      sx={{
        borderBottom: '1px solid #ccc',
        paddingY: 1,
      }}
    >
      <Typography width="100px" variant="body1">
        {title}
      </Typography>

      <Typography variant="body1">
        {price !== null ? `${price.toLocaleString()}円` : '-'}
      </Typography>
    </Stack>
  );
};

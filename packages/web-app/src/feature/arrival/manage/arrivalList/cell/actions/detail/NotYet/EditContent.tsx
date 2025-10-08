import { BackendStockingAPI } from '@/app/api/store/[store_id]/stocking/api';
import { LeftEditContent } from '@/feature/arrival/manage/arrivalList/cell/actions/detail/NotYet/LeftEditContent';
import { StockingProductsTable } from '@/feature/arrival/manage/arrivalList/cell/actions/detail/NotYet/StokingProductsTable';
import { Stack } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';

interface Props {
  isFromStoreShipment: boolean;
  editStocking: BackendStockingAPI[5]['response']['200'][0];
  setEditStocking: Dispatch<
    SetStateAction<BackendStockingAPI[5]['response']['200'][0]>
  >;
}

export const EditContent = ({
  isFromStoreShipment,
  editStocking,
  setEditStocking,
}: Props) => {
  return (
    <Stack flexDirection="row" gap={3} p={2} height="100%" width="100%">
      <LeftEditContent
        isFromStoreShipment={isFromStoreShipment}
        editStocking={editStocking}
        setEditStocking={setEditStocking}
      />
      <StockingProductsTable
        isFromStoreShipment={isFromStoreShipment}
        editStocking={editStocking}
        setEditStocking={setEditStocking}
      />
    </Stack>
  );
};

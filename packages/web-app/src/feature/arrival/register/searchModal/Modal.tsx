import { Stack } from '@mui/material';
import { ArrivalProductSearchTable } from '@/feature/arrival/register/searchModal/contents/ArrivalProductSearchTable';
import { Dispatch, SetStateAction, useState } from 'react';
import { CustomArrivalProductSearchType } from '@/app/auth/(dashboard)/arrival/register/page';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';

interface Props {
  open: boolean;
  onClose: () => void;
  setProducts: Dispatch<SetStateAction<CustomArrivalProductSearchType[]>>;
}

export const ArrivalProductAddModal = ({
  open,
  onClose,
  setProducts,
}: Props) => {
  const [localCart, setLocalCart] = useState<CustomArrivalProductSearchType[]>(
    [],
  );

  const handleAddArrivalProducts = () => {
    setProducts((prevProducts) => {
      return [...prevProducts, ...localCart];
    });

    setLocalCart([]);
  };

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title="発注商品検索"
      onActionButtonClick={() => {
        handleAddArrivalProducts();
        onClose();
      }}
      actionButtonText="発注商品を追加"
      cancelButtonText="商品追加しない"
      width="95%"
      height="90%"
    >
      <Stack flexDirection="row" gap={3} width="100%" height="100%">
        <ArrivalProductSearchTable
          products={localCart}
          setProducts={setLocalCart}
        />
      </Stack>
    </CustomModalWithIcon>
  );
};

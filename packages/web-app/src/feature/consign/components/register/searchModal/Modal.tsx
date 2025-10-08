import { Stack } from '@mui/material';
import { Dispatch, SetStateAction, useState } from 'react';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { ConsignmentProductSearchTable } from '@/feature/consign/components/register/searchModal/contents/ConsignmentProductSearchTable';
import { ConsignmentProductSearchType } from '@/feature/consign/components/register/searchModal/type';
import { UnregisteredProductModal } from '@/feature/consign/components/register/UnregisteredProductModal';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';

interface Props {
  open: boolean;
  onClose: () => void;
  setProducts: Dispatch<SetStateAction<ConsignmentProductSearchType[]>>;
}

export const ConsignmentProductAddModal = ({
  open,
  onClose,
  setProducts,
}: Props) => {
  const [localCart, setLocalCart] = useState<ConsignmentProductSearchType[]>(
    [],
  );
  const [unregisteredModalOpen, setUnregisteredModalOpen] = useState(false);
  const [isRefetchItem, setIsRefetchItem] = useState(false);

  const handleAddConsignmentProducts = () => {
    setProducts((prevProducts) => {
      return [...prevProducts, ...localCart];
    });

    setLocalCart([]);
  };

  return (
    <>
      <CustomModalWithIcon
        open={open}
        onClose={onClose}
        title="委託販売商品検索"
        onActionButtonClick={() => {
          handleAddConsignmentProducts();
          onClose();
        }}
        actionButtonText="委託商品を追加"
        cancelButtonText="商品追加しない"
        width="95%"
        height="90%"
      >
        <Stack flexDirection="row" gap={3} width="100%" height="100%">
          <ConsignmentProductSearchTable
            products={localCart}
            setProducts={setLocalCart}
            isRefetchItem={isRefetchItem}
            unregisteredProductButton={
              <SecondaryButtonWithIcon
                onClick={() => {
                  setUnregisteredModalOpen(true);
                  setIsRefetchItem(false);
                }}
                sx={{
                  whiteSpace: 'nowrap',
                  minWidth: 'auto',
                  alignSelf: 'flex-end',
                }}
              >
                未登録商品を追加
              </SecondaryButtonWithIcon>
            }
          />
        </Stack>
      </CustomModalWithIcon>

      <UnregisteredProductModal
        open={unregisteredModalOpen}
        onClose={() => setUnregisteredModalOpen(false)}
        setIsRefetchItem={setIsRefetchItem}
      />
    </>
  );
};

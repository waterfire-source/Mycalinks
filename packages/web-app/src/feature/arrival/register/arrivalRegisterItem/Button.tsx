import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ArrivalProductAddModal } from '@/feature/arrival/register/searchModal/Modal';
import { ArrivalProductSearchType } from '@/feature/arrival/register/searchModal/type';
import { Dispatch, SetStateAction, useState } from 'react';

interface Props {
  setProducts: Dispatch<SetStateAction<ArrivalProductSearchType[]>>;
}
export const ArrivalRegisterItemButton = ({ setProducts }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <PrimaryButton onClick={() => setIsOpen(true)}>商品追加</PrimaryButton>
      <ArrivalProductAddModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        setProducts={setProducts}
      />
    </>
  );
};

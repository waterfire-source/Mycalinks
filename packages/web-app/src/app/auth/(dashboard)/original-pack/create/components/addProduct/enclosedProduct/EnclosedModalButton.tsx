'use client';
import { EnclosedSelectModal } from '@/app/auth/(dashboard)/original-pack/create/components/addProduct/enclosedProduct/EnclosedSelectModal';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

export const EnclosedModalButton = () => {
  const [open, setOpen] = useState(false);

  //補充機能の有無を判定
  const searchParams = useSearchParams();
  const isReplenishment = searchParams.get('replenishment') === 'true';
  const id = searchParams.get('id');
  const buttonTitle = useMemo(() => {
    if (isReplenishment) {
      return '補充商品を選択';
    } else if (id) {
      return '封入商品を追加';
    } else {
      return '封入商品を選択';
    }
  }, [isReplenishment, id]);

  return (
    <>
      <PrimaryButton onClick={() => setOpen(true)}>{buttonTitle}</PrimaryButton>
      {open && (
        <EnclosedSelectModal open={open} onClose={() => setOpen(false)} />
      )}
    </>
  );
};

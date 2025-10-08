import { useSaveLocalStorageOriginalPack } from '@/app/auth/(dashboard)/original-pack/create/components/confirm/hooks/useSaveLocalStorageOriginalPack';
import { useEnclosedProductContext } from '@/app/auth/(dashboard)/original-pack/create/context/EnclosedProductContext';
import { CancelButton } from '@/components/buttons/CancelButton';
import PrimaryButton from '@/components/buttons/PrimaryButtonWithIcon';
import { PATH } from '@/constants/paths';
import { Stack, Typography } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
  onConfirm: () => void;
}
export const OriginalPackListTableFooter = ({ onConfirm }: Props) => {
  const { totalWholesalePrice, totalSellPrice, enclosedProducts } =
    useEnclosedProductContext();
  const { saveLocalStorageItem } = useSaveLocalStorageOriginalPack();
  const { push } = useRouter();
  //補充機能の有無を判定
  const searchParams = useSearchParams();
  const isReplenishment = searchParams.get('replenishment') === 'true';
  const id = searchParams.get('id');

  const handleSaveAndConfirm = () => {
    if (!id) return;
    saveLocalStorageItem(Number(id), enclosedProducts);
    onConfirm();
  };

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      width="100%"
      height="100%"
      alignItems="center"
      px="12px"
    >
      <Stack direction="row" gap={2}>
        <Typography>
          仕入れ値合計{totalWholesalePrice.toLocaleString()}円
        </Typography>
        <Typography>販売額合計{totalSellPrice.toLocaleString()}円</Typography>
      </Stack>
      <Stack direction="row" gap={2}>
        <CancelButton onClick={() => push(PATH.ORIGINAL_PACK.root)}>
          {isReplenishment ? '補充をやめる' : '作成をやめる'}
        </CancelButton>
        <PrimaryButton
          disabled={enclosedProducts.length === 0}
          onClick={id ? handleSaveAndConfirm : onConfirm}
        >
          {isReplenishment ? 'この内容で補充' : 'この内容で作成'}
        </PrimaryButton>
      </Stack>
    </Stack>
  );
};

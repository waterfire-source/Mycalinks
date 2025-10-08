import { Box, Stack } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { PATH } from '@/constants/paths';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TertiaryButtonWithIcon from '@/components/buttons/TertiaryButtonWithIcon';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { useGuestOrderCart } from '@/contexts/GuestOrderCartContext';
import { useParamsInGuest } from '@/app/guest/[storeId]/stock/hooks/useParamsInGuest';
export const HEADER_HEIGHT = '60px';

interface HeaderProps {
  openCart: () => void;
  isOrderCompleted: boolean;
}

export const Header = ({ openCart, isOrderCompleted }: HeaderProps) => {
  const { totalQuantity, totalPrice } = useGuestOrderCart();
  const { encodedParams } = useParamsInGuest();
  const router = useRouter();
  const searchParams = useSearchParams();

  const genreId = searchParams.get('genreId');

  // 「ジャンル選択に戻る」をクリックした際にgenreIdを削除する
  const handleBackToGenreSelect = () => {
    router.push(PATH.GUEST_STOCK.root(encodedParams));
  };

  return (
    <>
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'white',
          boxShadow: '0 2px 3px #0000001f',
          height: HEADER_HEIGHT,
        }}
      >
        <Stack
          direction="row"
          padding="12px"
          sx={{
            justifyContent: 'flex-end',
            alignItems: 'center',
            height: HEADER_HEIGHT,
          }}
        >
          {!isOrderCompleted && genreId && (
            <TertiaryButtonWithIcon onClick={handleBackToGenreSelect}>
              ジャンル選択に戻る
            </TertiaryButtonWithIcon>
          )}
          {!isOrderCompleted && (
            <PrimaryButtonWithIcon
              type="submit"
              icon={<ShoppingCartIcon />}
              onClick={openCart}
            >
              カート（合計 {totalQuantity.toLocaleString()} 点{' '}
              {totalPrice.toLocaleString()} 円）
            </PrimaryButtonWithIcon>
          )}
        </Stack>
      </Box>
    </>
  );
};

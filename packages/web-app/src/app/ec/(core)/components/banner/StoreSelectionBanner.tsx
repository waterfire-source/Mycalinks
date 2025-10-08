'use client';

import { Box, Typography } from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';
import { useSearchParams } from 'next/navigation';
import { useEcStoreContext } from '@/app/ec/(core)/contexts/EcStoreContext';

type Props = {
  /**
   * バナーのマージン調整用
   */
  marginBottom?: number;
  /**
   * バナーのパディング調整用
   */
  padding?: number;
  /**
   * バナーの角丸調整用
   */
  borderRadius?: number;
};

/**
 * 店舗選択バナーコンポーネント
 * storeIdsクエリパラメータから選択中の店舗を表示
 */
export const StoreSelectionBanner = ({
  marginBottom = 1,
  padding = 1,
  borderRadius = 1,
}: Props) => {
  const searchParams = useSearchParams();
  const { stores } = useEcStoreContext();

  /**
   * 店舗選択バナーのテキストを生成
   */
  const getStoreBannerText = () => {
    const storeIdsParam = searchParams.get('storeIds');
    if (!storeIdsParam || !stores) return null;

    const selectedStoreIds = storeIdsParam
      .split(',')
      .map((id) => parseInt(id.trim()));
    const selectedStores = stores.filter((store) =>
      selectedStoreIds.includes(store.id),
    );

    if (selectedStores.length === 0) return null;

    if (selectedStores.length === 1) {
      return `${selectedStores[0].display_name}の商品を表示しています`;
    } else {
      return `${selectedStores[0].display_name}を含む、${selectedStores.length}店舗の商品を表示しています`;
    }
  };

  const storeBannerText = getStoreBannerText();

  // 表示するテキストがない場合は何も表示しない
  if (!storeBannerText) return null;

  return (
    <Box
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        padding,
        borderRadius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        marginBottom,
      }}
    >
      <StoreIcon sx={{ fontSize: 20 }} />
      <Typography variant="body2" fontWeight="medium">
        {storeBannerText}
      </Typography>
    </Box>
  );
};

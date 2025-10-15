import React, { useState, useEffect, ChangeEvent } from 'react';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import NumericTextField from '@/components/inputFields/NumericTextField';
import {
  Box,
  Card,
  Checkbox,
  Typography,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import Select from '@mui/material/Select';
import { PackType } from '@/feature/stock/register/pack/components/PackTable';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { CaptionToolTip } from '@/components/tooltips/CaptionToolTip';
import { ItemText } from '@/feature/item/components/ItemText';
import { useConfirmationModal } from '@/contexts/ConfirmationModalContext';
import { RequiredChip } from '@/components/inputFields/RequiredChip';

import { RegisterParams } from '@/feature/stock/register/pack/types';

interface PackOpenSettingProps {
  tableHeight: string;
  selectedPack?: PackType;
  registerParams: RegisterParams;
  storageProducts:
    | BackendProductAPI[0]['response']['200']['products']
    | undefined;
  onSetRegisterParams: (newRegisterParams: RegisterParams) => void;
  onNextProgress: () => void;
  storeID: number;
  isDirty: boolean;
}

export const PackOpenSetting: React.FC<PackOpenSettingProps> = ({
  tableHeight,
  selectedPack,
  registerParams,
  storageProducts,
  onSetRegisterParams: handleSetRegisterParams,
  onNextProgress: handleNextProgress,
  isDirty,
}) => {
  const [isRegisterParamsDisabled, setIsRegisterParamsDisabled] =
    useState<boolean>(true);

  const handleOpenNumberInputChange = (value: number | undefined) => {
    handleSetRegisterParams({
      ...registerParams,
      openNumber: value,
    });
  };

  const handleIsFixedPackChange = (value: boolean) => {
    handleSetRegisterParams({
      ...registerParams,
      isFixedPack: value,
    });
  };

  const handleIsRandomPackChange = (value: boolean) => {
    handleSetRegisterParams({
      ...registerParams,
      isRandomPack: value,
    });
  };

  const handleSelectStorageProduct = (
    event: SelectChangeEvent<number | string>,
  ) => {
    handleSetRegisterParams({
      ...registerParams,
      selectedStorageProduct: event.target.value,
    });
  };

  // フォームのバリデーション
  useEffect(() => {
    if (
      registerParams?.openNumber &&
      registerParams?.selectedStorageProduct &&
      (registerParams?.isFixedPack || registerParams?.isRandomPack) &&
      selectedPack !== undefined
    ) {
      setIsRegisterParamsDisabled(false);
    } else {
      setIsRegisterParamsDisabled(true);
    }
  }, [registerParams]);

  // 画面遷移確認モーダル表示の制御
  const { setModalVisible } = useConfirmationModal();
  useEffect(() => {
    setModalVisible(!!selectedPack || isDirty);
  }, [isDirty, selectedPack, setModalVisible]);

  return (
    <Card
      sx={{
        width: '100%',
        minWidth: '300px',
        height: tableHeight,
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        variant="h1"
        align="center"
        sx={{
          width: '100%',
          color: 'text.secondary',
          backgroundColor: 'primary.main',
          height: '56px',
          borderRadius: '4px 4px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        開封設定
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          pt: 2,
          px: 2,
          pb: 1,
          overflow: 'auto',
          width: '100%',
          gap: 3,
        }}
      >
        {/* 選択されたパック */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography variant="body1">開封商品</Typography>
          <Box sx={{ width: '100%' }}>
            {selectedPack ? (
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ItemImage imageUrl={selectedPack.imageUrl} height={110} />
                <Box sx={{ flexGrow: 1 }}>
                  <ItemText text={selectedPack?.displayName} />
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      mt: 1,
                      gap: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'grey.300',
                        color: 'black',
                        borderRadius: '2px',
                        px: '4px',
                        py: '2px',
                      }}
                    >
                      {selectedPack?.genreName}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {'>'}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'grey.300',
                        color: 'black',
                        borderRadius: '2px',
                        px: '4px',
                        py: '2px',
                      }}
                    >
                      {selectedPack?.categoryName}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box sx={{ height: '110px' }}></Box>
            )}
          </Box>
        </Box>

        {/* 予定開封数 */}
        <Box sx={{ width: '100%' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
              <Typography variant="body1">予定開封数</Typography>
              <RequiredChip />
            </Box>
            <Box sx={{ width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  gap: 1,
                }}
              >
                <Box sx={{ width: '50%' }}>
                  <Box sx={{ mx: 2 }}>
                    <NumericTextField
                      value={registerParams.openNumber}
                      onChange={handleOpenNumberInputChange}
                      size="small"
                    />
                  </Box>
                </Box>
                <Box sx={{ width: '50%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'start' }}>
                    {selectedPack && (
                      <Typography variant="caption">
                        （在庫変動：{selectedPack.stockNumber} →{' '}
                        {selectedPack.stockNumber -
                          (registerParams.openNumber ?? 0)}
                        ）
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* 在庫登録するカード */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
            <Typography variant="body1">在庫登録するカード</Typography>
            <RequiredChip />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', mx: 2 }}>
            {/* 封入カードが決まっているカード */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                sx={{
                  '& .MuiSvgIcon-root': { color: 'primary.main' },
                }}
                checked={registerParams.isFixedPack}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  handleIsFixedPackChange(e.target.checked);
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <Typography variant="body1">
                封入カードが決まっているカード
                <CaptionToolTip message="決まったカードが確実に入っている(例：スタートデッキ)" />
              </Typography>
            </Box>

            {/* ランダム封入のカード */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                sx={{
                  '& .MuiSvgIcon-root': { color: 'primary.main' },
                }}
                checked={registerParams.isRandomPack}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  handleIsRandomPackChange(e.target.checked);
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <Typography variant="body1">
                ランダム封入のカード
                <CaptionToolTip message="どのカードが入っているか分からない状態で販売されるカード(例：拡張パック)" />
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 未登録カードの処理 */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
            <Typography variant="body1">登録しないカードの処理</Typography>
            <RequiredChip />
          </Box>
          <Box sx={{ mx: 2 }}>
            {storageProducts && (
              <Select
                value={registerParams.selectedStorageProduct || ''}
                onChange={handleSelectStorageProduct}
                size="small"
                fullWidth
              >
                <MenuItem value="loss">ロス</MenuItem>
                {storageProducts.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.display_name} :{' '}
                    {option.condition_option_display_name || '未設定'}
                  </MenuItem>
                ))}
              </Select>
            )}
          </Box>
        </Box>
      </Box>

      {/* ボタン部分 */}
      <Box sx={{ px: 2, pb: 2 }}>
        <PrimaryButton
          fullWidth
          onClick={handleNextProgress}
          disabled={isRegisterParamsDisabled}
        >
          開封結果の登録を開始
        </PrimaryButton>
      </Box>
    </Card>
  );
};

import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  SelectChangeEvent,
  Select,
  MenuItem,
  Tooltip,
  ClickAwayListener,
} from '@mui/material';
import { PackItemType } from '@/feature/stock/register/pack/components/PackRegisterTab';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { PackRegisterTab } from '@/feature/stock/register/pack/components/PackRegisterTab';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import ErrorIcon from '@mui/icons-material/Error';
import { PackRegisterFooter } from '@/feature/stock/register/pack/components/PackRegisterFooter';

interface RandomPackRegisterProps {
  items: PackItemType[];
  setItems: (newItems: PackItemType[]) => void;
  openNumber: number;
  setOpenNumber: (newOpenNumber: number) => void;
  selectedStorageProduct: number | string;
  setSelectedStorageProduct: (
    newSelectedStorageProduct: number | string,
  ) => void;
  storageProducts:
    | BackendProductAPI[0]['response']['200']['products']
    | undefined;
  handleNextProgress: () => void;
  handleBackProgress: () => void;
  includeFixedPack: boolean;
  isDisabledEditOpenNumber: boolean;
  setIsDisabledEditOpenNumber: (isDisabled: boolean) => void;
}

export const RandomPackRegister: React.FC<RandomPackRegisterProps> = ({
  items,
  setItems: handleSetItems,
  openNumber,
  setOpenNumber,
  selectedStorageProduct,
  setSelectedStorageProduct,
  storageProducts,
  handleNextProgress,
  handleBackProgress,
  includeFixedPack,
  isDisabledEditOpenNumber,
  setIsDisabledEditOpenNumber,
}) => {
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);

  const handleOpenNumberInputChange = (value: number | undefined) => {
    setOpenNumber(value || 0);
  };

  const handleSelectStorageProduct = (
    event: SelectChangeEvent<number | string>,
  ) => {
    setSelectedStorageProduct(event.target.value);
  };

  const onUpdateItemQuantity = (id: number, newQuantity: number) => {
    const newItems: PackItemType[] = items.map((item) =>
      item.myca_item_id === id ? { ...item, quantity: newQuantity } : item,
    );
    handleSetItems(newItems);
  };

  const numberOfRegisterdCards = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const onBackProgress = () => {
    setIsDisabledEditOpenNumber(false);
    handleBackProgress();
  };

  return (
    <ContainerLayout
      title="ランダム封入のカードの登録"
      helpArchivesNumber={708}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: 'calc(100% - 50px)',
          padding: '20px',
          gap: '20px',
          boxSizing: 'border-box',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ height: '34px', width: '100%' }}>
          <Grid container spacing={1} alignItems="center">
            {/* 開封数 */}
            <Grid item>
              <Typography variant="body1">開封数</Typography>
            </Grid>
            <Grid item>
              <NumericTextField
                value={openNumber}
                onChange={handleOpenNumberInputChange}
                size="small"
                isReadOnly={isDisabledEditOpenNumber}
                sx={{ width: 60 }}
              />
            </Grid>

            {/* 未登録カードの扱い */}
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                <Typography variant="body1">未登録カードの扱い</Typography>
                <ClickAwayListener onClickAway={() => setIsTooltipOpen(false)}>
                  <div>
                    <Tooltip
                      title="個別に登録されなかったカードが自動的にこの扱いを受けます"
                      placement="top"
                      arrow={true}
                      onClose={() => setIsTooltipOpen(false)}
                      open={isTooltipOpen}
                      disableFocusListener
                      disableHoverListener
                      disableTouchListener
                      slotProps={{
                        popper: {
                          disablePortal: true,
                        },
                      }}
                    >
                      <ErrorIcon
                        fontSize="small"
                        sx={{
                          verticalAlign: 'middle',
                          color: 'grey.500',
                          ml: 0.5,
                        }}
                        onClick={() => setIsTooltipOpen(true)}
                      />
                    </Tooltip>
                  </div>
                </ClickAwayListener>
              </Box>
            </Grid>
            <Grid item sx={{ minWidth: 120 }}>
              <Select
                value={selectedStorageProduct || ''}
                onChange={handleSelectStorageProduct}
                size="small"
                fullWidth
              >
                <MenuItem value="loss">ロス</MenuItem>
                {storageProducts?.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.display_name} :{' '}
                    {option.condition_option_display_name || '未設定'}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item>
              <Typography variant="body1">として登録</Typography>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ flexGrow: 1, minHeight: '500px' }}>
          <PackRegisterTab
            items={items}
            isLoading={!(items.length > 0)}
            updateItemQuantity={onUpdateItemQuantity}
            footer={
              <PackRegisterFooter
                numberOfRegisterdCards={numberOfRegisterdCards}
                prevButtonLabel={
                  includeFixedPack
                    ? '確定封入カードの登録へ戻る'
                    : '開封商品の選択へ戻る'
                }
                prevButtonOnClick={onBackProgress}
                nextButtonLabel="開封結果の確認へ進む"
                nextButtonOnClick={handleNextProgress}
              />
            }
            forFixedPack={false}
          />
        </Box>
      </Box>
    </ContainerLayout>
  );
};

export default RandomPackRegister;

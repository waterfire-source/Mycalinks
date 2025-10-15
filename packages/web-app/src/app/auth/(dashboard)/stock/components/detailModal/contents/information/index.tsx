import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { DetailComponent } from '@/app/auth/(dashboard)/stock/components/detailModal/DetailComponent';
import {
  Box,
  Checkbox,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Product } from '@prisma/client';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { useState } from 'react';
import { StockChangeSaveModal } from '@/app/auth/(dashboard)/stock/components/detailModal/contents/information/StockChangeSaveModal';
import { CaptionToolTip } from '@/components/tooltips/CaptionToolTip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { NoSpinTextField } from '@/components/common/NoSpinTextField';
import { toHalfWidthOnly } from '@/utils/convertToHalfWidth';
import { MultiImagePicker } from '@/components/cards/MultiImagePicker';
import { ProductImageData } from '@/feature/products/hooks/useUpdateProductImages';
import NumericTextField from '@/components/inputFields/NumericTextField';

interface Props {
  detailData: BackendProductAPI[0]['response']['200']['products'][0][];
  formData?: Partial<Product> & {
    allow_sell_price_auto_adjustment?: boolean;
    allow_buy_price_auto_adjustment?: boolean;
  };
  setFormData?: React.Dispatch<
    React.SetStateAction<
      | (Partial<Product> & {
          allow_sell_price_auto_adjustment?: boolean;
          allow_buy_price_auto_adjustment?: boolean;
        })
      | undefined
    >
  >;
  wholesalePrice?: BackendProductAPI[9]['response']['200'];
  isStockSaveModalOpen: boolean;
  setIsStockSaveModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isResetSpecificPrice: boolean;
  setIsResetSpecificPrice: React.Dispatch<React.SetStateAction<boolean>>;
  setIsStockChange: React.Dispatch<React.SetStateAction<boolean>>;
  fetchProducts: () => Promise<void>;
  productId: number;
  storeId: number;
  fetchAllProducts?: () => Promise<void>;
  onCancelSpecialPrice?: () => void;
  loading?: boolean;
  productImages: ProductImageData[];
  setProductImages: React.Dispatch<React.SetStateAction<ProductImageData[]>>;
  setIsImagesChanged: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Information = ({
  detailData,
  formData,
  setFormData,
  wholesalePrice,
  isStockSaveModalOpen,
  setIsStockSaveModalOpen,
  isResetSpecificPrice,
  setIsResetSpecificPrice,
  setIsStockChange,
  fetchProducts,
  fetchAllProducts,
  onCancelSpecialPrice,
  loading,
  productImages,
  setProductImages,
  setIsImagesChanged,
}: Props) => {
  // 在庫数を管理
  const [stockNumber, SetStockNumber] = useState<number | ''>(''); // 初期化する時は空文字

  const handleStringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.trim() === '' ? '' : value;
    if (setFormData) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: numericValue,
      }));
    }
  };

  const handleStringJanCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    const halfWidthValue = toHalfWidthOnly(value);
    const numericValue = halfWidthValue.trim() === '' ? '' : halfWidthValue;
    if (setFormData) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: numericValue,
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.trim() === '' ? null : Number(value);
    if (setFormData) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: numericValue,
      }));
    }
  };

  // 在庫数入力専用のonChangeだけでisStockChangeを判定
  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.trim() === '' ? null : Number(value); // 数値に変換

    if (setFormData) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: numericValue,
      }));
      SetStockNumber(Number(value));
      if (
        value.trim() === '' ||
        detailData[0]?.stock_number === Number(value)
      ) {
        SetStockNumber('');
        setIsStockChange(false);
      } else {
        setIsStockChange(true);
      }
    }
  };

  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleTooltipToggle = () => {
    setTooltipOpen((prev) => !prev);
  };

  const handleTooltipClose = () => {
    setTooltipOpen(false);
  };

  return (
    <Grid container spacing={1} sx={{ height: '100%' }}>
      <Grid item xs={4} sx={{ height: '100%' }}>
        <DetailComponent
          loading={loading}
          detailData={detailData}
          fetchProducts={fetchProducts}
          onCancelSpecialPrice={onCancelSpecialPrice}
          fetchAllProducts={fetchAllProducts}
        />
      </Grid>
      {/* 真ん中 */}
      <Grid
        item
        xs={4}
        sx={{
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ mt: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="left" gap={5}>
            <Typography sx={{ width: '155px' }}>商品名</Typography>
            <TextField
              name="display_name"
              value={formData?.display_name || null}
              size="small"
              onChange={handleStringChange}
              sx={{ backgroundColor: 'white', width: '30%' }}
              fullWidth
            />
          </Box>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="left"
            sx={{ mt: 1.5 }}
            gap={5}
          >
            <Typography sx={{ width: '155px' }}>JANコード</Typography>
            <TextField
              name="readonly_product_code"
              value={formData?.readonly_product_code || ''}
              size="small"
              onChange={handleStringJanCodeChange}
              sx={{ backgroundColor: 'white', width: '30%' }}
              fullWidth
            />
          </Box>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="left"
            sx={{ mt: 1.5 }}
            gap={5}
          >
            <Typography sx={{ width: '155px' }}>販売価格</Typography>
            <TextField
              name="sell_price"
              value={
                formData?.sell_price
                  ? formData.sell_price.toLocaleString() + '円'
                  : null
              }
              size="small"
              disabled
              sx={{ backgroundColor: 'white', width: '30%' }}
              fullWidth
            />
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="left"
            sx={{ mt: 1.5 }}
            gap={5}
          >
            <Typography sx={{ width: '155px' }}>買取価格</Typography>
            <TextField
              name="buy_price"
              value={
                formData?.buy_price
                  ? formData.buy_price.toLocaleString() + '円'
                  : null
              }
              size="small"
              disabled
              sx={{ backgroundColor: 'white', width: '30%' }}
              fullWidth
            />
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="left"
            sx={{ mt: 1.5 }}
            gap={5}
          >
            <Typography sx={{ width: '155px' }}>
              平均仕入れ値
              <Tooltip
                open={tooltipOpen}
                onClose={handleTooltipClose}
                onOpen={() => setTooltipOpen(true)}
                disableFocusListener
                disableHoverListener={false}
                title={
                  <Box>
                    {wholesalePrice?.originalWholesalePrices?.map(
                      (option, index) => (
                        <Box
                          key={index}
                          display="flex"
                          justifyContent="space-between"
                        >
                          <Typography>{`${option.unit_price.toLocaleString()}円`}</Typography>
                          <Typography>{` ${option.item_count.toLocaleString()}点`}</Typography>
                        </Box>
                      ),
                    )}
                  </Box>
                }
                arrow
                placement="right"
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: 'white',
                      color: 'black',
                      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
                      border: '1px solid #ccc',
                    },
                  },
                  arrow: {
                    sx: { color: 'white' },
                  },
                }}
              >
                <IconButton onClick={handleTooltipToggle}>
                  <HelpOutlineIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            </Typography>
            <TextField
              name="specific_buy_price"
              value={
                wholesalePrice
                  ? Math.floor(
                      wholesalePrice.totalWholesalePrice /
                        wholesalePrice.totalItemCount,
                    ).toLocaleString() + '円'
                  : '仕入れ値なし'
              }
              size="small"
              disabled
              sx={{ backgroundColor: 'white', width: '30%' }}
              fullWidth
            />
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="left"
            sx={{ mt: 1.5 }}
            gap={5}
          >
            <Typography sx={{ width: '155px' }}>
              販売価格（独自）
              <CaptionToolTip message="[注意]価格を独自で指定した場合、商品マスタの価格の更新の影響を受けなくなります。" />
            </Typography>
            <NumericTextField
              value={formData?.specific_sell_price ?? undefined}
              onChange={(value) => {
                if (setFormData) {
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    specific_sell_price: value,
                  }));
                }
              }}
              size="small"
              min={0}
              sx={{ backgroundColor: 'white', width: '30%' }}
              noSpin={true}
            />
            <Stack direction="row" alignItems="center">
              <Checkbox
                checked={
                  !(
                    (formData as any)?.allow_sell_price_auto_adjustment ??
                    ((detailData[0] as any)
                      ?.allow_sell_price_auto_adjustment as
                      | boolean
                      | undefined) ??
                    true
                  )
                }
                onChange={() => {
                  if (setFormData) {
                    const current =
                      (formData as any)?.allow_sell_price_auto_adjustment ??
                      ((detailData[0] as any)
                        ?.allow_sell_price_auto_adjustment as
                        | boolean
                        | undefined) ??
                      true;
                    setFormData({
                      ...(formData as any),
                      allow_sell_price_auto_adjustment: !current,
                    } as any);
                  }
                }}
              />
              <Typography>保持</Typography>
            </Stack>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="left"
            sx={{ mt: 1.5 }}
            gap={5}
          >
            <Typography sx={{ width: '155px' }}>
              買取価格（独自）
              <CaptionToolTip message="[注意]価格を独自で指定した場合、商品マスタの価格の更新の影響を受けなくなります。" />
            </Typography>
            <NumericTextField
              value={formData?.specific_buy_price ?? undefined}
              onChange={(value) => {
                if (setFormData) {
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    specific_buy_price: value,
                  }));
                }
              }}
              size="small"
              min={0}
              sx={{ backgroundColor: 'white', width: '30%' }}
              noSpin={true}
            />
            <Stack direction="row" alignItems="center">
              <Checkbox
                checked={
                  !(
                    (formData as any)?.allow_buy_price_auto_adjustment ??
                    ((detailData[0] as any)?.allow_buy_price_auto_adjustment as
                      | boolean
                      | undefined) ??
                    true
                  )
                }
                onChange={() => {
                  if (setFormData) {
                    const current =
                      (formData as any)?.allow_buy_price_auto_adjustment ??
                      ((detailData[0] as any)
                        ?.allow_buy_price_auto_adjustment as
                        | boolean
                        | undefined) ??
                      true;
                    setFormData({
                      ...(formData as any),
                      allow_buy_price_auto_adjustment: !current,
                    } as any);
                  }
                }}
              />
              <Typography>保持</Typography>
            </Stack>
          </Box>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="left"
            sx={{ mt: 1.5 }}
            gap={5}
          >
            <Typography sx={{ width: '155px' }}>小売価格</Typography>
            <NoSpinTextField
              name="retail_price"
              type="number"
              value={formData?.retail_price || null}
              onChange={handleChange}
              size="small"
              inputProps={{ min: 0 }}
              sx={{ backgroundColor: 'white', width: '30%' }}
              fullWidth
            />
          </Box>
          {detailData[0]?.item_infinite_stock ? (
            <></>
          ) : (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="left"
              sx={{ mt: 1.5 }}
              gap={5}
            >
              <Typography sx={{ width: '155px' }}>在庫数</Typography>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                width="calc(60% + 40px)"
              >
                <TextField
                  name="stock_number"
                  value={
                    detailData[0]?.stock_number
                      ? detailData[0]?.stock_number
                      : 0
                  }
                  size="small"
                  disabled
                  sx={{ backgroundColor: 'white' }}
                  fullWidth
                />
                <ArrowRightAltIcon sx={{ color: 'gray' }} />
                <TextField
                  name="stock_number"
                  type="number"
                  value={stockNumber}
                  onChange={handleStockChange}
                  size="small"
                  sx={{ backgroundColor: 'white' }}
                  fullWidth
                  inputProps={{ min: 0 }}
                />
              </Box>
            </Box>
          )}

          {/* チェックボックス群を在庫数の下に移動 */}
          <Box sx={{ mt: 2 }}>
            <Stack direction="column" gap={1}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Checkbox
                  checked={!formData?.tablet_allowed}
                  onChange={() => {
                    if (setFormData) {
                      setFormData({
                        ...formData,
                        tablet_allowed: !formData?.tablet_allowed,
                      });
                    }
                  }}
                />
                <Typography>店舗タブレットに表示しない</Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Grid>

      <Grid
        item
        xs={4}
        sx={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          mt: 2,
          height: '100%',
          overflow: 'auto',
        }}
      >
        <Box sx={{ width: '100%' }}>
          {/* メモ入力欄 */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1 }}>メモ</Typography>
            <TextField
              name="description"
              value={formData?.description || ''}
              onChange={handleStringChange}
              multiline
              rows={4}
              size="small"
              sx={{ backgroundColor: 'white', width: '100%' }}
              placeholder="メモを入力してください"
            />
          </Box>

          {/* 追加画像のアップロード／プレビュー */}
          <Box sx={{ mb: 3 }}>
            <MultiImagePicker
              images={productImages}
              onImagesChange={(images) => {
                setProductImages(images);
                setIsImagesChanged(true);
              }}
              maxImages={10}
              label="追加画像"
            />
          </Box>
        </Box>
      </Grid>
      {/* <Grid
        item
        xs={4}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          mt: 2,
        }}
      > */}
      {/* タグ（機能なし） */}

      {/* <TagDetail
          filteredTags={filteredTags}
          visibleTags={visibleTags}
          setVisibleTags={setVisibleTags}
          canDisplay={canDisplay}
          setCanDisplay={setCanDisplay}
          fetchProducts={fetchProducts}
          storeId={storeId}
          productId={productId}
        /> */}
      {/* </Grid> */}
      <StockChangeSaveModal
        open={isStockSaveModalOpen}
        onClose={() => setIsStockSaveModalOpen(false)}
        detailData={detailData}
        formData={formData}
        fetchProducts={fetchProducts}
        fetchAllProducts={fetchAllProducts}
        setStockNumber={SetStockNumber}
        isResetSpecificPrice={isResetSpecificPrice}
        setIsResetSpecificPrice={setIsResetSpecificPrice}
        setIsStockChange={setIsStockChange}
      />
    </Grid>
  );
};

import { MarketFluctuationsProduct } from '@/feature/marketFluctuationsModal/type';
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
import { useState } from 'react';
import { Product } from '@prisma/client';
import { NoSpinTextField } from '@/components/common/NoSpinTextField';
import { CaptionToolTip } from '@/components/tooltips/CaptionToolTip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { ProductDetailComponent } from '@/feature/marketFluctuationsModal/ProductDetailComponent';

interface ChangeInventoryPriceProps {
  detailData: MarketFluctuationsProduct;
  formData?: Partial<Product>;
  setFormData: React.Dispatch<
    React.SetStateAction<Partial<Product> | undefined>
  >;
}

export const ChangeInventoryPrice = ({
  detailData,
  formData,
  setFormData,
}: ChangeInventoryPriceProps) => {
  // 買取価格（独自）/販売価格（独自）編集
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.trim() === '' ? null : Number(value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: numericValue,
    }));
  };
  // 平均仕入れ値用ツールチップ
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
        <ProductDetailComponent detailData={detailData} />
      </Grid>
      {/* 真ん中 */}
      <Grid
        item
        xs={4}
        sx={{ height: '100%', flexDirection: 'column', alignItems: 'center' }}
      >
        <Box sx={{ mt: 2 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography sx={{ width: '240px' }}>商品名</Typography>
            <TextField
              name="display_name"
              value={detailData.display_name || ''}
              size="small"
              disabled
              sx={{ backgroundColor: 'white' }}
              fullWidth
            />
          </Box>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 1.5 }}
          >
            <Typography sx={{ width: '240px' }}>JANコード</Typography>
            <TextField
              name="readonly_product_code"
              value={detailData.readonly_product_code || ''}
              size="small"
              disabled
              sx={{ backgroundColor: 'white' }}
              fullWidth
            />
          </Box>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 1.5 }}
          >
            <Typography sx={{ width: '240px' }}>販売価格</Typography>
            <TextField
              name="sell_price"
              value={
                detailData.sell_price
                  ? detailData.sell_price.toLocaleString() + '円'
                  : ''
              }
              size="small"
              disabled
              sx={{ backgroundColor: 'white' }}
              fullWidth
            />
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 1.5 }}
          >
            <Typography sx={{ width: '240px' }}>買取価格</Typography>
            <TextField
              name="buy_price"
              value={
                detailData.buy_price
                  ? detailData.buy_price.toLocaleString() + '円'
                  : ''
              }
              size="small"
              disabled
              sx={{ backgroundColor: 'white' }}
              fullWidth
            />
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 1.5 }}
          >
            <Typography sx={{ width: '240px' }}>
              平均仕入れ値
              <Tooltip
                open={tooltipOpen}
                onClose={handleTooltipClose}
                onOpen={() => setTooltipOpen(true)}
                disableFocusListener
                disableHoverListener={false}
                title={
                  <Box display="flex" gap="10px" justifyContent="space-between">
                    {detailData.average_wholesale_price && (
                      <Typography>{`${detailData.average_wholesale_price.toLocaleString()}円`}</Typography>
                    )}
                    <Typography>{` ${detailData.stock_number.toLocaleString()}点`}</Typography>
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
              name="wholesale_price"
              value={
                detailData.average_wholesale_price
                  ? detailData.average_wholesale_price.toLocaleString() + '円'
                  : '仕入れ値なし'
              }
              size="small"
              disabled
              sx={{ backgroundColor: 'white' }}
              fullWidth
            />
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 1.5 }}
          >
            <Typography sx={{ width: '240px' }}>
              販売価格（独自）
              <CaptionToolTip message="[注意]価格を独自で指定した場合、商品マスタの価格の更新の影響を受けなくなります。" />
            </Typography>
            <NoSpinTextField
              name="specific_sell_price"
              type="number"
              value={
                formData?.specific_sell_price !== undefined
                  ? formData?.specific_sell_price
                  : detailData.specific_sell_price ?? ''
              }
              onChange={handleChange}
              size="small"
              inputProps={{ min: 0 }}
              sx={{ backgroundColor: 'white' }}
              fullWidth
            />
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 1.5 }}
          >
            <Typography sx={{ width: '240px' }}>
              買取価格（独自）
              <CaptionToolTip message="[注意]価格を独自で指定した場合、商品マスタの価格の更新の影響を受けなくなります。" />
            </Typography>
            <NoSpinTextField
              name="specific_buy_price"
              type="number"
              value={
                formData?.specific_buy_price !== undefined
                  ? formData?.specific_buy_price
                  : detailData.specific_buy_price ?? ''
              }
              onChange={handleChange}
              size="small"
              inputProps={{ min: 0 }}
              sx={{ backgroundColor: 'white' }}
              fullWidth
            />
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 1.5 }}
          >
            <Typography sx={{ width: '240px' }}>判定結果</Typography>
            <TextField
              name="appraisal_result"
              value={
                detailData.tags?.find(
                  (tag) => tag.genre1 === 'appraisal_option',
                )?.tag_name || ''
              }
              size="small"
              disabled
              sx={{ backgroundColor: 'white' }}
              fullWidth
            />
          </Box>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 1.5 }}
          >
            <Typography sx={{ width: '240px' }}>鑑定番号</Typography>
            <TextField
              name="appraisal_number"
              value={
                detailData.tags
                  ?.find((tag) => tag.tag_name.startsWith('鑑定番号:'))
                  ?.tag_name.replace('鑑定番号:', '') || ''
              }
              size="small"
              disabled
              sx={{ backgroundColor: 'white' }}
              fullWidth
            />
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 1.5 }}
          >
            <Typography sx={{ width: '240px' }}>小売価格</Typography>
            <NoSpinTextField
              name="retail_price"
              type="number"
              value={detailData.retail_price ?? ''}
              onChange={handleChange}
              size="small"
              inputProps={{ min: 0 }}
              disabled
              sx={{ backgroundColor: 'white' }}
              fullWidth
            />
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 1.5 }}
          >
            <Typography sx={{ width: '240px' }}>卸売価格</Typography>
            <TextField
              name="wholesale_price"
              type="number"
              value={detailData.wholesale_price ?? ''}
              onChange={handleChange}
              size="small"
              inputProps={{ min: 0 }}
              disabled
              sx={{ backgroundColor: 'white' }}
              fullWidth
            />
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 1.5 }}
          >
            <Typography sx={{ width: '240px' }}>在庫数</Typography>
            <TextField
              name="stock_number"
              type="number"
              value={
                detailData.item_infinite_stock
                  ? '∞'
                  : (detailData.stock_number ?? 0).toLocaleString()
              }
              onChange={handleChange}
              size="small"
              disabled
              sx={{ backgroundColor: 'white' }}
              fullWidth
            />
          </Box>
        </Box>
      </Grid>
      <Grid
        item
        xs={4}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          mt: 2,
        }}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <Checkbox checked={!detailData.tablet_allowed} disabled />
          <Typography>店舗タブレットに表示しない</Typography>
        </Stack>
      </Grid>
    </Grid>
  );
};

import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { MarketFluctuationsProduct } from '@/feature/marketFluctuationsModal/type';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';

interface Props {
  detailData: MarketFluctuationsProduct;
}

export const ProductDetailComponent = ({ detailData }: Props) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleTooltipToggle = () => {
    setTooltipOpen((prev) => !prev);
  };

  const handleTooltipClose = () => {
    setTooltipOpen(false);
  };

  // 鑑定オプションの表示（カンマ区切り）
  const appraisal = detailData.tags
    .filter((tag) => tag.genre1 === 'appraisal_option')
    .map((tag) => tag.tag_name)
    .join(', ');

  // 商品の状態（or オリパ・福袋／バンドル表示）
  const conditionOptions: Record<string, string> = {
    ORIGINAL_PACK: 'オリパ・福袋',
    BUNDLE: 'バンドル',
  };
  const productState =
    conditionOptions[detailData.type] ||
    detailData.condition_option_display_name ||
    null;

  // タグ情報（鑑定品ラベル用）
  const filteredTags = detailData.tags
    .filter((tag) => tag.genre1 === null)
    .map((tag) => tag.tag_name);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start" // 全体を左寄せ
      sx={{ maxWidth: 300, mx: 'auto', p: 2 }}
    >
      {/* 画像 */}
      <Box display="flex" justifyContent="center" width="100%">
        <ItemImage imageUrl={detailData.image_url} height={300} />
      </Box>

      {/* 商品名 */}
      <ItemText sx={{ mt: 2 }} text={detailData.displayNameWithMeta} />

      {/* 商品タグ (状態 & 鑑定オプション) */}
      <Box display="flex" gap={1} sx={{ mt: 1 }}>
        {productState && <Typography>{productState}</Typography>}
        {appraisal && (
          <Typography
            variant="body1"
            sx={{
              backgroundColor: 'grey.500',
              color: 'black',
              border: '1px solid',
              borderColor: 'grey.500',
              pr: 1,
              pl: 1,
            }}
          >
            {appraisal}
          </Typography>
        )}
      </Box>

      {/* 鑑定品ラベル（タグ） */}
      <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
        {Array.isArray(filteredTags) && filteredTags.length > 0 && (
          <>
            <Typography
              variant="body1"
              sx={{
                backgroundColor: 'grey.300',
                color: 'black',
                borderRadius: 5,
                border: '1px solid',
                borderColor: 'grey.500',
                pr: 1,
                pl: 1,
                mr: 2,
              }}
            >
              {filteredTags[0]}
            </Typography>
            {/* 他のタグ数を表示 */}
            {filteredTags.length > 1 && (
              <>
                <Typography variant="body1" sx={{ fontSize: '0.75rem' }}>
                  他{filteredTags.length - 1}個のタグ
                </Typography>
                <Tooltip
                  open={tooltipOpen}
                  onClose={handleTooltipClose}
                  onOpen={() => setTooltipOpen(true)}
                  disableFocusListener
                  disableHoverListener={false}
                  title={
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        backgroundColor: 'white',
                        p: 1,
                      }}
                    >
                      {filteredTags.map((tag, index) => (
                        <Typography
                          variant="body1"
                          key={index}
                          sx={{
                            backgroundColor: 'grey.300',
                            borderRadius: 5,
                            border: '1px solid',
                            borderColor: 'grey.500',
                            pr: 1,
                            pl: 1,
                            width: 'max-content',
                          }}
                        >
                          {tag}
                        </Typography>
                      ))}
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
              </>
            )}
          </>
        )}
      </Box>

      {/* 価格情報 */}
      <Box display="flex" alignItems="center" sx={{ mt: 1, gap: 2 }}>
        {/* 販売価格 */}
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              backgroundColor: 'red',
              color: 'white',
              borderRadius: '50%',
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 'bold',
            }}
          >
            販
          </Box>
          <Typography variant="body1">
            {detailData.specific_sell_price !== undefined &&
            detailData.specific_sell_price !== null
              ? detailData.specific_sell_price?.toLocaleString()
              : (detailData.sell_price ?? 0).toLocaleString()}
            円
          </Typography>
        </Box>
        {/* 仕入価格 */}
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              backgroundColor: '#2A69B8',
              color: 'white',
              borderRadius: '50%',
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 'bold',
            }}
          >
            買
          </Box>
          <Typography variant="body1">
            {detailData.specific_buy_price !== undefined &&
            detailData.specific_buy_price !== null
              ? detailData.specific_buy_price?.toLocaleString()
              : (detailData.buy_price ?? 0).toLocaleString()}
            円
          </Typography>
        </Box>
      </Box>

      {/* 在庫情報 */}
      <Typography variant="body1" sx={{ mt: 1 }}>
        総在庫数：
        {detailData.item_infinite_stock
          ? '∞'
          : detailData.stock_number
          ? detailData.stock_number.toLocaleString()
          : 0}
      </Typography>
    </Box>
  );
};

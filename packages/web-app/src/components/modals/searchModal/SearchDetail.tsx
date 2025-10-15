import React from 'react';
import { Box, Typography, Divider, CardMedia } from '@mui/material';
import NoImg from '@/components/common/NoImg';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import NumericTextField from '@/components/inputFields/NumericTextField';

export interface SearchItemDetail {
  id: number;
  image_url?: string | null;
  display_name: string | null;
  display_name_with_meta: string | null;
  stock_number?: number | null;
  description?: string | null;
  expansion?: string | null;
  cardnumber?: string | null;
  pack_name?: string | null;
  rarity?: string | null;
  isBuyOnly?: boolean | null;
  products: {
    id: number;
    sell_price?: number | null;
    specific_sell_price?: number | null;
    purchase_price?: number | null;
    specific_purchase_price?: number | null;
    stock_number?: number | null;
    condition_option_display_name?: string | null;
    conditionDisplayName?: string | null;
    specialty__display_name?: string | null;
    item_infinite_stock?: boolean;
    is_special_price_product?: boolean;
    management_number?: string | null;
    consignment_client_id?: number | null;
    consignment_client__full_name?: string | null;
    consignment_client__display_name?: string | null;
  }[];
  infinite_stock?: boolean;
}

export interface Props {
  item: SearchItemDetail;
  selectedProduct: SearchItemDetail['products'][0] | null;
  onSelectProduct: (product: SearchItemDetail['products'][0]) => void;
  unitPriceLabel: string;
  unitPrice: number | null;
  onUnitPriceChange: (price: number | null) => void;
  itemCount: number;
  onItemCountChange: (count: number) => void;
  error: string;
  remainingStock?: number; // 買取の時はundefined
  totalStockNumber: number;
  canSetProductPrice: boolean;
  isPurchase: boolean;
}

// このコンポーネントは販売、買取のどちらの画面でも利用されている。
// 商品検索の時に表示される右側の追加する商品の詳細を表示するコンポーネント
export const SearchDetail: React.FC<Props> = ({
  item,
  selectedProduct,
  onSelectProduct,
  unitPriceLabel,
  unitPrice,
  onUnitPriceChange,
  itemCount,
  onItemCountChange,
  error,
  remainingStock,
  totalStockNumber,
  canSetProductPrice,
  isPurchase,
}) => {
  return (
    <Box
      sx={{
        padding: '20px',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        backgroundColor: 'grey.100',
      }}
    >
      {/* 上部: 画像 & 基本情報 */}
      <Box sx={{ display: 'flex', paddingBottom: '10px', gap: '20px' }}>
        {item.image_url ? (
          <CardMedia
            component="img"
            sx={{ width: '60px', height: '84px' }}
            image={item.image_url}
            alt={`${item.display_name} image`}
          />
        ) : (
          <Box sx={{ width: '60px', height: '84px' }}>
            <NoImg />
          </Box>
        )}
        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '16px' }}>
            {selectedProduct
              ? item.display_name_with_meta
              : '商品が選択されていません'}
          </Typography>
          {/* 封入パック */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingY: '5px',
            }}
          >
            <Typography sx={{ fontSize: '14px' }}>封入パック</Typography>
            <Typography sx={{ fontSize: '14px', textAlign: 'right' }}>
              {item.pack_name}
            </Typography>
          </Box>
          <Divider />
          {/* 在庫数 */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingY: '5px',
            }}
          >
            <Typography sx={{ fontSize: '14px' }}>総在庫数</Typography>
            <Typography sx={{ fontSize: '14px', textAlign: 'right' }}>
              {item.infinite_stock ? '∞' : `${totalStockNumber}`}
            </Typography>
          </Box>
          <Divider />
          {/* 管理番号 */}
          {selectedProduct?.management_number && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingY: '5px',
              }}
            >
              <Typography sx={{ fontSize: '14px' }}>管理番号</Typography>
              <Typography sx={{ fontSize: '14px', textAlign: 'right' }}>
                {selectedProduct.management_number}
              </Typography>
            </Box>
          )}
          <Divider />
          {/* 委託者（空でなければ表示） */}
          {selectedProduct?.consignment_client_id &&
            (selectedProduct.consignment_client__display_name ||
              selectedProduct.consignment_client__full_name) && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingY: '5px',
                }}
              >
                <Typography sx={{ fontSize: '14px' }}>委託者</Typography>
                <Typography sx={{ fontSize: '14px', textAlign: 'right' }}>
                  {selectedProduct.consignment_client__display_name
                    ? selectedProduct.consignment_client__display_name
                    : selectedProduct.consignment_client__full_name}
                </Typography>
              </Box>
            )}
          <Divider />
        </Box>
      </Box>
      <Typography variant="body1">状態</Typography>
      <Box sx={{ height: '30px', width: '100%', marginBottom: '10px' }}>
        <Box
          sx={{
            display: 'flex',
            gap: '10px', // 子要素間のスペース
            overflowX: 'auto', // 横スクロールを有効にする
            whiteSpace: 'nowrap', // 子要素を一行に保持
            maxWidth: '100%', // 親要素の最大幅を指定
            boxSizing: 'border-box', // padding を含めた計算にする
          }}
          data-testid="condition-options-container"
        >
          {item.products &&
            item.products.map((product) => {
              const conditionName =
                product.conditionDisplayName ||
                product.condition_option_display_name;
              const managementNumber = product.management_number;
              const consignmentName =
                product.consignment_client__display_name ||
                product.consignment_client__full_name;
              // 販売の時は在庫0の商品は表示しない
              if (product.stock_number === 0 && !isPurchase) {
                return null;
              }
              return (
                <SecondaryButton
                  key={product.id}
                  sx={{
                    flex: '0 0 auto', // 横スクロールを確実に有効にする
                    width: 'auto',
                    minWidth: 'auto',
                    backgroundColor:
                      selectedProduct?.id === product.id
                        ? 'grey.700'
                        : 'grey.300',
                    borderRadius: '0px',
                    height: '30px',
                    padding: '8px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color:
                      selectedProduct?.id === product.id
                        ? 'text.secondary'
                        : 'grey.700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap', // テキストを改行させない
                  }}
                  onClick={() => onSelectProduct(product)}
                  disabled={product?.stock_number === 0 && !isPurchase} // 販売なら在庫数が0の時に選択できない。買取ならOK
                >
                  {conditionName}
                  {managementNumber === '' && ' / 管理番号未入力'}
                  {managementNumber && ` / ${managementNumber}`}
                  {consignmentName && ` / ${consignmentName}`}(
                  {item.infinite_stock ? '∞' : product?.stock_number})
                </SecondaryButton>
              );
            })}
        </Box>
      </Box>

      <Box sx={{ marginBottom: '10px' }} data-testid="price-input-container">
        <Typography variant="body1">{unitPriceLabel}</Typography>
        <NumericTextField
          value={unitPrice ?? undefined}
          dataTestId="price-input"
          aria-label={unitPriceLabel}
          onChange={(value) => {
            onUnitPriceChange(Number.isNaN(value) ? null : value);
          }}
          sx={{
            width: '100%',
            backgroundColor: 'common.white',
            border: 'solid 1px',
            borderRadius: '4px',
            borderColor: 'grey.400',
            fontSize: '16px',
            boxSizing: 'border-box',
          }}
          InputProps={{
            endAdornment: <Typography>円</Typography>,
          }}
          disabled={!canSetProductPrice}
        />
      </Box>

      {/* 数量 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
        data-testid="quantity-input-container"
      >
        <Typography variant="body1">数量</Typography>
        <NumericTextField
          dataTestId="quantity-input"
          min={0}
          max={item.infinite_stock ? undefined : remainingStock}
          value={itemCount}
          aria-label="数量"
          aria-describedby={error ? 'quantity-error' : undefined}
          onChange={(value) => {
            onItemCountChange(Number.isNaN(value) ? 0 : value);
          }}
          sx={{
            width: '100%',
            maxWidth: '150px',
            marginLeft: 'auto',
            backgroundColor: 'common.white',
            border: 'solid 1px',
            borderRadius: '4px',
            borderColor: 'grey.400',
            fontSize: '16px',
          }}
        />
        {error && (
          <Typography
            id="quantity-error"
            color="error"
            variant="caption"
            role="alert"
          >
            {error}
          </Typography>
        )}
      </Box>

      {/* 備考 */}
      <Box>
        <Typography variant="body1">備考</Typography>
        <Box
          sx={{
            height: '80px',
            width: '100%',
            backgroundColor: 'common.white',
            border: 'solid 1px',
            borderRadius: '4px',
            borderColor: 'grey.400',
            fontSize: '14px',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: '10px',
          }}
        >
          {item.description ? item.description : '---'}
        </Box>
      </Box>
    </Box>
  );
};

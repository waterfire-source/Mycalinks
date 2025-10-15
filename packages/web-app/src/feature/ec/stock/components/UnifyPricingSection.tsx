import React from 'react';
import { Stack, FormControlLabel, Checkbox, Alert } from '@mui/material';
import NumericTextField from '@/components/inputFields/NumericTextField';
import {
  getUniqueCardNames,
  type ProductSearchResult,
} from '@/feature/ec/stock/utils/unifyPricingUtils';

interface Props {
  enableUnifyPricing: boolean;
  setEnableUnifyPricing: (enabled: boolean) => void;
  unifyPrice: number | undefined;
  setUnifyPrice: (price: number | undefined) => void;
  unifyTargetCount: number;
  loading: boolean;
  baseProducts: ProductSearchResult[];
  disabled?: boolean;
}

export const UnifyPricingSection: React.FC<Props> = ({
  enableUnifyPricing,
  setEnableUnifyPricing,
  unifyPrice,
  setUnifyPrice,
  unifyTargetCount,
  loading,
  baseProducts,
  disabled = false,
}) => {
  const displayText = '同じカードの他の商品の価格も統一する';

  const cardNames = getUniqueCardNames(baseProducts);
  const isDisabled = disabled || loading;

  return (
    <Stack spacing={2}>
      <FormControlLabel
        control={
          <Checkbox
            checked={enableUnifyPricing}
            onChange={(e) => setEnableUnifyPricing(e.target.checked)}
            disabled={isDisabled}
          />
        }
        label={displayText}
      />

      {enableUnifyPricing && (
        <Stack spacing={2}>
          <NumericTextField
            label="統一価格"
            value={unifyPrice}
            onChange={(value) => setUnifyPrice(value)}
            helperText={
              loading
                ? '対象商品を検索中...'
                : `対象商品: ${unifyTargetCount}個`
            }
            disabled={isDisabled}
            required
            inputProps={{
              min: 1,
              max: 999999,
            }}
          />

          {!loading && unifyTargetCount > 0 && unifyPrice && (
            <Alert severity="info">
              同じカード（{cardNames}）で、メモ・画像が設定されていない 商品
              {unifyTargetCount}個の価格が{unifyPrice.toLocaleString()}
              円に統一されます。
            </Alert>
          )}

          {!loading && unifyTargetCount === 0 && enableUnifyPricing && (
            <Alert severity="warning">
              統一対象の商品が見つかりません。
              メモや画像が設定されていない同じカードの商品がない可能性があります。
            </Alert>
          )}

          {unifyTargetCount > 50 && (
            <Alert severity="warning">
              対象商品数が多数（{unifyTargetCount}個）です。
              本当に全ての商品の価格を統一しますか？
            </Alert>
          )}
        </Stack>
      )}
    </Stack>
  );
};

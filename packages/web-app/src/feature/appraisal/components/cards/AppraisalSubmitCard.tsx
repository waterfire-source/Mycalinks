'use client';

import { useState } from 'react';
import {
  Card,
  Box,
  Typography,
  Divider,
  CardContent,
  Stack,
  IconButton,
  TextField,
} from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ProductDetail } from '@/feature/products/components/ProductDetail';
import theme from '@/theme';
import { CartProduct } from '@/app/auth/(dashboard)/appraisal/register/page';
import { useStore } from '@/contexts/StoreContext';
import { styled } from '@mui/system';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { useAlert } from '@/contexts/AlertContext';
import { MycaPosApiClient } from 'api-generator/client';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import NumericTextField from '@/components/inputFields/NumericTextField';

interface Props {
  products: CartProduct[];
  onRemoveFromCart: (id: number) => void;
  onChangeQuantity: (id: number, quantity: number) => void;
}

const StyledSelectBox = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '24px',
}));

export const AppraisalSubmitCard: React.FC<Props> = ({
  products,
  onRemoveFromCart,
  onChangeQuantity,
}) => {
  const { store } = useStore();
  const router = useRouter();
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();
  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });

  const [totalAppraisalFee, setTotalAppraisalFee] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [insuranceFee, setInsuranceFee] = useState<number>(0);
  const [handlingFee, setHandlingFee] = useState<number>(0);
  const [otherFee, setOtherFee] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // 合計商品点数（カート内の数量合計）
  const totalCount = products.reduce(
    (sum, product) => sum + product.item_count,
    0,
  );

  // 合計仕入金額（各商品ごとの仕入れ値 × 数量 の合計）
  const totalPrice = products.reduce(
    (sum, product) =>
      sum + (product.average_wholesale_price || 0) * product.item_count,
    0,
  );

  // 鑑定料変更ハンドラ
  const handleAppraisalFeeChange = (amount: number) => {
    const value = amount;
    setTotalAppraisalFee(value > 0 ? value : 0);
  };

  // 送料変更ハンドラ
  const handleShippingFeeChange = (amount: number) => {
    const value = amount;
    setShippingFee(value > 0 ? value : 0);
  };

  // 保険料変更ハンドラ
  const handleInsuranceFeeChange = (amount: number) => {
    const value = amount;
    setInsuranceFee(value > 0 ? value : 0);
  };

  // 事務手数料変更ハンドラ
  const handleHandlingFeeChange = (amount: number) => {
    const value = amount;
    setHandlingFee(value > 0 ? value : 0);
  };

  // その他手数料変更ハンドラ
  const handleOtherFeeChange = (amount: number) => {
    const value = amount;
    setOtherFee(value > 0 ? value : 0);
  };

  // 備考変更ハンドラ
  const handleDescriptionChange = (value: string) => {
    setDescription(value);
  };

  // 鑑定提出ハンドラ
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await apiClient.appraisal.createAppraisal({
        storeId: Number(store.id),
        requestBody: {
          appraisal_fee: totalAppraisalFee,
          shipping_fee: shippingFee,
          insurance_fee: insuranceFee,
          handling_fee: handlingFee,
          other_fee: otherFee,
          description: description,
          products: products.map((product) => ({
            product_id: product.id,
            item_count: product.item_count,
          })),
        },
      });

      setAlertState({
        message: '鑑定提出を行いました。',
        severity: 'success',
      });
      router.push(PATH.APPRAISAL.root);
    } catch (e) {
      handleError(e);
      console.error('鑑定提出に失敗しました。', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      sx={{
        display: 'flex',
        height: '100%',
        overflowY: 'auto',
        width: '100%',
        boxShadow: 3,
        flexDirection: 'column',
      }}
    >
      <Typography
        align="center"
        sx={{
          color: 'text.secondary',
          backgroundColor: 'primary.main',
          height: '60px',
          borderRadius: '4px 4px 0 0 ',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        査定提出リスト
      </Typography>

      <Stack direction={'column'} sx={{ overflowY: 'auto', height: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '60%',
            padding: 2,
            overflowY: 'auto',
          }}
        >
          <Card
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: '400px',
            }}
          >
            <CardContent
              sx={{ backgroundColor: 'common.white', height: '100%' }}
            >
              {/* 合計情報 */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingX: '8px',
                  height: '40px',
                  alignItems: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontSize: theme.typography.body2.fontSize,
                  }}
                >
                  合計 {totalCount}点
                </Typography>
                <Typography
                  sx={{
                    fontSize: theme.typography.body2.fontSize,
                  }}
                >
                  合計仕入値金額 ¥{totalPrice.toLocaleString()}
                </Typography>
              </Box>
              <Divider />
              <Box
                sx={{
                  overflowY: 'auto',
                  height: 'calc(100% - 40px)',
                }}
              >
                {products.map((product) => {
                  return (
                    <Box key={product.id}>
                      <Stack
                        sx={{
                          padding: 1,
                          boxSizing: 'border-box',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                        }}
                      >
                        <ProductDetail
                          imageUrl={product.image_url || ''}
                          title={product.displayNameWithMeta}
                          condition={
                            product.condition_option_display_name ?? ''
                          }
                          price={product.average_wholesale_price ?? 0}
                        >
                          <Stack
                            flexDirection={'column'}
                            justifyContent={'space-between'}
                            alignItems={'flex-end'}
                          >
                            <IconButton
                              onClick={() => onRemoveFromCart(product.id)}
                              sx={{ height: '30px', width: '30px' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                            <Stack
                              gap={'2px'}
                              alignItems={'flex-end'}
                              flexDirection={'row'}
                            >
                              <NumericTextField
                                min={1}
                                value={product.item_count}
                                onChange={(e) =>
                                  onChangeQuantity(product.id, e)
                                }
                                suffix="枚"
                              />
                            </Stack>
                          </Stack>
                        </ProductDetail>
                      </Stack>
                      <Divider />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* 鑑定先選択、鑑定費用入力、提出ボタン */}
        <Stack gap={3} sx={{ padding: 2, height: '40%', overflowY: 'auto' }}>
          {/* 費用入力セクション */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {/* 鑑定費用入力 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                鑑定料
              </Typography>
              <NumericTextField
                fullWidth
                value={totalAppraisalFee}
                onChange={handleAppraisalFeeChange}
                endSuffix="円"
                size="small"
              />
            </Box>

            {/* 送料入力 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                送料
              </Typography>
              <NumericTextField
                fullWidth
                value={shippingFee}
                onChange={handleShippingFeeChange}
                endSuffix="円"
                size="small"
              />
            </Box>

            {/* 保険料入力 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                保険料
              </Typography>
              <NumericTextField
                fullWidth
                value={insuranceFee}
                onChange={handleInsuranceFeeChange}
                endSuffix="円"
                size="small"
              />
            </Box>

            {/* 事務手数料入力 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                事務手数料
              </Typography>
              <NumericTextField
                fullWidth
                value={handlingFee}
                onChange={handleHandlingFeeChange}
                endSuffix="円"
                size="small"
              />
            </Box>

            {/* その他手数料入力 */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                その他手数料
              </Typography>
              <NumericTextField
                fullWidth
                value={otherFee}
                onChange={handleOtherFeeChange}
                endSuffix="円"
                size="small"
              />
            </Box>
          </Box>

          {/* 備考入力 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              備考
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="備考を入力してください"
              size="small"
            />
          </Box>

          {/* 一枚あたりの鑑定費用表示 */}
          <StyledSelectBox>
            <Typography>一枚あたりの鑑定費用</Typography>
            <Typography>
              ¥
              {Math.round(totalAppraisalFee / totalCount || 0).toLocaleString()}
            </Typography>
          </StyledSelectBox>

          {/* 鑑定提出ボタン */}
          <Box>
            <PrimaryButton
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              loading={isLoading}
              disabled={totalCount === 0} // 鑑定先が選択されており、かつ商品が1点以上ある場合のみ有効
              fullWidth
            >
              鑑定提出
            </PrimaryButton>
          </Box>
        </Stack>
      </Stack>
    </Card>
  );
};

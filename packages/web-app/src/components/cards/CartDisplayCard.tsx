import React from 'react';
import {
  Card,
  Box,
  Typography,
  Divider,
  CircularProgress,
  TextField,
  useMediaQuery,
  Stack,
} from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import theme from '@/theme';
import { ProductDetail } from '@/feature/products/components/ProductDetail';
import { BackendCustomerAPI } from '@/app/api/store/[store_id]/customer/api';

export interface MobileCartResultItem {
  id: string; // 同じproductIdを持つ商品を別の行として表示させることがあるため、行を特定するための識別子。
  productId: number;
  imageUrl?: string;
  displayName: string;
  conditionName: string;
  unitPrice: number;
  discountPrice?: number;
  itemCount: number;
  hasManagementNumber?: boolean;
  managementNumber?: string;
  specialId?: number;
}

interface PurchaseCartCardProps {
  title: string;
  buttonText: string;
  totalItems: number;
  totalAmount: number;
  items: MobileCartResultItem[] | null;
  onConfirmAppraisal: () => void;
  onQuantityChange: (id: string, newQuantity: number) => void;
  isLoading: boolean;
  customer:
    | BackendCustomerAPI[0]['response']['200'] // getCustomerのレスポンス
    | BackendCustomerAPI[1]['response']['200'][0] // getCustomerByCustomerIDのレスポンス
    | undefined;
}

export const CartDisplayCard: React.FC<PurchaseCartCardProps> = ({
  title,
  buttonText,
  totalItems,
  totalAmount,
  items,
  onConfirmAppraisal,
  onQuantityChange,
  isLoading,
  customer,
}) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      sx={{
        display: 'flex',
        flex: 1,
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
          height: isMobile ? '30px' : '60px',
          borderRadius: '4px 4px 0 0 ',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          height: '100%',
          overflowY: 'auto',
          padding: isMobile ? 1 : 2,
        }}
      >
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            height: '100%',
            width: '100%',
          }}
        >
          <Box
            sx={{ backgroundColor: 'common.white', height: '100%', padding: 0 }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingX: '8px',
                height: isMobile ? '30px' : '40px',
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: isMobile ? '12px' : theme.typography.body2.fontSize,
                }}
              >
                合計 {totalItems}点
              </Typography>
              <Typography
                sx={{
                  fontSize: isMobile ? '12px' : theme.typography.body2.fontSize,
                }}
              >
                合計金額 ¥{totalAmount.toLocaleString()}
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ overflowY: 'auto', height: 'calc(100% - 40px)' }}>
              {isLoading ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : items && items.length > 0 ? (
                items.map((item, index) => {
                  return (
                    <Box key={`cart-item-${item.id}`}>
                      <Stack
                        key={index}
                        sx={{
                          padding: isMobile ? 0.5 : 1,
                          boxSizing: 'border-box',
                        }}
                      >
                        <ProductDetail
                          imageUrl={item.imageUrl ?? ''}
                          title={item.displayName}
                          condition={item.conditionName}
                          price={item.unitPrice}
                          discountPrice={item.discountPrice}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-end',
                              gap: '2px',
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: isMobile
                                  ? '12px'
                                  : theme.typography.body2.fontSize,
                                textWrap: 'nowrap',
                              }}
                            >
                              数量
                            </Typography>
                            <TextField
                              type="number"
                              value={item.itemCount}
                              onChange={(e) =>
                                onQuantityChange(
                                  item.id,
                                  parseInt(e.target.value),
                                )
                              }
                              sx={{ width: '60px' }}
                              InputProps={{
                                inputProps: {
                                  min: 0,
                                  sx: {
                                    paddingX: '0.275rem',
                                    paddingY: '0.7rem',
                                    fontSize: '12px',
                                  },
                                },
                              }}
                            ></TextField>
                          </Box>
                        </ProductDetail>
                      </Stack>
                      <Divider />
                    </Box>
                  );
                })
              ) : (
                <Typography align="center" sx={{ marginTop: 2 }}>
                  査定対象の商品はありません。
                </Typography>
              )}
            </Box>
          </Box>
        </Card>

        {/* 会員情報 */}
        {customer && !isMobile && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              width: '100%',
            }}
          >
            <Box sx={{ textAlign: 'left', width: '60%', marginTop: '16px' }}>
              <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>
                名前：{customer.full_name}（{customer.full_name_ruby}）
              </Typography>
              <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>
                郵便番号：{customer.zip_code}
              </Typography>
              <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>
                住所：
                {(customer.prefecture || '') +
                  (customer.city || '') +
                  (customer.address2 || '') +
                  (customer.building || '')}
              </Typography>
              <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>
                電話番号：{customer.phone_number}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
      <Box sx={{ padding: isMobile ? 1 : 2 }}>
        <PrimaryButton
          variant="contained"
          color="primary"
          fullWidth
          onClick={onConfirmAppraisal}
          disabled={isLoading || !items || items.length === 0}
        >
          {buttonText}
        </PrimaryButton>
      </Box>
    </Card>
  );
};

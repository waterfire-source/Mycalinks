'use client';

import React from 'react';
import { DetailCard } from '@/components/cards/DetailCard';
import {
  Stack,
  Divider,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { BackendCustomerAPI } from '@/app/api/store/[store_id]/customer/api';
import theme from '@/theme';
import { useMediaQuery } from '@mui/material';
import { PurchaseCartItemDetail } from '@/feature/purchaseReception/components/cards/PurchaseCartItemDetail';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { Specialties } from '@/feature/specialty/hooks/useGetSpecialty';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend } from 'dnd-multi-backend';
import { TouchTransition, MouseTransition } from 'dnd-multi-backend';

export interface MobileCartResultItem {
  id: string;
  productId: number;
  imageUrl?: string;
  displayName: string;
  conditionName: string;
  unitPrice: number;
  discountPrice?: number;
  itemCount: number;
}

const DnDBackends = {
  backends: [
    {
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      transition: TouchTransition,
    },
  ],
};

interface PurchaseReceptionCartDetailProps {
  totalProductCount: number;
  totalItemCount: number;
  totalAmount: number;
  items: MobileCartResultItem[] | null;
  onConfirmAppraisal: () => void;
  onCreateDraft: () => Promise<void>;
  onQuantityChange: (id: string, newQuantity: number) => void;
  onPriceChange: (id: string, newPrice: number) => void;
  onRemoveItem: (id: string) => void;
  isLoading: boolean;
  customer?:
    | BackendCustomerAPI[0]['response']['200']
    | BackendCustomerAPI[1]['response']['200'][0];
  specialties: Specialties;
  onSpecialtyChange: (id: string, newSpecialtyId: number) => void;
  onManagementNumberChange: (id: string, newManagementNumber: string) => void;
  onItemsReorder: (reorderedItems: MobileCartResultItem[]) => void;
}

export const PurchaseReceptionCartDetail: React.FC<
  PurchaseReceptionCartDetailProps
> = ({
  totalProductCount,
  totalItemCount,
  totalAmount,
  items,
  onConfirmAppraisal,
  onCreateDraft,
  onQuantityChange,
  onPriceChange,
  onRemoveItem,
  isLoading,
  customer,
  specialties,
  onSpecialtyChange,
  onManagementNumberChange,
  onItemsReorder,
}) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMoveItem = (dragIndex: number, hoverIndex: number) => {
    if (!items) return;

    const updatedItems = [...items];
    const [removed] = updatedItems.splice(dragIndex, 1);
    updatedItems.splice(hoverIndex, 0, removed);

    onItemsReorder(updatedItems);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (!items || items.length === 0) {
      return (
        <Stack gap={3} height="100%" justifyContent="center">
          <Stack width="100%" justifyContent="center" alignItems="center">
            <Typography variant="body1">
              査定対象の商品はありません。
            </Typography>
            {/* 会員情報を表示 */}
          </Stack>
          {customer && !isMobile && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                mt: 2,
                mb: 2,
              }}
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography sx={{ fontSize: '14px', mb: 1 }}>
                  名前：{customer.full_name}（{customer.full_name_ruby}）
                </Typography>
                <Typography sx={{ fontSize: '14px', mb: 1 }}>
                  郵便番号：{customer.zip_code}
                </Typography>
                <Typography sx={{ fontSize: '14px', mb: 1 }}>
                  住所：
                  {(customer.prefecture || '') +
                    (customer.city || '') +
                    (customer.address2 || '') +
                    (customer.building || '')}
                </Typography>
                <Typography sx={{ fontSize: '14px', mb: 1 }}>
                  電話番号：{customer.phone_number}
                </Typography>
              </Box>
            </Box>
          )}
        </Stack>
      );
    }

    return (
      <DndProvider backend={MultiBackend} options={DnDBackends}>
        <Stack
          gap={0}
          sx={{
            overflowY: 'auto',
            width: '100%',
            height: '100%',
          }}
        >
          {items.map((item, index) => (
            <div key={`cart-item-${item.id}`}>
              <PurchaseCartItemDetail
                item={item}
                index={index}
                onQuantityChange={onQuantityChange}
                onPriceChange={onPriceChange}
                onRemoveItem={onRemoveItem}
                specialties={specialties}
                onSpecialtyChange={onSpecialtyChange}
                onManagementNumberChange={onManagementNumberChange}
                onMoveItem={handleMoveItem}
              />
              {index < items.length - 1 && <Divider />}
            </div>
          ))}

          {/* 会員情報を表示 */}
          {customer && !isMobile && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                width: '100%',
                mt: 2,
                mb: 2,
              }}
            >
              <Box sx={{ textAlign: 'left', width: '100%' }}>
                <Typography sx={{ fontSize: '14px', mb: 1 }}>
                  名前：{customer.full_name}（{customer.full_name_ruby}）
                </Typography>
                <Typography sx={{ fontSize: '14px', mb: 1 }}>
                  郵便番号：{customer.zip_code}
                </Typography>
                <Typography sx={{ fontSize: '14px', mb: 1 }}>
                  住所：
                  {(customer.prefecture || '') +
                    (customer.city || '') +
                    (customer.address2 || '') +
                    (customer.building || '')}
                </Typography>
                <Typography sx={{ fontSize: '14px', mb: 1 }}>
                  電話番号：{customer.phone_number}
                </Typography>
              </Box>
            </Box>
          )}
        </Stack>
      </DndProvider>
    );
  };

  return (
    <DetailCard
      title={`${totalItemCount}商品${totalProductCount}点`}
      titleDetail={`合計金額 ${totalAmount.toLocaleString()}円`}
      content={renderContent()}
      bottomContent={
        <Stack
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          <SecondaryButtonWithIcon
            variant="contained"
            color="primary"
            fullWidth
            onClick={onCreateDraft}
            disabled={isLoading || !items || items.length === 0}
            sx={{
              minWidth: 0,
              width: 'fit-content',
            }}
          >
            一時保留
          </SecondaryButtonWithIcon>
          <PrimaryButtonWithIcon
            variant="contained"
            color="primary"
            fullWidth
            onClick={onConfirmAppraisal}
            disabled={isLoading || !items || items.length === 0}
            sx={{
              minWidth: 0,
              width: 'fit-content',
            }}
          >
            査定確定
          </PrimaryButtonWithIcon>
        </Stack>
      }
    />
  );
};

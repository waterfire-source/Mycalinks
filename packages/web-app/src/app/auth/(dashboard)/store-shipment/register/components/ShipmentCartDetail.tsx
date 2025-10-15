import { ShipmentCartDetailRow } from '@/app/auth/(dashboard)/store-shipment/register/components/ShipmentCartDetailRow';
import { ShipmentProduct } from '@/app/auth/(dashboard)/store-shipment/register/page';
import { CancelButton } from '@/components/buttons/CancelButton';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { DetailCard } from '@/components/cards/DetailCard';
import { Stack } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';

type Props = {
  shipmentCart: ShipmentProduct[];
  setShipmentCart: Dispatch<SetStateAction<ShipmentProduct[]>>;
  cartToShipmentProduct: () => void;
  quantityChange: (id: number, newValue: number) => void;
  deleteFromCart: (id: number) => void;
  onClose: () => void;
};

export const ShipmentCartDetail = ({
  shipmentCart,
  setShipmentCart,
  cartToShipmentProduct,
  quantityChange,
  deleteFromCart,
  onClose,
}: Props) => {
  const productTotalCount = shipmentCart.reduce(
    (sum, p) => sum + p.itemCount,
    0,
  );
  return (
    <DetailCard
      title="出荷商品"
      titleDetail={`${
        shipmentCart.length
      }点${productTotalCount.toLocaleString()}商品`}
      content={
        <Stack gap="12px">
          {shipmentCart.map((product) => (
            <ShipmentCartDetailRow
              key={product.id}
              product={product}
              quantityChange={quantityChange}
              deleteFromCart={deleteFromCart}
            />
          ))}
        </Stack>
      }
      bottomContent={
        <Stack
          direction="row"
          justifyContent="flex-end"
          width="100%"
          gap="12px"
        >
          <CancelButton onClick={onClose}>登録内容を破棄</CancelButton>
          <PrimaryButton onClick={cartToShipmentProduct}>
            上記商品を出荷
          </PrimaryButton>
        </Stack>
      }
    />
  );
};

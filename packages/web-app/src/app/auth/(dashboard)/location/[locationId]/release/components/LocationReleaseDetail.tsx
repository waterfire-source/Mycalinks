import { LocationReleaseDetailContent } from '@/app/auth/(dashboard)/location/[locationId]/release/components/LocationReleaseDetailContent';
import { LocationProduct } from '@/app/auth/(dashboard)/location/register/page';
import { PATH } from '@/constants/paths';
import { useAlert } from '@/contexts/AlertContext';
import { useLocation } from '@/feature/location/hooks/useLocation';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type Props = {
  locationId: number;
  releaseProducts: LocationProduct[];
  locationProducts: LocationProduct[];
  mode?: 'out' | 'remain';
};

export const LocationReleaseDetail = ({
  locationId,
  releaseProducts,
  locationProducts,
  mode,
}: Props) => {
  const { releaseLocation, loading } = useLocation();
  const { setAlertState } = useAlert();
  const { push } = useRouter();

  const [totalSalePrice, setTotalSalePrice] = useState(0);

  // 合計仕入れ値の計算
  const totalWholesalePrice = useMemo(() => {
    if (mode === 'out') {
      // 出ていったものを登録: releaseProducts（出ていった商品）の仕入れ値の合計
      return releaseProducts.reduce(
        (sum, product) =>
          sum + (product.average_wholesale_price || 0) * product.itemCount,
        0,
      );
    } else if (mode === 'remain') {
      // 残ったものを登録: locationProducts全体の仕入れ値 - releaseProducts（残った商品）の仕入れ値
      const locationTotal = locationProducts.reduce(
        (sum, product) =>
          sum + (product.average_wholesale_price || 0) * product.itemCount,
        0,
      );
      const remainTotal = releaseProducts.reduce(
        (sum, product) =>
          sum + (product.average_wholesale_price || 0) * product.itemCount,
        0,
      );
      return locationTotal - remainTotal;
    }
    return 0;
  }, [releaseProducts, locationProducts, mode]);

  // 粗利益の計算
  const grossProfit = useMemo(() => {
    return totalSalePrice - totalWholesalePrice;
  }, [totalSalePrice, totalWholesalePrice]);

  // 粗利率の計算（小数点1位まで四捨五入）
  const grossProfitRate = useMemo(() => {
    if (totalSalePrice === 0) return 0;
    return Math.round((grossProfit / totalSalePrice) * 100 * 10) / 10;
  }, [grossProfit, totalSalePrice]);

  const rejectRelease = () => {
    push(PATH.LOCATION.root);
  };

  const handleReleaseLocation = async () => {
    if (!mode) return;
    if (mode === 'out') {
      // locationProductsからreleaseProductsに登録されている在庫を差し引く
      const remainProducts = locationProducts
        .map((locationProduct) => {
          const releaseProduct = releaseProducts.find(
            (rp) => rp.id === locationProduct.id,
          );
          if (releaseProduct) {
            // releaseProductsに含まれている場合、数量を差し引く
            const remainingCount =
              locationProduct.itemCount - releaseProduct.itemCount;
            if (remainingCount > 0) {
              return { ...locationProduct, itemCount: remainingCount };
            }
            // 数量が0以下の場合は除外
            return null;
          }
          // releaseProductsに含まれていない場合はそのまま残す
          return locationProduct;
        })
        .filter((product): product is LocationProduct => product !== null);

      const ok = await releaseLocation(locationId, {
        products: remainProducts.map((p) => ({
          product_id: p.id,
          item_count: p.itemCount,
        })),
        actual_sales: totalSalePrice,
      });

      if (ok) {
        setAlertState({
          message: 'ロケーションの解体に成功しました',
          severity: 'success',
        });
        push(PATH.LOCATION.root);
      }
    } else {
      const ok = await releaseLocation(locationId, {
        products: releaseProducts.map((rp) => ({
          product_id: rp.id,
          item_count: rp.itemCount,
        })),
        actual_sales: totalSalePrice,
      });

      if (ok) {
        setAlertState({
          message: 'ロケーションの解体に成功しました',
          severity: 'success',
        });
        push(PATH.LOCATION.root);
      }
    }
  };

  return (
    <LocationReleaseDetailContent
      totalWholesalePrice={totalWholesalePrice}
      totalSalePrice={totalSalePrice}
      setTotalSalePrice={setTotalSalePrice}
      grossProfit={grossProfit}
      grossProfitRate={grossProfitRate}
      rejectRelease={rejectRelease}
      releaseLocation={handleReleaseLocation}
      releasing={loading}
    />
  );
};

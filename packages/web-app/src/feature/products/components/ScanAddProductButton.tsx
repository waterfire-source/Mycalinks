import { useCallback, useEffect, useRef, useState } from 'react';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { useScanner } from '@/hooks/useScanner';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { useStore } from '@/contexts/StoreContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';

interface Props {
  handleOpenMultipleProductModal: () => void;
  handleAddMultipleProducts: (
    multipleProduct: BackendProductAPI[0]['response']['200']['products'],
  ) => void;
  handleAddProductToResult: (
    product: BackendProductAPI[0]['response']['200']['products'][0],
  ) => Promise<void>;
}

export const ScanAddProductButton = ({
  handleOpenMultipleProductModal,
  handleAddMultipleProducts,
  handleAddProductToResult,
}: Props) => {
  const [isLoadingScan, setIsLoadingScan] = useState<boolean>(false);
  const [scannedCode, setScannedCode] = useState<string | undefined>(undefined);

  const { store } = useStore();
  const { setAlertState } = useAlert();
  const { isScanning, setIsScanning } = useScanner(async (code) => {
    if (!code) return;
    setScannedCode(code);
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // スキャン開始ボタン押下
  const handleButtonClick = () => {
    setIsScanning(true);
  };
  // スキャン終了ボタン押下
  const handleSecondaryButtonClick = () => {
    setScannedCode(undefined);
    setIsScanning(false);
  };

  const handleAddProductByScan = useCallback(
    async (code: string) => {
      setIsLoadingScan(true);
      const clientAPI = createClientAPI();
      const response = await clientAPI.product.listProducts({
        storeID: store.id,
        code: code,
      });

      if (response instanceof CustomError) {
        setAlertState({ message: response.message, severity: 'error' });
        setIsLoadingScan(false);
        return;
      }
      // 商品が見つからないときはアラートを表示する
      if (response.products.length === 0) {
        setAlertState({
          message: '商品が見つかりませんでした。',
          severity: 'error',
        });
        setIsLoadingScan(false);
        return;
      }
      // product_codeに紐づく商品が複数存在するかつ、在庫がある商品が複数存在する時は商品選択モーダルを表示する4289000525010
      if (
        response.products.length > 1 &&
        response.products.filter((p) => p.stock_number > 0).length > 1
      ) {
        // 在庫がある商品を表示する
        handleAddMultipleProducts(
          response.products.filter((p) => p.stock_number > 0),
        );
        handleOpenMultipleProductModal();
        setIsLoadingScan(false);
        return;
      }
      // 全て通過した際は商品を追加する
      const product = response.products[0];
      handleAddProductToResult(product);
      setIsLoadingScan(false);
    },
    [
      store.id,
      setAlertState,
      handleAddMultipleProducts,
      handleOpenMultipleProductModal,
      handleAddProductToResult,
    ],
  );

  // スキャンで商品追加（キャンセルボタ押下まで連続スキャン可能）
  useEffect(() => {
    if (scannedCode === undefined) return;
    handleAddProductByScan(scannedCode);
    setScannedCode(undefined);
  }, [scannedCode, handleAddProductByScan]);

  // コンポーネント外のクリック/タッチでスキャンモードを解除（ProductScanButton同様）
  useEffect(() => {
    const handleOutsideInteraction = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setScannedCode(undefined);
        setIsScanning(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideInteraction);
    document.addEventListener('touchstart', handleOutsideInteraction);

    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction);
      document.removeEventListener('touchstart', handleOutsideInteraction);
    };
  }, [setIsScanning]);

  return (
    <div ref={containerRef}>
      {isScanning ? (
        <SecondaryButtonWithIcon
          onClick={handleSecondaryButtonClick}
          size="small"
          sx={{
            ml: 'auto',
          }}
          loading={isLoadingScan}
        >
          キャンセル
        </SecondaryButtonWithIcon>
      ) : (
        <PrimaryButtonWithIcon
          size="small"
          sx={{
            color: 'text.secondary',
            ml: 'auto',
          }}
          onClick={handleButtonClick}
        >
          スキャンで追加
        </PrimaryButtonWithIcon>
      )}
    </div>
  );
};

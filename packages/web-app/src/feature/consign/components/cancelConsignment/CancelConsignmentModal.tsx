import { CustomError } from '@/api/implement';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { useAlert } from '@/contexts/AlertContext';

import { CancelConsignmentModalTable } from '@/feature/consign/components/cancelConsignment/CancelConsignmentTable';
import {
  ConsignmentProduct,
  useConsignment,
} from '@/feature/consign/hooks/useConsignment';
import { Breakpoint } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  selectedProducts?: ConsignmentProduct[];
  setSelectedProducts?: React.Dispatch<
    React.SetStateAction<ConsignmentProduct[]>
  >;
  detailData?: BackendProductAPI[0]['response']['200']['products'][0][];
  fetchProductsData: () => Promise<void> | void;
}

export const CancelConsignmentModal = ({
  open,
  onClose,
  selectedProducts,
  setSelectedProducts,
  detailData,
  fetchProductsData,
}: Props) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoadingCancel, setIsLoadingCancel] = useState(false);

  const defaultCancelCount = useMemo(() => {
    const source =
      selectedProducts ?? (detailData && detailData[0] ? [detailData[0]] : []);
    return source.map((p) => ({
      id: p.id,
      cancelCount: 0,
    }));
  }, [selectedProducts, detailData]);

  const [cancelCount, setCancelCount] =
    useState<{ id: number; cancelCount: number }[]>(defaultCancelCount);

  const allCancelCountFilled = useMemo(() => {
    return cancelCount.every((c) => c.cancelCount > 0);
  }, [cancelCount]);

  const handleChangeCancelCount = (id: number, value: number) => {
    setCancelCount((prev) => [
      ...prev.filter((c) => c.id !== id),
      { id, cancelCount: value },
    ]);
  };

  const { setAlertState } = useAlert();

  const { deleteProduct, cancelConsignmentProduct } = useConsignment();

  const handleCloseModal = () => {
    onClose();
    setCancelCount(defaultCancelCount);
    setStep(1);
  };

  useEffect(() => {
    setCancelCount(defaultCancelCount);
  }, [defaultCancelCount]);

  const handleCancel = useCallback(async () => {
    setIsLoadingCancel(true);
    try {
      // 受託商品管理
      if (selectedProducts?.length) {
        const promises = selectedProducts.map(async (product) => {
          const count =
            cancelCount?.find((c) => c.id === product.id)?.cancelCount ?? 0;

          // cancel 処理
          await cancelConsignmentProduct({
            productId: product.id,
            cancelCount: count,
          });

          // 全部の在庫を取り消す時は、委託在庫取り消しAPI(cancelConsignmentProduct)を叩いた後に在庫論理削除APIを叩く
          if (count === product.stock_number) {
            await deleteProduct({ productId: product.id });
          }
        });

        await Promise.all(promises);
      }

      // 在庫一覧
      if (detailData) {
        const product = detailData[0];
        const count =
          cancelCount?.find((c) => c.id === product?.id)?.cancelCount ?? 0;
        if (count > 0) {
          await cancelConsignmentProduct({
            productId: product?.id,
            cancelCount: count,
          });
          if (count === product.stock_number) {
            await deleteProduct({ productId: product.id });
          }
        }
      }

      setAlertState({
        message: `委託商品を取り消しました`,
        severity: 'success',
      });

      setCancelCount([]);
      setSelectedProducts?.([]);
      handleCloseModal();
      fetchProductsData();
    } catch (error) {
      if (error instanceof CustomError) {
        setAlertState({
          message: `${error.status}:${error.message}`,
          severity: 'error',
        });
      } else {
        setAlertState({
          message: `キャンセルに失敗しました。`,
          severity: 'error',
        });
      }
    } finally {
      setIsLoadingCancel(false);
    }
  }, [
    selectedProducts,
    detailData,
    setAlertState,
    setSelectedProducts,
    fetchProductsData,
    cancelCount,
    cancelConsignmentProduct,
    deleteProduct,
  ]);

  const modalConfigs = useMemo(() => {
    const baseConfig = {
      1: {
        modalMassage: `取り消す商品の数を入力してください。`,
        modalOnActionButtonClick: () => setStep(2),
        onCancel: undefined,
        maxWidth: 'md',
        content: (
          <CancelConsignmentModalTable
            selectedProducts={selectedProducts}
            detailData={detailData}
            cancelCount={cancelCount}
            handleChangeCancelCount={handleChangeCancelCount}
          />
        ),
      },
      2: {
        modalMassage: `取り消された委託は復元できません。\\n本当に取り消しますか？。`,
        modalOnActionButtonClick: () => handleCancel(),
        onCancel: () => setStep(1),
        content: undefined,
        maxWidth: 'sm',
      },
    };

    return (
      baseConfig[step] ?? {
        modalMassage: '',
        modalOnActionButtonClick: () => {},
        onCancel: () => {},
        content: undefined,
        maxWidth: 'md',
      }
    );
  }, [selectedProducts, detailData, cancelCount, step, handleCancel]);

  const {
    modalMassage,
    modalOnActionButtonClick,
    onCancel,
    content,
    maxWidth,
  } = modalConfigs;

  return (
    <ConfirmationDialog
      open={open}
      onClose={handleCloseModal}
      onConfirm={modalOnActionButtonClick}
      onCancel={onCancel}
      title="委託取り消し"
      message={modalMassage}
      confirmButtonText="取り消す"
      confirmButtonDisable={
        (!selectedProducts?.length && !detailData) || !allCancelCountFilled
      }
      cancelButtonText="キャンセル"
      isLoading={isLoadingCancel}
      content={content}
      maxWidth={maxWidth as Breakpoint}
      width="800px"
    />
  );
};

'use client';

import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { useState, useEffect } from 'react';
import { ConsignmentProductSearchType } from '@/feature/consign/components/register/searchModal/type';
import {
  ConsignmentClient,
  useConsignment,
} from '@/feature/consign/hooks/useConsignment';
import { useAlert } from '@/contexts/AlertContext';
import { PATH } from '@/constants/paths';
import { ConsignmentRegisterContent } from '@/app/auth/(dashboard)/stock/consign/register/components/ConsignmentRegisterContent';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { CustomError } from '@/api/implement';
import { useConfirmationModal } from '@/contexts/ConfirmationModalContext';

export default function ConsignmentRegisterPage() {
  const router = useRouter();
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();

  const {
    consignmentClients,
    fetchConsignmentClients,
    stockConsignmentClientProduct,
    createProduct,
    checkConsignmentProductExists,
  } = useConsignment();

  const [products, setProducts] = useState<ConsignmentProductSearchType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedConsignmentClient, setSelectedConsignmentClient] =
    useState<ConsignmentClient | null>(null);
  // 画面遷移確認モーダル表示の制御
  const { setModalVisible } = useConfirmationModal();

  useEffect(() => {
    setModalVisible(products.length > 0);
  }, [products, setModalVisible]);

  // 初期データの取得
  useEffect(() => {
    fetchConsignmentClients({});
  }, [fetchConsignmentClients]);

  const handleEdit = (
    id: string,
    key: 'consignmentPrice' | 'consignmentCount',
    value: number,
  ) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.customId === id ? { ...product, [key]: value } : product,
      ),
    );
  };

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.customId !== id));
  };

  // バリデーション関数
  const validateOrderData = (): boolean => {
    if (!selectedConsignmentClient) {
      setAlertState({
        message: '委託者を選択してください',
        severity: 'error',
      });
      return false;
    }

    if (products.length === 0) {
      setAlertState({
        message: '商品を追加してください',
        severity: 'error',
      });
      return false;
    }

    const invalidProducts = products.filter(
      (product) => !product.consignmentCount || !product.consignmentPrice,
    );

    if (invalidProducts.length > 0) {
      setAlertState({
        message: 'すべての商品の委託数と価格を入力してください',
        severity: 'error',
      });
      return false;
    }

    return true;
  };

  // 単一商品の処理
  const processProduct = async (product: ConsignmentProductSearchType) => {
    if (!product.item_id) {
      throw new Error(
        `商品マスタIDが取得できませんでした。商品ID: ${product.id}`,
      );
    }

    // 管理番号がある場合は新規在庫作成
    if (product.management_number) {
      const newProduct = await createProduct({
        itemId: product.item_id,
        condition_option_id: product.condition_option_id,
        consignmentPrice: product.consignmentPrice,
        consignmentClientId: selectedConsignmentClient!.id,
        specialty_id: product.specialty_id,
        management_number: product.management_number,
      });

      if (newProduct instanceof CustomError) throw newProduct;

      return {
        product_id: newProduct!.id,
        item_count: product.consignmentCount,
        sell_price: product.consignmentPrice,
      };
    }

    // 通常商品の場合：既存チェック
    const exists = await checkConsignmentProductExists({
      consignmentClientID: selectedConsignmentClient!.id,
      consignmentClientFullName: selectedConsignmentClient!.full_name,
      itemId: product.item_id,
      condition_option_id: product.condition_option_id,
      specialty_id: product.specialty_id,
      actual_sell_price: product.consignmentPrice,
    });

    if (!exists) {
      // 新規作成
      try {
        const newProduct = await createProduct({
          itemId: product.item_id,
          condition_option_id: product.condition_option_id,
          consignmentPrice: product.consignmentPrice,
          consignmentClientId: selectedConsignmentClient!.id,
          specialty_id: product.specialty_id,
        });

        if (newProduct instanceof CustomError) throw newProduct;

        return {
          product_id: newProduct!.id,
          item_count: product.consignmentCount,
          sell_price: product.consignmentPrice,
        };
      } catch (error) {
        handleError(error);
        return;
      }
    } else {
      // 既存商品として処理
      return {
        product_id: exists.id,
        item_count: product.consignmentCount,
        sell_price: product.consignmentPrice,
      };
    }
  };

  // 登録確定処理
  const handleConfirmOrder = async () => {
    // バリデーション
    if (!validateOrderData()) return;

    setIsSubmitting(true);

    try {
      const productsData = [];

      // 各商品を処理
      for (const product of products) {
        try {
          const productData = await processProduct(product);
          if (!productData)
            return setAlertState({
              message:
                '商品処理中にエラーが発生しました。もう一度試して下さい。',
              severity: 'error',
            });
          productsData.push(productData);
        } catch (err) {
          handleError(err);
          return;
        }
      }

      // 在庫登録実行
      const result = await stockConsignmentClientProduct({
        consignmentClientID: selectedConsignmentClient!.id,
        products: productsData,
      });

      if (result) {
        setAlertState({
          message: '委託商品の登録が完了しました',
          severity: 'success',
        });

        // フォームリセット
        setProducts([]);
        setSelectedConsignmentClient(null);

        // 委託商品管理に戻る
        router.push(PATH.STOCK.consign.root);
      }
    } catch (error) {
      setAlertState({
        message: '委託商品の登録に失敗しました',
        severity: 'error',
      });
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  // モーダルを開く
  const handleAddProduct = () => {
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const renderActions = () => {
    return (
      <Stack spacing={1} mt={2}>
        <PrimaryButtonWithIcon size="small" onClick={handleAddProduct}>
          商品追加
        </PrimaryButtonWithIcon>
        {/* <SecondaryButtonWithIcon size="small">
          CSVアップロード
        </SecondaryButtonWithIcon> */}
      </Stack>
    );
  };

  const handleConsignmentClientChange = (client: ConsignmentClient | null) => {
    setSelectedConsignmentClient(client);
  };

  return (
    <ContainerLayout
      title="受託商品登録"
      helpArchivesNumber={3023}
      actions={renderActions()}
    >
      <ConsignmentRegisterContent
        products={products}
        selectedConsignmentClient={selectedConsignmentClient}
        isSubmitting={isSubmitting}
        isModalOpen={isModalOpen}
        consignmentClients={consignmentClients}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddProduct={handleAddProduct}
        onCloseModal={handleCloseModal}
        onConfirmOrder={handleConfirmOrder}
        onConsignmentClientChange={handleConsignmentClientChange}
        setProducts={setProducts}
      />
    </ContainerLayout>
  );
}

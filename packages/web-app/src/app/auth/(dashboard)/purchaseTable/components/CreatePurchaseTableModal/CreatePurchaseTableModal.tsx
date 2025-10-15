import { createClientAPI, CustomError } from '@/api/implement';
import { CreatePurchaseTableModalContent } from '@/app/auth/(dashboard)/purchaseTable/components/CreatePurchaseTableModal/CreatePurchaseTableModalContent';
import { DisplayImageModal } from '@/app/auth/(dashboard)/purchaseTable/components/CreatePurchaseTableModal/DisplayImageModal/DisplayImageModal';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { useFetchCustomTemplates } from '@/app/auth/(dashboard)/purchaseTable/hooks/useFetchCustomTemplates';
import { ConfirmationModal } from '@/components/modals/ConfirmationModal';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import {
  CreatePurchaseTable,
  useCreatePurchaseTable,
} from '@/feature/purchaseTable/hooks/useCreatePurchaseTable';
import { type PurchaseTableResponse } from '@/feature/purchaseTable/hooks/usePurchaseTable';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { mycaPosCommonConstants } from '@/constants/mycapos';

interface Props {
  isOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  itemsInfo?:
    | {
        title: string;
        color: string;
        background_text_color?: string;
        cardname_and_price_text_color?: string;
        comment?: string;
        customTemplateImageUrl?: string;
        format: string;
        order: string;
        showStoreName: boolean;
        items: {
          itemId: number;
          displayPrice: number;
          anyModelNumber: boolean;
          isPsa10: boolean;
          orderNumber: number;
          imageUrl?: string;
          displayName?: string;
        }[];
      }
    | undefined;
  fetchPurchaseTable: () => Promise<PurchaseTableResponse | undefined>;
  setIsCreated: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface SelectedProduct {
  itemId: number;
  itemImage?: string;
  itemName?: string;
  displayPrice?: string;
  anyModelNumber?: boolean;
  isPsa10?: boolean;
  orderNumber?: number;
}

export interface PurchaseTableElement {
  title?: string;
  format?: string;
  orderBy?: string;
  showStoreName?: boolean;
  showTitle?: boolean;
  color?: string;
  background_text_color?: string;
  cardname_and_price_text_color?: string;
  customTemplateImageUrl?: string;
  comment?: string;
}

interface ValidationErrors {
  displayPrices: Record<number, string>; // itemId → error message
  format: string;
  orderBy: string;
  color: string;
  products: string; // 商品数関連のエラー
}

export const CreatePurchaseTableModal = ({
  isOpen,
  setIsModalOpen,
  itemsInfo,
  fetchPurchaseTable,
  setIsCreated,
}: Props) => {
  const [tertiaryButtonLoading, setTertiaryButtonLoading] =
    useState<boolean>(false);
  const [primaryButtonLoading, setPrimaryButtonLoading] =
    useState<boolean>(false);
  const [isShowInputField, setIsShowInputField] = useState<boolean>(false);
  const { store } = useStore();
  const { createPurchaseTable } = useCreatePurchaseTable();
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct[]>([]);
  const [purchaseTable, setPurchaseTable] = useState<PurchaseTableElement>();
  const [createPurchaseTableElement, setCreatePurchaseTableElement] =
    useState<CreatePurchaseTable>();
  const { setAlertState } = useAlert();
  const [isUpdateItemPriceModalOpen, setIsUpdateItemPriceModalOpen] =
    useState(false);
  const clientAPI = createClientAPI();
  const [canClick, setCanClick] = useState<boolean>(true);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [purchaseTableImage, setPurchaseTableImage] = useState<string>();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    displayPrices: {},
    format: '',
    orderBy: '',
    color: '',
    products: '',
  });

  // `itemsInfo` を `purchaseTable` に変換
  useEffect(() => {
    if (itemsInfo && itemsInfo.items.length > 0) {
      setPurchaseTable((prev) => {
        return {
          ...prev,
          title: itemsInfo.title,
          format: itemsInfo.format,
          orderBy: itemsInfo.order,
          showStoreName: itemsInfo.showStoreName,
          color: itemsInfo.color,
          background_text_color: itemsInfo.background_text_color,
          cardname_and_price_text_color:
            itemsInfo.cardname_and_price_text_color,
          customTemplateImageUrl: itemsInfo.customTemplateImageUrl
            ? itemsInfo.customTemplateImageUrl
            : undefined,
          comment: itemsInfo.comment,
        };
      });
      setIsShowInputField(true);
    }
  }, [itemsInfo]);

  // itemsInfoから直接商品情報を取得してselectedProductを作成
  const selectedProducts = useMemo(() => {
    if (!itemsInfo?.items) return [];

    const sortedItems = [...itemsInfo.items].sort((a, b) => {
      return (a.orderNumber ?? 0) - (b.orderNumber ?? 0);
    });

    return sortedItems.map((item) => {
      return {
        itemId: item.itemId,
        itemName: item.displayName,
        itemImage: item.imageUrl,
        displayPrice: item.displayPrice.toString(),
        anyModelNumber: item.anyModelNumber,
        isPsa10: item.isPsa10,
        orderNumber: item.orderNumber,
      };
    });
  }, [itemsInfo]);

  useEffect(() => {
    setSelectedProduct(selectedProducts);
  }, [selectedProducts]);

  // バリデーション関数
  const validateAllFields = useCallback(() => {
    const newErrors: ValidationErrors = {
      displayPrices: {},
      format: '',
      orderBy: '',
      color: '',
      products: '',
    };

    if (
      !purchaseTable?.format?.trim() &&
      !purchaseTable?.customTemplateImageUrl?.trim()
    ) {
      newErrors.format =
        'フォーマットまたはカスタムテンプレート画像を選択してください';
    }

    if (!purchaseTable?.orderBy?.trim()) {
      newErrors.orderBy = '表示順序が未選択です';
    }

    if (!purchaseTable?.color?.trim()) {
      newErrors.color = 'テーマカラーが未選択です';
    }

    // 商品数チェック
    const productCount = selectedProduct.length;

    // 1. 掲載商品なしのチェック
    if (productCount === 0) {
      newErrors.products = '掲載する商品を選択してください';
    } else if (purchaseTable?.format) {
      // 2. テンプレートの上限チェック
      const formatConfig = mycaPosCommonConstants.purchaseTableFormats.find(
        (f) => f.format === purchaseTable.format,
      );

      if (formatConfig) {
        const maxProductsPerPage = formatConfig.count;
        const maxPages = 3; // 3枚まで印刷可能
        const maxTotalProducts = maxProductsPerPage * maxPages;

        if (productCount > maxTotalProducts) {
          newErrors.products = `1回に最大3枚まで生成できます。${maxTotalProducts}件以下に商品数を調整してください（現在：${productCount}件選択中）`;
        }
      }
    }

    // 価格チェック
    selectedProduct.forEach((product) => {
      if (!product.displayPrice || product.displayPrice === '') {
        newErrors.displayPrices[product.itemId] = '掲載価格が未入力です';
      } else if (
        isNaN(Number(product.displayPrice)) ||
        Number(product.displayPrice) < 0
      ) {
        newErrors.displayPrices[product.itemId] =
          '正しい価格を入力してください';
      }
    });

    setValidationErrors(newErrors);

    // エラーがあるかチェック
    const hasErrors = Object.values(newErrors).some((error) =>
      typeof error === 'string' ? error !== '' : Object.keys(error).length > 0,
    );

    return !hasErrors;
  }, [selectedProduct, purchaseTable]);

  // エラーサマリーを取得
  const getErrorSummary = useCallback(() => {
    const errors: string[] = [];

    if (validationErrors.format) errors.push('• フォーマットが未選択です');
    if (validationErrors.orderBy) errors.push('• 表示順序が未選択です');
    if (validationErrors.color) errors.push('• テーマカラーが未選択です');
    if (validationErrors.products)
      errors.push(`• ${validationErrors.products}`);

    const priceErrorCount = Object.keys(validationErrors.displayPrices).length;
    if (priceErrorCount > 0) {
      errors.push(`• ${priceErrorCount}件の商品で掲載価格にエラーがあります`);
    }

    return errors;
  }, [validationErrors]);

  // リアルタイムバリデーション
  useEffect(() => {
    validateAllFields();
  }, [validateAllFields]);

  // `selectedProduct` から `createPurchaseTableElement` を作成
  useEffect(() => {
    if (
      (purchaseTable?.format || purchaseTable?.customTemplateImageUrl) &&
      purchaseTable?.orderBy &&
      purchaseTable?.color &&
      selectedProduct.length > 0
    ) {
      setCreatePurchaseTableElement({
        title: purchaseTable.title ?? '',
        format: purchaseTable.format || 'HORIZONTAL_18', // 入れておかないとエラーになる
        order: purchaseTable.orderBy,
        showStoreName: purchaseTable.showStoreName ?? false,
        showTitle: purchaseTable.showTitle ?? true, // デフォルトでタイトル表示を有効にする
        color: purchaseTable.color,
        background_text_color: purchaseTable.background_text_color,
        cardname_and_price_text_color:
          purchaseTable.cardname_and_price_text_color,
        customTemplateImageUrl: purchaseTable?.customTemplateImageUrl,
        comment: purchaseTable?.comment,
        items: selectedProduct.map((item) => ({
          itemId: item.itemId,
          displayPrice: Number(item.displayPrice),
          anyModelNumber: item.anyModelNumber as boolean,
          isPsa10: item.isPsa10 as boolean,
        })),
      });
    }
  }, [selectedProduct, purchaseTable]);

  // バツボタンを押したら、警告モーダルを開く
  const handleConfirmationModal = () => {
    setIsConfirmationModalOpen(true);
  };

  // キャンセルボタン
  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedProduct([]);
    setPurchaseTable(undefined);
    setCreatePurchaseTableElement(undefined);
    setIsShowInputField(false);
    setIsConfirmationModalOpen(false);
  };

  //掲載商品の選択へ戻る
  const handleBack = () => {
    setIsShowInputField(false);
  };

  const handleClick = async () => {
    if (!isShowInputField) {
      setIsShowInputField(true);
      return;
    }
    setIsUpdateItemPriceModalOpen(true);
  };

  useEffect(() => {
    // バリデーションエラーがあるかチェック
    const hasErrors = Object.values(validationErrors).some((error) =>
      typeof error === 'string' ? error !== '' : Object.keys(error).length > 0,
    );

    const existCreatePurchaseTableElement = createPurchaseTableElement;

    if (!hasErrors && existCreatePurchaseTableElement) {
      setCanClick(false); // ボタンを有効化
    } else {
      setCanClick(true); // 不備があるのでクリック不可
    }
  }, [validationErrors, createPurchaseTableElement]);

  const handleCreate = async () => {
    if (createPurchaseTableElement) {
      const res = await createPurchaseTable(
        store.id,
        createPurchaseTableElement,
      );
      // ローカルストレージに カラーと注意事項 を保存
      localStorage.setItem(
        'purchaseTable',
        JSON.stringify({
          color: createPurchaseTableElement.color,
          background_text_color:
            createPurchaseTableElement.background_text_color,
          cardname_and_price_text_color:
            createPurchaseTableElement.cardname_and_price_text_color,
          comment: createPurchaseTableElement.comment,
        }),
      );

      if (res.success) {
        resetState();
        fetchPurchaseTable();
        setIsCreated(true);
        setIsUpdateItemPriceModalOpen(false);
        setIsShowInputField(false);
        setIsModalOpen(false);

        const images = res.response?.purchaseTable?.generated_images ?? [];

        for (const image of images) {
          const imageUrl = image.image_url;
          setPurchaseTableImage(imageUrl);
          const fileName = `image-${image.purchase_table_id}.jpg`;

          downloadImageByUrl(imageUrl, fileName);
        }
        return { success: true };
      }

      return { success: false };
    }
  };

  useEffect(() => {
    if (purchaseTableImage) {
      setImageModalOpen(true);
    }
  }, [purchaseTableImage]);

  //画像ダウンロード処理
  const downloadImageByUrl = (imageUrl: string, filename: string) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', imageUrl, true);
    xhr.responseType = 'blob';

    xhr.onload = function () {
      if (xhr.status !== 200) {
        console.error('画像の取得に失敗しました:', xhr.statusText);
        return;
      }

      const blob = xhr.response;
      const dataUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // メモリ解放
      setTimeout(() => {
        URL.revokeObjectURL(dataUrl);
      }, 1000);
    };

    xhr.onerror = function () {
      console.error('画像リクエストでエラーが発生しました');
    };

    xhr.send();
  };

  const handleCloseUpdateItemPriceModal = () => {
    setIsUpdateItemPriceModalOpen(false);
  };

  const handleCreateWithoutUpdateItemPrice = async () => {
    setTertiaryButtonLoading(true);
    try {
      await handleCreate();
    } catch (error) {
      setTertiaryButtonLoading(false);
    } finally {
      setTertiaryButtonLoading(false);
    }
  };

  // 状態を初期化する関数
  const resetState = () => {
    setSelectedProduct([]);
    setPurchaseTable(undefined);
    setCreatePurchaseTableElement(undefined);
  };

  const handleCreateWithUpdateItemPrice = async () => {
    if (!createPurchaseTableElement || !createPurchaseTableElement.items) {
      setAlertState({
        message: 'アイテム情報がありません。',
        severity: 'error',
      });
      return;
    }

    setPrimaryButtonLoading(true);

    const createResult = await handleCreate();

    if (!createResult?.success) {
      setPrimaryButtonLoading(false);
      return;
    }

    try {
      // すべての itemID に対して API 呼び出しを行う
      const responses = await Promise.all(
        createPurchaseTableElement.items.map(async (item) => {
          try {
            const response = await clientAPI.item.update({
              storeID: store.id,
              itemID: item.itemId,
              body: { buy_price: item.displayPrice },
            });

            if (response instanceof CustomError) {
              throw new Error(`${response.status}:${response.message}`);
            }

            return response;
          } catch (error) {
            return error; // エラーをキャッチし、後で処理
          }
        }),
      );

      // エラーが含まれている場合、最初のエラーメッセージを表示
      const firstError = responses.find((res) => res instanceof Error);
      if (firstError) {
        setAlertState({
          message: firstError.message,
          severity: 'error',
        });
        return;
      }
    } catch (error) {
      setAlertState({
        message: '買取価格の更新に失敗しました。',
        severity: 'error',
      });
    } finally {
      setPrimaryButtonLoading(false);
    }
  };

  const { customTemplates, fetchCustomTemplates } = useFetchCustomTemplates();

  // モーダル開いたら設定でアップロード済みのカスタムテンプレートを取得
  useEffect(() => {
    if (!isOpen) return;

    fetchCustomTemplates();
  }, [fetchCustomTemplates, isOpen]);

  // ConfirmationDialogのメッセージを動的生成
  const confirmationMessage = useMemo(() => {
    const baseMessage = '商品の買取価格を買取表掲載価格に変更しますか？';
    const cautionMessage =
      '※型番違いなど買取価格が変わらない商品もございますので実際の買取の際はご注意ください。';

    const errorSummary = getErrorSummary();
    if (errorSummary.length > 0) {
      return (
        <Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {baseMessage}
          </Typography>
          <Typography sx={{ mb: 2 }}>{cautionMessage}</Typography>
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: 'error.main',
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              以下の項目を修正してください：
            </Typography>
            {errorSummary.map((error, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{ color: 'error.main', ml: 1 }}
              >
                {error}
              </Typography>
            ))}
          </Box>
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {baseMessage}
        </Typography>
        <Typography>{cautionMessage}</Typography>
      </Box>
    );
  }, [getErrorSummary]);

  return (
    <>
      <CustomModalWithIcon
        open={isOpen}
        onClose={handleConfirmationModal}
        onCancelClick={isShowInputField ? handleBack : handleConfirmationModal}
        title="新規買取表作成"
        onActionButtonClick={handleClick}
        actionButtonText={
          isShowInputField
            ? '買取表作成'
            : 'タイトルの設定・表示形式の指定に進む'
        }
        cancelButtonText={
          isShowInputField ? '掲載商品の選択へ戻る' : 'キャンセル'
        }
        width="95%"
        height="85%"
      >
        <CreatePurchaseTableModalContent
          isShowInputField={isShowInputField}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          setPurchaseTable={setPurchaseTable}
          purchaseTable={purchaseTable}
          customTemplates={customTemplates}
        />
      </CustomModalWithIcon>
      <ConfirmationDialog
        open={isUpdateItemPriceModalOpen}
        onClose={handleCloseUpdateItemPriceModal}
        title="買取表生成"
        content={confirmationMessage}
        confirmButtonText="変更して生成"
        onConfirm={handleCreateWithUpdateItemPrice}
        confirmButtonLoading={primaryButtonLoading}
        confirmButtonDisable={canClick || tertiaryButtonLoading}
        secondActionButtonText="変更せずに生成"
        onSecondActionButtonClick={handleCreateWithoutUpdateItemPrice}
        secondActionButtonDisable={canClick || primaryButtonLoading}
        secondActionButtonLoading={tertiaryButtonLoading}
      />
      {purchaseTableImage ? (
        <DisplayImageModal
          open={isImageModalOpen}
          onClose={() => setImageModalOpen(false)}
          imageUrl={purchaseTableImage}
        />
      ) : undefined}
      {/* 遷移注意モーダル */}
      <ConfirmationModal
        open={isConfirmationModalOpen}
        onClose={() => {
          setIsConfirmationModalOpen(false);
        }}
        onConfirm={handleCancel}
        title="画面遷移の確認"
        description="入力された内容が破棄されますが、よろしいですか？"
        confirmButtonText="はい"
        cancelButtonText="キャンセル"
      />
    </>
  );
};

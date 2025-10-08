import { useEnclosedProductContext } from '@/app/auth/(dashboard)/original-pack/create/context/EnclosedProductContext';
import { useAlert } from '@/contexts/AlertContext';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { useStore } from '@/contexts/StoreContext';
import { SelectChangeEvent } from '@mui/material';
import { MycaPosApiClient } from 'api-generator/client';
import { useSession } from 'next-auth/react';
import { ChangeEvent, useState } from 'react';

type FormDataType = {
  displayName: string;
  initStockNumber: number;
  sellPrice: number;
  genreId: number | null;
  categoryId: number | null;
  imageUrl: string | null;
};
export const useCreateOriginalPack = () => {
  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });

  const { store } = useStore();
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();
  const { data } = useSession();
  const staffAccountId = Number(data?.user?.id) ?? null;
  const [originalPack, setOriginalPack] = useState<FormDataType>({
    displayName: '',
    initStockNumber: 0,
    sellPrice: 0,
    genreId: null,
    categoryId: null,
    imageUrl: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { enclosedProducts } = useEnclosedProductContext();
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setOriginalPack({ ...originalPack, displayName: e.target.value });
  };
  const handleInitStockNumberChange = (value: number) => {
    setOriginalPack({
      ...originalPack,
      initStockNumber: value,
    });
  };
  const handleSellPriceChange = (price: number) => {
    setOriginalPack({
      ...originalPack,
      sellPrice: price,
    });
  };
  const handleGenreChange = (e: SelectChangeEvent<string>) => {
    setOriginalPack({
      ...originalPack,
      genreId: Number(e.target.value),
    });
  };
  const handleImageUploaded = (imageUrl: string | null) => {
    setOriginalPack({
      ...originalPack,
      imageUrl: imageUrl,
    });
  };
  const createOriginalPack = async (
    onSuccess: () => void,
    asDraft: boolean = false,
    id: number | undefined = undefined,
    skipValidation: boolean = false, // 一時保存の場合は商品単価と作成数を任意に
  ) => {
    if (originalPack.displayName === '') {
      setAlertState({
        message: '商品名を入力してください',
        severity: 'error',
      });
      return;
    }
    if (originalPack.genreId === null) {
      setAlertState({
        message: 'ジャンルを選択してください',
        severity: 'error',
      });
      return;
    }
    if (originalPack.categoryId === null) {
      setAlertState({
        message: 'カテゴリを選択してください',
        severity: 'error',
      });
      return;
    }
    if (!skipValidation) {
      if (originalPack.initStockNumber === 0) {
        setAlertState({
          message: '初期在庫数を入力してください',
          severity: 'error',
        });
        return;
      }
      if (originalPack.sellPrice === 0) {
        setAlertState({
          message: '販売価格を入力してください',
          severity: 'error',
        });
        return;
      }
    }
    setIsLoading(true);
    try {
      const res = await apiClient.item.createOriginalPack({
        storeId: store.id,
        requestBody: {
          id: id, // 編集時のみ
          asDraft: asDraft, // 下書きフラグ
          staff_account_id: staffAccountId,
          display_name: originalPack.displayName,
          sell_price: originalPack.sellPrice,
          init_stock_number: originalPack.initStockNumber,
          genre_id: originalPack.genreId!,
          category_id: originalPack.categoryId!,
          image_url: originalPack.imageUrl ?? undefined,
          products: enclosedProducts.map((product) => ({
            product_id: product.id,
            item_count: product.item_count ?? 0,
            staff_account_id: staffAccountId,
          })),
        },
      });
      setAlertState({
        message: asDraft
          ? '下書き保存に成功しました'
          : '商品の作成に成功しました',
        severity: 'success',
      });
      onSuccess();
      return res;
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    setOriginalPack({
      ...originalPack,
      categoryId: Number(e.target.value),
    });
  };
  return {
    originalPack,
    setOriginalPack,
    handleNameChange,
    handleInitStockNumberChange,
    handleSellPriceChange,
    handleGenreChange,
    handleCategoryChange,
    handleImageUploaded,
    createOriginalPack,
    isLoading,
  };
};

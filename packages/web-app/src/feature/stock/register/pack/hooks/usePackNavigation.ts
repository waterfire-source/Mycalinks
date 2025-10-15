import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import {
  PackNavigationState,
  ProgressType,
  RegisterParams,
} from '@/feature/stock/register/pack/types';
import { PackItemType } from '@/feature/stock/register/pack/components/PackRegisterTab';
import { PackType } from '@/feature/stock/register/pack/components/PackTable';

interface UsePackNavigationProps {
  registerParams: RegisterParams;
  items: PackItemType[];
  setOpenNumber: (value: number) => void;
  setSelectedStorageProduct: (value: number | string) => void;
  setItemsToRegister: React.Dispatch<React.SetStateAction<PackItemType[]>>;
  setSelectedPack: (pack: PackType | undefined) => void;
  setRegisterParams: (params: RegisterParams) => void;
  setItems: (items: PackItemType[]) => void;
  setRandomCardsPerPack: (count: number) => void;
}

interface UsePackNavigationReturn extends PackNavigationState {
  setProgress: (progress: ProgressType) => void;
}

/**
 * パック開封ナビゲーションのカスタムフック
 */
export const usePackNavigation = ({
  registerParams,
  items,
  setOpenNumber,
  setSelectedStorageProduct,
  setItemsToRegister,
  setSelectedPack,
  setRegisterParams,
  setItems,
  setRandomCardsPerPack,
}: UsePackNavigationProps): UsePackNavigationReturn => {
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressType>('select-pack');
  // 次のステップに進む
  const handleNextProgress = () => {
    if (progress === 'select-pack') {
      setOpenNumber(registerParams.openNumber ?? 0);
      setSelectedStorageProduct(registerParams.selectedStorageProduct);
      // 開封結果の登録画面に遷移
      if (registerParams.isFixedPack) {
        setProgress('register-fixed-pack');
      } else {
        setProgress('register-random-pack');
      }
    } else if (
      progress === 'register-fixed-pack' &&
      registerParams.isRandomPack
    ) {
      setProgress('register-random-pack');
    } else {
      setItemsToRegister(items.filter((item) => item.quantity > 0));
      setProgress('confirm');
    }
  };

  // 前のステップに戻る
  const handleBackProgress = () => {
    if (progress === 'confirm') {
      if (registerParams.isRandomPack) {
        setProgress('register-random-pack');
        setRandomCardsPerPack(0);
      } else {
        setProgress('register-fixed-pack');
        setRandomCardsPerPack(0);
      }
    } else if (progress === 'register-random-pack') {
      if (registerParams.isFixedPack) {
        setProgress('register-fixed-pack');
      } else {
        setProgress('select-pack');
      }
    } else {
      setProgress('select-pack');
      setItemsToRegister([]); // パック選択画面に戻ったらitemsToRegisterを初期化
      router.push(`${PATH.STOCK.register.pack.root}`);
    }
  };
  // 最初の状態にリセット
  const handleResetProgress = () => {
    setProgress('select-pack');
    setSelectedPack(undefined);
    setRegisterParams({
      openNumber: undefined,
      isFixedPack: false,
      isRandomPack: false,
      selectedStorageProduct: '',
    });
    setOpenNumber(0);
    setRandomCardsPerPack(0);
    setSelectedStorageProduct(0);
    setItems([]);
    setItemsToRegister([]);
  };

  return {
    progress,
    handleNextProgress,
    handleBackProgress,
    handleResetProgress,
    setProgress,
  };
};

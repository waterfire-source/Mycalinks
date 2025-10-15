import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useStore } from '@/contexts/StoreContext';
import { useUpdateProduct } from '@/feature/products/hooks/useUpdateProduct';
import { isManagementNumberEmpty } from '@/feature/products/utils/managementNumber';
import { FormControl, TextField } from '@mui/material';
import { useEffect, useState } from 'react';

type Props = {
  initValue: string; //テキストフィールドの初期値
  productId: number;
  disabled?: boolean; //編集を可能にするかどうかのboolean
  updateProduct: (
    storeId: number,
    productId: number,
    updateState: useUpdateProduct,
  ) => Promise<{
    success: boolean;
  }>;
  loading?: boolean;
  onUpdate?: () => void; //update後に実行する関数(最新の情報をfetchなど)
};

export const EditManagementNumberField = ({
  initValue,
  productId,
  disabled,
  updateProduct,
  loading,
  onUpdate,
}: Props) => {
  const { store } = useStore();
  const [inputValue, setInputValue] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const onClick = async () => {
    if (isEditMode) {
      await updateProduct(store.id, productId, {
        managementNumber: inputValue,
      });
      if (onUpdate) onUpdate();
      setIsEditMode((prev) => !prev);
    } else {
      setIsEditMode((prev) => !prev);
    }
  };

  useEffect(() => {
    if (!isManagementNumberEmpty(initValue)) setInputValue(initValue);
  }, []);
  return (
    <FormControl
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        gap: '5px',
      }}
    >
      <TextField
        sx={{ width: '100%' }}
        size="small"
        type="text"
        placeholder="管理番号"
        value={inputValue}
        disabled={!isEditMode}
        InputLabelProps={{
          shrink: true,
          sx: {
            color: 'grey.700', // フォーカスしてないときの色
          },
        }}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <PrimaryButton
        onClick={onClick}
        disabled={disabled}
        sx={{ width: '50px' }}
        loading={loading}
      >
        {isEditMode ? '確定' : '編集'}
      </PrimaryButton>
    </FormControl>
  );
};

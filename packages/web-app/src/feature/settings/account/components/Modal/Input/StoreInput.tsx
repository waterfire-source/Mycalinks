import { useFieldNameMap } from '@/contexts/FormErrorContext';
import { useStoreInfoNormal } from '@/feature/store/hooks/useStoreInfoNormal';
import { AccountType } from '@/feature/account/hooks/useAccounts';
import { Checkbox, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

interface Props {
  titleWidth: string;
  account?: AccountType;
}
export const StoreInput = ({ titleWidth, account }: Props) => {
  const { storeInfoNormal, fetchStoreInfoNormal } = useStoreInfoNormal();
  const name = 'storeIds';
  const fieldNameMap = useFieldNameMap();
  const fieldDisplayName = fieldNameMap[name] || name;
  
  useEffect(() => {
    fetchStoreInfoNormal();
  }, [fetchStoreInfoNormal]);

  const { setValue, watch } = useFormContext();
  const currentStoreIds = watch(name) || [];

  // アカウントの既存店舗情報を初期値として設定
  useEffect(() => {
    if (account?.stores && currentStoreIds.length === 0) {
      const existingStoreIds = account.stores.map(store => store.store_id);
      setValue(name, existingStoreIds);
    }
  }, [account?.stores, setValue, name, currentStoreIds.length]);

  const handleChange = (storeId: number) => {
    const isChecked = currentStoreIds.includes(storeId);
    if (isChecked) {
      // チェックを外す場合は配列から削除
      setValue(name, currentStoreIds.filter((id: number) => id !== storeId));
    } else {
      // チェックを入れる場合は配列に追加
      setValue(name, [...currentStoreIds, storeId]);
    }
  };
  return (
    <Stack direction="row" alignItems="start">
      <Typography sx={{ width: titleWidth }}>{fieldDisplayName}</Typography>
      <Stack
        sx={{
          border: '1px solid grey',
          borderRadius: '4px',
          width: `calc(100% - ${titleWidth})`,
          height: '200px',
          overflow: 'auto',
        }}
      >
        {storeInfoNormal &&
          storeInfoNormal.map((store) => (
            <Stack key={store.id} direction="row" alignItems="center">
              <Checkbox 
                checked={currentStoreIds.includes(store.id)}
                onChange={() => handleChange(store.id)}
              />
              <Typography>{store.display_name}</Typography>
            </Stack>
          ))}
      </Stack>
    </Stack>
  );
};

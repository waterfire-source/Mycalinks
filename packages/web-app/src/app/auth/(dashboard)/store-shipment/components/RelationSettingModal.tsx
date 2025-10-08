import { RelationSettingContent } from '@/app/auth/(dashboard)/store-shipment/components/RelationSettingContent';
import { useGetAllStore } from '@/app/auth/(dashboard)/store-shipment/hooks/useGetAllStore';
import Loader from '@/components/common/Loader';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { SecondaryCustomTabTableStyle } from '@/components/tabs/CustomTabTableStyle';
import { Box, Stack, Tabs } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { useSetStoreShipmentMapping } from '@/app/auth/(dashboard)/store-shipment/hooks/useSetStoreShipmentMapping';
import { useGetRelationToStore } from '@/app/auth/(dashboard)/store-shipment/hooks/useGetRelationToStore';
import { useAlert } from '@/contexts/AlertContext';
import { FormValue } from '@/app/auth/(dashboard)/store-shipment/type';

interface Props {
  onClose: () => void;
}

export const RelationSettingModal = ({ onClose }: Props) => {
  const { setAlertState } = useAlert();
  const { allStores, fetchAllStores } = useGetAllStore();
  const { setStoreShipmentMapping, isLoading: ShipmentMappingLoading } =
    useSetStoreShipmentMapping();
  const {
    isLoading: relationToStoreLoading,
    fetchRelationToStore,
    storeRelations,
  } = useGetRelationToStore();

  const defaultValues: FormValue = {
    condition_option: [],
    genre: [],
    specialty: [],
    category: [],
    consignment_client: [],
  };

  // useFormをここに追加
  const methods = useForm<FormValue>({
    defaultValues,
  });

  const [selectedTab, setSelectedTab] = useState<number>();

  // マッピング情報を設定する関数
  const setMappingToForm = useCallback(
    (tabId: number) => {
      if (!storeRelations) return;

      const matchingStore = storeRelations.find(
        (store) => store.to_store_id === tabId,
      );

      if (matchingStore) {
        methods.reset({
          condition_option: matchingStore.condition_option_mappings?.map(
            (m) => ({
              from_option_id: m.from_option_id,
              to_option_id: m.to_option_id,
            }),
          ),
          genre: matchingStore.genre_mappings?.map((m) => ({
            from_genre_id: m.from_genre_id,
            to_genre_id: m.to_genre_id,
          })),
          specialty: matchingStore.specialty_mappings?.map((m) => ({
            from_specialty_id: m.from_specialty_id,
            to_specialty_id: m.to_specialty_id,
          })),
          category: matchingStore.category_mappings?.map((m) => ({
            from_category_id: m.from_category_id,
            to_category_id: m.to_category_id,
          })),
          consignment_client: [], // 空の配列をわたさないとエラーになる
        });
      } else {
        methods.reset(defaultValues);
      }
    },
    [storeRelations, methods],
  );

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);

    // storeRelationsからselectedTabと同じidの配列を検索
    setMappingToForm(newValue);
  };

  // フォーム送信処理
  const onSubmit = async (data: FormValue) => {
    if (!selectedTab) {
      setAlertState({ message: '店舗が選択されていません', severity: 'error' });
      return;
    }

    try {
      const filteredData = {
        condition_option: data.condition_option.filter(
          (item) => item.from_option_id !== null && item.to_option_id !== null,
        ),
        genre: data.genre.filter(
          (item) => item.from_genre_id !== null && item.to_genre_id !== null,
        ),
        specialty: data.specialty.filter(
          (item) =>
            item.from_specialty_id !== null && item.to_specialty_id !== null,
        ),
        category: data.category.filter(
          (item) =>
            item.from_category_id !== null && item.to_category_id !== null,
        ),
        consignment_client: [],
      };

      await setStoreShipmentMapping({
        to_store_id: selectedTab,
        mappings: filteredData,
      });
      setAlertState({ message: '紐づけしました。', severity: 'success' });
      onClose(); // 送信後にモーダルを閉じる
    } catch (error) {
      console.error('フォーム送信エラー:', error);
      // エラーは useSetStoreShipmentMapping 内で handleError により処理される
    }
  };

  // ActionButtonクリック時の処理
  const handleActionButtonClick = () => {
    methods.handleSubmit(onSubmit)();
  };

  useEffect(() => {
    fetchAllStores();
    fetchRelationToStore();
  }, [fetchAllStores, fetchRelationToStore]);

  useEffect(() => {
    // 最初の店舗を選択状態にする
    if (allStores.length > 0) {
      setSelectedTab(allStores[0].id);
    }
  }, [allStores]);

  // selectedTabとstoreRelationsが変更されたらフォームの全データなどをresetで設定、自動選択された状態で表示される
  useEffect(() => {
    if (selectedTab) {
      setMappingToForm(selectedTab);
    }
  }, [selectedTab, storeRelations, setMappingToForm]);

  return (
    <CustomModalWithIcon
      open={true}
      title="状態等の紐づけ"
      onClose={onClose}
      cancelButtonText="やめる"
      onActionButtonClick={handleActionButtonClick}
      actionButtonText="紐づけを保存"
      width="90%"
      height="90%"
      loading={ShipmentMappingLoading}
    >
      {allStores.length === 0 || relationToStoreLoading ? (
        <Loader sx={{ height: '100%', bgcolor: 'transparent' }} />
      ) : (
        <Stack sx={{ height: '100%' }}>
          {/* タブ部分 */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={selectedTab}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons={false} // 矢印ボタンを非表示
              sx={{
                margin: 0,
                padding: 0,
                minHeight: '31px',
                '& .MuiTabs-scroller': {
                  overflowX: 'auto',
                  scrollbarWidth: 'thin', // Firefox用
                  '&::-webkit-scrollbar': {
                    height: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f1f1f1',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#c1c1c1',
                    borderRadius: '3px',
                    '&:hover': {
                      backgroundColor: '#a8a8a8',
                    },
                  },
                },
              }}
            >
              {allStores.map((store) => (
                <SecondaryCustomTabTableStyle
                  key={store.id}
                  label={store.display_name ?? ''}
                  value={store.id}
                />
              ))}
            </Tabs>
          </Box>
          {/* メイン部分 */}
          <Box sx={{ my: 2 }}>
            <FormProvider {...methods}>
              <RelationSettingContent selectedTab={selectedTab} />
            </FormProvider>
          </Box>
        </Stack>
      )}
    </CustomModalWithIcon>
  );
};

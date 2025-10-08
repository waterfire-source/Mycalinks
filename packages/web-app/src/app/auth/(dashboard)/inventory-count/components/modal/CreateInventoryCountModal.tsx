import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Typography, Stack, TextField } from '@mui/material';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useSession } from 'next-auth/react';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { CheckCircleOutline } from '@mui/icons-material';
import { Store } from '@prisma/client';
import { ApiError } from 'api-generator/client';
import { InventoryAPIRes } from '@/api/frontend/inventory/api';
import { useCreateInventory } from '@/feature/inventory-count/hook/useCreateInventory';
import { InventoryCountData } from '@/feature/inventory-count/hook/useInventoryCount';
import { DetailViewType } from '@/app/auth/(dashboard)/inventory-count/page';
import dayjs from 'dayjs';
import { useStore } from '@/contexts/StoreContext';

interface CreateInventoryCountModalProps {
  open: boolean;
  onClose: () => void;
  store: Store;
  genreIds: number[];
  genreNames: string[];
  categoryIds: number[];
  categoryNames: string[];
  handleOpenDetailModal: (data: InventoryCountData) => void;
  setDetailViewType: Dispatch<SetStateAction<DetailViewType>>;
}

export const CreateInventoryCountModal = ({
  open,
  onClose,
  store,
  genreIds,
  genreNames,
  categoryIds,
  categoryNames,
  handleOpenDetailModal,
  setDetailViewType,
}: CreateInventoryCountModalProps) => {
  const { setAlertState } = useAlert();
  const { stores } = useStore();
  const { data: session } = useSession();
  const staffAccountID = session?.user?.id;
  const clientAPI = createClientAPI();
  const { createInventory, isCreatingInventory } = useCreateInventory();

  const [inventoryCountTitle, setInventoryCountTitle] = useState<string>('');
  const [selectedGenreIds, setSelectedGenreIds] = useState<Array<number>>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Array<number>>(
    [],
  );

  const [shelfs, setShelfs] = useState<InventoryAPIRes['getShelfs']['shelfs']>(
    [],
  );

  // 棚のリストを取得
  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      try {
        const shelfsResponse = await clientAPI.inventory.getShelfs({
          storeID: store.id,
        });
        if (shelfsResponse instanceof CustomError) {
          setAlertState({ message: shelfsResponse.message, severity: 'error' });
          return;
        }
        setShelfs(shelfsResponse.shelfs);
      } catch (error) {
        setAlertState({
          message: '棚情報の取得に失敗しました',
          severity: 'error',
        });
        return;
      }
    };
    fetchData();
  }, [open, store.id]);

  // 入力をリセット
  const reset = () => {
    setInventoryCountTitle('');
    setSelectedGenreIds([]);
    setSelectedCategoryIds([]);
  };

  const handleCloseCreateModal = () => {
    reset();
    onClose();
  };

  const handleClickCreateButton = async () => {
    const requestBody = {
      title: inventoryCountTitle,
      item_genre_ids: selectedGenreIds.map((id) => ({ id })),
      item_category_ids: selectedCategoryIds.map((id) => ({ id })),
    };

    try {
      //必要であれば作成後にinventoryを再フェッチする
      const res = await createInventory(store.id, requestBody);
      if (!res) return;

      const inputCount = res.total_item_count || 0;
      const targetCount = res.total_stock_number || 0;

      const inventoryCountData: InventoryCountData = {
        id: res.id,
        title: res.title || '',
        status: res.status === 'FINISHED' ? '完了' : '中断中',
        updatedAt: res.updated_at
          ? dayjs(res.updated_at).format('YYYY/MM/DD HH:mm')
          : '-',
        store: {
          id: res.store_id,
          display_name:
            stores.find((s) => s.id === res.store_id)?.display_name || '-',
        },
        genreIds: res.item_genres.map((item) => item.item_genre_id),
        categoryIds: res.item_categories.map((item) => item.item_category_id),
        progress: Math.round((inputCount / targetCount) * 1000) / 10,
        difference: Number(
          BigInt(res.total_item_wholesale_price || 0) -
            BigInt(res.total_stock_wholesale_price || 0),
        ),
        inputTotalWholesalePrice: BigInt(res.total_item_wholesale_price || 0),
        inputCount,
        targetTotalWholesalePrice: BigInt(res.total_stock_wholesale_price || 0),
        targetCount,
        discrepancy: inputCount - targetCount,
      };

      setDetailViewType('create');

      handleOpenDetailModal(inventoryCountData);
      handleCloseCreateModal();
      setShelfs([]);
    } catch (e) {
      const msg =
        e instanceof ApiError && e.body?.error
          ? e.body.error
          : '棚卸の作成に失敗しました';

      setAlertState({ message: msg, severity: 'error' });
      reset();
      return;
    }
  };

  const buttonStyle = {
    whiteSpace: 'nowrap',
    margin: 1,
    minWidth: '200px',
    minHeight: '40px',
  };

  return (
    <>
      <CustomModalWithIcon
        title="新規棚卸"
        open={open}
        onClose={handleCloseCreateModal}
        width="90%"
        height="85%"
        actionButtonText="新規棚卸開始"
        onActionButtonClick={handleClickCreateButton}
        cancelButtonText="キャンセル"
        loading={isCreatingInventory}
        isAble={
          inventoryCountTitle !== '' &&
          selectedGenreIds.length > 0 &&
          selectedCategoryIds.length > 0 &&
          shelfs.length > 0 &&
          !isCreatingInventory &&
          !!staffAccountID
        }
      >
        <Stack width="100%" gap="12px">
          <Stack direction="column" spacing={2} alignItems="left" width="100%">
            <Typography sx={{ whiteSpace: 'nowrap' }}>
              棚卸のタイトルを設定して、棚卸を行うジャンル・カテゴリを指定してください。
            </Typography>
            <Typography
              sx={{ whiteSpace: 'nowrap', width: '70px', marginTop: '10px' }}
            >
              タイトル
            </Typography>
            <TextField
              variant="outlined"
              size="small"
              placeholder="棚卸のタイトル"
              value={inventoryCountTitle}
              type="text"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setInventoryCountTitle(e.target.value)
              }
              sx={{
                width: '100%',
                backgroundColor: 'common.white',
                '& .MuiInputBase-input': {
                  color: 'text.primary',
                },
              }}
            />
            <Typography
              sx={{ whiteSpace: 'nowrap', width: '70px', marginTop: '10px' }}
            >
              ジャンル
            </Typography>
            <Stack
              direction="row"
              alignItems="left"
              width="100%"
              flexWrap="wrap"
            >
              <SecondaryButtonWithIcon
                selected={selectedGenreIds.length === genreIds.length}
                icon={
                  selectedGenreIds.length === genreIds.length && (
                    <CheckCircleOutline />
                  )
                }
                onClick={() => {
                  if (selectedGenreIds.length === genreIds.length) {
                    setSelectedGenreIds([]);
                  } else {
                    setSelectedGenreIds(genreIds);
                  }
                }}
                sx={buttonStyle}
              >
                全て
              </SecondaryButtonWithIcon>
              {genreIds.map((id, index) => (
                <SecondaryButtonWithIcon
                  key={id}
                  selected={selectedGenreIds.some(
                    (selectedId) => selectedId === id,
                  )}
                  icon={
                    selectedGenreIds.some(
                      (selectedId) => selectedId === id,
                    ) && <CheckCircleOutline />
                  }
                  onClick={() => {
                    if (
                      selectedGenreIds.some((selectedId) => selectedId === id)
                    ) {
                      setSelectedGenreIds((prev) =>
                        prev.filter((prevId) => prevId !== id),
                      );
                    } else {
                      setSelectedGenreIds((prev) => [...prev, id]);
                    }
                  }}
                  sx={buttonStyle}
                >
                  {genreNames[index]}
                </SecondaryButtonWithIcon>
              ))}
            </Stack>
            <Typography
              sx={{ whiteSpace: 'nowrap', width: '70px', marginTop: '10px' }}
            >
              カテゴリー
            </Typography>
            <Stack
              direction="row"
              alignItems="left"
              width="100%"
              flexWrap="wrap"
            >
              <SecondaryButtonWithIcon
                selected={selectedCategoryIds.length === categoryIds.length}
                icon={
                  selectedCategoryIds.length === categoryIds.length && (
                    <CheckCircleOutline />
                  )
                }
                onClick={() => {
                  if (selectedCategoryIds.length === categoryIds.length) {
                    setSelectedCategoryIds([]);
                  } else {
                    setSelectedCategoryIds(categoryIds);
                  }
                }}
                sx={buttonStyle}
              >
                全て
              </SecondaryButtonWithIcon>
              {categoryIds.map((id, index) => (
                <SecondaryButtonWithIcon
                  key={id}
                  selected={selectedCategoryIds.some(
                    (selectedId) => selectedId === id,
                  )}
                  icon={
                    selectedCategoryIds.some(
                      (selectedId) => selectedId === id,
                    ) && <CheckCircleOutline />
                  }
                  onClick={() => {
                    if (
                      selectedCategoryIds.some(
                        (selectedId) => selectedId === id,
                      )
                    ) {
                      setSelectedCategoryIds((prev) =>
                        prev.filter((prevId) => prevId !== id),
                      );
                    } else {
                      setSelectedCategoryIds((prev) => [...prev, id]);
                    }
                  }}
                  sx={buttonStyle}
                >
                  {categoryNames[index]}
                </SecondaryButtonWithIcon>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </CustomModalWithIcon>

      {/* 棚選択モーダル（→棚ごとに商品追加へ） */}
      {/* <ShelfSelectedModal
        open={isShelfModalOpen}
        onClose={() => setIsShelfModalOpen(false)}
        shelfs={shelfs}
        onConfirm={handleConfirmShelfModal}
        isLoading={isCreatingInventory}
      /> */}
    </>
  );
};

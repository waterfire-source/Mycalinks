'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Stack, Typography } from '@mui/material';
import { ShelfNameChangeModal } from '@/app/auth/(dashboard)/inventory-count/components/modal/ShelfNameChangeModal';
import { CreateInventoryCountModal } from '@/app/auth/(dashboard)/inventory-count/components/modal/CreateInventoryCountModal';
import { useStore } from '@/contexts/StoreContext';

import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import {
  InventoryCountData,
  useInventoryCount,
} from '@/feature/inventory-count/hook/useInventoryCount';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { InventoryCountDetailModal } from '@/app/auth/(dashboard)/inventory-count/components/modal/InventoryCountDetailModal';
import { StyledAlertConfirmationModal } from '@/components/modals/StyledAlertConfirmationModal';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { InventoryCountTable } from '@/app/auth/(dashboard)/inventory-count/components/InventoryCountTable';
import { useSearchParams } from 'next/navigation';
import { palette } from '@/theme/palette';
import { useErrorAlert } from '@/hooks/useErrorAlert';

export type DetailViewType = 'edit' | 'create' | 'confirm' | 'complete';

export default function InventoryCountPage() {
  const [isShelfChangeModalOpen, setIsShelfChangeModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { store, stores } = useStore();
  const [selectedInventoryCount, setSelectedInventoryCount] =
    useState<InventoryCountData | null>(null);

  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [detailViewType, setDetailViewType] = useState<DetailViewType>('edit'); //詳細モーダルのビューを管理 confirmは棚卸しの後、editは一覧から、createは新規作成からの遷移
  const {
    rows,
    isLoading,
    currentShelfs,
    fetchData,
    handleSaveShelfNames,
    totalCount,
  } = useInventoryCount(store.id, stores);
  const clientAPI = createClientAPI();
  const { genre, fetchGenreList } = useGenre();
  const { category, fetchCategoryList } = useCategory();
  const { setAlertState } = useAlert();
  const { handleError } = useErrorAlert();
  const searchParams = useSearchParams();
  const updated = searchParams.get('updated');
  const idToOpen = searchParams.get('idToOpen'); //棚卸後に戻ってきた場合のパラメータ。指定されたIDの詳細モーダルが開く。
  // クエリパラメータを参照してモーダルを開いたかどうかを判定するref
  const isModalOpenRef = useRef(false);

  // ========== ジャンル、カテゴリ取得 ==========
  useEffect(() => {
    fetchData();
    fetchGenreList();
    fetchCategoryList();
  }, []);

  // urlのクエリパラメータにupdatedがあればfetchDataを実行
  useEffect(() => {
    if (updated) {
      fetchData();
      fetchGenreList();
      fetchCategoryList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updated]);

  const [genreIds, genreNames] = useMemo(() => {
    return [
      genre?.itemGenres.map((g) => g.id) || [],
      genre?.itemGenres.map((g) => g.display_name) || [],
    ];
  }, [genre]);

  const [categoryIds, categoryNames] = useMemo(() => {
    return [
      category?.itemCategories.map((g) => g.id) || [],
      category?.itemCategories.map((g) => g.display_name) || [],
    ];
  }, [category]);

  useEffect(() => {
    if (idToOpen && !isModalOpenRef.current) {
      setDetailViewType('confirm');
      const targetRow = rows.find((r) => r.id === Number(idToOpen));
      if (targetRow) {
        handleOpenDetailModal(targetRow);
        isModalOpenRef.current = true;
      }
    }
  }, [idToOpen, rows]);

  // ========== 関数 ==========
  // 詳細モーダルを開く
  const handleOpenDetailModal = (data: InventoryCountData) => {
    setSelectedInventoryCount(data);
    setIsDetailModalOpen(true);
  };

  // 削除モーダルを開く
  const handleOpenDeleteModal = () => {
    setIsDetailModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  // 棚卸削除
  const handleConfirmDelete = async () => {
    if (!selectedInventoryCount) return;
    setIsLoadingDelete(true);
    try {
      const res = await clientAPI.inventory.deleteInventory({
        storeID: store.id,
        inventoryID: selectedInventoryCount.id,
      });
      if (res instanceof CustomError) {
        setAlertState({ message: res.message, severity: 'error' });
        return;
      } else {
        setAlertState({
          message: '削除に成功しました',
          severity: 'success',
        });
      }
    } catch (error) {
      setAlertState({
        message: '削除に失敗しました',
        severity: 'error',
      });
      setIsLoadingDelete(false);
      return;
    }
    setIsDeleteModalOpen(false);
    setSelectedInventoryCount(null);
    setIsLoadingDelete(false);
    await fetchData();
  };

  // 棚卸完了
  const handleConfirm = async (adjust: boolean) => {
    if (!selectedInventoryCount) return { ok: false };

    try {
      const res = await clientAPI.inventory.applyInventory({
        storeID: store.id,
        inventoryID: selectedInventoryCount.id,
        adjust,
      });

      if (res instanceof CustomError) throw res;

      setAlertState({
        message: '棚卸を完了しました',
        severity: 'success',
      });

      fetchData(); // 棚卸し一覧を更新

      return { ok: true };
    } catch (error) {
      handleError(error);
      return { ok: false };
    }
  };

  // CSV出力処理
  const handleExportCsv = async () => {
    if (!store || !selectedInventoryCount?.id) return;

    const url = `/api/store/${store.id}/inventory/${selectedInventoryCount.id}/csv`;

    try {
      const res = await fetch(url);

      const data = await res.json();
      if (data.fileUrl) {
        // ダウンロード実行
        window.location.href = data.fileUrl;
      } else {
        setAlertState({
          message: 'CSVファイルの出力に失敗しました',
          severity: 'error',
        });
      }
    } catch (e) {
      handleError(e);
    }
  };

  return (
    <ContainerLayout
      title="棚卸一覧"
      helpArchivesNumber={590}
      actions={
        <Stack gap={1}>
          <Stack
            direction="row"
            gap="20px"
            paddingLeft={5}
            alignItems="center"
            justifyContent="space-between"
          >
            <SecondaryButtonWithIcon
              onClick={() => setIsShelfChangeModalOpen(true)}
              sx={{
                paddingX: 5,
              }}
            >
              棚変更・追加
            </SecondaryButtonWithIcon>
            <PrimaryButtonWithIcon
              onClick={() => setIsCreateModalOpen(true)}
              sx={{
                paddingX: 5,
              }}
              disabled={currentShelfs.length === 0}
            >
              新規棚卸
            </PrimaryButtonWithIcon>
          </Stack>
          <Typography
            textAlign={'right'}
            variant="caption"
            color={palette.primary.error}
          >
            棚を追加してから棚卸を開始してください。
          </Typography>
        </Stack>
      }
    >
      <Stack sx={{ width: '100%', height: '100%' }}>
        {/* データテーブル部分 */}
        <InventoryCountTable
          rows={rows}
          setDetailViewType={setDetailViewType}
          isLoading={isLoading}
          genreIds={genreIds}
          genreNames={genreNames}
          categoryIds={categoryIds}
          categoryNames={categoryNames}
          handleOpenDetailModal={handleOpenDetailModal}
          fetchData={fetchData}
          totalCount={totalCount}
        />
      </Stack>

      {/* 棚変更・追加モーダル */}
      <ShelfNameChangeModal
        open={isShelfChangeModalOpen}
        onClose={() => setIsShelfChangeModalOpen(false)}
        currentShelfs={currentShelfs}
        onSave={handleSaveShelfNames}
      />

      {/* 新規棚卸モーダル */}
      <CreateInventoryCountModal
        open={isCreateModalOpen}
        setDetailViewType={setDetailViewType}
        handleOpenDetailModal={handleOpenDetailModal}
        onClose={() => setIsCreateModalOpen(false)}
        store={store}
        genreIds={genreIds}
        genreNames={genreNames}
        categoryIds={categoryIds}
        categoryNames={categoryNames}
      />

      {/* 棚卸詳細モーダル */}
      <InventoryCountDetailModal
        open={isDetailModalOpen}
        detailViewType={detailViewType}
        fetchData={fetchData}
        onClose={() => setIsDetailModalOpen(false)}
        store={store}
        selectedInventoryCount={selectedInventoryCount}
        status={selectedInventoryCount?.status || ''}
        onDeleteButtonClick={handleOpenDeleteModal}
        handleConfirm={handleConfirm}
        handleExportCsv={handleExportCsv}
      />

      {/* 棚卸削除モーダル */}
      <StyledAlertConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="棚卸の削除"
        message="本当に棚卸の内容を削除しますか？"
        confirmButtonText="削除する"
        cancelButtonText="キャンセル"
        isLoading={isLoadingDelete}
      />
    </ContainerLayout>
  );
}

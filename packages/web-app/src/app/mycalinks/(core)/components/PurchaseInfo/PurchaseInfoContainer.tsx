'use client';
import { PurchaseInfoCard } from '@/app/mycalinks/(core)/components/PurchaseInfo/PurchaseInfoCard';
import { PurchaseInfoModal } from '@/app/mycalinks/(core)/components/PurchaseInfo/PurchaseInfoModal';
import { HeaderWithBackButton } from '@/app/mycalinks/(core)/components/StoreMenu/HeaderWithBackButton';
import { PosCustomerInfo } from '@/app/mycalinks/(core)/types/customer';
import {
  ViewConfig,
  ViewTypes,
} from '@/app/mycalinks/(core)/types/MembershipCardContent';
import Loader from '@/components/common/Loader';
import {
  GetAllStorePurchaseTableByMycaUserResponse,
  useGetPurchaseTableByMycaUser,
} from '@/feature/purchaseTable/hooks/useGetPurchaseTableByMycaUser';
import { Box, Button } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

export type PurchaseInfosType = {
  groupId: string;
  published_at: string | null;
  genre_handle: string | null;
  store_id: number;
  tables: GetAllStorePurchaseTableByMycaUserResponse['purchaseTables'];
  allImages: Array<{
    purchase_table_id: number;
    order_number: number;
    image_url: string;
  }>;
};

interface Props {
  onBack: () => void;
  currentView: ViewConfig;
  posCustomerStoresInfos?: PosCustomerInfo['store'][];
  selectedStoreId: number | null;
}
export const PurchaseInfoContainer = ({
  onBack,
  currentView,
  posCustomerStoresInfos,
  selectedStoreId,
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [availableStores, setAvailableStores] = useState<
    { id: number; name: string }[]
  >([]);
  const [isFilterOptionsCreated, setIsFilterOptionsCreated] =
    useState<boolean>(false);
  const { purchaseTables, isLoading, fetchPurchaseTableByMycaUser } =
    useGetPurchaseTableByMycaUser();

  /**
   * 買取表カードを表示用にグループ化する関数
   * published_at、genre_handle（正規化）、store_idが同じものをグループ化
   * 各グループ内の全ての画像を統合して管理
   *
   * @param purchaseTables APIから取得した買取テーブルの配列
   * @returns グループ化された買取情報の配列
   */
  const groupPurchaseTables = useCallback(
    (
      purchaseTables: GetAllStorePurchaseTableByMycaUserResponse['purchaseTables'],
    ) => {
      const grouped = purchaseTables.reduce(
        (acc, purchaseTable) => {
          // genre_handleの正規化: null、"null"、空文字を統一
          const normalizedGenre =
            !purchaseTable.genre_handle ||
            purchaseTable.genre_handle === 'null' ||
            purchaseTable.genre_handle.trim() === ''
              ? null
              : purchaseTable.genre_handle;

          // グループ化キー: 公開日_正規化ジャンル_店舗ID
          const key = `${purchaseTable.published_at}_${normalizedGenre}_${purchaseTable.store_id}`;

          // 新しいグループの場合は初期化
          if (!acc[key]) {
            acc[key] = {
              groupId: key,
              published_at: purchaseTable.published_at,
              genre_handle: normalizedGenre,
              store_id: purchaseTable.store_id,
              tables: [], // 同じ条件の買取テーブル群
              allImages: [], // グループ内の全画像
            };
          }

          // 既存グループに買取テーブルを追加
          acc[key].tables.push(purchaseTable);

          // generated_imagesを全て統合（order_numberでソート）
          const sortedImages = [...purchaseTable.generated_images].sort(
            (a, b) => a.order_number - b.order_number,
          );
          acc[key].allImages.push(...sortedImages);

          return acc;
        },
        {} as Record<
          string,
          {
            groupId: string;
            published_at: string | null;
            genre_handle: string | null;
            store_id: number;
            tables: GetAllStorePurchaseTableByMycaUserResponse['purchaseTables'];
            allImages: Array<{
              purchase_table_id: number;
              order_number: number;
              image_url: string;
            }>;
          }
        >,
      );

      // published_atで降順ソート（最新順）
      return Object.values(grouped).sort((a, b) => {
        const dateA = new Date(a.published_at || 0).getTime();
        const dateB = new Date(b.published_at || 0).getTime();
        return dateB - dateA;
      });
    },
    [],
  );

  // 全件取得時に選択肢を作成
  const createFilterOptions = useCallback(
    (tables: GetAllStorePurchaseTableByMycaUserResponse['purchaseTables']) => {
      const genres = [
        ...new Set(
          tables
            .map((t) => t.genre_handle)
            .filter((genre): genre is string => genre !== null),
        ),
      ];
      const storeIds = [
        ...new Set(tables.map((t) => t.store_id).filter(Boolean)),
      ];

      // posCustomerStoresInfosを使って店舗情報を作成
      const stores = storeIds.map((storeId) => {
        const storeInfo = posCustomerStoresInfos?.find(
          (store) => store?.id === storeId,
        );
        return {
          id: storeId,
          name: storeInfo?.display_name ?? `店舗${storeId}`,
        };
      });

      setAvailableGenres(genres);
      setAvailableStores(stores);
    },
    [posCustomerStoresInfos],
  );

  // 絞り込みハンドラ
  const handleFilterChange = useCallback(
    async (genre: string | null, storeIds: number[]) => {
      await fetchPurchaseTableByMycaUser({
        storeId: storeIds.length > 0 ? storeIds.join(',') : undefined,
        genreHandle: genre || undefined,
      });
    },
    [fetchPurchaseTableByMycaUser],
  );

  // 初回全件取得
  useEffect(() => {
    if (currentView.type === ViewTypes.PURCHASE_INFO) {
      fetchPurchaseTableByMycaUser({
        storeId: undefined,
        genreHandle: undefined,
      });
    }
  }, [currentView, fetchPurchaseTableByMycaUser]);

  // purchaseTablesが初回更新されたら選択肢を作成（初回のみ）
  useEffect(() => {
    if (purchaseTables.length > 0 && !isFilterOptionsCreated) {
      createFilterOptions(purchaseTables);
      setIsFilterOptionsCreated(true);
    }
  }, [purchaseTables, createFilterOptions, isFilterOptionsCreated]);

  return (
    <>
      <Box sx={{ px: 2 }}>
        {/* ヘッダー */}
        <HeaderWithBackButton
          onBack={onBack}
          title="買取情報"
          custom={
            <Button
              variant="contained"
              color="inherit"
              size="small"
              onClick={() => setIsModalOpen(true)}
              sx={{
                bgcolor: '#aaaaaa',
                color: 'white',
                '&:hover': {
                  bgcolor: '#999999',
                },
              }}
              disabled={isLoading}
            >
              絞り込み
            </Button>
          }
        />

        {/* 買取表list */}
        {isLoading ? (
          <Loader
            sx={{
              bgcolor: 'transparent',
              height: '80vh',
            }}
          />
        ) : (
          groupPurchaseTables(purchaseTables).map((purchaseInfo) => (
            <PurchaseInfoCard
              key={purchaseInfo.groupId}
              purchaseInfo={purchaseInfo}
              posCustomerStoresInfos={posCustomerStoresInfos}
            />
          ))
        )}
      </Box>

      {/* 絞り込みモーダル */}
      <PurchaseInfoModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableGenres={availableGenres}
        availableStores={availableStores}
        handleFilterChange={handleFilterChange}
        selectedStoreId={selectedStoreId}
      />
    </>
  );
};

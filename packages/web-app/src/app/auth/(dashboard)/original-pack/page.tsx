'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/contexts/StoreContext';
import { PATH } from '@/constants/paths';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { OriginalPackTabTable } from '@/feature/originalPack/components/OriginalPackTabTable';
import { OriginalPackDisassembly } from '@/feature/originalPack/disassembly/components/OriginalPackDisassembly';
import { ItemAPIRes } from '@/api/frontend/item/api';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { useItems } from '@/feature/item/hooks/useItems';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { ItemGetAllOrderType } from '@/feature/products/components/searchTable/const';
import { ItemType } from '@prisma/client';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import { useSaveLocalStorageOriginalPack } from '@/app/auth/(dashboard)/original-pack/create/components/confirm/hooks/useSaveLocalStorageOriginalPack';

export type OriginalPackItemType = ItemAPIRes['getAll']['items'][0];

export type OriginalPackProduct =
  BackendProductAPI[0]['response'][200]['products'][0] & {
    processId: string;
    mean_wholesale_price: number;
    item_count: number;
    max_count: number;
  };

export default function OriginalPackPage() {
  const { store } = useStore();
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  // 復元確認モーダル表示
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  // オリパ・福袋一覧取得
  const {
    items: originalPacks,
    fetchTypeItems,
    searchParams,
    setSearchParams,
  } = useItems();

  // 選択されたオリパ・福袋
  const [selectedOriginalPack, setSelectedOriginalPack] =
    useState<OriginalPackItemType | null>(null);
  // フロントで扱うオリパに含まれるプロダクト一覧
  const [originalPackProducts, setOriginalPackProducts] = useState<
    OriginalPackProduct[]
  >([]);
  // ジャンル・カテゴリ一覧取得
  const { genre, fetchGenreList } = useGenre();
  const { category, fetchCategoryList } = useCategory();

  // ローカルストレージ操作
  const { clearLocalStorageItem, getLocalStorageItem } =
    useSaveLocalStorageOriginalPack();

  // タブクリックのハンドラ
  const handleTabClick = (value: string) => {
    switch (value) {
      case 'STOCK':
        setSearchParams((prev) => ({
          ...prev,
          hasStock: true,
          asDraft: undefined,
        }));
        break;

      case 'NO_STOCK':
        setSearchParams((prev) => ({
          ...prev,
          hasStock: false,
          asDraft: undefined,
        }));
        break;

      case 'DRAFT':
        setSearchParams((prev) => ({
          ...prev,
          hasStock: undefined,
          asDraft: true,
        }));
        break;

      case 'ALL':
        setSearchParams((prev) => ({
          ...prev,
          hasStock: undefined,
          asDraft: undefined,
        }));
        break;

      default:
        break;
    }
  };

  // 全てクリアするハンドラ
  const handleClearAll = () => {
    setOriginalPackProducts([]);
    setSelectedOriginalPack(null);
    setSearchParams({
      genreId: undefined,
      categoryId: undefined,
      orderBy: undefined,
      hasStock: undefined,
    });
  };

  // ジャンルによるフィルタリングのハンドラ
  const handleGenreFilter = (genreDisplayName: string) => {
    const genreId = genre?.itemGenres?.find(
      (genre) => genre.display_name === genreDisplayName,
    )?.id;
    if (genreId) {
      setSearchParams((prev) => ({ ...prev, genreId }));
    } else {
      setSearchParams((prev) => ({ ...prev, genreId: undefined }));
    }
  };

  // カテゴリによるフィルタリングのハンドラ
  const handleCategoryFilter = (categoryDisplayName: string) => {
    const categoryId = category?.itemCategories?.find(
      (category) => category.display_name === categoryDisplayName,
    )?.id;
    if (categoryId) {
      setSearchParams((prev) => ({ ...prev, categoryId }));
    } else {
      setSearchParams((prev) => ({ ...prev, categoryId: undefined }));
    }
  };

  // 作成日によるソートのハンドラ
  const handleSortByCreatedAt = (direction: 'asc' | 'desc') => {
    const orderBy =
      direction === 'asc'
        ? ItemGetAllOrderType.IdAsc
        : ItemGetAllOrderType.IdDesc;
    setSearchParams((prev) => ({ ...prev, orderBy: orderBy }));
  };

  // フィルタリング条件が変更された場合に再取得
  useEffect(() => {
    setIsLoading(true);
    fetchTypeItems(store.id, undefined, ItemType.ORIGINAL_PACK);
  }, [searchParams, store.id, fetchTypeItems]);

  // loading 状態の変更
  useEffect(() => {
    if (originalPacks) {
      setIsLoading(false);
    }
  }, [originalPacks]);

  // ジャンル・カテゴリ一覧取得
  useEffect(() => {
    fetchGenreList();
    fetchCategoryList();
  }, [fetchGenreList, fetchCategoryList]);

  // 解体ページ
  const [isDisassembling, setIsDisassembling] = useState(false);
  // 遷移ハンドラ
  const handleDisassemble = () => {
    if (originalPackProducts && originalPackProducts.length !== 0) {
      setIsDisassembling(true);
    }
  };

  // 最初へ戻るハンドラ
  const handleBack = () => {
    setIsDisassembling(false);
    handleClearAll();
  };

  //プロセスIDの取得
  useEffect(() => {
    if (originalPacks) {
      setIsLoading(false);
    }
  }, [originalPacks]);

  // 復元しない
  const handleRestoreModalCancel = () => {
    clearLocalStorageItem();
    push(PATH.ORIGINAL_PACK.create);
  };
  //復元するデータがあるかどうか
  const isRestoreData = getLocalStorageItem(-1).length !== 0;

  return (
    <>
      {!isDisassembling ? (
        <ContainerLayout
          title="オリパ・福袋・デッキ作成"
          helpArchivesNumber={559}
          actions={
            <PrimaryButtonWithIcon
              onClick={() =>
                isRestoreData
                  ? setIsRestoreModalOpen(true)
                  : push(PATH.ORIGINAL_PACK.create)
              }
            >
              新規オリパ・福袋・デッキ作成
            </PrimaryButtonWithIcon>
          }
        >
          <OriginalPackTabTable
            originalPacks={originalPacks ?? []}
            onTabChange={handleTabClick}
            itemGenres={genre?.itemGenres ?? []}
            itemCategories={category?.itemCategories ?? []}
            onGenreFilter={handleGenreFilter}
            onCategoryFilter={handleCategoryFilter}
            onSortByCreatedAt={handleSortByCreatedAt}
            isLoading={isLoading}
            selectedOriginalPack={selectedOriginalPack}
            setSelectedOriginalPack={setSelectedOriginalPack}
            originalPackProducts={originalPackProducts}
            setOriginalPackProducts={setOriginalPackProducts}
            handleDisassemble={handleDisassemble}
            fetchTypeItems={fetchTypeItems}
          />
        </ContainerLayout>
      ) : (
        <OriginalPackDisassembly
          storeId={store.id}
          originalPack={selectedOriginalPack}
          originalPackProducts={originalPackProducts}
          setOriginalPackProducts={setOriginalPackProducts}
          onCancel={handleBack}
        />
      )}

      {/* 新規作成localStorage復元確認モーダル */}
      <ConfirmationDialog
        open={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        title="入力データ復元"
        message="入力中のデータがあります。復元しますか？"
        confirmButtonText="復元"
        onConfirm={() => push(PATH.ORIGINAL_PACK.create)}
        cancelButtonText="復元しない"
        onCancel={handleRestoreModalCancel}
      />
    </>
  );
}

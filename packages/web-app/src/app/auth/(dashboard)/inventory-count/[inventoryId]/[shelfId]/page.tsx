'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Stack } from '@mui/material';

import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';

import { useShelf } from '@/feature/inventory-count/hook/useShelf';
import { useInventoryConvert } from '@/feature/inventory-count/hook/useInventoryConvert';
import { useUpdateInventory } from '@/feature/inventory-count/hook/useUpdateInventory';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { useGenre } from '@/feature/genre/hooks/useGenre';

import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { InventoryProductEditTable } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryProductEditTable';
import {
  InventoryAddModal,
  CartItem,
} from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/components/InventoryAddModal';

import { PATH } from '@/constants/paths';
import { Categories } from '@/feature/category/hooks/useCategory';
import { Genres } from '@/feature/genre/hooks/useGenre';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { useInventoryProducts } from '@/feature/inventory-count/hook/useInventoryProducts';
import { useInventoryCount } from '@/feature/inventory-count/hook/useInventoryCount';
export type ShelfProduct =
  BackendProductAPI[0]['response']['200']['products'][0] & {
    shelf_item_id: string;
    shelf_id: number;
    shelf_name: string;
    item_count: number;
    item_count_in_other_shelf: number;
  };

// ----------------------
// 在庫編集ページコンポーネント本体
// ----------------------
export default function InventoryCountEditPage() {
  // --- 基本情報取得
  const { inventoryId, shelfId } = useParams();
  const { store, stores } = useStore();
  const { setAlertState } = useAlert();
  const { data: session } = useSession();
  const router = useRouter();

  // --- フック群
  const { inventoryProducts, fetchInventoryProducts } = useInventoryProducts();
  const { fetchData, rows: inventories } = useInventoryCount(store.id, stores);
  const { fetchShelf, shelf } = useShelf();
  const { fetchCategoryList } = useCategory();
  const { fetchGenreList } = useGenre();
  const {
    APIResponseDataToShelfProducts,
    shelfProductsToAPIRequestData,
    APIResponseDataToAPIRequestData,
    isLoading: isConverting,
  } = useInventoryConvert();
  const { updateInventory, isLoading: isUpdating } = useUpdateInventory();

  // --- state定義
  const [shelfProducts, setShelfProducts] = useState<ShelfProduct[]>([]);
  const [categories, setCategories] = useState<Categories>({
    itemCategories: [],
  });
  const [genres, setGenres] = useState<Genres>({ itemGenres: [] });
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);

  // --- 変換済みIDなど
  const staffAccountID = session?.user?.id;
  const inventoryID = Number(inventoryId);
  const shelfID = Number(shelfId);

  // ----------------------
  // 初期データ取得：棚と棚卸データ
  // ----------------------
  useEffect(() => {
    fetchInventoryProducts({ inventoryId: inventoryID, take: -1 });
    fetchData({ id: inventoryID });
    fetchShelf(shelfID);
  }, [store.id, inventoryID, shelfID]);

  // ----------------------
  // データ変換・カテゴリ・ジャンル取得
  // ----------------------
  useEffect(() => {
    const productsInShelf = inventoryProducts.filter(
      (p) => p.shelf_id === shelfID,
    );
    APIResponseDataToShelfProducts(productsInShelf, shelfID).then(
      setShelfProducts,
    );

    const currentInventory = inventories[0];

    if (!currentInventory) return;

    const categoryIds = new Set(currentInventory.categoryIds);
    fetchCategoryList().then((all) => {
      if (all) {
        setCategories({
          ...all,
          itemCategories: (all.itemCategories ?? []).filter((c) =>
            categoryIds.has(c.id),
          ),
        });
      }
    });

    const genreIds = new Set(currentInventory.genreIds);
    fetchGenreList().then((all) => {
      if (all) {
        setGenres({
          ...all,
          itemGenres: all.itemGenres.filter((g) => genreIds.has(g.id)),
        });
      }
    });
  }, [inventoryProducts, shelfID]);

  // ----------------------
  // 商品追加処理
  // ----------------------
  const handleAddShelfProduct = useCallback(
    (products: CartItem[]) => {
      if (!shelf) {
        setAlertState({ message: '棚が指定されていません', severity: 'error' });
        return;
      }

      const newProducts = products.map((p) => {
        const others =
          inventoryProducts.filter(
            (i) => i.shelf_id !== shelfID && i.product_id === p.id,
          ) ?? [];

        const countInOthers = others.reduce((sum, i) => sum + i.item_count, 0);

        return {
          ...p,
          shelf_item_id: p.cart_item_id,
          shelf_id: shelf.id,
          shelf_name: shelf.display_name,
          item_count: p.count,
          item_count_in_other_shelf: countInOthers,
        };
      });

      setShelfProducts([...shelfProducts, ...newProducts]);
      setIsOpenAddModal(false);
    },
    [shelf, shelfProducts, inventories, setAlertState],
  );

  // ----------------------
  // 登録処理
  // ----------------------
  const handleSubmitProducts = useCallback(async () => {
    if (!staffAccountID) {
      return setAlertState({
        message: 'スタッフアカウントIDを指定してください',
        severity: 'error',
      });
    }
    if (!inventories?.[0]) {
      return setAlertState({
        message: 'inventoryが取得できていません',
        severity: 'error',
      });
    }

    const currentInventory = inventories[0];

    const otherShelfProducts =
      APIResponseDataToAPIRequestData(
        inventoryProducts.filter((p) => p.shelf_id !== shelfID),
        staffAccountID,
      ) ?? [];

    const thisShelfProducts =
      (await shelfProductsToAPIRequestData(shelfProducts, staffAccountID)) ??
      [];

    // 重複している商品をまとめる
    const mergedThisShelfProducts = thisShelfProducts.reduce(
      (acc, current) => {
        const existingIndex = acc.findIndex(
          (item) => item.product_id === current.product_id,
        );

        if (existingIndex !== -1) {
          // 既存の商品がある場合は数量を合計
          acc[existingIndex].item_count += current.item_count;
        } else {
          // 新しい商品の場合は追加
          acc.push({ ...current });
        }

        return acc;
      },
      [] as typeof thisShelfProducts,
    );

    const { ok } = await updateInventory(currentInventory.id, [
      ...otherShelfProducts,
      ...mergedThisShelfProducts,
    ]);

    if (ok) {
      router.push(
        `${PATH.INVENTORY_COUNT.root}?idToOpen=${currentInventory.id}`,
      );
    }
  }, [staffAccountID, inventories, shelfProducts]);

  // ----------------------
  // レンダリング
  // ----------------------
  console.log('shelfProducts: ', shelfProducts);
  return (
    <ContainerLayout
      actions={
        <PrimaryButton onClick={() => setIsOpenAddModal(true)}>
          検索して商品を登録
        </PrimaryButton>
      }
      title={
        (inventories &&
          shelf &&
          `${inventories[0]?.title} (${shelf.display_name}) 進行状況`) ||
        ''
      }
      helpArchivesNumber={590}
      description={
        inventories &&
        `登録数(棚合計) ${
          inventories[0]?.inputCount?.toLocaleString() || 0
        }点/理論在庫総数${inventories[0]?.targetCount?.toLocaleString() || 0}点`
      }
      descriptionAlign="left"
    >
      <Stack sx={{ height: '100%' }}>
        <InventoryProductEditTable
          shelfProducts={shelfProducts}
          setShelfProducts={setShelfProducts}
          handleSubmitProducts={handleSubmitProducts}
          handleAddShelfProduct={handleAddShelfProduct}
          loading={isConverting}
          submitLoading={isUpdating}
          categories={categories}
        />
      </Stack>

      {isOpenAddModal && (
        <InventoryAddModal
          isOpen={isOpenAddModal}
          onClose={() => setIsOpenAddModal(false)}
          handleAddShelfProduct={handleAddShelfProduct}
          categories={categories}
        />
      )}
    </ContainerLayout>
  );
}

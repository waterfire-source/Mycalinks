import { EnclosedModalButton } from '@/app/auth/(dashboard)/original-pack/create/components/addProduct/enclosedProduct/EnclosedModalButton';
import { EnclosedProduct } from '@/app/auth/(dashboard)/original-pack/create/components/addProduct/enclosedProduct/EnclosedSelectModal';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { ItemImage } from '@/feature/item/components/ItemImage';
import {
  ColumnDef,
  CustomTabTable,
  TabDef,
} from '@/components/tabs/CustomTabTable';
import { ConditionChip } from '@/feature/products/components/ConditionChip';
import { IconButton, Typography } from '@mui/material';
import { useEnclosedProductContext } from '@/app/auth/(dashboard)/original-pack/create/context/EnclosedProductContext';
import { Delete } from '@mui/icons-material';
import { OriginalPackListTableFooter } from '@/app/auth/(dashboard)/original-pack/create/components/list/OriginalPackListTableFooter';
import { QuantityControlField } from '@/components/inputFields/QuantityControlField';
import { useSearchParams } from 'next/navigation';
import { ItemText } from '@/feature/item/components/ItemText';
import { useEffect, useMemo } from 'react';
import { getConditionDisplayName } from '@/feature/products/utils/conditionDisplayName';
import { useSaveLocalStorageOriginalPack } from '@/app/auth/(dashboard)/original-pack/create/components/confirm/hooks/useSaveLocalStorageOriginalPack';

interface Props {
  onConfirm: () => void;
}
export const OriginalPackCreateAddProductView = ({ onConfirm }: Props) => {
  // TODO: フィルターのロジック決まったらジェネリクスで型を渡す
  const tabs: TabDef<EnclosedProduct>[] = [
    {
      label: 'すべて',
      value: 'ALL',
    },
  ];
  const {
    enclosedProducts,
    deleteEnclosedProduct,
    handleItemCountChange,
    handleSetEnclosedProducts,
    refreshEnclosedProducts,
  } = useEnclosedProductContext();
  const { getLocalStorageItem, saveLocalStorageItem } =
    useSaveLocalStorageOriginalPack();

  //補充機能の有無を判定
  const searchParams = useSearchParams();
  const isReplenishment = searchParams.get('replenishment') === 'true';
  const id = searchParams.get('id');

  const containerTitle = useMemo(() => {
    if (isReplenishment) {
      return 'オリパ・福袋・デッキ補充';
    } else if (id) {
      return 'オリパ・福袋・デッキ編集';
    } else {
      return 'オリパ・福袋・デッキ作成';
    }
  }, [isReplenishment, id]);

  /**
   * 新規作成時初期データ読み込み用Effect
   */
  const NEW_PACK_STORAGE_ID = -1;
  // LocalStorageにid=-1(新規作成時のid)のデータがあったら取得
  useEffect(() => {
    if (isReplenishment || id) return;

    const saved = getLocalStorageItem(NEW_PACK_STORAGE_ID) as EnclosedProduct[];
    if (saved && saved.length > 0) {
      handleSetEnclosedProducts(saved);
    }
  }, [id, isReplenishment]);

  /**
   * 新規作成時自動保存用Effect
   */
  // enclosedProductsが変化するたびlocalStorageに保存
  useEffect(() => {
    if (isReplenishment || id) return;

    saveLocalStorageItem(NEW_PACK_STORAGE_ID, enclosedProducts);
  }, [enclosedProducts]);

  /**
   * ページ表示時および初回ロード直後に最新の商品データを取得
   */
  useEffect(() => {
    if (enclosedProducts.length > 0) {
      // 追加済みの商品があれば最新化
      refreshEnclosedProducts();
    }
    // 初回は依存なしで一度だけ。enclosedProductsは上の条件で見る
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // localStorageや編集モードから初めて商品が入ってきたタイミングで最新化
  useEffect(() => {
    if (enclosedProducts.length === 0) return;
    refreshEnclosedProducts();
    // 一度最新化できれば十分。ループ回避のため、商品配列の長さだけ監視
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enclosedProducts.length]);

  return (
    <ContainerLayout
      title={containerTitle}
      actions={<EnclosedModalButton />}
      helpArchivesNumber={559}
      description="全オリパ・福袋・デッキの合計封入数を登録してください。"
    >
      <CustomTabTable
        data={enclosedProducts}
        columns={getColumns(
          deleteEnclosedProduct,
          handleItemCountChange,
          isReplenishment,
        )}
        tabs={tabs}
        rowKey={(item) => item.id}
        onTabChange={() => {
          // TODO: 担当者でのフィルター
        }}
        customFooter={<OriginalPackListTableFooter onConfirm={onConfirm} />}
      />
    </ContainerLayout>
  );
};

const getColumns = (
  deleteEnclosedProduct: (id: number) => void,
  handleItemCountChange: (product: EnclosedProduct, quantity: number) => void,
  isReplenishment: boolean = false,
): ColumnDef<EnclosedProduct>[] => {
  return [
    {
      header: '商品画像',
      key: 'image_url',
      sx: {
        width: '100px',
      },
      render: (product) => <ItemImage imageUrl={product.image_url} />,
    },
    {
      header: '商品名',
      key: 'display_name',
      render: (product) => <ItemText text={product.displayNameWithMeta} />,
    },
    {
      header: '状態',
      key: 'status',
      render: (product) => (
        <ConditionChip condition={getConditionDisplayName(product)} />
      ),
    },
    {
      header: '仕入れ値',
      key: 'mean_wholesale_price',
      render: (product) => (
        <Typography>
          {product.mean_wholesale_price?.toLocaleString()}円
        </Typography>
      ),
    },
    {
      header: '販売価格',
      key: 'actual_sell_price',
      render: (product) => (
        <Typography>
          {product.actual_sell_price === null
            ? '-'
            : `${product.actual_sell_price.toLocaleString()}円`}
        </Typography>
      ),
    },
    {
      header: '在庫数',
      key: 'stock_number',
      render: (product) => (
        <Typography>
          {product.is_infinite_stock
            ? '∞'
            : `${product.stock_number} → ${
                product.stock_number - (product.item_count ?? 0)
              }`}
        </Typography>
      ),
    },
    {
      header: isReplenishment ? '補充数' : '封入数',
      key: 'item_count',
      render: (product) => (
        <QuantityControlField
          quantity={product.item_count ?? 0}
          onQuantityChange={(quantity) => {
            handleItemCountChange(product, quantity);
          }}
          minQuantity={1}
          containerSx={{
            width: '100px',
            alignSelf: 'center',
          }}
        />
      ),
      sx: {
        width: '100px',
        alignSelf: 'center',
      },
    },
    {
      header: '',
      key: 'delete',
      render: (product) => (
        <IconButton onClick={() => deleteEnclosedProduct(product.id)}>
          <Delete />
        </IconButton>
      ),
    },
  ];
};

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClientAPI, CustomError } from '@/api/implement';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { MycaPosApiClient, ItemService } from 'api-generator/client';
import { useStore } from '@/contexts/StoreContext';

// ===== 型 =====
export type PackInfo = BackendItemAPI[6]['response']['200']['itemsInPack'][0];
export type ItemInfo = BackendItemAPI[0]['response']['200']['items'][0];
export type PackBoxInfo = Awaited<
  ReturnType<ItemService['getPackItemBoxDef']>
>['boxItems'];
export type CartonBoxInfo = ItemInfo['inner_box_item'] | undefined;

export type ProductType = 'PACK' | 'BOX' | 'CARTON' | 'OTHER' | 'LOADING';

// 変換用の共通情報型
export type ConversionItemInfo = {
  id: number;
  pos_item_id?: number;
  display_name: string;
  displayNameWithMeta: string;
  image_url?: string | null;
  pack_count?: number;
  box_count?: number;
  carton_count?: number;
};

// 変換元情報（ConversionItemInfoと同様の統一形式）
export type ConversionSourceInfo = {
  productType: ProductType;
  currentItem: ConversionItemInfo;
  // 各変換で必要な追加情報
  packCountPerBox?: number; // ボックスあたりのパック数
  boxCountPerCarton?: number; // カートンあたりのボックス数
  originalItemInfo?: ItemInfo; // 元のItemInfo（API呼び出し用）
};

// 変換先情報（変換タイプごとに適切な情報を含む）
export type ConversionTargetInfo = {
  packItems?: ConversionItemInfo[]; // BOX_TO_PACK用
  boxItems?: ConversionItemInfo[]; // PACK_TO_BOX用
  cartonItem?: ConversionItemInfo; // BOX_TO_CARTON用
  boxItem?: ConversionItemInfo; // CARTON_TO_BOX用
};

export type AvailableAction = {
  type: 'PACK_TO_BOX' | 'BOX_TO_PACK' | 'BOX_TO_CARTON' | 'CARTON_TO_BOX';
  label: string;
  description: string;
  sourceInfo: ConversionSourceInfo;
  targetInfo: ConversionTargetInfo;
};

export type UseCheckBoxInfoArgs = {
  itemId: number;
  enabled?: boolean; // 取得を有効化/無効化
  clearOnRefetch?: boolean; // 再フェッチ時に既存データを消すか（既定: false）
};

// ===== 判定（純関数） =====
const classifyProductType = (args: {
  loading: boolean;
  itemInfo?: ItemInfo;
  packInfo?: PackInfo[];
  packBoxInfo?: PackBoxInfo;
  cartonBoxInfo?: CartonBoxInfo;
  enabled: boolean;
}): ProductType => {
  //todo:カートン情報とパック情報を持たないBOXはOTHERになってしまう。
  const { loading, itemInfo, packInfo, packBoxInfo, cartonBoxInfo, enabled } =
    args;
  if (!enabled) return 'OTHER';

  const nothing = !itemInfo && !packInfo && !packBoxInfo && !cartonBoxInfo;
  if (loading && nothing) return 'LOADING';

  //CARTON:内部にボックス情報を持つ
  if (itemInfo?.inner_box_item) return 'CARTON';

  //BOX:内部に親カートン情報を持つ or パック情報を持つ
  if (itemInfo?.carton_item_id) return 'BOX';

  //PACK:カートン情報を持たない and ボックス情報を持たない and 親のボックス情報を持つ
  if (packBoxInfo && !itemInfo?.carton_item_id && !itemInfo?.inner_box_item)
    return 'PACK';

  //PACKもパック情報を持つため、上記のPACK判定の後に行う
  if (Array.isArray(packInfo) && packInfo.length > 0) return 'BOX';
  return 'OTHER';
};

// ===== データ変換ヘルパー関数 =====
const convertPackInfoToConversionItems = (
  packInfo: PackInfo[],
): ConversionItemInfo[] => {
  return packInfo.map((item) => ({
    id: item.pos_item_id || 0,
    pos_item_id: item.pos_item_id,
    display_name: item.display_name || '',
    displayNameWithMeta: item.displayNameWithMeta || item.display_name || '',
    image_url: item.image_url,
    pack_count: 1,
  }));
};

const convertPackBoxInfoToConversionItems = (
  packBoxInfo: PackBoxInfo,
): ConversionItemInfo[] => {
  return packBoxInfo.map((item) => ({
    id: item.pos_item_info?.id || 0,
    pos_item_id: item.pos_item_info?.id,
    display_name: item.display_name || '',
    displayNameWithMeta: item.displayNameWithMeta || item.display_name || '',
    image_url: item.image_url,
    box_count: 1,
  }));
};

const convertItemInfoToConversionItem = (
  itemInfo: ItemInfo,
): ConversionItemInfo => {
  return {
    id: itemInfo.id,
    pos_item_id: itemInfo.id,
    display_name: itemInfo.display_name || '',
    displayNameWithMeta:
      itemInfo.displayNameWithMeta || itemInfo.display_name || '',
    image_url: itemInfo.image_url,
    carton_count: 1,
  };
};

const convertCartonBoxInfoToConversionItem = (
  cartonBoxInfo: CartonBoxInfo,
): ConversionItemInfo | undefined => {
  if (!cartonBoxInfo) return undefined;
  return {
    id: cartonBoxInfo.id,
    pos_item_id: cartonBoxInfo.id,
    display_name: cartonBoxInfo.display_name || '',
    displayNameWithMeta: cartonBoxInfo.display_name || '',
    image_url: cartonBoxInfo.image_url,
    box_count: 1,
  };
};

// ===== SourceInfo生成ヘルパー関数 =====
const createSourceInfoFromItemInfo = (
  itemInfo: ItemInfo,
  productType: ProductType,
): ConversionSourceInfo => {
  return {
    productType,
    currentItem: {
      id: itemInfo.id,
      pos_item_id: itemInfo.id,
      display_name: itemInfo.display_name || '',
      displayNameWithMeta:
        itemInfo.displayNameWithMeta || itemInfo.display_name || '',
      image_url: itemInfo.image_url,
      pack_count: productType === 'PACK' ? 1 : undefined,
      box_count: productType === 'BOX' ? 1 : undefined,
      carton_count: productType === 'CARTON' ? 1 : undefined,
    },
    packCountPerBox: itemInfo.box_pack_count || undefined,
    boxCountPerCarton: itemInfo.box_pack_count || undefined,
    originalItemInfo: itemInfo,
  };
};

const createSourceInfoFromPackInfo = (
  packInfo: PackInfo,
): ConversionSourceInfo => {
  return {
    productType: 'PACK',
    currentItem: {
      id: packInfo.pos_item_id || 0,
      pos_item_id: packInfo.pos_item_id,
      display_name: packInfo.display_name || '',
      displayNameWithMeta:
        packInfo.displayNameWithMeta || packInfo.display_name || '',
      image_url: packInfo.image_url,
      pack_count: 1,
    },
    originalItemInfo: undefined, // PackInfoからは完全なItemInfoは取得不可
  };
};

const createSourceInfoFromPackBoxInfo = (
  packBoxInfo: PackBoxInfo[0],
): ConversionSourceInfo => {
  return {
    productType: 'BOX',
    currentItem: {
      id: packBoxInfo.pos_item_info?.id || 0,
      pos_item_id: packBoxInfo.pos_item_info?.id,
      display_name: packBoxInfo.display_name || '',
      displayNameWithMeta:
        packBoxInfo.displayNameWithMeta || packBoxInfo.display_name || '',
      image_url: packBoxInfo.image_url,
      box_count: 1,
    },
    packCountPerBox: packBoxInfo.pos_item_info?.box_pack_count ?? undefined,
    originalItemInfo: packBoxInfo.pos_item_info as any, // 型の互換性問題を回避
  };
};

// ===== Hook =====
export const useCheckBoxInfo = ({
  itemId,
  enabled = true,
  clearOnRefetch = false,
}: UseCheckBoxInfoArgs) => {
  const { store } = useStore();
  const storeId = store.id;
  // クライアントは安定化
  const apiClient = useMemo(() => createClientAPI(), []);
  const mycaPosApiClient = useMemo(
    () =>
      new MycaPosApiClient({ BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api` }),
    [],
  );

  // 状態
  const [itemInfo, setItemInfo] = useState<ItemInfo | undefined>(undefined);
  const [packInfo, setPackInfo] = useState<PackInfo[] | undefined>(undefined);
  const [packBoxInfo, setPackBoxInfo] = useState<PackBoxInfo | undefined>(
    undefined,
  );
  const [cartonBoxInfo, setCartonBoxInfo] = useState<CartonBoxInfo>(undefined);
  const [cartonInfo, setCartonInfo] = useState<ItemInfo | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // レース対策
  const requestIdRef = useRef(0);

  const productType: ProductType = useMemo(
    () =>
      classifyProductType({
        loading,
        itemInfo,
        packInfo,
        packBoxInfo,
        cartonBoxInfo,
        enabled,
      }),
    [loading, itemInfo, packInfo, packBoxInfo, cartonBoxInfo, enabled],
  );

  // 双方向変換対応のアクション生成
  const availableActions: AvailableAction[] = useMemo(() => {
    const actions: AvailableAction[] = [];

    if (!itemInfo) return actions;

    // PACK ⇔ BOX の双方向変換
    // パック→ボックス（packBoxInfoがある場合）
    if (packBoxInfo && packBoxInfo.length > 0) {
      // パックが変換元の場合のsourceInfo
      const packSourceInfo = createSourceInfoFromItemInfo(itemInfo, 'PACK');

      actions.push({
        type: 'PACK_TO_BOX',
        label: 'ボックスにまとめる',
        description: 'パックをボックスに統合します',
        sourceInfo: packSourceInfo,
        targetInfo: {
          boxItems: convertPackBoxInfoToConversionItems(packBoxInfo),
        },
      });

      // 同じ関係で逆方向（ボックス→パック）も可能
      // ボックスが変換元の場合のsourceInfo（packBoxInfoの各ボックス情報を基に）
      packBoxInfo.forEach((boxInfo) => {
        const boxSourceInfo = createSourceInfoFromPackBoxInfo(boxInfo);

        const reversePackItems: ConversionItemInfo[] = [
          {
            id: itemInfo?.id || 0,
            pos_item_id: itemInfo?.id,
            display_name: itemInfo?.display_name || '',
            displayNameWithMeta:
              itemInfo?.displayNameWithMeta || itemInfo?.display_name || '',
            image_url: itemInfo?.image_url,
            pack_count: 1,
          },
        ];

        // 重複チェック：同じボックスからのBOX_TO_PACKがまだなければ追加
        if (
          !actions.find(
            (a) =>
              a.type === 'BOX_TO_PACK' &&
              a.sourceInfo.currentItem.id === boxInfo.pos_item_info?.id,
          )
        ) {
          actions.push({
            type: 'BOX_TO_PACK',
            label: 'パックに分割',
            description: 'ボックスをパックに分割します',
            sourceInfo: boxSourceInfo,
            targetInfo: { packItems: reversePackItems },
          });
        }
      });
    }

    // ボックス→パック（packInfoがあり、上記で追加されていない場合）
    if (
      packInfo &&
      packInfo.length > 0 &&
      !actions.find((a) => a.type === 'BOX_TO_PACK')
    ) {
      // ボックスが変換元の場合のsourceInfo
      const boxSourceInfo = createSourceInfoFromItemInfo(itemInfo, 'BOX');

      actions.push({
        type: 'BOX_TO_PACK',
        label: 'パックに分割',
        description: 'ボックスをパックに分割します',
        sourceInfo: boxSourceInfo,
        targetInfo: { packItems: convertPackInfoToConversionItems(packInfo) },
      });

      // 同じ関係で逆方向（パック→ボックス）も可能
      packInfo.forEach((packItem) => {
        const packSourceInfo = createSourceInfoFromPackInfo(packItem);

        const reverseBoxItems: ConversionItemInfo[] = [
          {
            id: itemInfo?.id || 0,
            pos_item_id: itemInfo?.id,
            display_name: itemInfo?.display_name || '',
            displayNameWithMeta:
              itemInfo?.displayNameWithMeta || itemInfo?.display_name || '',
            image_url: itemInfo?.image_url,
            box_count: 1,
          },
        ];

        // 重複チェック：同じパックからのPACK_TO_BOXがまだなければ追加
        if (
          !actions.find(
            (a) =>
              a.type === 'PACK_TO_BOX' &&
              a.sourceInfo.currentItem.id === packItem.pos_item_id,
          )
        ) {
          actions.push({
            type: 'PACK_TO_BOX',
            label: 'ボックスにまとめる',
            description: 'パックをボックスに統合します',
            sourceInfo: packSourceInfo,
            targetInfo: { boxItems: reverseBoxItems },
          });
        }
      });
    }

    // BOX ⇔ CARTON の双方向変換
    // ボックス→カートン（cartonInfoがある場合）
    if (cartonInfo) {
      // ボックスが変換元の場合のsourceInfo
      const boxSourceInfo = createSourceInfoFromItemInfo(itemInfo, 'BOX');

      actions.push({
        type: 'BOX_TO_CARTON',
        label: 'カートンにまとめる',
        description: 'ボックスをカートンに統合します',
        sourceInfo: boxSourceInfo,
        targetInfo: { cartonItem: convertItemInfoToConversionItem(cartonInfo) },
      });

      // 同じ関係で逆方向（カートン→ボックス）も可能
      // カートンが変換元の場合のsourceInfo
      const cartonSourceInfo = createSourceInfoFromItemInfo(
        cartonInfo,
        'CARTON',
      );

      const reverseBoxItem: ConversionItemInfo = {
        id: itemInfo?.id || 0,
        pos_item_id: itemInfo?.id,
        display_name: itemInfo?.display_name || '',
        displayNameWithMeta:
          itemInfo?.displayNameWithMeta || itemInfo?.display_name || '',
        image_url: itemInfo?.image_url,
        box_count: 1,
      };

      actions.push({
        type: 'CARTON_TO_BOX',
        label: 'ボックスに分割',
        description: 'カートンをボックスに分割します',
        sourceInfo: cartonSourceInfo,
        targetInfo: { boxItem: reverseBoxItem },
      });
    }

    // カートン→ボックス（cartonBoxInfoがあり、上記で追加されていない場合）
    if (cartonBoxInfo && !actions.find((a) => a.type === 'CARTON_TO_BOX')) {
      // カートンが変換元の場合のsourceInfo
      const cartonSourceInfo = createSourceInfoFromItemInfo(itemInfo, 'CARTON');

      const boxItem = convertCartonBoxInfoToConversionItem(cartonBoxInfo);
      if (boxItem) {
        actions.push({
          type: 'CARTON_TO_BOX',
          label: 'ボックスに分割',
          description: 'カートンをボックスに分割します',
          sourceInfo: cartonSourceInfo,
          targetInfo: { boxItem },
        });

        // 同じ関係で逆方向（ボックス→カートン）も可能
        // ボックスが変換元の場合のsourceInfo（cartonBoxInfoを基に）
        const boxSourceInfo: ConversionSourceInfo = {
          productType: 'BOX',
          currentItem: {
            id: cartonBoxInfo.id,
            pos_item_id: cartonBoxInfo.id,
            display_name: cartonBoxInfo.display_name || '',
            displayNameWithMeta: cartonBoxInfo.display_name || '',
            image_url: cartonBoxInfo.image_url,
            box_count: 1,
          },
          originalItemInfo: undefined, // CartonBoxInfoからは完全なItemInfoは取得不可
        };

        const reverseCartonItem: ConversionItemInfo = {
          id: itemInfo?.id || 0,
          pos_item_id: itemInfo?.id,
          display_name: itemInfo?.display_name || '',
          displayNameWithMeta:
            itemInfo?.displayNameWithMeta || itemInfo?.display_name || '',
          image_url: itemInfo?.image_url,
          carton_count: 1,
        };

        actions.push({
          type: 'BOX_TO_CARTON',
          label: 'カートンにまとめる',
          description: 'ボックスをカートンに統合します',
          sourceInfo: boxSourceInfo,
          targetInfo: { cartonItem: reverseCartonItem },
        });
      }
    }

    return actions;
  }, [itemInfo, packBoxInfo, packInfo, cartonInfo, cartonBoxInfo]);

  const fetchAllRelatedInfo = useCallback(async () => {
    if (!enabled) return;

    const reqId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    // 既存データの保持/クリアを選択
    if (clearOnRefetch) {
      setItemInfo(undefined);
      setPackInfo(undefined);
      setPackBoxInfo(undefined);
      setCartonBoxInfo(undefined);
      setCartonInfo(undefined);
    }

    // ---- ローカルに集約して最後に一括 set ----
    let _itemInfo: ItemInfo | undefined;
    let _packInfo: PackInfo[] | undefined;
    let _packBoxInfo: PackBoxInfo | undefined;
    let _cartonBoxInfo: CartonBoxInfo;
    let _cartonInfo: ItemInfo | undefined;

    try {
      // 1) 基本情報
      const itemRes = await apiClient.item.getAll({
        storeID: storeId,
        id: itemId,
        includesInnerBoxItemInfo: true,
      });

      //カートンの場合：ボックス情報を取得
      if (!(itemRes instanceof CustomError)) {
        _itemInfo = itemRes.items?.[0];
        if (_itemInfo?.inner_box_item)
          _cartonBoxInfo = _itemInfo.inner_box_item;

        //ボックスの場合：カートン情報を取得
        if (_itemInfo?.carton_item_id) {
          const cartonRes = await apiClient.item.getAll({
            storeID: storeId,
            id: _itemInfo.carton_item_id,
          });
          if (!(cartonRes instanceof CustomError))
            _cartonInfo = cartonRes.items?.[0];
        }
      }

      // 4xx が自然に落ちる場合があるので try/catch せず settled で扱う
      const [packRes, packBoxRes] = await Promise.allSettled([
        //ボックスの場合：パック情報を取得
        apiClient.item.getPackItem({
          storeID: storeId,
          item_id: itemId,
          isPack: true,
        }),
        //パックの場合：ボックス情報を取得
        mycaPosApiClient.item.getPackItemBoxDef({ storeId, itemId }),
      ]);

      if (
        packRes.status === 'fulfilled' &&
        !(packRes.value instanceof CustomError)
      ) {
        _packInfo = packRes.value.itemsInPack;
      }
      if (packBoxRes.status === 'fulfilled') {
        _packBoxInfo = packBoxRes.value.boxItems;
      }

      // レース負けは破棄
      if (requestIdRef.current !== reqId) return;

      setItemInfo(_itemInfo);
      setPackInfo(_packInfo);
      setPackBoxInfo(_packBoxInfo);
      setCartonBoxInfo(_cartonBoxInfo);
      setCartonInfo(_cartonInfo);
    } catch (e) {
      if (requestIdRef.current !== reqId) return;
      setError(e);
    } finally {
      if (requestIdRef.current === reqId) setLoading(false);
    }
  }, [apiClient, mycaPosApiClient, storeId, itemId, enabled, clearOnRefetch]);

  useEffect(() => {
    if (!enabled) {
      // 無効時は状態をクリア
      setItemInfo(undefined);
      setPackInfo(undefined);
      setPackBoxInfo(undefined);
      setCartonBoxInfo(undefined);
      setCartonInfo(undefined);
      setLoading(false);
      setError(null);
      return;
    }
    fetchAllRelatedInfo();
  }, [enabled, fetchAllRelatedInfo]);

  return {
    productType,
    itemInfo,
    packInfo,
    packBoxInfo,
    cartonBoxInfo,
    cartonInfo,
    availableActions,
    loading,
    error,
    refetch: fetchAllRelatedInfo,
  };
};

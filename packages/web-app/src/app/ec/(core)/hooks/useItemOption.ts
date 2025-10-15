'use client';

import { useAlert } from '@/contexts/AlertContext';
import { CustomError, createClientAPI } from '@/api/implement';

/**
 * 商品タイプの列挙型
 */
export enum ItemType {
  BOX = 'box', // 箱
  CARD = 'card', // カード
}

/**
 * 商品オプションの型定義
 */
export interface ItemOptionInfo {
  kind: string;
  option_value: string;
  image_url: string;
  option_label: string;
  match_policy: string;
}

/**
 * 商品オプションの配列の型定義
 */
export interface ItemOption {
  label: string;
  options: ItemOptionInfo[];
  columnOnItems: string;
}

/**
 * 商品オプション関連のカスタムフック
 * MycaアプリのAPI呼び出しを行い、商品のオプション情報を取得するための機能を提供する
 */
export const useItemOption = () => {
  const { setAlertState } = useAlert();
  const clientAPI = createClientAPI();
  /**
   * 商品オプションを取得する
   * MycaアプリのAPIから特定の条件に基づいて商品オプションデータを取得する
   */
  const getItemOption = async (
    genre: string, // ジャンルID
    itemType: ItemType,
    kindLabel: string,
  ): Promise<ItemOptionInfo[] | null> => {
    try {
      // MycaアプリのAPIにGETリクエストを送信
      const response = await clientAPI.ec.getItemOption(
        genre,
        itemType,
        kindLabel,
      );
      if (response instanceof CustomError) {
        setAlertState({
          message: '商品オプションの取得に失敗しました',
          severity: 'error',
        });
        return null;
      }
      return response;
    } catch (error) {
      // エラー発生時はアラートを表示
      setAlertState({
        message: '商品オプションの取得に失敗しました',
        severity: 'error',
      });
      return null;
    }
  };

  /**
   * 指定されたジャンルに関連する全ての商品オプションを取得する
   * 設定定数から該当ジャンルの検索設定を抽出し、必要な商品オプションをMycaアプリのAPIから取得する
   * @param genre - ジャンルID（例: ポケモンカード、遊戯王など）
   * @param settingConstants - 設定定数データ（ジャンル情報や検索設定を含む）
   * @param itemType - 商品タイプ（デフォルトはCARD）
   * @returns 商品オプションの配列
   */
  const fetchItemOptions = async (
    genre: string,
    settingConstants: any,
    itemType: ItemType = ItemType.CARD,
  ): Promise<ItemOption[] | null> => {
    const itemOptions: ItemOption[] = [];

    // 現在のジャンルを設定定数から検索
    const currentGenre = settingConstants?.GenreList?.find(
      (g: any) => g.genre == genre,
    );

    if (currentGenre) {
      // 商品タイプに応じた検索設定を取得（カードまたはボックス）
      const searchTypeConfig = currentGenre.searchType?.find((type: any) => {
        switch (itemType) {
          case ItemType.CARD:
            return type.type === 'カード';
          case ItemType.BOX:
            return type.type === 'ボックス';
          default:
            return type.type === 'カード';
        }
      });

      // picker入力タイプの要素のみをフィルタリング（ドロップダウン選択肢として表示される項目）
      const pickInputElements = searchTypeConfig?.searchElements?.filter(
        (element: any) => element.inputType === 'picker',
      );

      // 各要素に対して商品オプションを取得（並行処理ではなく逐次処理）
      for (const element of pickInputElements || []) {
        // 一旦封入パックは取得しない
        if (element.label === '封入パック') continue;
        const option = await getItemOption(genre, itemType, element.label);
        if (option) {
          itemOptions.push({
            label: element.label,
            options: option,
            columnOnItems: element.columnOnItems,
          });
        }
      }
    }
    return itemOptions;
  };

  // フックから公開する関数
  return {
    getItemOption,
    fetchItemOptions,
  };
};

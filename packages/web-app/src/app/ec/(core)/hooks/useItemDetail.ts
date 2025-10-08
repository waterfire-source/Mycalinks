'use client';

// TODO： 封入パックの取得などで使用する。 現状はまだ未使用

import { useAlert } from '@/contexts/AlertContext';
import { customFetch, METHOD, CustomError } from '@/api/implement';
/**
 * 商品詳細関連のカスタムフック
 * MycaアプリのAPI呼び出しを行い、商品詳細情報を取得する
 */
export const useItemDetail = () => {
  const { setAlertState } = useAlert();

  /**
   * 商品詳細情報を取得する
   * MycaアプリのAPIから商品詳細データを取得する
   * @param genre - ジャンルID
   * @param isPack - パックフラグ (1: パック, 0: 非パック)
   * @param page - 現在のページ番号
   * @param perPage - 1ページあたりの表示件数
   * @param orderColumn - ソート列
   * @param orderMode - ソート方向 ('ASC' または 'DESC')
   * @param userId - ユーザーID (オプション)
   * @param fields - 取得するフィールド情報 (デフォルトは詳細情報)
   */
  const getItemDetail = async (
    genre: number,
    isPack: number = 0,
    page: number = 1,
    perPage: number = 18,
    orderColumn: string = 'id',
    orderMode: string = 'DESC',
    userId?: number,
    fields: any = { detail: 1 },
  ) => {
    try {
      const requestBody: any = {
        props: {
          genre: genre,
          is_pack: isPack,
        },
        fields: fields,
        order: {
          column: orderColumn,
          mode: orderMode,
        },
      };

      // ユーザーIDが指定されている場合のみ追加
      if (userId) {
        requestBody.props.user = userId;
      }

      const response = await customFetch({
        method: METHOD.POST,
        url: `${process.env.NEXT_PUBLIC_MYCA_APP_API_URL}/item/detail`,
        body: requestBody,
      });
      const data = await response();
      if (data instanceof CustomError) {
        setAlertState({
          message: '商品詳細の取得に失敗しました',
          severity: 'error',
        });
        return null;
      }
      return data;
    } catch (error) {
      setAlertState({
        message: '商品詳細の取得に失敗しました',
        severity: 'error',
      });
      console.error('商品詳細の取得に失敗しました', error);
      return null;
    }
  };

  return {
    getItemDetail,
  };
};

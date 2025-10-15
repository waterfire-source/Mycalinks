'use client';

import { DetailContent } from '@/app/ec/(core)/components/DetailContent';
import { notFound } from 'next/navigation';
import { useEcProductDetail } from '@/app/ec/(core)/feature/detail/hooks/useEcProduct';
import { ConditionOptionHandle } from '@prisma/client';
import { ORDER_KIND_VALUE } from '@/app/ec/(core)/constants/orderKind';
import { useAlert } from '@/contexts/AlertContext';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { MycaPosApiClient } from 'api-generator/client';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// ProductResponseの型を定義（CustomErrorを除外）
type ProductResponse = Awaited<
  ReturnType<MycaPosApiClient['ec']['getEcProduct']>
>;

/**
 * 商品詳細ページ
 * @param params.id - 商品ID
 * @param searchParams - クエリパラメータによるフィルタ条件
 */
export default function ECDetailPage({ params, searchParams }: Props) {
  const { setAlertState } = useAlert();
  const { getEcProductWithFilters } = useEcProductDetail();
  const [isLoading, setIsLoading] = useState(true);
  const [productData, setProductData] = useState<ProductResponse | null>(null);
  const [fetchStarted, setFetchStarted] = useState(false);

  /**
   * クエリパラメータから条件の配列を取得する
   * @param param - カンマ区切りの条件文字列
   * @returns 条件の配列
   */
  const getConditionsFromQuery = useCallback(
    (param: string | string[] | undefined): ConditionOptionHandle[] => {
      if (!param) return [];
      const conditions = Array.isArray(param) ? param[0] : param;
      // URLデコードしてから分割し、有効な条件のみをフィルタリング
      return decodeURIComponent(conditions)
        .split(',')
        .filter((condition): condition is ConditionOptionHandle =>
          Object.values(ConditionOptionHandle).includes(
            condition as ConditionOptionHandle,
          ),
        );
    },
    [],
  );

  /**
   * クエリパラメータから並び替えの条件を取得する
   * @param param - クエリパラメータによる並び替え条件
   * @returns 有効な並び替えの条件、または undefined
   */
  const getOrderByFromQuery = useCallback(
    (param: string | string[] | undefined): string => {
      if (!param) return ORDER_KIND_VALUE.PRICE_ASC;
      const orderBy = Array.isArray(param) ? param[0] : param;
      // 有効な並び替え条件かチェック
      return Object.values(ORDER_KIND_VALUE).includes(orderBy as any)
        ? orderBy
        : ORDER_KIND_VALUE.PRICE_ASC;
    },
    [],
  );

  /**
   * クエリパラメータからspecialtyを取得する
   * @param param - specialtyパラメータ
   * @returns 有効なSpecialtyHandle、または undefined
   */
  const getSpecialtyFromQuery = useCallback(
    (param: string | string[] | undefined): string | undefined => {
      if (!param) return undefined;
      return Array.isArray(param) ? param[0] : param;
    },
    [],
  );

  // クエリパラメータからカードの状態と並び替えの条件を取得
  const cardConditions = useMemo(
    () => getConditionsFromQuery(searchParams.cardConditions),
    [searchParams.cardConditions, getConditionsFromQuery],
  );

  const orderBy = useMemo(
    () => getOrderByFromQuery(searchParams.orderBy),
    [searchParams.orderBy, getOrderByFromQuery],
  );

  const specialty = useMemo(
    () => getSpecialtyFromQuery(searchParams.specialty),
    [searchParams.specialty, getSpecialtyFromQuery],
  );

  // storeIdsをクエリパラメータから取得しnumber[]に変換
  const storeIds = useMemo(() => {
    const ids = searchParams.storeIds;
    return Array.isArray(ids)
      ? ids.map((id) => Number(id))
      : ids
      ? ids.split(',').map((id) => Number(id))
      : [];
  }, [searchParams.storeIds]);

  // データを取得する関数
  const fetchData = useCallback(async () => {
    if (fetchStarted) return;

    try {
      setIsLoading(true);
      setFetchStarted(true);
      // フィルタリングオプションを指定して整形後のデータを取得
      const data = await getEcProductWithFilters(Number(params.id), {
        cardConditions,
        orderBy,
        storeIds,
        specialty,
      });

      if (data === null) {
        notFound();
      }

      setProductData(data);
    } catch (error) {
      console.error('Failed to fetch product data:', error);
      setAlertState({
        message: '商品詳細の取得に失敗しました',
        severity: 'error',
      });
      notFound();
    } finally {
      setIsLoading(false);
    }
  }, [
    params.id,
    cardConditions,
    orderBy,
    storeIds, // 依存関係に追加
    specialty,
    getEcProductWithFilters,
    setAlertState,
    fetchStarted,
  ]);

  // 初回レンダリング時およびクエリパラメータ変更時にのみデータを取得
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          py: 4,
        }}
        component="div"
      >
        {isLoading && <CircularProgress />}
      </Box>
    );
  }

  if (!productData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          商品情報を取得できませんでした
        </Typography>
      </Box>
    );
  }

  return <DetailContent data={productData} storeIds={storeIds} />;
}

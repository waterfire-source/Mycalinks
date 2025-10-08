import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { BundleFormDataType } from '@/feature/stock/bundle/register/BundleSetting/BundleSetting';
import { BundleSetProductType } from '@/feature/stock/bundle/components/TabTable';
import { CountableProductType } from '@/feature/stock/bundle/components/ProductCountSearchTable';

export const useBundleForm = (
  selectedProducts: CountableProductType[],
  defaultBundle?: BundleSetProductType,
) => {
  const initialFormData = useMemo<BundleFormDataType>(
    () => ({
      bundleName: defaultBundle?.displayName ?? null,
      sellPrice: defaultBundle?.bundleSellPrice ?? null,
      bundleStockNumber: defaultBundle?.bundleStockNumber ?? null,
      genreID: defaultBundle?.bundleGenre?.id ?? null,
      startAt: defaultBundle?.startAt
        ? dayjs(defaultBundle.startAt).tz().startOf('day').toDate()
        : dayjs().tz().startOf('day').toDate(), // 初期値を日本時間の今日の日付に設定
      expiredAt: defaultBundle?.expiredAt
        ? dayjs(defaultBundle.expiredAt).tz().toDate()
        : undefined,
      imageUrl: defaultBundle?.imageUrl ?? undefined,
    }),
    [defaultBundle],
  );
  const [bundleFormData, setBundleFormData] =
    useState<BundleFormDataType>(initialFormData);
  const [expiredAtDayjs, setExpiredAtDayjs] = useState<dayjs.Dayjs>();
  // 終了日時設定するかしないか
  const [isExpiredAtEnabled, setIsExpiredAtEnabled] = useState<boolean>(false);
  // 開始日時の設定するか今すぐ(今日)にするか
  const [isStartAtEnabled, setIsStartAtEnabled] = useState<boolean>(false);
  const [startAtDayjs, setStartAtDayjs] = useState<dayjs.Dayjs>(
    defaultBundle?.startAt
      ? dayjs(defaultBundle.startAt)
      : dayjs().tz().startOf('day'),
  );
  const [isFormDisabled, setIsFormDisabled] = useState<boolean>(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (defaultBundle) {
      setBundleFormData({
        bundleName: defaultBundle?.displayName ?? null,
        sellPrice: defaultBundle?.bundleSellPrice ?? null,
        bundleStockNumber: defaultBundle?.bundleStockNumber ?? null,
        genreID: defaultBundle?.bundleGenre?.id ?? null,
        startAt: defaultBundle?.startAt
          ? dayjs(defaultBundle.startAt).tz().startOf('day').toDate()
          : dayjs().tz().startOf('day').toDate(), // 初期値を日本時間の今日の日付に設定
        expiredAt: defaultBundle?.expiredAt
          ? dayjs(defaultBundle.expiredAt).tz().toDate()
          : undefined,
        imageUrl: defaultBundle?.imageUrl ?? undefined,
      });
      setImageUrl(defaultBundle.imageUrl ?? null);
      setStartAtDayjs(dayjs(defaultBundle.startAt));
      setExpiredAtDayjs(dayjs(defaultBundle.expiredAt) ?? undefined);
    }
  }, []);

  // 有効期限の表示/非表示を切り替える
  const handleExpiredAtToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsExpiredAtEnabled(e.target.value === 'yes');
    if (e.target.value === 'no') {
      setExpiredAtDayjs(undefined);
      setBundleFormData({ ...bundleFormData, expiredAt: undefined });
    }
  };
  // 開始日時の表示/非表示を切り替える
  const handleStartAtToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsStartAtEnabled(e.target.value === 'yes');
    if (e.target.value === 'no') {
      setStartAtDayjs(dayjs().tz().startOf('day'));
      setBundleFormData({
        ...bundleFormData,
        startAt: dayjs().tz().startOf('day').toDate(),
      });
    }
  };

  // バンドル名の値が変更されたときのハンドラ
  const handleBundleNameInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setBundleFormData({ ...bundleFormData, bundleName: e.target.value });
  };

  // ジャンルの値が変更されたときのハンドラ
  const handleGenreSelectChange = (e: any) => {
    const genreID = Number(e.target.value);
    setBundleFormData({ ...bundleFormData, genreID: genreID });
  };

  // 単価の値が変更されたときのハンドラ
  const handleSellPriceInputChange = (value: number | undefined) => {
    if (value !== undefined) {
      setBundleFormData({ ...bundleFormData, sellPrice: value });
    }
  };

  // バンドル数の値が変更されたときのハンドラ
  const handleBundleStockNumberChange = (value: number | undefined) => {
    if (value !== undefined) {
      setBundleFormData({ ...bundleFormData, bundleStockNumber: value });
    }
  };

  // 有効期限の変更ハンドラー
  const handleExpiredAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = dayjs(e.target.value, 'YYYY-MM-DD', true);
    if (date.isValid()) {
      setExpiredAtDayjs(date);
      setBundleFormData({ ...bundleFormData, expiredAt: date.toDate() });
    } else {
      console.error('有効期限の日付が不正です:', e.target.value);
    }
  };

  // 開始日時の変更ハンドラー
  const handleStartAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = dayjs(e.target.value, 'YYYY-MM-DD', true);
    if (date.isValid()) {
      setStartAtDayjs(date);
      setBundleFormData({ ...bundleFormData, startAt: date.toDate() });
    } else {
      console.error('開始日時の日付が不正です:', e.target.value);
    }
  };

  // 画像URLの登録時の処理
  useEffect(() => {
    if (imageUrl) {
      setBundleFormData((prevFormData) => ({
        ...prevFormData,
        imageUrl: imageUrl,
      }));
    }
  }, [imageUrl]);

  // フォームのバリデーション
  useEffect(() => {
    if (
      bundleFormData.bundleName &&
      (bundleFormData.sellPrice || bundleFormData.sellPrice === 0) &&
      bundleFormData.bundleStockNumber &&
      selectedProducts.length > 0 &&
      bundleFormData.genreID
    ) {
      setIsFormDisabled(false);
    } else {
      setIsFormDisabled(true);
    }
  }, [bundleFormData, selectedProducts]);

  // フォームデータに変更があるか

  const isDirty = useMemo(() => {
    return (
      bundleFormData.bundleName !== initialFormData.bundleName ||
      bundleFormData.sellPrice !== initialFormData.sellPrice ||
      bundleFormData.bundleStockNumber !== initialFormData.bundleStockNumber ||
      bundleFormData.genreID !== initialFormData.genreID ||
      (bundleFormData.startAt?.getTime() ?? 0) !==
        (initialFormData.startAt?.getTime() ?? 0) ||
      (bundleFormData.expiredAt?.getTime() ?? 0) !==
        (initialFormData.expiredAt?.getTime() ?? 0) ||
      bundleFormData.imageUrl !== initialFormData.imageUrl
    );
  }, [bundleFormData, initialFormData]);

  return {
    bundleFormData,
    setBundleFormData,
    expiredAtDayjs,
    setExpiredAtDayjs,
    isExpiredAtEnabled,
    isFormDisabled,
    imageUrl,
    setImageUrl,
    handleExpiredAtToggle,
    handleBundleNameInputChange,
    handleGenreSelectChange,
    handleSellPriceInputChange,
    handleBundleStockNumberChange,
    handleExpiredAtChange,
    isStartAtEnabled,
    startAtDayjs,
    handleStartAtChange,
    handleStartAtToggle,
    isDirty,
  };
};

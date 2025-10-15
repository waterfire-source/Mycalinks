import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { SelectChangeEvent } from '@mui/material';
import { CountableProductType } from '@/feature/stock/bundle/components/ProductCountSearchTable';
import { SetFormDataType } from '@/feature/stock/set/register/SetSetting/SetSetting';
import { BundleSetProductType } from '@/feature/stock/bundle/components/TabTable';

export const useSetForm = (
  selectedProducts: CountableProductType[],
  defaultBundle?: BundleSetProductType,
) => {
  const initialFormData = useMemo<SetFormDataType>(
    () => ({
      setName: defaultBundle?.displayName ?? undefined,
      discount: null,
      discountUnit: defaultBundle?.setDiscountAmount?.includes('%')
        ? '%'
        : 'JPY',
      startAt: defaultBundle?.startAt
        ? dayjs(defaultBundle.startAt).tz().startOf('day').toDate()
        : dayjs().tz().startOf('day').toDate(),
      expiredAt: defaultBundle?.expiredAt
        ? dayjs(defaultBundle.expiredAt).tz().toDate()
        : undefined,
      imageUrl: defaultBundle?.imageUrl ?? undefined,
    }),
    [defaultBundle],
  );
  const [setFormData, setSetFormData] =
    useState<SetFormDataType>(initialFormData);
  const [isFormDisabled, setIsFormDisabled] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [expiredAtDayjs, setExpiredAtDayjs] = useState<dayjs.Dayjs>();
  const [isExpiredAtEnabled, setIsExpiredAtEnabled] = useState<boolean>(false);
  const [isStartAtEnabled, setIsStartAtEnabled] = useState<boolean>(false);
  const [startAtDayjs, setStartAtDayjs] = useState<dayjs.Dayjs>(
    dayjs().tz().startOf('day'),
  );

  useEffect(() => {
    if (defaultBundle) {
      setSetFormData({
        setName: defaultBundle.displayName,
        discount: null,
        discountUnit: defaultBundle.setDiscountAmount?.includes('%')
          ? '%'
          : 'JPY',
        startAt: defaultBundle.startAt
          ? dayjs(defaultBundle.startAt).tz().startOf('day').toDate()
          : dayjs().tz().startOf('day').toDate(),
        expiredAt: defaultBundle.expiredAt
          ? dayjs(defaultBundle.expiredAt).tz().toDate()
          : undefined,
        imageUrl: defaultBundle.imageUrl ?? undefined,
      });

      if (defaultBundle.setDiscountAmount) {
        const discountValue = parseFloat(
          defaultBundle.setDiscountAmount.replace(/[^\d]/g, ''),
        );

        //渡って来る値は%の場合絶対値なので割引割合に戻す
        const actualDiscountValue = defaultBundle.setDiscountAmount.includes(
          '%',
        )
          ? 100 - discountValue
          : discountValue;
        setSetFormData((prevFormData) => ({
          ...prevFormData,
          discount: actualDiscountValue,
        }));
      }
      setImageUrl(defaultBundle.imageUrl ?? null);
    }
  }, [defaultBundle, setSetFormData, setImageUrl]);

  const handleExpiredAtToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsExpiredAtEnabled(e.target.value === 'yes');
    if (e.target.value === 'no') {
      setExpiredAtDayjs(undefined);
      setSetFormData({ ...setFormData, expiredAt: undefined });
    }
  };

  const handleStartAtToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsStartAtEnabled(e.target.value === 'yes');
    if (e.target.value === 'no') {
      setStartAtDayjs(dayjs().tz().startOf('day'));
      setSetFormData({
        ...setFormData,
        startAt: dayjs().tz().startOf('day').toDate(),
      });
    }
  };

  const handleSetNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSetFormData({ ...setFormData, setName: e.target.value });
  };

  const handleDiscountInputChange = (value: number | undefined) => {
    if (value !== undefined) {
      setSetFormData({ ...setFormData, discount: value });
    } else {
      setSetFormData({ ...setFormData, discount: null });
    }
  };

  const handleDiscountUnitSelectChange = (e: SelectChangeEvent) => {
    setSetFormData({ ...setFormData, discountUnit: e.target.value });
  };

  const handleExpiredAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = dayjs(e.target.value, 'YYYY-MM-DD', true);
    if (date.isValid()) {
      setExpiredAtDayjs(date);
      setSetFormData({ ...setFormData, expiredAt: date.toDate() });
    } else {
      console.error('Invalid date format:', e.target.value);
    }
  };

  const handleStartAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = dayjs(e.target.value, 'YYYY-MM-DD', true);
    if (date.isValid()) {
      setStartAtDayjs(date);
      setSetFormData({ ...setFormData, startAt: date.toDate() });
    } else {
      console.error('Invalid date format:', e.target.value);
    }
  };

  useEffect(() => {
    if (imageUrl) {
      setSetFormData((prevFormData) => ({
        ...prevFormData,
        imageUrl: imageUrl,
      }));
    }
  }, [imageUrl]);

  useEffect(() => {
    if (
      setFormData.setName &&
      (setFormData.discount || setFormData.discount === 0) &&
      setFormData.discountUnit &&
      selectedProducts.length > 0
    ) {
      setIsFormDisabled(false);
    } else {
      setIsFormDisabled(true);
    }
  }, [setFormData, selectedProducts]);

  // フォームデータに変更があるか
  const isDirty = useMemo(() => {
    return (
      setFormData.setName !== initialFormData.setName ||
      setFormData.discount !== initialFormData.discount ||
      setFormData.discountUnit !== initialFormData.discountUnit ||
      (setFormData.startAt?.getTime() ?? 0) !==
        (initialFormData.startAt?.getTime() ?? 0) ||
      (setFormData.expiredAt?.getTime() ?? 0) !==
        (initialFormData.expiredAt?.getTime() ?? 0) ||
      setFormData.imageUrl !== initialFormData.imageUrl
    );
  }, [setFormData, initialFormData]);

  return {
    setFormData,
    isFormDisabled,
    imageUrl,
    expiredAtDayjs,
    isExpiredAtEnabled,
    isStartAtEnabled,
    startAtDayjs,
    setSetFormData,
    setImageUrl,
    setExpiredAtDayjs,
    setIsExpiredAtEnabled,
    setIsStartAtEnabled,
    setStartAtDayjs,
    handleExpiredAtToggle,
    handleStartAtToggle,
    handleSetNameChange,
    handleDiscountInputChange,
    handleDiscountUnitSelectChange,
    handleExpiredAtChange,
    handleStartAtChange,
    isDirty,
  };
};

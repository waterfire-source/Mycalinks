import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { BundleSetProductType } from '@/feature/stock/bundle/components/TabTable';
import { CountableProductType } from '@/feature/stock/bundle/components/ProductCountSearchTable';
import { SetDealFormDataType } from '@/feature/stock/set/register/SetSetting';

export const useSetDealForm = (
  selectedProducts: CountableProductType[],
  defaultSetDeal?: BundleSetProductType,
) => {
  const [formData, setFormData] = useState<SetDealFormDataType>({
    setName: null,
    discount: 0,
    discountUnit: 'JPY',
    startAt: dayjs().tz().startOf('day').toDate(),
  });
  const [expiredAtDayjs, setExpiredAtDayjs] = useState<dayjs.Dayjs>();
  const [isLoading, setIsLoading] = useState(false);
  const [isFormDisabled, setIsFormDisabled] = useState<boolean>(false);

  // セット名の変更ハンドラー
  const handleSetNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, setName: e.target.value });
  };

  // 適用割引の変更ハンドラー
  const handleDiscountInputChange = (value: number | undefined) => {
    if (value !== undefined) {
      setFormData({ ...formData, discount: value });
    } else {
      setFormData({ ...formData, discount: 0 });
    }
  };

  // 割引単位の変更ハンドラー
  const handleDiscountUnitSelectChange = (e: SelectChangeEvent) => {
    setFormData({ ...formData, discountUnit: e.target.value });
  };

  // 有効期限の変更ハンドラー
  const handleExpiredAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = dayjs(e.target.value);
    if (date) {
      setExpiredAtDayjs(date);
      setFormData({ ...formData, expiredAt: date.toDate() });
    }
  };

  // フォーム送信時
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await handleSave(formData);

      // 成功時にフォームをクリア
      setFormData({
        setName: null,
        discount: 0,
        discountUnit: 'JPY',
        expiredAt: undefined,
        startAt: dayjs().tz().startOf('day').toDate(),
      });
      setExpiredAtDayjs(undefined);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  // 画像URLの登録時の処理
  useEffect(() => {
    if (imageUrl) {
      setFormData((prevFormData) => ({ ...prevFormData, imageUrl: imageUrl }));
    }
  }, [imageUrl]);

  // フォームのバリデーション
  useEffect(() => {
    if (
      formData.setName &&
      (formData.discount || formData.discount === 0) &&
      formData.discountUnit &&
      selectedProducts.length > 0
    ) {
      setIsFormDisabled(false);
    } else {
      setIsFormDisabled(true);
    }
  }, [formData, selectedProducts]);

  return {
    formData,
    setFormData,
    expiredAtDayjs,
    setExpiredAtDayjs,
    isFormDisabled,
    handleExpiredAtChange,
  };
};

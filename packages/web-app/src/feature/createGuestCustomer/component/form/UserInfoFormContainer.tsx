import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserInfoForm } from '@/feature/createGuestCustomer/component/form/UserInfoForm';
import { useAddressSearch } from '@/feature/stocking/hooks/useAddressSearch';
import { toHalfWidth } from '@/utils/convertToHalfWidth';
import { GuestCustomer } from '@/feature/createGuestCustomer';

const userInfoSchema = z.object({
  name: z.string().min(1, '名前は必須です。'),
  furigana: z
    .string()
    .min(1, 'フリガナは必須です。')
    .regex(
      /^[ァ-ンヴー\s]+$/,
      'フリガナはカタカナと半角スペースのみで入力してください。',
    ),
  birthdate: z
    .string()
    .regex(
      /^\d{4}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/,
      '生年月日はYYYYMMDD形式で入力してください。',
    ),
  postalCode: z.string().min(1, '郵便番号は必須です。'),
  prefecture: z.string().min(1, '都道府県は必須です。'),
  city: z.string().min(1, '市区町村は必須です。'),
  address: z.string().min(1, '住所は必須です。'),
  buildingName: z.string().optional(),
  phoneNumber: z.string().min(1, '電話番号は必須です。'),
  gender: z.string().min(1, '性別は必須です。'),
  career: z.string().min(1, '職業は必須です。'),
});

interface UserInfoFormContainerProps {
  guestCustomer: GuestCustomer;
  setGuestCustomer: React.Dispatch<React.SetStateAction<GuestCustomer>>;
  onNext: () => void;
}

export const UserInfoFormContainer: React.FC<UserInfoFormContainerProps> = ({
  guestCustomer,
  setGuestCustomer,
  onNext,
}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(userInfoSchema),
    defaultValues: guestCustomer,
  });

  // リアルタイムでガイドおよび型の変換を行うための監視
  const birthdate = watch('birthdate');
  const postalCode = watch('postalCode');
  const phoneNumber = watch('phoneNumber');

  const [age, setAge] = useState(0);

  const { address, handleAddressSearch } = useAddressSearch(postalCode);

  // 郵便番号のフォーマット
  useEffect(() => {
    if (postalCode) {
      const cleanedPostalCode = toHalfWidth(postalCode)
        .replace(/[^\d]/g, '')
        .slice(0, 7); // 7桁まで制限
      const formattedPostalCode = cleanedPostalCode.replace(
        /(\d{3})(\d{4})/,
        '$1-$2',
      );
      setValue('postalCode', formattedPostalCode);
    }
  }, [postalCode, setValue]);

  // 電話番号のフォーマット
  useEffect(() => {
    if (phoneNumber) {
      const cleanedPhoneNumber = toHalfWidth(phoneNumber)
        .replace(/[^\d]/g, '')
        .slice(0, 11);
      const formattedPhoneNumber = cleanedPhoneNumber.replace(
        /(\d{3})(\d{4})(\d{4})/,
        '$1-$2-$3',
      );
      setValue('phoneNumber', formattedPhoneNumber);
    }
  }, [phoneNumber, setValue]);

  // 郵便番号変更時に住所を検索
  useEffect(() => {
    if (postalCode && postalCode.length === 7) {
      handleAddressSearch();
    }
  }, [postalCode, handleAddressSearch]);

  // 検索結果をフォームにセット
  useEffect(() => {
    if (address.prefecture) {
      setValue('prefecture', address.prefecture);
    }
    if (address.city) {
      setValue('city', address.city);
    }
    if (address.address2) {
      setValue('address', address.address2);
    }
  }, [address, setValue]);

  // 生年月日が変更されたときに年齢を計算
  useEffect(() => {
    if (birthdate) {
      const year = parseInt(birthdate.substring(0, 4));
      const month = parseInt(birthdate.substring(4, 6)) - 1;
      const day = parseInt(birthdate.substring(6, 8));
      const birthDateObj = new Date(year, month, day);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDateObj.getFullYear();
      const monthDifference = today.getMonth() - birthDateObj.getMonth();

      if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDateObj.getDate())
      ) {
        calculatedAge--;
      }

      setAge(calculatedAge >= 0 ? calculatedAge : 0);
    }
  }, [birthdate]);

  const onSubmit = (data: GuestCustomer) => {
    setGuestCustomer(data);
    onNext();
  };

  return (
    <UserInfoForm
      register={register}
      errors={errors}
      control={control}
      age={age}
      onSubmit={handleSubmit(onSubmit)}
    />
  );
};

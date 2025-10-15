'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { GuestCustomer } from '@/feature/createGuestCustomer';

interface ConfirmationProps {
  guestCustomer: GuestCustomer;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export const Confirmation: React.FC<ConfirmationProps> = ({
  guestCustomer,
  onConfirm,
  onBack,
  isLoading,
}) => {
  const formatBirthdate = (birthdate: string) => {
    const year = birthdate.substring(0, 4);
    const month = birthdate.substring(4, 6);
    const day = birthdate.substring(6, 8);
    return `${year}年${month}月${day}日`;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        width: '100%',
      }}
    >
      <Typography
        sx={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}
      >
        個人情報確認
      </Typography>

      <Box sx={{ textAlign: 'left', width: '100%' }}>
        <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>
          お名前：{guestCustomer.name}
        </Typography>
        <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>
          フリガナ：{guestCustomer.furigana}
        </Typography>
        <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>
          生年月日：{formatBirthdate(guestCustomer.birthdate)}（
          {(() => {
            const birthYear = parseInt(
              guestCustomer.birthdate.substring(0, 4),
              10,
            );
            const birthMonth =
              parseInt(guestCustomer.birthdate.substring(4, 6), 10) - 1; // JSの月は0-11
            const birthDay = parseInt(
              guestCustomer.birthdate.substring(6, 8),
              10,
            );

            const birthDate = new Date(birthYear, birthMonth, birthDay);
            const today = new Date();

            let age = today.getFullYear() - birthDate.getFullYear();

            // 誕生日がまだ来ていなければ1引く
            if (
              today.getMonth() < birthDate.getMonth() ||
              (today.getMonth() === birthDate.getMonth() &&
                today.getDate() < birthDate.getDate())
            ) {
              age--;
            }

            return age;
          })()}
          歳）
        </Typography>

        <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>
          性別：{guestCustomer.gender}
        </Typography>
        <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>
          職業：{guestCustomer.career}
        </Typography>
        <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>
          郵便番号：{guestCustomer.postalCode}
        </Typography>
        <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>
          都道府県：{guestCustomer.prefecture}
        </Typography>
        <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>
          市区町村：{guestCustomer.city}
        </Typography>
        <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>
          以降の住所：{guestCustomer.address}
        </Typography>
        <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>
          建物名など：{guestCustomer.buildingName}
        </Typography>
        <Typography sx={{ fontSize: '14px', marginBottom: '8px' }}>
          電話番号：{guestCustomer.phoneNumber}
        </Typography>
      </Box>

      <Box sx={{ textAlign: 'center', width: '100%' }}>
        <Typography color="primary.main" sx={{ fontSize: '14px' }}>
          必ずご確認ください。
        </Typography>
        <Typography color="primary.main" sx={{ fontSize: '14px' }}>
          入力内容は後から編集できません。
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          width: '100%',
          justifyContent: 'center',
          marginTop: '16px',
        }}
      >
        <PrimaryButton
          onClick={onConfirm}
          sx={{ paddingX: 4 }}
          loading={isLoading}
        >
          確定
        </PrimaryButton>
        <SecondaryButton onClick={onBack} sx={{ paddingX: 4 }}>
          戻る
        </SecondaryButton>
      </Box>
    </Box>
  );
};

export default Confirmation;

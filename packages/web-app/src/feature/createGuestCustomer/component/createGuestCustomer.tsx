'use client';

import React, { useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import Image from 'next/image';
import { AgreementForm } from '@/feature/createGuestCustomer/component/form/AgreementForm';
import { Confirmation } from '@/feature/createGuestCustomer/component/form/Confirmation';
import { BarcodeDisplay } from '@/feature/createGuestCustomer/component/form/BarcodeDisplay';
import { DownloadLinks } from '@/feature/createGuestCustomer/component/form/DownloadLinks';
import { UserInfoFormContainer } from '@/feature/createGuestCustomer/component/form/UserInfoFormContainer';
import { useParams } from 'next/navigation';
import { AlertProvider } from '@/contexts/AlertContext';
import {
  GuestCustomer,
  useCreateGuestCustomer,
} from '@/feature/createGuestCustomer';

type Props = {
  pageTitle: string;
  isReservation?: boolean;
};

export const CreateGuestCustomer = ({
  pageTitle,
  isReservation = false,
}: Props) => {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { storeId } = useParams();
  const { createGuestCustomer } = useCreateGuestCustomer();

  const [guestCustomer, setGuestCustomer] = useState<GuestCustomer>({
    name: '',
    furigana: '',
    birthdate: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
    buildingName: undefined,
    phoneNumber: '',
    career: '',
    gender: '男',
  });

  const [barcode, setBarcode] = useState('');

  // 顧客情報の登録とバーコードの取得をシミュレートする関数
  const handleConfirm = async () => {
    setIsLoading(true);

    const res = await createGuestCustomer(storeId, guestCustomer);

    if (!res) return;

    // シミュレーション: 2秒後にバーコードを生成し、次のステップに進む
    setTimeout(() => {
      setIsLoading(false);
      setBarcode(res.barcode!);
      setStep(4);
    }, 2000);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <DownloadLinks
            onNext={() => {
              isReservation ? setStep(2) : setStep(1);
            }}
            isReservation={isReservation}
          />
        );
      case 1:
        return (
          <AgreementForm onNext={() => setStep(2)} onBack={() => setStep(0)} />
        );
      case 2:
        return (
          <UserInfoFormContainer
            guestCustomer={guestCustomer}
            setGuestCustomer={setGuestCustomer}
            onNext={() => setStep(3)}
          />
        );
      case 3:
        return (
          <Confirmation
            guestCustomer={guestCustomer}
            onConfirm={handleConfirm}
            onBack={() => setStep(2)}
            isLoading={isLoading}
          />
        );
      case 4:
        return <BarcodeDisplay code={barcode} />;
      default:
        return <DownloadLinks onNext={() => setStep(1)} />;
    }
  };

  return (
    <AlertProvider>
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 4,
          gap: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Image
            src="https://static.mycalinks.io/pos/store/1/setting/logo/shopMycaLogo.png" //[TODO]: 各ストアのロゴが表示される様にする
            alt="Mycalinks"
            height={40}
            width={160}
            priority
          />
          <Typography sx={{ fontSize: '14px' }}>{pageTitle}</Typography>
        </Box>

        {renderStep()}
      </Container>
    </AlertProvider>
  );
};

'use client';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { Box, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { useAddressSearch } from '@/feature/stocking/hooks/useAddressSearch';
import { ImagePicker } from '@/components/cards/ImagePicker';
import Image from 'next/image';
import { palette } from '@/theme/palette';
import { useUpdateStoreInfo } from '@/feature/store/hooks/useUpdateStoreInfo';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { SquareLocationSelect } from '@/feature/square/components/SquareLocationSelect';
import { useCorporation } from '@/feature/corporation/hooks/useCorporation';

export default function InfoPage() {
  const { push } = useRouter();
  const { updateStoreInfo } = useUpdateStoreInfo();
  const { store } = useStore();
  const { setAlertState } = useAlert();
  // 法人情報
  const { corporation, fetchCorporation } = useCorporation();

  const [storeName, setStoreName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  // 店舗代表者名
  const [leaderName, setLeaderName] = useState('');
  // 本社郵便番号
  const [postalCode, setPostalCode] = useState('');
  // 本社所在地
  const [address, setAddress] = useState('');
  // 電話番号
  const [phoneNumber, setPhoneNumber] = useState('');
  const { address: addressSearchState, handleAddressSearch } =
    useAddressSearch(postalCode);
  const [squareLocationId, setSquareLocationId] = useState('');
  useEffect(() => {
    setStoreName(store.display_name ?? '');
    setLeaderName(store.leader_name ?? '');
    setPostalCode(store.zip_code ?? '');
    setAddress(store.full_address ?? '');
    setPhoneNumber(store.phone_number ?? '');
  }, [store]);
  // 法人情報を取得
  useEffect(() => {
    fetchCorporation();
  }, [fetchCorporation]);
  // 郵便番号の住所検索
  const handleClickAddressSearch = async () => {
    await handleAddressSearch();
    setAddress(
      `${addressSearchState.prefecture}${addressSearchState.city}${addressSearchState.address2}`,
    );
  };
  const handleUpdateSetting = async () => {
    // 各項目のバリデーション
    if (storeName === '') {
      setAlertState({
        message: '店舗名を入力してください',
        severity: 'error',
      });
      return;
    }
    if (leaderName === '') {
      setAlertState({
        message: '代表者名を入力してください',
        severity: 'error',
      });
      return;
    }
    if (address === '') {
      setAlertState({
        message: '所在地を入力してください',
        severity: 'error',
      });
      return;
    }
    if (phoneNumber === '') {
      setAlertState({
        message: '電話番号を入力してください',
        severity: 'error',
      });
      return;
    }
    if (postalCode === '') {
      setAlertState({
        message: '郵便番号を入力してください',
        severity: 'error',
      });
      return;
    }
    try {
      console.log('squareLocationId: ', squareLocationId);
      await updateStoreInfo({
        displayName: storeName,
        leaderName: leaderName,
        imageUrl: image ?? undefined,
        fullAddress: address,
        zipCode: postalCode,
        phoneNumber: phoneNumber,
        squareLocationId: squareLocationId,
      });
      push(PATH.SETUP.store.cashRegister);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Stack alignItems="center" justifyContent="start" height="100%" gap={3}>
      <Typography variant="h1">店舗情報設定</Typography>
      <Stack width="80%" gap={3}>
        <Stack gap={1}>
          <Typography variant="body1">店舗名</Typography>
          <TextField
            fullWidth
            size="small"
            type="email"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
        </Stack>
        <Stack gap={1}>
          <Stack gap={3} direction="row" alignItems="center">
            <Typography variant="body1">店舗ロゴデータ</Typography>
            <Box sx={{ width: '100px', height: '30px' }}>
              <ImagePicker
                onImageUploaded={setImage}
                kind="store"
                buttonSx={{ mt: 0, height: '30px' }}
              />
            </Box>
          </Stack>
          <Box
            sx={{
              width: '100px',
              height: '100px',
              border: `1px solid ${palette.grey[300]}`,
            }}
          >
            {image && (
              <Image
                src={image}
                alt="店舗ロゴ"
                width={100}
                height={100}
                style={{ objectFit: 'cover' }}
              />
            )}
          </Box>
        </Stack>
        <Stack gap={1}>
          <Stack
            direction="row"
            gap={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="body1">代表者名(店舗)</Typography>
            <SameAsCorporation
              onClick={() => setLeaderName(corporation?.ceo_name ?? '')}
            />
          </Stack>
          <TextField
            fullWidth
            size="small"
            type="text"
            value={leaderName}
            onChange={(e) => setLeaderName(e.target.value)}
          />
        </Stack>

        <Stack gap={1}>
          <Stack
            gap={1}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="body1">郵便番号(店舗)</Typography>
            <SameAsCorporation
              onClick={() => setPostalCode(corporation?.zip_code ?? '')}
            />
          </Stack>
          <TextField
            fullWidth
            size="small"
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
        </Stack>
        <Stack gap={1}>
          <Stack
            direction="row"
            gap={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" gap={1} alignItems="center">
              <Typography variant="body1">所在地(店舗)</Typography>
              <SecondaryButton
                onClick={handleClickAddressSearch}
                size="small"
                sx={{ fontSize: '10px', py: '2px' }}
              >
                住所検索
              </SecondaryButton>
            </Stack>
            <SameAsCorporation
              onClick={() => setAddress(corporation?.head_office_address ?? '')}
            />
          </Stack>
          <TextField
            fullWidth
            size="small"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Stack>
        <Stack gap={1}>
          <Stack
            direction="row"
            gap={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="body1">電話番号(店舗)</Typography>
            <SameAsCorporation
              onClick={() => setPhoneNumber(corporation?.phone_number ?? '')}
            />
          </Stack>
          <TextField
            fullWidth
            size="small"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </Stack>
      </Stack>
      <Stack width="80%" gap={3}>
        {corporation?.square_available && (
          <Stack gap={1}>
            <Typography variant="body1">Squareロケーションを選択</Typography>
            <SquareLocationSelect
              value={squareLocationId}
              onChange={(value) => setSquareLocationId(value)}
            />
          </Stack>
        )}
        <PrimaryButton onClick={handleUpdateSetting}>
          メインレジの作成に進む
        </PrimaryButton>
      </Stack>
    </Stack>
  );
}

const SameAsCorporation = ({ onClick }: { onClick: () => void }) => {
  return (
    <Typography
      variant="caption"
      sx={{ textDecoration: 'underline', cursor: 'pointer' }}
      onClick={onClick}
    >
      法人アカウントと同じ
    </Typography>
  );
};

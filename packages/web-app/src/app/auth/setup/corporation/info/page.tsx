'use client';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { PATH } from '@/constants/paths';
import { prefectures } from '@/constants/prefectures';
import { useEffect } from 'react';
import { useGetOAuthUrl } from '@/feature/square/hooks/useGetOAuthUrl';
import { palette } from '@/theme/palette';
import { useSession } from 'next-auth/react';
import { useCorporationSetup } from '@/app/auth/setup/corporation/info/useCorporationSetup';
import { useCorporation } from '@/feature/corporation/hooks/useCorporation';
export default function InfoPage() {
  const { push } = useRouter();
  const {
    formData,
    handleChange,
    handleClickAddressSearch,
    handleUpdateCorporation,
    setFormData,
  } = useCorporationSetup();
  const { data: session } = useSession();
  const corporationId = session?.user.id;
  const { getOAuthUrl } = useGetOAuthUrl();
  const { corporation, fetchCorporation } = useCorporation();

  // 法人情報を取得
  useEffect(() => {
    fetchCorporation();
  }, [fetchCorporation]);

  // アカウント情報を取得したら、フォームに表示する
  useEffect(() => {
    if (corporation) {
      setFormData({
        name: corporation?.name || '',
        ceoName: corporation?.ceo_name || '',
        zipCode: corporation?.zip_code || '',
        address: corporation?.head_office_address || '',
        phoneNumber: corporation?.phone_number || '',
        kobutsushoKoanIinkai: corporation?.kobutsusho_koan_iinkai || '',
        kobutsushoNumber: corporation?.kobutsusho_number || '',
        invoiceNumber: corporation?.invoice_number || '',
      });
    }
  }, [corporation, setFormData]);
  const handleClickSquareAccount = async () => {
    try {
      // ページ遷移前に法人情報を更新する(帰ってきた時に再fetchできるようにするため)
      await handleUpdateCorporation(Number(corporationId));
      // Squareアカウントと連携する(OAuth同意画面に遷移)
      await getOAuthUrl({
        succeedCallbackUrl: PATH.SETUP.corporation.info,
        failedCallbackUrl: PATH.SETUP.corporation.info,
      });
    } catch (error) {
      console.error('Squareアカウントと連携に失敗しました:', error);
    }
  };
  const handleUpdateSetting = async () => {
    try {
      await handleUpdateCorporation(Number(corporationId));
      push(PATH.SETUP.corporation.defaultSetting);
    } catch (error) {
      console.error('法人情報の更新に失敗しました:', error);
    }
  };

  return (
    <Stack alignItems="center" justifyContent="start" height="100%" gap={3}>
      <Typography variant="h1">法人情報設定</Typography>
      <Stack width="80%" gap={3}>
        <Stack gap={1}>
          <Typography variant="body1">法人名</Typography>
          <TextField
            fullWidth
            size="small"
            type="email"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </Stack>
        <Stack gap={1}>
          <Typography variant="body1">法人代表者名</Typography>
          <TextField
            fullWidth
            size="small"
            type="text"
            value={formData.ceoName}
            onChange={(e) => handleChange('ceoName', e.target.value)}
          />
        </Stack>

        <Stack gap={1}>
          <Typography variant="body1">本社郵便番号</Typography>
          <Stack direction="row" gap={1} alignItems="center">
            <TextField
              size="small"
              type="text"
              value={formData.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
            />
            <SecondaryButton
              onClick={handleClickAddressSearch}
              size="small"
              sx={{ fontSize: '10px', py: '2px' }}
            >
              住所検索
            </SecondaryButton>
          </Stack>
        </Stack>
        <Stack gap={1}>
          <Stack direction="row" gap={1} alignItems="center">
            <Typography variant="body1">本社所在地</Typography>
          </Stack>
          <TextField
            fullWidth
            size="small"
            type="text"
            value={formData.address}
            onChange={(e) => {
              handleChange('address', e.target.value);
            }}
          />
        </Stack>
        <Stack gap={1}>
          <Typography variant="body1">電話番号</Typography>
          <TextField
            fullWidth
            size="small"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
          />
        </Stack>
        <Stack gap={1}>
          <Typography variant="body1">所属する古物商公安委員会</Typography>
          <Select
            fullWidth
            size="small"
            defaultValue={`${prefectures[0].name}公安委員会`}
            value={formData.kobutsushoKoanIinkai}
            onChange={(e) =>
              handleChange('kobutsushoKoanIinkai', e.target.value)
            }
          >
            <MenuItem value="">選択してください</MenuItem>
            {prefectures.map((prefecture) => (
              <MenuItem
                key={prefecture.id}
                value={`${prefecture.name}公安委員会`}
              >
                {prefecture.name}公安委員会
              </MenuItem>
            ))}
          </Select>
        </Stack>
        <Stack gap={1}>
          <Typography variant="body1">古物商番号</Typography>
          <Stack direction="row" gap={1} alignItems="center">
            <TextField
              fullWidth
              size="small"
              type="text"
              value={formData.kobutsushoNumber}
              onChange={(e) => handleChange('kobutsushoNumber', e.target.value)}
            />
            号
          </Stack>
        </Stack>
        <Stack gap={1}>
          <Typography variant="body1">インボイス登録番号</Typography>
          <TextField
            fullWidth
            size="small"
            type="text"
            value={formData.invoiceNumber}
            onChange={(e) => handleChange('invoiceNumber', e.target.value)}
          />
        </Stack>
      </Stack>
      <Stack width="80%" gap={3}>
        {corporation?.square_available ? (
          <Stack
            sx={{ backgroundColor: 'grey.700', color: palette.common.white }}
            p={1}
            borderRadius={1}
            textAlign="center"
          >
            <Typography variant="body1">Squareアカウントと連携済み</Typography>
          </Stack>
        ) : (
          <SecondaryButton onClick={handleClickSquareAccount}>
            <Typography variant="body1">
              すでに所持しているSquareアカウントと連携する
            </Typography>
          </SecondaryButton>
        )}
        <PrimaryButton onClick={handleUpdateSetting}>
          店舗アカウントのデフォルト設定の作成へ進む
        </PrimaryButton>
      </Stack>
    </Stack>
  );
}

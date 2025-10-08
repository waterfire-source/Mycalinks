import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { useAddressSearch } from '@/feature/stocking/hooks/useAddressSearch';
import { PasswordUpdateModal } from '@/components/modals/common/PasswordUpdateModal';
import { PasswordConfirmModal } from '@/components/modals/common/PasswordConfirmModal';
import { StoreData } from '@/app/auth/(dashboard)/settings/store/[store_id]/page';
import Image from 'next/image';
import { useStore } from '@/contexts/StoreContext';
import { useAccount } from '@/feature/account/hooks/useAccount';
import { useUploadImage } from '@/hooks/useUploadImage';
import { useUpdateStoreInfo } from '@/feature/store/hooks/useUpdateStoreInfo';
import { CustomError } from '@/api/implement';
import { NoSpinTextField } from '@/components/common/NoSpinTextField';
import { toHalfWidthOnly } from '@/utils/convertToHalfWidth';

/**
 * 店舗アカウント編集モーダルのプロパティ
 */
interface Props {
  isOpen: boolean;
  onClose: () => void;
  storeData: StoreData;
  setStoreData: (data: StoreData) => void;
  accountID: string;
}

/**
 * 店舗アカウント情報を編集するためのモーダルコンポーネント
 */
export const StoreEditModal: React.FC<Props> = ({
  isOpen,
  onClose,
  storeData,
  setStoreData,
  accountID,
}) => {
  // 状態管理
  const [isLoading, setIsLoading] = useState(false);
  const [passwordUpdateModalOpen, setPasswordUpdateModalOpen] = useState(false);
  const { store } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateStoreInfo } = useUpdateStoreInfo();
  const { updateAccount } = useAccount();
  const { uploadImage, result } = useUploadImage();

  // フォームデータの初期値
  const [formData, setFormData] = useState<StoreData>({
    storeName: '',
    leaderName: '',
    zipCode: '',
    address: '',
    phoneNumber: '',
    email: '',
    kobutsushoKoanIinkai: '',
    kobutsushoNumber: '',
    corporation: '',
    storeId: '',
    logoData: '',
    squareLocation: '',
  });

  // バリデーションエラー管理
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // サブモーダルの表示状態管理
  const [passwordConfirmModalOpen, setPasswordConfirmModalOpen] =
    useState(false);

  // 住所検索機能
  const { address, handleAddressSearch } = useAddressSearch(
    formData.zipCode || '',
  );

  /**
   * 住所検索結果を監視して自動入力する
   */
  useEffect(() => {
    if (address.prefecture || address.city || address.address2) {
      setFormData((prev) => ({
        ...prev,
        address: `${address.prefecture}${address.city}${address.address2}`,
      }));
    }
  }, [address]);

  /**
   * モーダルが開かれたときに初期データをフォームにセットする
   */
  useEffect(() => {
    if (storeData) {
      setFormData({
        storeName: storeData.storeName || '',
        leaderName: storeData.leaderName || '',
        zipCode: storeData.zipCode || '',
        address: storeData.address || '',
        phoneNumber: storeData.phoneNumber || '',
        email: storeData.email || '',
        storeId: storeData.storeId || '',
        logoData: storeData.logoData || '',
        kobutsushoKoanIinkai: storeData.kobutsushoKoanIinkai || '',
        kobutsushoNumber: storeData.kobutsushoNumber || '',
        corporation: storeData.corporation || '',
        squareLocation: storeData.squareLocation || '',
      });
    }
    setErrors({});
    setIsLoading(false);
  }, [isOpen, storeData]);

  useEffect(() => {
    if (result instanceof CustomError) return;

    // ここで result は CustomError ではないことが確定したので、
    // { imageUrl: string; } 型として扱われる
    if (result?.success && result.data) {
      setFormData((prev) => ({
        ...prev,
        logoData: result?.data?.imageUrl || '',
      }));
    }
  }, [result]);

  /**
   * フォームのバリデーションを行う
   * 必須項目が入力されていない場合はエラーメッセージを表示
   */
  const handleValidate = () => {
    const newErrors: { [key: string]: string } = {};
    setErrors({});

    if (!formData.storeName) newErrors.storeName = '店舗名を入力してください';
    if (!formData.leaderName)
      newErrors.leaderName = '代表者名を入力してください';
    if (!formData.zipCode) newErrors.zipCode = '郵便番号を入力してください';
    if (!formData.address) newErrors.address = '所在地を入力してください';
    if (!formData.phoneNumber)
      newErrors.phoneNumber = '電話番号を入力してください';
    if (!formData.email) newErrors.email = 'メールアドレスを入力してください';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    // バリデーション成功時はパスワード確認モーダルを表示
    setPasswordConfirmModalOpen(true);
  };

  /**
   * 設定を保存する処理
   * @param currentPassword 現在のパスワード（確認用）
   */
  const handleSettingSave = async (password: string) => {
    setIsLoading(true);
    const accountRes = await updateAccount(accountID, password, {
      email: formData.email,
      displayName: formData.leaderName,
    });
    if (!accountRes) {
      setIsLoading(false);
      return;
    }
    const storeRes = await updateStoreInfo({
      displayName: formData.storeName,
      imageUrl: formData.logoData,
      fullAddress: formData.address,
      zipCode: formData.zipCode,
      phoneNumber: formData.phoneNumber,
      currentPassword: password,
    });
    if (!storeRes) {
      setIsLoading(false);
      return;
    }
    setStoreData(formData);
    setIsLoading(false);
    setPasswordConfirmModalOpen(false);
    onClose();
  };

  /**
   * 郵便番号入力時の処理
   */
  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, zipCode: e.target.value }));
  };

  /**
   * ロゴ画像をアップロードする処理
   */
  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadImage(store?.id, file, 'store');
  };

  return (
    <>
      <CustomModalWithIcon
        open={isOpen}
        onClose={onClose}
        title="店舗アカウント編集"
        onActionButtonClick={handleValidate}
        actionButtonText="編集内容を保存"
        cancelButtonText="編集を破棄"
        secondActionButtonText="パスワード編集"
        onSecondActionButtonClick={() => setPasswordUpdateModalOpen(true)}
        width="90%"
      >
        <Box sx={{ backgroundColor: 'white', p: 3 }}>
          <Box sx={{ p: 3 }}>
            {/* 店舗ID */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                店舗ID
              </Typography>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                {formData.storeId}
              </Typography>
            </Box>
            {/* 店舗名入力フィールド */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                店舗名
              </Typography>
              <TextField
                value={formData.storeName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    storeName: e.target.value,
                  }))
                }
                error={!!errors.storeName}
                helperText={errors.storeName}
                size="small"
                sx={{ width: '90%' }}
              />
            </Box>
            {/* ロゴ画像 */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                ロゴ画像
              </Typography>
              <Box sx={{ width: 300, height: 35, display: 'flex', gap: 2 }}>
                {formData.logoData && (
                  <Image
                    src={formData.logoData}
                    alt="ロゴ画像"
                    width={300}
                    height={35}
                    style={{
                      width: '300px',
                      height: '35px',
                      objectFit: 'contain',
                    }}
                  />
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <SecondaryButton
                  variant="contained"
                  sx={{ minWidth: '130px' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  ファイルを選択
                </SecondaryButton>
              </Box>
            </Box>
            {/* 代表者名入力フィールド */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                代表者名
              </Typography>
              <TextField
                value={formData.leaderName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    leaderName: e.target.value,
                  }))
                }
                error={!!errors.leaderName}
                helperText={errors.leaderName}
                size="small"
                sx={{ width: '90%' }}
              />
            </Box>
            {/* 郵便番号入力フィールドと住所検索ボタン */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                郵便番号
              </Typography>
              <NoSpinTextField
                type="text"
                value={formData.zipCode}
                onChange={handleZipCodeChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddressSearch();
                  }
                }}
                error={!!errors.zipCode}
                helperText={errors.zipCode}
                size="small"
              />
              <SecondaryButton
                variant="contained"
                onClick={handleAddressSearch}
              >
                住所検索
              </SecondaryButton>
            </Box>
            {/* 所在地入力フィールド */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                所在地
              </Typography>
              <TextField
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                error={!!errors.address}
                helperText={errors.address}
                size="small"
                sx={{ width: '90%' }}
              />
            </Box>
            {/* 電話番号入力フィールド */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                電話番号
              </Typography>
              <TextField
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phoneNumber: toHalfWidthOnly(e.target.value),
                  }))
                }
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                size="small"
                sx={{ width: '90%' }}
              />
            </Box>
            {/* メールアドレス入力フィールド */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                メールアドレス
              </Typography>
              <TextField
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: toHalfWidthOnly(e.target.value),
                  }))
                }
                error={!!errors.email}
                helperText={errors.email}
                size="small"
                sx={{ width: '90%' }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                古物商公安委員会
              </Typography>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                {formData.kobutsushoKoanIinkai}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                古物商番号
              </Typography>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                {formData.kobutsushoNumber}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                本部
              </Typography>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                {formData.corporation}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CustomModalWithIcon>

      {/* パスワード確認用モーダル */}
      <PasswordConfirmModal
        isOpen={passwordConfirmModalOpen}
        onClose={() => setPasswordConfirmModalOpen(false)}
        onConfirm={handleSettingSave}
        isLoading={isLoading}
      />
      {/* パスワード更新用モーダル */}
      <PasswordUpdateModal
        isOpen={passwordUpdateModalOpen}
        onClose={() => setPasswordUpdateModalOpen(false)}
        accountID={accountID}
      />
    </>
  );
};

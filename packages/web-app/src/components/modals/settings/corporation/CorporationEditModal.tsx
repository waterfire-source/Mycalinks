import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Select, MenuItem } from '@mui/material';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { useAddressSearch } from '@/feature/stocking/hooks/useAddressSearch';
import { PasswordUpdateModal } from '@/components/modals/common/PasswordUpdateModal';
import { PasswordConfirmModal } from '@/components/modals/common/PasswordConfirmModal';
import { NoSpinTextField } from '@/components/common/NoSpinTextField';
import { toHalfWidthOnly } from '@/utils/convertToHalfWidth';
import { prefectures } from '@/constants/prefectures';

/**
 * 法人情報情報のデータ型
 */
interface CorporationData {
  companyName: string;
  ceoName: string;
  zipCode: string;
  headOfficeAddress: string;
  phoneNumber: string;
  email: string;
  kobutsushoKoanIinkai: string;
  kobutsushoNumber: string;
  invoiceNumber: string;
}

/**
 * 法人情報編集モーダルのプロパティ
 */
interface Props {
  accountID: string;
  isOpen: boolean;
  onClose: () => void;
  initialData: CorporationData;
  onConfirm: (data: CorporationData, password: string) => Promise<boolean>;
}

/**
 * 法人情報情報を編集するためのモーダルコンポーネント
 * 法人情報の編集とパスワード変更機能を提供する
 */
export const CorporationEditModal: React.FC<Props> = ({
  accountID,
  isOpen,
  onClose,
  initialData,
  onConfirm,
}) => {
  // 状態管理
  const [isLoading, setIsLoading] = useState(false);

  // フォームデータの初期値
  const [formData, setFormData] = useState<CorporationData>({
    companyName: '',
    ceoName: '',
    zipCode: '',
    headOfficeAddress: '',
    phoneNumber: '',
    email: '',
    kobutsushoKoanIinkai: '',
    kobutsushoNumber: '',
    invoiceNumber: '',
  });

  // バリデーションエラー管理
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // サブモーダルの表示状態管理
  const [passwordUpdateModalOpen, setPasswordUpdateModalOpen] = useState(false);
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
        headOfficeAddress: `${address.prefecture}${address.city}${address.address2}`,
      }));
    }
  }, [address]);

  /**
   * モーダルが開かれたときに初期データをフォームにセットする
   */
  useEffect(() => {
    setFormData({
      companyName: initialData.companyName || '',
      ceoName: initialData.ceoName || '',
      zipCode: initialData.zipCode || '',
      headOfficeAddress: initialData.headOfficeAddress || '',
      phoneNumber: initialData.phoneNumber || '',
      email: initialData.email || '',
      kobutsushoKoanIinkai: initialData.kobutsushoKoanIinkai || '',
      kobutsushoNumber: initialData.kobutsushoNumber || '',
      invoiceNumber: initialData.invoiceNumber || '',
    });
    setErrors({});
    setIsLoading(false);
  }, [isOpen]);

  /**
   * フォームのバリデーションを行う
   * 必須項目が入力されていない場合はエラーメッセージを表示
   */
  const handleValidate = () => {
    const newErrors: { [key: string]: string } = {};
    setErrors({});

    if (!formData.companyName)
      newErrors.companyName = '法人名を入力してください';
    if (!formData.ceoName) newErrors.ceoName = '代表者名を入力してください';
    if (!formData.zipCode) newErrors.zipCode = '郵便番号を入力してください';
    if (!formData.headOfficeAddress)
      newErrors.headOfficeAddress = '本社所在地を入力してください';
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
  const handleSettingSave = async (currentPassword: string) => {
    setIsLoading(true);
    const isSuccess = await onConfirm(formData, currentPassword);
    setIsLoading(false);
    if (!isSuccess) return;
    setPasswordConfirmModalOpen(false);
  };

  /**
   * 郵便番号入力時の処理
   */
  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, zipCode: e.target.value }));
  };

  return (
    <>
      <CustomModalWithIcon
        open={isOpen}
        onClose={onClose}
        title="法人情報編集"
        onActionButtonClick={handleValidate}
        actionButtonText="編集内容を保存"
        cancelButtonText="編集を破棄"
        secondActionButtonText="パスワード編集"
        onSecondActionButtonClick={() => setPasswordUpdateModalOpen(true)}
        width="90%"
      >
        <Box sx={{ backgroundColor: 'white', p: 3 }}>
          <Box sx={{ p: 3 }}>
            {/* 法人名入力フィールド */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                法人名
              </Typography>
              <TextField
                value={formData.companyName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    companyName: e.target.value,
                  }))
                }
                error={!!errors.companyName}
                helperText={errors.companyName}
                size="small"
                sx={{ width: '90%' }}
              />
            </Box>
            {/* 代表者名入力フィールド */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                代表者名
              </Typography>
              <TextField
                value={formData.ceoName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, ceoName: e.target.value }))
                }
                error={!!errors.ceoName}
                helperText={errors.ceoName}
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
            {/* 本社所在地入力フィールド */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                本社所在地
              </Typography>
              <TextField
                value={formData.headOfficeAddress}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    headOfficeAddress: e.target.value,
                  }))
                }
                error={!!errors.headOfficeAddress}
                helperText={errors.headOfficeAddress}
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
                type="email"
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
            {/* 古物商公安委員会入力フィールド */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                古物商公安委員会
              </Typography>
              <Select
                fullWidth
                size="small"
                defaultValue={`${prefectures[0].name}公安委員会`}
                value={formData.kobutsushoKoanIinkai}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    kobutsushoKoanIinkai: e.target.value,
                  }))
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
            </Box>
            {/* 古物商番号入力フィールド */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                古物商番号
              </Typography>
              <NoSpinTextField
                type="number"
                value={formData.kobutsushoNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    kobutsushoNumber: e.target.value,
                  }))
                }
                size="small"
                sx={{ width: '90%' }}
              />
            </Box>
            {/* インボイス登録番号入力フィールド */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Typography sx={{ width: '200px', minWidth: '200px' }}>
                インボイス登録番号
              </Typography>
              <TextField
                value={formData.invoiceNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    invoiceNumber: toHalfWidthOnly(e.target.value),
                  }))
                }
                size="small"
                sx={{ width: '90%' }}
              />
            </Box>
          </Box>
        </Box>
      </CustomModalWithIcon>

      {/* パスワード更新用モーダル */}
      <PasswordUpdateModal
        isOpen={passwordUpdateModalOpen}
        onClose={() => setPasswordUpdateModalOpen(false)}
        accountID={accountID}
      />

      {/* パスワード確認用モーダル */}
      <PasswordConfirmModal
        isOpen={passwordConfirmModalOpen}
        onClose={() => setPasswordConfirmModalOpen(false)}
        onConfirm={handleSettingSave}
        isLoading={isLoading}
      />
    </>
  );
};

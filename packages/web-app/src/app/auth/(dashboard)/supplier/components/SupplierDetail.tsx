import {
  Box,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import React, { useEffect } from 'react';
import { Supplier } from '@prisma/client';
import { useAddressSearch } from '@/feature/stocking/hooks/useAddressSearch';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { DetailCard } from '@/components/cards/DetailCard';
import { useStore } from '@/contexts/StoreContext';
import { SupplierData } from '@/app/auth/(dashboard)/supplier/page';
import { SupplierDataError } from '@/app/auth/(dashboard)/supplier/page';
export const SupplierDetail = ({
  supplier,
  status,
  setStatus,
  supplierData,
  setSupplierData,
  errors,
}: {
  supplier: Supplier | null;
  status: boolean;
  setStatus: React.Dispatch<React.SetStateAction<boolean>>;
  supplierData: SupplierData;
  setSupplierData: React.Dispatch<React.SetStateAction<SupplierData>>;
  errors: SupplierDataError;
}) => {
  const { store } = useStore();
  const { address, handleAddressSearch } = useAddressSearch(
    supplierData.zip_code || '',
  );

  useEffect(() => {
    if (supplier) {
      // 更新処理
      setStatus(supplier.enabled);
      setSupplierData({
        display_name: supplier.display_name || null,
        address: supplier.address || null,
        zip_code: supplier.zip_code || null,
        prefecture: supplier.prefecture || null,
        city: supplier.city || null,
        address2: supplier.address2 || null,
        building: supplier.building || null,
        phone_number: supplier.phone_number || null,
        fax_number: supplier.fax_number || null,
        email: supplier.email || null,
        staff_name: supplier.staff_name || null,
        description: supplier.description || null,
        order_method: supplier.order_method || null,
        order_number: supplier.order_number || 0,
        enabled: supplier.enabled, // `enabled` を明示的にセット
      });
    } else {
      // 新規登録
      setSupplierData({
        display_name: '',
        address: '',
        zip_code: '',
        prefecture: '',
        city: '',
        address2: '',
        building: '',
        phone_number: '',
        fax_number: '',
        email: '',
        staff_name: '',
        description: '',
        order_method: '',
        order_number: 0,
        enabled: true, // 新規作成時は `true` に設定
      });
    }
  }, [supplier, store.id]);

  //住所検索時
  useEffect(() => {
    setSupplierData((prev) => ({
      ...prev,
      prefecture: address.prefecture,
      city: address.city,
      address2: address.address2,
    }));
  }, [address]);

  const InputLabelProps = {
    shrink: true,
    sx: {
      color: 'text.primary',
    },
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSupplierData({ ...supplierData, [name]: value });
  };

  const handlePostalCodeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSupplierData({ ...supplierData, zip_code: event.target.value });
  };
  const handleStatusChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    value: string,
  ) => {
    setStatus(value === '有効'); // value が '有効' の場合は true、そうでない場合は false を設定
  };

  return (
    <>
      <DetailCard
        containerSx={{ height: '100%', pb: 10 }}
        title={
          supplierData?.display_name === ''
            ? '　'
            : supplierData?.display_name ?? '仕入れ先詳細'
        }
        titleSx={{
          position: 'sticky',
          backgroundColor: 'white',
          zIndex: '1',
          top: 0,
        }}
        content={
          supplier ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ minWidth: 130 }}>
                  仕入れ先ID
                </Typography>
                <TextField
                  fullWidth
                  name="id"
                  value={supplier.id ?? ''}
                  size="small"
                  disabled={true}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ minWidth: 130 }}>
                  名前
                </Typography>
                <TextField
                  fullWidth
                  name="display_name"
                  value={supplierData?.display_name ?? ''}
                  size="small"
                  onChange={handleChange}
                  error={!!errors.display_name} // エラーがある場合は error 属性を true にする
                  helperText={errors.display_name} // エラーメッセージを表示
                  InputLabelProps={InputLabelProps}
                  disabled={!supplier}
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="body1" sx={{ minWidth: 130 }}>
                  郵便番号
                </Typography>
                <TextField
                  fullWidth
                  name="zip_code"
                  value={supplierData?.zip_code ?? ''}
                  size="small"
                  onChange={handlePostalCodeChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddressSearch();
                    }
                  }}
                  InputLabelProps={InputLabelProps}
                  disabled={!supplier}
                  sx={{ mr: 2 }}
                />
                <SecondaryButtonWithIcon
                  onClick={handleAddressSearch}
                  disabled={!supplier}
                >
                  住所検索
                </SecondaryButtonWithIcon>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ minWidth: 130 }}>
                  都道府県
                </Typography>
                <TextField
                  fullWidth
                  name="prefecture"
                  value={supplierData?.prefecture ?? ''}
                  size="small"
                  onChange={handleChange}
                  InputLabelProps={InputLabelProps}
                  disabled={!supplier}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ minWidth: 130 }}>
                  市区町村
                </Typography>
                <TextField
                  fullWidth
                  name="city"
                  value={supplierData?.city ?? ''}
                  size="small"
                  onChange={handleChange}
                  InputLabelProps={InputLabelProps}
                  disabled={!supplier}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ minWidth: 130 }}>
                  番地名
                </Typography>
                <TextField
                  fullWidth
                  name="address2"
                  value={supplierData?.address2 ?? ''}
                  size="small"
                  onChange={handleChange}
                  InputLabelProps={InputLabelProps}
                  disabled={!supplier}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ minWidth: 130 }}>
                  建物
                </Typography>
                <TextField
                  fullWidth
                  name="building"
                  value={supplierData?.building ?? ''}
                  size="small"
                  onChange={handleChange}
                  InputLabelProps={InputLabelProps}
                  disabled={!supplier}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ minWidth: 130 }}>
                  電話番号
                </Typography>
                <TextField
                  fullWidth
                  value={supplierData?.phone_number ?? ''}
                  size="small"
                  name="phone_number"
                  onChange={handleChange}
                  InputLabelProps={InputLabelProps}
                  disabled={!supplier}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ minWidth: 130 }}>
                  FAX
                </Typography>
                <TextField
                  fullWidth
                  value={supplierData?.fax_number ?? ''}
                  size="small"
                  name="fax_number"
                  onChange={handleChange}
                  InputLabelProps={InputLabelProps}
                  disabled={!supplier}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ minWidth: 130 }}>
                  メール
                </Typography>
                <TextField
                  fullWidth
                  value={supplierData?.email ?? ''}
                  size="small"
                  name="email"
                  onChange={handleChange}
                  InputLabelProps={InputLabelProps}
                  disabled={!supplier}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ minWidth: 130 }}>
                  仕入れ先担当者
                </Typography>
                <TextField
                  fullWidth
                  value={supplierData?.staff_name ?? ''}
                  size="small"
                  name="staff_name"
                  onChange={handleChange}
                  InputLabelProps={InputLabelProps}
                  disabled={!supplier}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ minWidth: 130 }}>
                  発注方法
                </Typography>
                <TextField
                  fullWidth
                  value={supplierData?.order_method ?? ''}
                  size="small"
                  name="order_method"
                  onChange={handleChange}
                  InputLabelProps={InputLabelProps}
                  disabled={!supplier}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ minWidth: 130 }}>
                  備考
                </Typography>
                <TextField
                  fullWidth
                  id="outlined-multiline-static"
                  multiline
                  rows={4}
                  name="description"
                  onChange={handleChange}
                  InputLabelProps={InputLabelProps}
                  disabled={!supplier}
                  value={supplierData?.description ?? ''}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ minWidth: 130 }}>
                  表示優先順位
                </Typography>
                <TextField
                  sx={{ width: '25%' }} // 幅を50%に設定
                  value={supplierData?.order_number ?? ''}
                  size="small"
                  name="order_number"
                  onChange={handleChange}
                  InputLabelProps={InputLabelProps}
                  disabled={!supplier}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ minWidth: 130 }}>
                  ステータス
                </Typography>
                <RadioGroup
                  row
                  sx={{ ml: 1 }}
                  value={status ? '有効' : '無効'}
                  onChange={handleStatusChange}
                >
                  <FormControlLabel
                    value="有効"
                    control={<Radio />}
                    label="有効"
                    disabled={!supplier}
                  />
                  <FormControlLabel
                    value="無効"
                    control={<Radio />}
                    label="無効"
                    disabled={!supplier}
                  />
                </RadioGroup>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                mt: 2,
                p: 2,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography variant="body1">
                仕入れ先をクリックして詳細を表示
              </Typography>
            </Box>
          )
        }
        contentSx={{
          height: '100%',
          overflow: 'scroll',
        }}
      />
    </>
  );
};

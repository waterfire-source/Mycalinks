import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Supplier } from '@prisma/client';
import { useStore } from '@/contexts/StoreContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useRouter } from 'next/navigation';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useAddressSearch } from '@/feature/stocking/hooks/useAddressSearch';
import { NoSpinTextField } from '@/components/common/NoSpinTextField';

export const SupplierRegistrationModal = ({
  open,
  onClose,
  supplier,
  fetchSupplierData,
}: {
  open: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  fetchSupplierData: () => Promise<void>;
}) => {
  const { store } = useStore();
  const clientAPI = createClientAPI();
  const router = useRouter();
  const { setAlertState } = useAlert();

  const [status, setStatus] = useState(true);
  const [supplierData, setSupplierData] = useState({
    display_name: '',
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
  });

  const { address, handleAddressSearch } = useAddressSearch(
    supplierData.zip_code,
  );

  useEffect(() => {
    if (supplier) {
      //更新処理
      setStatus(supplier.enabled);
      setSupplierData({
        display_name: supplier.display_name || '',
        zip_code: supplier.zip_code || '',
        prefecture: supplier.prefecture || '',
        city: supplier.city || '',
        address2: supplier.address2 || '',
        building: supplier.building || '',
        phone_number: supplier.phone_number || '',
        fax_number: supplier.fax_number || '',
        email: supplier.email || '',
        staff_name: supplier.staff_name || '',
        description: supplier.description || '',
        order_method: supplier.order_method || '',
        order_number: supplier.order_number || 0,
      });
    } else {
      //supplierがない場合は新規登録
      //入力欄をリセット
      setSupplierData({
        display_name: '',
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
      });
    }
  }, [supplier]);

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

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatus(event.target.checked);
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

  //登録/更新処理
  const handleSubmit = async () => {
    const body = { ...supplierData, enabled: status };

    const response = supplier
      ? await clientAPI.stocking.updateStockingSupplier({
          store_id: store.id,
          body: { id: supplier.id, ...body },
        })
      : await clientAPI.stocking.createStockingSupplier({
          store_id: store.id,
          body,
        });

    if (response instanceof CustomError) {
      setAlertState({
        message: `${response.status}:${response.message}`,
        severity: 'error',
      });
    } else {
      setAlertState({
        message: supplier
          ? '仕入先が正常に更新されました。'
          : '仕入先が正常に登録されました。',
        severity: 'success',
      });
      fetchSupplierData();
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70%',
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
        }}
      >
        <Box
          sx={{
            bgcolor: 'grey.700',
            color: 'white',
            padding: '11px',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" component="h2">
            仕入先新規登録・編集
          </Typography>
        </Box>
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body1" component="p">
                仕入先ID: {supplier ? supplier.id : '新規'}
              </Typography>
              <TextField
                label="名前"
                fullWidth
                name="display_name"
                size="small"
                value={supplierData.display_name}
                onChange={handleChange}
                InputLabelProps={InputLabelProps}
              />
              <Grid container spacing={1}>
                <Grid item xs={8}>
                  <NoSpinTextField
                    type="text"
                    label="郵便番号"
                    fullWidth
                    size="small"
                    value={supplierData.zip_code}
                    onChange={handlePostalCodeChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddressSearch();
                      }
                    }}
                    InputLabelProps={InputLabelProps}
                  />
                </Grid>
                <Grid
                  item
                  xs={4}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleAddressSearch}
                  >
                    住所検索
                  </Button>
                </Grid>
              </Grid>
              <Typography variant="body1" component="p">
                住所
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="都道府県"
                    fullWidth
                    size="small"
                    name="prefecture"
                    value={supplierData.prefecture}
                    onChange={handleChange}
                    InputLabelProps={InputLabelProps}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="市区町村"
                    fullWidth
                    size="small"
                    name="city"
                    value={supplierData.city}
                    onChange={handleChange}
                    InputLabelProps={InputLabelProps}
                  />
                </Grid>
              </Grid>
              <TextField
                label="番地"
                fullWidth
                size="small"
                name="address2"
                value={supplierData.address2}
                onChange={handleChange}
                InputLabelProps={InputLabelProps}
              />
              <TextField
                label="建物名"
                fullWidth
                size="small"
                name="building"
                value={supplierData.building}
                onChange={handleChange}
                InputLabelProps={InputLabelProps}
              />
              <NoSpinTextField
                type="number"
                label="電話番号"
                fullWidth
                size="small"
                name="phone_number"
                value={supplierData.phone_number}
                onChange={handleChange}
                InputLabelProps={InputLabelProps}
              />
              <NoSpinTextField
                type="number"
                label="FAX"
                fullWidth
                size="small"
                name="fax_number"
                value={supplierData.fax_number}
                onChange={handleChange}
                InputLabelProps={InputLabelProps}
              />
              <TextField
                type="email"
                label="メール"
                fullWidth
                size="small"
                name="email"
                value={supplierData.email}
                onChange={handleChange}
                InputLabelProps={InputLabelProps}
              />
              <TextField
                label="担当者"
                fullWidth
                size="small"
                name="staff_name"
                value={supplierData.staff_name}
                onChange={handleChange}
                InputLabelProps={InputLabelProps}
              />
              <TextField
                label="発注方法"
                fullWidth
                size="small"
                name="order_method"
                value={supplierData.order_method}
                onChange={handleChange}
                InputLabelProps={InputLabelProps}
              />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                alignItems: 'flex-start',
              }}
            >
              <TextField
                label="備考"
                fullWidth
                multiline
                rows={8}
                name="description"
                value={supplierData.description}
                onChange={handleChange}
                InputLabelProps={InputLabelProps}
              />
              <TextField
                type="number"
                label="表示優先順位"
                fullWidth
                size="small"
                name="order_number"
                value={supplierData.order_number}
                onChange={(e) =>
                  setSupplierData({
                    ...supplierData,
                    order_number: Number(e.target.value),
                  })
                }
                InputLabelProps={InputLabelProps}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={status}
                    onChange={handleStatusChange}
                    color="primary"
                  />
                }
                label="有効無効"
                labelPlacement="start"
              />
            </Box>
          </Grid>
        </Grid>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            p: 2,
          }}
        >
          <PrimaryButton
            onClick={handleSubmit}
            sx={{
              px: 5,
              py: 1.5,
            }}
          >
            登録
          </PrimaryButton>
        </Box>
      </Box>
    </Modal>
  );
};

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Tabs, Grid, Stack, useTheme, Typography } from '@mui/material';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { useStore } from '@/contexts/StoreContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { Supplier } from '@prisma/client';
import { SupplierDetail } from '@/app/auth/(dashboard)/supplier/components/SupplierDetail';
import { SupplierRegistrationModal } from '@/app/auth/(dashboard)/supplier/components/SupplierRegistrationModal';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { CustomTabTableStyle } from '@/components/tabs/CustomTabTableStyle';
import { SupplierTable } from '@/app/auth/(dashboard)/supplier/components/SupplierTable';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import { HelpIcon } from '@/components/common/HelpIcon';

export interface SupplierData {
  display_name: string | null;
  address: string | null;
  zip_code: string | null;
  prefecture: string | null;
  order_method: string | null;
  city: string | null;
  address2: string | null;
  building: string | null;
  phone_number: string | null;
  fax_number: string | null;
  email: string | null;
  staff_name: string | null;
  order_number: number | null;
  enabled: boolean;
  description: string | null;
}

export interface SupplierDataError {
  display_name?: string | null;
  address?: string | null;
  zip_code?: string | null;
  prefecture?: string | null;
  order_method?: string | null;
  city?: string | null;
  address2?: string | null;
  building?: string | null;
  phone_number?: string | null;
  fax_number?: string | null;
  email?: string | null;
  staff_name?: string | null;
  order_number?: number | null;
  enabled?: string | null;
  description?: string | null;
}

export default function SupplierPage() {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'enabled' | 'disabled'
  >('enabled'); // 状態フィルタリング
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const [status, setStatus] = useState(true);
  const [supplierData, setSupplierData] = useState<SupplierData>({
    display_name: null,
    zip_code: null,
    address: null,
    prefecture: null,
    city: null,
    address2: null,
    building: null,
    phone_number: null,
    fax_number: null,
    email: null,
    staff_name: null,
    description: null,
    order_method: null,
    order_number: 0,
    enabled: true,
  });

  // Tab管理
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);

    switch (newValue) {
      case 0:
        setFilterStatus('enabled');
        break;
      case 1:
        setFilterStatus('disabled');
        break;
      case 2:
        setFilterStatus('all');
        break;
    }
  };

  const { store } = useStore();
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // 確認モーダルの状態

  // 一覧取得
  const fetchSupplierData = useCallback(async () => {
    const response = await clientAPI.stocking.listStockingSupplier({
      store_id: store.id,
    });

    if (response instanceof CustomError) {
      setAlertState({
        message: `${response.status}:${response.message}`,
        severity: 'error',
      });
      return;
    }

    // データをソート
    // const sortedSuppliers = response.sort((a, b) => (a.enabled === b.enabled ? 0 : a.enabled ? -1 : 1));
    setSuppliers(response);
  }, [clientAPI.stocking, setAlertState, store.id]);

  useEffect(() => {
    if (store) {
      fetchSupplierData();
    }
  }, [fetchSupplierData, store]);

  useEffect(() => {
    if (newSupplier && selectedSupplier === null) {
      setModalOpen(true);
      setNewSupplier(false);
    }
  }, [newSupplier, selectedSupplier]);

  const handleNewSupplierClick = () => {
    setNewSupplier(true);
    setSelectedSupplier(null);
  };

  // フィルタリングされたサプライヤーリストを取得
  const filteredSuppliers = useMemo(() => {
    switch (filterStatus) {
      case 'enabled':
        return suppliers.filter((supplier) => supplier.enabled);
      case 'disabled':
        return suppliers.filter((supplier) => !supplier.enabled);
      default:
        return suppliers;
    }
  }, [filterStatus, suppliers]);

  const theme = useTheme();

  // バリデーション
  const [errors, setErrors] = useState<SupplierDataError>({});
  const validate = useCallback((data: SupplierData) => {
    const errors: SupplierDataError = {};

    if (!data.display_name) {
      errors.display_name = '名前は必須です。';
    }
    if (data.phone_number && !/^[0-9-]{10,}$/.test(data.phone_number)) {
      errors.phone_number = '電話番号の形式が正しくありません。';
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'メールアドレスの形式が正しくありません。';
    }
    if (data.zip_code && !/^\d{3}-?\d{4}$/.test(data.zip_code)) {
      errors.zip_code = '郵便番号の形式が正しくありません。';
    }

    return errors;
  }, []);

  useEffect(() => {
    if (selectedSupplier) {
      const errors = validate(supplierData);
      setErrors(errors);
    }
  }, [selectedSupplier, supplierData, validate]);

  //登録/更新処理
  const handleSubmit = async () => {
    const errors = validate(supplierData);
    setErrors(errors);

    if (Object.keys(errors).length > 0) {
      setAlertState({
        message: '入力内容に誤りがあります。',
        severity: 'error',
      });
      return; // エラーがある場合は処理を中断
    }

    if (supplierData.order_number) {
      supplierData.order_number = Number(supplierData.order_number);
    }

    const body = { ...supplierData, enabled: status };
    if (body.display_name === null) {
      setAlertState({
        message: '名前は必須です。',
        severity: 'error',
      });
      return;
    }

    const response = selectedSupplier
      ? await clientAPI.stocking.updateStockingSupplier({
          store_id: store.id,
          body: { id: selectedSupplier.id, ...body },
        })
      : await clientAPI.stocking.createStockingSupplier({
          store_id: store.id,
          body: { ...body },
        });

    if (response instanceof CustomError) {
      setAlertState({
        message: `${response.status}:${response.message}`,
        severity: 'error',
      });
    } else {
      setAlertState({
        message: selectedSupplier
          ? '仕入先が正常に更新されました。'
          : '仕入先が正常に登録されました。',
        severity: 'success',
      });
      fetchSupplierData();
    }
  };

  // **削除処理**
  const handleDeleteSupplier = async () => {
    if (!selectedSupplier) return;

    const response = await clientAPI.stocking.deleteStockingSupplier({
      storeID: store.id,
      supplierID: selectedSupplier.id,
    });

    if (response instanceof CustomError) {
      setAlertState({
        message: `${response.status}:${response.message}`,
        severity: 'error',
      });
    } else {
      setAlertState({ message: '仕入先を削除しました。', severity: 'success' });
      setSelectedSupplier(null); // 選択状態をリセット
      setSelectedRow(null);
      fetchSupplierData(); // 一覧更新
    }
    setIsConfirmModalOpen(false); // モーダルを閉じる
  };

  // **削除確認モーダルを開く**
  const handleConfirmDeleteSupplier = () => {
    setIsConfirmModalOpen(true);
  };

  return (
    <ContainerLayout
      title="仕入れ先リスト"
      helpArchivesNumber={285}
      alignItems="flex-start"
      actions={
        <Stack
          direction="column"
          gap="12px"
          marginLeft="auto"
          marginRight="0px"
        >
          <PrimaryButtonWithIcon onClick={handleNewSupplierClick}>
            新規仕入先登録
          </PrimaryButtonWithIcon>
          {/* <SimpleButtonWithIcon
            onClick={() => router.push(PATH.STOCK.register.upload)}
          >
            ※ CSVアップロード
          </SimpleButtonWithIcon> */}
        </Stack>
      }
    >
      {/* サプライヤーテーブル */}
      <Box
        sx={{
          flexGrow: 1,
          pb: 2,
          height: '100%',
          position: 'relative',
        }}
      >
        <Grid
          container
          spacing={2}
          sx={{
            height: 'calc(100vh - 250px)',
            marginTop: -4,
            position: 'sticky',
            top: '0px',
          }}
        >
          <Grid item xs={8} sx={{ height: '100%' }}>
            {/* フィルターボタン */}
            <Box
              sx={{
                pt: 1,
                position: 'sticky',
                zIndex: '3',
                top: '0px',
                backgroundColor: theme.palette.background.default,
              }}
              flex={1}
            >
              <Box
                sx={{
                  borderBottom: '8px solid #b82a2a',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
              >
                <Tabs
                  value={tabIndex}
                  onChange={handleTabChange}
                  sx={{
                    margin: 0,
                    padding: 0,
                    minHeight: '31px',
                  }}
                >
                  <CustomTabTableStyle label={<Box>有効</Box>} />
                  <CustomTabTableStyle label={<Box>無効</Box>} />
                  <CustomTabTableStyle label={<Box>全て</Box>} />
                </Tabs>
              </Box>
            </Box>
            <SupplierTable
              filteredSuppliers={filteredSuppliers}
              selectedSupplier={selectedSupplier}
              setSelectedSupplier={setSelectedSupplier}
              selectedRow={selectedRow}
              setSelectedRow={setSelectedRow}
              filterStatus={filterStatus}
            />
            <Box
              sx={{
                position: 'sticky',
                bottom: -1,
                zIndex: 1,
                backgroundColor: theme.palette.background.default,
                pb: 4,
                mb: -2,
              }}
            >
              <Box
                sx={{
                  boxShadow:
                    '0 -3px 6px rgba(0, 0, 0, 0.1),0 3px 6px rgba(0, 0, 0, 0.1)',
                  borderRadius: '0px 0px 8px 8px',
                  backgroundColor: 'white',
                  height: '52.8px',
                }}
              ></Box>
            </Box>
          </Grid>
          <Grid
            item
            xs={4}
            sx={{
              height: 'calc(100vh - 150px)',
              mt: 4,
              pb: 6,
            }}
          >
            <SupplierDetail
              supplier={selectedSupplier}
              status={status}
              setStatus={setStatus}
              supplierData={supplierData}
              setSupplierData={setSupplierData}
              errors={errors}
            />
            <Box
              sx={{
                position: 'sticky',
                bottom: -1,
                zIndex: 1,
                backgroundColor: theme.palette.background.default,
                pb: 4,
                mb: -2,
              }}
            >
              <Box
                sx={{
                  boxShadow:
                    '0 -3px 6px rgba(0, 0, 0, 0.1),0 3px 6px rgba(0, 0, 0, 0.1)',
                  borderRadius: '0px 0px 8px 8px',
                  backgroundColor: 'white',
                  height: '52.8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  p: 1,
                  position: 'sticky',
                  zIndex: '1',
                  bottom: -1,
                }}
              >
                {selectedSupplier ? (
                  <>
                    <Box display="flex" alignItems="center" p={0}>
                      <SecondaryButtonWithIcon
                        disabled={!selectedSupplier}
                        onClick={handleConfirmDeleteSupplier}
                      >
                        削除
                      </SecondaryButtonWithIcon>
                      <HelpIcon helpArchivesNumber={1395} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 0 }}>
                      <PrimaryButtonWithIcon
                        onClick={handleSubmit}
                        disabled={!selectedSupplier}
                      >
                        編集内容を保存
                      </PrimaryButtonWithIcon>
                    </Box>
                  </>
                ) : (
                  <></>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* 確認用モーダル */}
      <CustomModalWithIcon
        open={isConfirmModalOpen}
        width="40%"
        height="30%"
        onClose={() => setIsConfirmModalOpen(false)}
        title="仕入れ先を削除"
        actionButtonText="削除する"
        onActionButtonClick={handleDeleteSupplier}
        cancelButtonText="キャンセル"
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Typography textAlign="center">
            {selectedSupplier?.display_name} を削除しますか？
            <br />
            この操作は取り消せません。
          </Typography>
        </Box>
      </CustomModalWithIcon>

      {/* モーダル */}
      <SupplierRegistrationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        supplier={selectedSupplier}
        fetchSupplierData={fetchSupplierData}
      />
    </ContainerLayout>
  );
}

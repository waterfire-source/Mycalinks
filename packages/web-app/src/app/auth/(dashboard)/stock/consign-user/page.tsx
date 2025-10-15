'use client';

import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { Stack, Typography, Grid, Box } from '@mui/material';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
// import UploadIcon from '@mui/icons-material/Upload';
import { CustomTabTable, TabDef } from '@/components/tabs/CustomTabTable';
import { ColumnDef } from '@/components/tables/CustomTable';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { DetailCard } from '@/components/cards/DetailCard';
import {
  ConsignmentClient,
  useConsignment,
} from '@/feature/consign/hooks/useConsignment';
import { useAlert } from '@/contexts/AlertContext';
import {
  AccountType,
  ConsignmentClientFormData,
  consignmentClientSchema,
  CreateOrEditClientForm,
  initialFormData,
  PaymentMethod,
} from '@/feature/consign/components/CreateOrEditClientForm';
import { CreateClientModal } from '@/feature/consign/components/CreateClientModal';
import { ConfirmationModal } from '@/components/modals/ConfirmationModal';

export default function ConsignUserPage() {
  const [selectedClient, setSelectedClient] =
    useState<ConsignmentClient | null>(null);
  const [isOpenCreateClient, setIsOpenCreateClient] = useState(false);
  const [isOpenDeleteConfirm, setIsOpenDeleteConfirm] = useState(false);
  const hasStock = (selectedClient?.summary?.totalStockNumber ?? 0) > 0;

  const {
    isLoading,
    consignmentClients,
    fetchConsignmentClients,
    createOrUpdateConsignmentClient,
    deleteConsignmentClient,
  } = useConsignment();

  const { setAlertState } = useAlert();

  const methods = useForm<ConsignmentClientFormData>({
    resolver: zodResolver(consignmentClientSchema),
    defaultValues: initialFormData,
  });

  const { reset } = methods;

  // データ取得
  const handleFetchClients = () => {
    fetchConsignmentClients({});
  };
  useEffect(() => {
    handleFetchClients();
  }, []);

  const handleClientSelect = (client: ConsignmentClient) => {
    setSelectedClient(client);

    // サーバーから取得したデータをフォーム用の値に変換
    const paymentMethod =
      client.commission_payment_method === 'CASH'
        ? PaymentMethod.Cash
        : client.commission_payment_method === 'BANK'
        ? PaymentMethod.Bank
        : PaymentMethod.Cash;
    const parsedBankInfo = client.bank_info_json
      ? JSON.parse(client.bank_info_json)
      : null;
    const accountType =
      parsedBankInfo?.accountType === 'SAVING'
        ? AccountType.Saving
        : parsedBankInfo?.accountType === 'CHECKING'
        ? AccountType.Checking
        : undefined;

    reset({
      full_name: client.full_name || '',
      display_name: client.display_name || '',
      zip_code: client.zip_code || '',
      prefecture: client.prefecture || '',
      city: client.city || '',
      address2: client.address2 || '',
      building: client.building || '',
      phone_number: client.phone_number || '',
      fax_number: client.fax_number || '',
      email: client.email || '',
      commission_cash_price: client.commission_cash_price || 0,
      commission_card_price: client.commission_card_price || 0,
      payment_cycle: client.payment_cycle || '',
      commission_payment_method: paymentMethod,
      bankName: parsedBankInfo?.bankName ?? undefined,
      branchCode: parsedBankInfo?.branchCode ?? undefined,
      accountType: accountType ?? undefined,
      accountNumber: parsedBankInfo?.accountNumber ?? undefined,
      description: client.description || '',
      enabled: client.enabled,
      display_name_on_receipt: client.display_name_on_receipt,
    });
  };

  const onSubmit = async (data: ConsignmentClientFormData) => {
    if (!selectedClient) return;
    const { bankName, branchCode, accountType, accountNumber, ...rest } = data;

    const bank_info_json = JSON.stringify({
      bankName,
      branchCode,
      accountType,
      accountNumber,
    });

    const result = await createOrUpdateConsignmentClient({
      ...rest,
      id: selectedClient.id,
      bank_info_json,
    });

    if (result) {
      setAlertState({
        message: '委託者情報を更新しました',
        severity: 'success',
      });
      // データを再取得
      handleFetchClients();
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedClient) {
      const result = await deleteConsignmentClient(selectedClient.id);
      if (result) {
        setAlertState({
          message: '委託者を削除しました',
          severity: 'success',
        });
        setSelectedClient(null);
        reset(initialFormData);
        handleFetchClients();
      }
      setIsOpenDeleteConfirm(false);
    }
  };

  const tabs: TabDef<ConsignmentClient>[] = [
    {
      label: '有効',
      value: 'active',
      filterFn: (data) => data.filter((client) => client.enabled),
    },
    {
      label: '無効',
      value: 'inactive',
      filterFn: (data) => data.filter((client) => !client.enabled),
    },
    {
      label: 'すべて',
      value: 'all',
    },
  ];

  // 委託者一覧のカラム定義
  const clientColumns: ColumnDef<ConsignmentClient>[] = [
    {
      header: '委託者名',
      render: (item: ConsignmentClient) => item.full_name,
      key: 'full_name',
      sx: { width: '150px' },
    },
    {
      header: '電話番号',
      render: (item: ConsignmentClient) => item.phone_number || '-',
      key: 'phone_number',
      sx: { width: '130px' },
    },
    {
      header: 'メールアドレス',
      render: (item: ConsignmentClient) => item.email || '-',
      key: 'email',
      sx: { width: '200px' },
    },
    {
      header: '支払サイクル',
      render: (item: ConsignmentClient) => item.payment_cycle || '-',
      key: 'payment_cycle',
      sx: { width: '150px' },
    },
  ];

  // 委託者データを取得
  const getClients = (): ConsignmentClient[] => consignmentClients ?? [];

  const renderActions = () => {
    return (
      <Stack spacing={1}>
        <PrimaryButtonWithIcon
          size="small"
          onClick={() => setIsOpenCreateClient(true)}
        >
          新規委託者登録
        </PrimaryButtonWithIcon>
        {/* <SecondaryButtonWithIcon size="small" icon={<UploadIcon />}>
          CSVアップロード
        </SecondaryButtonWithIcon> */}
      </Stack>
    );
  };

  return (
    <ContainerLayout
      title="委託者管理"
      helpArchivesNumber={3038}
      actions={renderActions()}
    >
      <Grid container spacing={2} sx={{ height: '100%', overflow: 'hidden' }}>
        <Grid item xs={12} md={7} sx={{ height: '100%', display: 'flex' }}>
          {/* 委託者一覧 */}
          <CustomTabTable<ConsignmentClient>
            data={getClients()}
            tabs={tabs}
            columns={clientColumns}
            rowKey={(item: any) => item.id}
            onTabChange={() => {}}
            isLoading={isLoading}
            onRowClick={(item) => handleClientSelect(item)}
            selectedRow={selectedClient}
            tableWrapperSx={{ height: 'calc(100% - 40px)' }}
            tabTableWrapperSx={{ flex: 1 }}
          />
        </Grid>

        <Grid
          item
          xs={12}
          md={5}
          sx={{ height: 'calc(100% - 40px)' }}
          mt="40px"
        >
          {/* 委託者詳細フォーム */}
          <DetailCard
            title="委託者情報"
            content={
              selectedClient ? (
                <CreateOrEditClientForm methods={methods} onSubmit={onSubmit} />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography variant="body1">
                    クリックして詳細を表示
                  </Typography>
                </Box>
              )
            }
            bottomContent={
              selectedClient ? (
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="space-between"
                  sx={{ width: '100%' }}
                >
                  <SecondaryButton
                    onClick={() => setIsOpenDeleteConfirm(true)}
                    disabled={!selectedClient || hasStock}
                    loading={isLoading}
                  >
                    削除
                  </SecondaryButton>
                  <PrimaryButton
                    type="submit"
                    form="consignment-form"
                    disabled={!selectedClient}
                    loading={isLoading}
                  >
                    設定内容を保存
                  </PrimaryButton>
                </Stack>
              ) : undefined
            }
          />
        </Grid>
      </Grid>
      <CreateClientModal
        open={isOpenCreateClient}
        onClose={() => setIsOpenCreateClient(false)}
        handleFetchClients={handleFetchClients}
      />
      <ConfirmationModal
        open={isOpenDeleteConfirm}
        onClose={() => setIsOpenDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="委託者削除の確認"
        description={`委託者「${
          selectedClient?.full_name || ''
        }」を削除しますか？\nこの操作は取り消せません。`}
        confirmButtonText="削除"
        cancelButtonText="キャンセル"
        isLoading={isLoading}
      />
    </ContainerLayout>
  );
}

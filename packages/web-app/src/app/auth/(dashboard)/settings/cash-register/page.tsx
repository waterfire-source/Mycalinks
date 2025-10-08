'use client';

import { useState, useEffect, useMemo } from 'react';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { useStore } from '@/contexts/StoreContext';
import { useRegister } from '@/contexts/RegisterContext';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { DetailComponent } from '@/app/auth/(dashboard)/settings/cash-register/components/DetailComponent';
import { RegisterCheckSettingModal } from '@/app/auth/(dashboard)/settings/cash-register/components/RegisterCheckSettingModal';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import {
  Register,
  RegisterCheckTiming,
  RegisterCashResetTiming,
  RegisterStatus,
} from '@prisma/client';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  CustomTabTable,
  ColumnDef,
  TabDef,
} from '@/components/tabs/CustomTabTable';
import { useTheme } from '@mui/material/styles';
import { palette } from '@/theme/palette';

export default function CushRegisterSettingPage() {
  const { store } = useStore();
  const theme = useTheme();
  const {
    register: selectedRegisterFromContext,
    registers,
    resetRegister,
  } = useRegister();
  const [localRegisters, setLocalRegisters] = useState<Register[]>([]);

  useEffect(() => {
    if (store?.id) {
      resetRegister();
    }
  }, [store?.id]);

  const mergedRegisters = useMemo(() => {
    const ids = new Set(registers.map((r) => r.id));
    return [...registers, ...localRegisters.filter((r) => !ids.has(r.id))];
  }, [registers, localRegisters]);

  // 新しいレジデータを追加する
  const handleAddRegister = () => {
    const newRegister: Register = {
      id: 999999999, // 一意のID
      display_name: '',
      description: null,
      total_cash_price: 0,
      cash_reset_price: 0,
      square_device_id: null,
      square_device_code: null,
      square_device_name: null,
      store_id: store.id,
      status: RegisterStatus.OPEN,
      deleted: false,
      sell_payment_method: '',
      buy_payment_method: '',
      square_device_code_expires_at: null,
      cash_reset_timing: RegisterCashResetTiming.AFTER_CLOSED,
      cash_check_timing: RegisterCheckTiming.BEFORE_CLOSE,
      cash_reset_enabled: true,
      is_primary: false,
      auto_print_receipt_enabled: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // すでに追加済みならスキップ
    const alreadyExists =
      registers.find((r) => r.id === 999999999) ||
      localRegisters.find((r) => r.id === 999999999);

    if (!alreadyExists) {
      setLocalRegisters((prev) => [...prev, newRegister]);
    }

    setSelectedRegister(newRegister);
  };

  // レジ点検設定モーダルの表示
  const [showRegisterCheckSettingModal, setRegisterCheckSettingModal] =
    useState(false);
  const handleSettingModal = () => {
    setRegisterCheckSettingModal(true);
  };

  // レジを選択する処理
  const [selectedRegister, setSelectedRegister] = useState<Register | null>();
  const handleSelectRegister = (selectRegister: Register) => {
    setSelectedRegister(selectRegister);
  };

  /**
   * テーブルのカラム定義
   */
  const columns: ColumnDef<Register>[] = [
    {
      header: '',
      render: (register) => (
        <Stack direction="row" spacing={1}>
          {register.is_primary && (
            <Typography
              color="primary"
              sx={{
                backgroundColor: palette.primary.main,
                borderRadius: '4px',
                paddingX: '2px',
                paddingTop: '3px',
                color: 'white',
              }}
              variant="caption"
            >
              メインレジ
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      header: 'レジ名',
      render: (register) => register.display_name || '',
      sx: {
        textAlign: 'left',
      },
    },
    {
      header: 'ステータス',
      render: (register) => {
        if (register.status === RegisterStatus.OPEN) {
          return (
            <span style={{ color: theme.palette.primary.main }}>開店中</span>
          );
        } else {
          return '閉店中';
        }
      },
    },
    {
      header: '決済端末',
      render: (register) =>
        register.square_device_id
          ? register.square_device_name || '接続済み'
          : '未接続',
    },
    {
      header: '', // 最後のカラムは矢印アイコンにする
      render: () => <ChevronRightIcon />,
    },
  ];

  /**
   * タブの配列: 「すべて」「使用中」「未使用」
   *  - filterFn: 全レジ (cashRegister) から各タブに応じたものを抽出するロジック
   *  - value: ローカルフィルタの場合不要なので指定しない
   */
  const tabs: TabDef<Register>[] = [
    { label: 'すべて', filterFn: (data) => data },
    {
      label: '開店中',
      filterFn: (data) =>
        data.filter((register) => register.status === RegisterStatus.OPEN),
    },
    {
      label: '閉店中',
      filterFn: (data) =>
        data.filter((register) => register.status === RegisterStatus.CLOSED),
    },
  ];

  return (
    <>
      <ContainerLayout
        title="レジ設定"
        helpArchivesNumber={875}
        actions={
          <>
            <Box
              sx={{
                width: '90%',
                display: 'flex',
                justifyContent: 'flex-start',
              }}
            >
              <SecondaryButton onClick={handleSettingModal}>
                レジ点検設定
              </SecondaryButton>
            </Box>
            <Box
              sx={{ width: '90%', display: 'flex', justifyContent: 'flex-end' }}
            >
              <PrimaryButtonWithIcon onClick={handleAddRegister}>
                登録
              </PrimaryButtonWithIcon>
            </Box>
          </>
        }
      >
        <Grid container spacing={1} sx={{ height: '100%', overflow: 'auto' }}>
          {/* タブ＆テーブルコンポーネント部分 */}
          <Grid item xs={7}>
            <CustomTabTable<Register>
              data={mergedRegisters ?? []}
              tabs={tabs}
              columns={columns}
              rowKey={(register) => register.id}
              onRowClick={handleSelectRegister}
              selectedRow={selectedRegister}
            />
          </Grid>

          {/* 詳細情報コンポーネント */}
          <Grid item xs={5}>
            <DetailComponent
              selectedRegister={selectedRegister}
              removeLocalRegister={(id) =>
                setLocalRegisters((prev) => prev.filter((r) => r.id !== id))
              }
            />
          </Grid>
        </Grid>
      </ContainerLayout>
      <RegisterCheckSettingModal
        open={showRegisterCheckSettingModal}
        onClose={() => setRegisterCheckSettingModal(false)}
      />
    </>
  );
}

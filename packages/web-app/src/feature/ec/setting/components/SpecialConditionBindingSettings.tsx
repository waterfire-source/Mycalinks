import {
  Box,
  Card,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useAlert } from '@/contexts/AlertContext';
import { useGetSpecialty } from '@/feature/specialty/hooks/useGetSpecialty';
import { useCreateOrUpdateSpecialty } from '@/feature/specialty/hooks/useCreateOrUpdateSpecialty';

interface Props {
  isEditable: boolean;
}

import { mallSpecialtyConditions } from '@/app/ec/(core)/constants/specialtyCondition';
import { HelpIcon } from '@/components/common/HelpIcon';

type UpdatingSpecialCondition = {
  [id: number]:
    | (typeof mallSpecialtyConditions)[number]['value']
    | null
    | undefined;
};

export const SpecialConditionBindingSettings = ({ isEditable }: Props) => {
  const { setAlertState } = useAlert();
  const { fetchSpecialty, specialties, isLoading } = useGetSpecialty();
  const { createOrUpdateSpecialty, isLoading: isUpdating } =
    useCreateOrUpdateSpecialty();

  // 即時変更用
  const [settings, setSettings] = useState<UpdatingSpecialCondition>({});

  // specialty一覧を取得
  useEffect(() => {
    fetchSpecialty();
  }, [fetchSpecialty]);

  // specialties取得後に設定を初期化
  useEffect(() => {
    if (specialties.length > 0) {
      const initialSettings = specialties.reduce((acc, specialty) => {
        // 既存のhandle設定をマッピング
        acc[specialty.id] = specialty.handle || undefined;
        return acc;
      }, {} as UpdatingSpecialCondition);
      setSettings(initialSettings);
    }
  }, [specialties]);

  const handleChange = async (event: SelectChangeEvent) => {
    const { name, value } = event.target;

    // 重複チェック
    if (
      event.target.value !== undefined &&
      Object.entries(settings).some(
        ([key, existingValue]) =>
          key !== name && existingValue === event.target.value,
      )
    ) {
      setAlertState({
        message: '同じ特殊状態は複数の状態に設定できません',
        severity: 'error',
      });
      return;
    }

    setSettings((prev) => ({
      ...prev,
      [Number(name)]:
        value as (typeof mallSpecialtyConditions)[number]['value'],
    }));

    try {
      // 更新対象の特殊状態を取得
      const targetSpecialty = specialties.find((s) => s.id === Number(name));
      if (!targetSpecialty) {
        throw new Error('対象の特殊状態が見つかりません');
      }

      // 特殊状態のhandle更新
      await createOrUpdateSpecialty({
        id: Number(name),
        display_name: targetSpecialty.display_name,
        kind: targetSpecialty.kind,
        order_number: targetSpecialty.order_number,
        handle:
          value === ''
            ? undefined
            : (value as (typeof mallSpecialtyConditions)[number]['value']),
      });

      setAlertState({
        message: '特殊状態の紐づけを更新しました',
        severity: 'success',
      });
    } catch (error) {
      console.error('特殊状態更新エラー:', error);
      setAlertState({
        message: '特殊状態の紐づけ更新に失敗しました',
        severity: 'error',
      });
    }
  };

  return (
    <>
      <Box display="flex" alignItems="center" gap={1} mt={2} mb={1}>
        <Typography variant="h2">
          MycalinksMALLでの特殊状態の紐づけ設定
        </Typography>
        <HelpIcon helpArchivesNumber={4411} />
      </Box>
      <Card
        sx={{ p: 2, width: '100%', flexDirection: 'column', display: 'flex' }}
      >
        <Typography variant="body2" mb={1}>
          POS上の特殊状態とMALL掲載時の特殊状態の紐づけを行ってください。
        </Typography>
        <TableContainer>
          <Table
            sx={{ borderCollapse: 'collapse', width: 'auto', minWidth: 0 }}
          >
            <TableHead>
              <TableRow
                sx={{
                  '& th': {
                    borderBottom: 'none', // ヘッダーの横線削除
                    padding: '4px 16px',
                    whiteSpace: 'nowrap', // テキスト改行防止で幅の制限
                  },
                }}
              >
                <TableCell>POS上の特殊状態</TableCell>
                <TableCell>MALLの特殊状態</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {specialties.map((specialty, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '& td': {
                      borderBottom: 'none', // ヘッダーの横線削除
                      padding: '4px 16px', // パディングも縮小
                      whiteSpace: 'nowrap', // テキスト改行防止で幅の制限
                    },
                  }}
                >
                  <TableCell>{specialty.display_name}</TableCell>
                  <TableCell>
                    <Select
                      name={specialty.id.toString()}
                      value={settings[specialty.id] || ''}
                      disabled={!isEditable || isLoading || isUpdating}
                      onChange={handleChange}
                      sx={{ width: 140 }}
                      size="small"
                    >
                      {mallSpecialtyConditions.map((condition, index) => {
                        return (
                          <MenuItem key={index} value={condition.value}>
                            {condition.label}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </>
  );
};

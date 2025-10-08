import { useCategory } from '@/feature/category/hooks/useCategory';
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
import { $Enums } from '@prisma/client';
import { useEffect, useState } from 'react';
import Loader from '@/components/common/Loader';
import { useAlert } from '@/contexts/AlertContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { useStore } from '@/contexts/StoreContext';
import { HelpIcon } from '@/components/common/HelpIcon';

interface Props {
  isEditable: boolean;
}

const conditionsOnEC = [
  { name: '状態A', value: $Enums.ConditionOptionHandle.O2_A },
  { name: '状態B', value: $Enums.ConditionOptionHandle.O4_B },
  { name: '状態C', value: $Enums.ConditionOptionHandle.O5_C },
  { name: '状態D', value: $Enums.ConditionOptionHandle.O6_D },
  { name: 'プレイ用', value: $Enums.ConditionOptionHandle.O3_FOR_PLAY },
  { name: '指定なし', value: undefined },
] as const;

type UpdatingCondition = {
  [id: number]: (typeof conditionsOnEC)[number]['value'] | null | undefined;
};

export const ConditionBindingSettings = ({ isEditable }: Props) => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const clientAPI = createClientAPI();
  const { cardConditionOptions, fetchCategoryList } = useCategory();

  // 即時変更用
  const [settings, setSettings] = useState<UpdatingCondition>({});

  const handleChange = async (event: SelectChangeEvent) => {
    if (!cardConditionOptions) {
      setAlertState({
        message: 'カードカテゴリが取得できていません',
        severity: 'error',
      });
      return;
    }

    const { name, value } = event.target;
    if (
      event.target.value !== undefined &&
      Object.entries(settings).some(
        ([key, value]) => key !== name && value === event.target.value,
      )
    ) {
      setAlertState({
        message: '同じ状態は複数の状態に設定できません',
        severity: 'error',
      });
      return;
    }

    setSettings((prev) => ({
      ...prev,
      [Number(name)]: value as (typeof conditionsOnEC)[number]['value'],
    }));
    // useConditionOptionのupdateConditionOptionは cardCategoryの取得が安定しないので使用しない(2025/03/27現在)
    const response = await clientAPI.conditionOption.updateConditionOption({
      id: Number(name),
      storeId: store.id,
      itemCategoryId: cardConditionOptions[0].item_category_id,
      handle: (value as (typeof conditionsOnEC)[number]['value']) ?? null,
    });
    if (response instanceof CustomError) {
      setAlertState({
        message: `${response.status}:${response.message}`,
        severity: 'error',
      });
    }
    fetchCategoryList();
  };

  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);

  useEffect(() => {
    if (!cardConditionOptions) return;
    setSettings(
      cardConditionOptions.reduce((acc, condition) => {
        condition.handle &&
          (acc[condition.id] =
            condition.handle as (typeof conditionsOnEC)[number]['value']);
        return acc;
      }, {} as UpdatingCondition),
    );
  }, [cardConditionOptions]);

  return (
    <>
      <Box display="flex" alignItems="center" gap={1} mt={2} mb={1}>
        <Typography variant="h2">MycalinksMALLでの状態の紐づけ設定</Typography>
        <HelpIcon helpArchivesNumber={2664} />
      </Box>
      <Card
        sx={{ p: 2, width: '100%', flexDirection: 'column', display: 'flex' }}
      >
        <Typography variant="body2" mb={1}>
          POS上の状態とMycalinks
          EC掲載時の状態の紐づけを行ってください。カード以外の状態は自動で紐づけされます。
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
                <TableCell>POS上の状態名</TableCell>
                <TableCell>Mycalinks EC掲載時の状態</TableCell>
              </TableRow>
            </TableHead>
            <>
              {cardConditionOptions ? (
                <TableBody>
                  {cardConditionOptions.map((condition_option, index) => (
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
                      <TableCell>{condition_option.display_name}</TableCell>
                      <TableCell>
                        <Select
                          name={condition_option.id.toString()}
                          value={settings[condition_option.id] || ''}
                          disabled={!isEditable}
                          onChange={handleChange}
                          sx={{ width: 120 }}
                          size="small"
                        >
                          {conditionsOnEC.map((condition, index) => {
                            return (
                              <MenuItem key={index} value={condition.value}>
                                {condition.name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <Loader />
              )}
            </>
          </Table>
        </TableContainer>
      </Card>
    </>
  );
};

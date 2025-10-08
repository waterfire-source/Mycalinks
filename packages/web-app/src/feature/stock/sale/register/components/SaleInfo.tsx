'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TimeInput from '@/components/common/TimeInput';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import { SaleItem } from '@/app/auth/(dashboard)/stock/sale/register/page';
import { TransactionKind } from '@prisma/client';
import CronBuilder from 'cron-builder';
import {
  RecurrenceType,
  getRepeatPatternLabel,
} from '@/feature/sale/utils/repeatPatternUtils';
// スタイル付きのButtonコンポーネント
const StyledButton = styled(Button)(({ theme }) => ({
  minWidth: '100px',
  '&.selected': {
    color: 'white',
    backgroundColor: theme.palette.grey[700],
    '&:hover': {
      backgroundColor: theme.palette.grey[800],
    },
  },
  '&:not(.selected)': {
    color: theme.palette.grey[800],
    backgroundColor: theme.palette.grey[200],
  },
}));

interface SaleInfoProps {
  saleSettings: SaleItem;
  setSaleSettings: React.Dispatch<React.SetStateAction<SaleItem>>;
}

export const SaleInfo: React.FC<SaleInfoProps> = ({
  saleSettings,
  setSaleSettings,
}) => {
  // 割引・割増（％または円）の入力状態
  const [discountInfo, setDiscountInfo] = useState<{
    type: '％' | '円';
    amount: string;
  }>({
    type: '％',
    amount: '0',
  });

  // 開始時間の設定方法
  const [startTimeType, setStartTimeType] = useState<'now' | 'scheduled'>(
    'now',
  );

  // 繰り返し設定の状態
  const [recurrence, setRecurrence] = useState<{
    type: RecurrenceType;
  }>({
    type: saleSettings.repeatCronRule
      ? getRepeatPatternLabel(saleSettings.repeatCronRule).type
      : RecurrenceType.none,
  });

  // 繰り返し終了日時の設定方法
  const [hasRecurrenceEnd, setHasRecurrenceEnd] = useState<boolean>(
    !!saleSettings.saleEndDatetime,
  );

  // 現在時刻を10分単位で切り捨てる
  const getRoundedCurrentTime = () => {
    const now = dayjs();
    const minutes = now.minute();
    const roundedMinutes = Math.floor(minutes / 10) * 10;
    return now.minute(roundedMinutes).second(0).millisecond(0);
  };

  // 初期表示時
  useEffect(() => {
    // 割引/割増の表示用ステートを整形
    if (saleSettings.discountAmount) {
      if (saleSettings.discountAmount.endsWith('%')) {
        setDiscountInfo({
          type: '％',
          amount: Math.abs(
            100 - parseInt(saleSettings.discountAmount),
          ).toString(),
        });
      } else {
        setDiscountInfo({
          type: '円',
          amount: saleSettings.discountAmount.startsWith('-')
            ? saleSettings.discountAmount.slice(1)
            : saleSettings.discountAmount,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 開始時間タイプが変更されたときの処理
  useEffect(() => {
    if (startTimeType === 'now') {
      const roundedTime = getRoundedCurrentTime();
      setSaleSettings((prev) => {
        const newStartDatetime = roundedTime.toDate();
        const shouldResetEndDatetime =
          prev.endDatetime &&
          dayjs(prev.endDatetime).isBefore(dayjs(newStartDatetime));

        return {
          ...prev,
          startDatetime: newStartDatetime,
          endDatetime: shouldResetEndDatetime
            ? newStartDatetime
            : prev.endDatetime,
        };
      });
    }
  }, [startTimeType]);

  // 割引・割増の更新処理
  useEffect(() => {
    const discountAmount = () => {
      if (discountInfo.type === '％') {
        // 販売の場合は 100 - 入力値、買取の場合は 100 + 入力値
        return saleSettings.transactionKind === TransactionKind.sell
          ? `${100 - parseInt(discountInfo.amount || '0', 10)}%`
          : `${100 + parseInt(discountInfo.amount || '0', 10)}%`;
      } else {
        // 販売の場合は「-入力値」、買取の場合は「そのまま入力値」
        return saleSettings.transactionKind === TransactionKind.sell
          ? `-${discountInfo.amount}`
          : discountInfo.amount;
      }
    };

    setSaleSettings((prev) => ({
      ...prev,
      discountAmount: discountAmount(),
    }));
    // 割引・割増の変更時のみ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountInfo, saleSettings.transactionKind]);

  // 繰り返し設定が変更されたときにCron文字列を生成する例
  useEffect(() => {
    const cronRule = generateCronRule();
    setSaleSettings((prev) => ({
      ...prev,
      repeatCronRule: cronRule,
    }));
  }, [recurrence.type, saleSettings.startDatetime]);

  /**
   * handleStartDateTimeChange:
   * 開始日時を更新し、もし終了日時が開始日時より早い場合は終了日時を同じにそろえる
   */
  const handleStartDateTimeChange = (
    startDateStr: string,
    startTimeStr: string,
  ) => {
    if (!startDateStr || !startTimeStr) return;
    const newStartDateTime = dayjs(`${startDateStr}T${startTimeStr}`);
    setSaleSettings((prev) => {
      let end = prev.endDatetime ? dayjs(prev.endDatetime) : null;
      if (end && end.isBefore(newStartDateTime)) {
        end = newStartDateTime;
      }
      return {
        ...prev,
        startDatetime: newStartDateTime.toDate(),
        endDatetime: end ? end.toDate() : null,
      };
    });
  };

  /**
   * handleEndDateTimeChange:
   * 終了日時を更新し、もし更新後の終了日時が開始日時より早い場合は開始日時へそろえる
   */
  const handleEndDateTimeChange = (endDateStr: string, endTimeStr: string) => {
    if (!endDateStr || !endTimeStr) return;
    const newEndDateTime = dayjs(`${endDateStr}T${endTimeStr}`);

    setSaleSettings((prev) => {
      const start = prev.startDatetime ? dayjs(prev.startDatetime) : null;
      if (start && newEndDateTime.isBefore(start)) {
        return {
          ...prev,
          endDatetime: start.toDate(),
        };
      }
      return {
        ...prev,
        endDatetime: newEndDateTime.toDate(),
      };
    });
  };

  /**
   * handleSaleEndDatetimeChange:
   * 繰り返し終了日時を更新し、もし終了日時が開始日時より早い場合は開始日時で上書き
   */
  const handleSaleEndDatetimeChange = (
    endDateStr: string,
    endTimeStr: string,
  ) => {
    if (!endDateStr || !endTimeStr) return;
    const newEndDatetime = dayjs(`${endDateStr}T${endTimeStr}`);
    setSaleSettings((prev) => {
      const start = prev.startDatetime ? dayjs(prev.startDatetime) : null;
      if (start && newEndDatetime.isBefore(start)) {
        return {
          ...prev,
          saleEndDatetime: start.toDate(),
        };
      }
      return {
        ...prev,
        saleEndDatetime: newEndDatetime.toDate(),
      };
    });
  };

  /**
   * 現在の終了条件を SaleSettingsView の endCondition に対応させるためのユーティリティ
   * 'none' / 'datetime' / 'itemCount' / 'totalCount'
   */
  const getEndCondition = () => {
    if (saleSettings.endDatetime) return 'datetime';
    if (saleSettings.endUnitItemCount) return 'itemCount';
    if (saleSettings.endTotalItemCount) return 'totalCount';
    return 'none';
  };

  /**
   * handleEndConditionChange:
   * RadioGroup で終了条件を切り替えたときの処理
   */
  const handleEndConditionChange = (condition: string) => {
    setSaleSettings((prev) => {
      // 一度 null や 0 に初期化しておき、選ばれたパターンだけ値を保持
      let newEndDatetime: Date | null = null;
      let newEndUnitItemCount: number | null = null;
      let newEndTotalItemCount: number | null = null;

      if (condition === 'datetime') {
        newEndDatetime = prev.endDatetime || prev.startDatetime || null;
        // もし終了日時が開始日時より前なら開始日時で上書き
        if (prev.startDatetime && newEndDatetime) {
          const start = dayjs(prev.startDatetime);
          const end = dayjs(newEndDatetime);
          if (end.isBefore(start)) {
            newEndDatetime = start.toDate();
          }
        }
      } else if (condition === 'itemCount') {
        newEndUnitItemCount = prev.endUnitItemCount || 1;
      } else if (condition === 'totalCount') {
        newEndTotalItemCount = prev.endTotalItemCount || 1;
      }

      return {
        ...prev,
        endDatetime: newEndDatetime,
        endUnitItemCount: newEndUnitItemCount,
        endTotalItemCount: newEndTotalItemCount,
      };
    });
  };

  // 日付と時間を文字列に整形
  const getFormattedDate = (date: Date | null) =>
    date ? dayjs(date).format('YYYY-MM-DD') : '';
  const getFormattedTime = (date: Date | null) =>
    date ? dayjs(date).format('HH:mm') : '';

  // 繰り返しの選択肢を生成
  const getRecurrenceOptions = () => {
    const startDate = dayjs(saleSettings.startDatetime);
    if (!startDate.isValid()) return [];

    const weekday = ['日', '月', '火', '水', '木', '金', '土'][startDate.day()];
    const date = startDate.date();
    const week = Math.ceil(date / 7);
    const month = startDate.month() + 1;

    return [
      { value: RecurrenceType.none, label: '繰り返さない' },
      { value: RecurrenceType.daily, label: '毎日' },
      { value: RecurrenceType.weekly, label: `毎週${weekday}曜日` },
      { value: RecurrenceType.monthlyByDate, label: `毎月${date}日` },
      {
        value: RecurrenceType.monthlyByWeek,
        label: `毎月第${week}${weekday}曜日`,
      },
      { value: RecurrenceType.yearly, label: `毎年${month}月${date}日` },
      { value: RecurrenceType.weekday, label: '毎週平日（月〜金）' },
    ];
  };

  /**
   * 現在の繰り返し設定からCron文字列を生成
   */
  const generateCronRule = (): string | null => {
    if (!saleSettings.startDatetime || recurrence.type === 'none') {
      return null;
    }

    const startDate = dayjs(saleSettings.startDatetime);
    const builder = new CronBuilder();

    // 時刻は開始時刻から固定で指定
    builder.set('minute', [startDate.minute().toString()]);
    builder.set('hour', [startDate.hour().toString()]);

    switch (recurrence.type) {
      case 'daily':
        // 毎日実行
        builder.set('dayOfTheMonth', ['*']);
        builder.set('month', ['*']);
        builder.set('dayOfTheWeek', ['*']);
        break;

      case 'weekly': {
        // 毎週特定の曜日に実行
        const dayOfWeek = startDate.day();
        // 日曜日は 0 から 7 に変換
        const adjustedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
        builder.set('dayOfTheMonth', ['*']);
        builder.set('month', ['*']);
        builder.set('dayOfTheWeek', [adjustedDayOfWeek.toString()]);
        break;
      }

      case 'monthlyByDate': {
        // 毎月同じ日に実行
        const dayOfMonth = startDate.date();
        builder.set('dayOfTheMonth', [dayOfMonth.toString()]);
        builder.set('month', ['*']);
        builder.set('dayOfTheWeek', ['*']);
        break;
      }

      case 'monthlyByWeek': {
        // 毎月第N週X曜日に実行
        const dayOfWeek = startDate.day();
        // 日曜日は 0 から 7 に変換
        const adjustedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
        const weekOfMonth = Math.ceil(startDate.date() / 7);
        builder.set('dayOfTheMonth', ['*']);
        builder.set('month', ['*']);
        builder.set('dayOfTheWeek', [`${adjustedDayOfWeek}#${weekOfMonth}`]);
        break;
      }

      case 'yearly': {
        // 毎年同じ月日に実行
        const dayOfMonth = startDate.date();
        const month = startDate.month() + 1; // dayjs の月は 0 始まり
        builder.set('dayOfTheMonth', [dayOfMonth.toString()]);
        builder.set('month', [month.toString()]);
        builder.set('dayOfTheWeek', ['*']);
        break;
      }

      case 'weekday':
        // 平日（月-金）に実行
        builder.set('dayOfTheMonth', ['*']);
        builder.set('month', ['*']);
        builder.set('dayOfTheWeek', ['1-5']); // 月-金は 1-5
        break;
    }

    // Cron文字列を生成して先頭のゼロを削除
    const cronString = builder.build();
    const formattedCronString = cronString
      .split(' ')
      .map((part: string) => part.replace(/^0+/, '') || '0')
      .join(' ');

    return formattedCronString;
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto', // スクロール可能に
        p: 3,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          flex: 1, // 残りのスペースを埋める
        }}
      >
        {/* セール名 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography sx={{ minWidth: 130 }}>セール名</Typography>
          <TextField
            fullWidth
            value={saleSettings.displayName}
            onChange={(e) =>
              setSaleSettings((prev) => ({
                ...prev,
                displayName: e.target.value,
              }))
            }
            sx={{ backgroundColor: 'white' }}
            size="small"
          />
        </Box>

        {/* 販売/買取 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography sx={{ minWidth: 130 }}>販売/買取</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <StyledButton
              variant="contained"
              className={
                saleSettings.transactionKind === TransactionKind.sell
                  ? 'selected'
                  : ''
              }
              onClick={() =>
                setSaleSettings((prev) => ({
                  ...prev,
                  transactionKind: TransactionKind.sell,
                }))
              }
              size="small"
            >
              販売
            </StyledButton>
            <StyledButton
              variant="contained"
              className={
                saleSettings.transactionKind === TransactionKind.buy
                  ? 'selected'
                  : ''
              }
              onClick={() =>
                setSaleSettings((prev) => ({
                  ...prev,
                  transactionKind: TransactionKind.buy,
                }))
              }
              size="small"
            >
              買取
            </StyledButton>
          </Box>
        </Box>

        {/* 割引・割増 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography sx={{ minWidth: 130 }}>割引・割増</Typography>
          <TextField
            value={discountInfo.amount}
            onChange={(e) => {
              // 入力は数字のみに制限（全角数字も許可）
              const value = e.target.value
                .replace(/[^0-9０-９]/g, '')
                .replace(/[０-９]/g, (s) =>
                  String.fromCharCode(s.charCodeAt(0) - 0xfee0),
                );
              setDiscountInfo((prev) => ({
                ...prev,
                amount: value,
              }));
            }}
            sx={{ width: 150, backgroundColor: 'white' }}
            size="small"
          />
          <Select
            value={discountInfo.type}
            onChange={(e) =>
              setDiscountInfo((prev) => ({
                ...prev,
                type: e.target.value as '％' | '円',
              }))
            }
            size="small"
          >
            <MenuItem value="円">円</MenuItem>
            <MenuItem value="％">％</MenuItem>
          </Select>
          <Typography>
            {saleSettings.transactionKind === TransactionKind.sell
              ? '引き'
              : '増し'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Typography sx={{ minWidth: 130, mt: 1 }}>開始日時</Typography>
          <Box sx={{ gap: 1 }}>
            <RadioGroup
              value={startTimeType}
              onChange={(e) =>
                setStartTimeType(e.target.value as 'now' | 'scheduled')
              }
            >
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                <FormControlLabel
                  value="now"
                  control={<Radio />}
                  label="今すぐ"
                />
                <FormControlLabel
                  value="scheduled"
                  control={<Radio />}
                  label="設定する"
                />
              </Box>
            </RadioGroup>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                type="date"
                value={getFormattedDate(saleSettings.startDatetime)}
                onChange={(e) =>
                  handleStartDateTimeChange(
                    e.target.value,
                    getFormattedTime(saleSettings.startDatetime),
                  )
                }
                sx={{ backgroundColor: 'white' }}
                disabled={startTimeType === 'now'}
                size="small"
              />
              <TimeInput
                value={getFormattedTime(saleSettings.startDatetime)}
                onChange={(time) =>
                  handleStartDateTimeChange(
                    getFormattedDate(saleSettings.startDatetime),
                    time,
                  )
                }
                sx={{ width: 150, px: 1 }}
                disabled={startTimeType === 'now'}
              />
            </Box>
          </Box>
        </Box>

        {/* 終了条件 */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Typography sx={{ minWidth: 130, mt: 1 }}>終了条件</Typography>
          <RadioGroup
            value={getEndCondition()}
            onChange={(e) => handleEndConditionChange(e.target.value)}
          >
            <FormControlLabel
              value="none"
              control={<Radio />}
              label="設定しない"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel
                value="datetime"
                control={<Radio />}
                label="日時"
                sx={{ width: 150 }}
              />
              {getEndCondition() === 'datetime' && (
                <>
                  <TextField
                    type="date"
                    value={getFormattedDate(saleSettings.endDatetime)}
                    onChange={(e) =>
                      handleEndDateTimeChange(
                        e.target.value,
                        getFormattedTime(saleSettings.endDatetime),
                      )
                    }
                    sx={{ backgroundColor: 'white' }}
                    size="small"
                  />
                  <TimeInput
                    value={getFormattedTime(saleSettings.endDatetime)}
                    onChange={(time) =>
                      handleEndDateTimeChange(
                        getFormattedDate(saleSettings.endDatetime),
                        time,
                      )
                    }
                    sx={{ width: 150 }}
                    selectedDate={
                      saleSettings.endDatetime
                        ? getFormattedDate(saleSettings.endDatetime)
                        : undefined
                    }
                    eventStartDate={
                      saleSettings.startDatetime
                        ? getFormattedDate(saleSettings.startDatetime)
                        : undefined
                    }
                    eventStartTime={
                      saleSettings.startDatetime
                        ? getFormattedTime(saleSettings.startDatetime)
                        : undefined
                    }
                  />
                </>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel
                value="itemCount"
                control={<Radio />}
                label="点数（商品ごと）"
              />
              {getEndCondition() === 'itemCount' && (
                <TextField
                  type="number"
                  value={saleSettings.endUnitItemCount || ''}
                  onChange={(e) =>
                    setSaleSettings((prev) => ({
                      ...prev,
                      endUnitItemCount: Number(e.target.value),
                      endDatetime: null, // 安全策として一度 null に
                      endTotalItemCount: null,
                    }))
                  }
                  sx={{ width: 150, backgroundColor: 'white' }}
                  InputProps={{ endAdornment: <Typography>点</Typography> }}
                  size="small"
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel
                value="totalCount"
                control={<Radio />}
                label="点数（合計点数）"
              />
              {getEndCondition() === 'totalCount' && (
                <TextField
                  type="number"
                  value={saleSettings.endTotalItemCount || ''}
                  onChange={(e) =>
                    setSaleSettings((prev) => ({
                      ...prev,
                      endTotalItemCount: Number(e.target.value),
                      endDatetime: null, // 安全策として一度 null に
                      endUnitItemCount: null,
                    }))
                  }
                  sx={{ width: 150, backgroundColor: 'white' }}
                  InputProps={{ endAdornment: <Typography>点</Typography> }}
                  size="small"
                />
              )}
            </Box>
          </RadioGroup>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography sx={{ minWidth: 130, mt: 1 }}>繰り返し</Typography>
          <Select
            value={recurrence.type}
            onChange={(e) =>
              setRecurrence({ type: e.target.value as RecurrenceType })
            }
            size="small"
          >
            {getRecurrenceOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* 繰り返し終了日時 - recurrence.type が 'none' 以外の時のみ表示 */}
        {recurrence.type !== 'none' && (
          <Box
            sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}
          >
            <Typography sx={{ minWidth: 130, mt: 1 }}>
              繰り返し終了日時
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <RadioGroup
                row
                value={hasRecurrenceEnd.toString()}
                onChange={(e) => {
                  const newValue = e.target.value === 'true';
                  setHasRecurrenceEnd(newValue);
                  setSaleSettings((prev) => ({
                    ...prev,
                    saleEndDatetime: newValue ? prev.startDatetime : null,
                  }));
                }}
              >
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label="設定しない"
                />
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  label="設定する"
                />
              </RadioGroup>

              {hasRecurrenceEnd && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    type="date"
                    value={getFormattedDate(saleSettings.saleEndDatetime)}
                    onChange={(e) => {
                      handleSaleEndDatetimeChange(
                        e.target.value,
                        getFormattedTime(saleSettings.saleEndDatetime) ||
                          getFormattedTime(saleSettings.startDatetime),
                      );
                    }}
                    inputProps={{
                      min: getFormattedDate(saleSettings.startDatetime),
                    }}
                    sx={{ backgroundColor: 'white' }}
                    size="small"
                  />
                  <TimeInput
                    value={getFormattedTime(saleSettings.saleEndDatetime)}
                    onChange={(time) => {
                      handleSaleEndDatetimeChange(
                        getFormattedDate(saleSettings.saleEndDatetime) ||
                          getFormattedDate(saleSettings.startDatetime),
                        time,
                      );
                    }}
                    sx={{ width: 150 }}
                    selectedDate={getFormattedDate(
                      saleSettings.saleEndDatetime,
                    )}
                    eventStartDate={getFormattedDate(
                      saleSettings.startDatetime,
                    )}
                    eventStartTime={getFormattedTime(
                      saleSettings.startDatetime,
                    )}
                  />
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

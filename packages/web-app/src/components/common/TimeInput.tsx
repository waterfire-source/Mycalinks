import React, { useCallback, useEffect } from 'react';
import dayjs from 'dayjs';
import { Autocomplete, TextField, MenuItem } from '@mui/material';
import { SxProps, Theme } from '@mui/material';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  selectedDate?: string;
  eventStartDate?: string;
  eventStartTime?: string;
  sx?: SxProps<Theme>;
}

const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  disabled,
  selectedDate,
  eventStartDate,
  eventStartTime,
  sx = {},
}) => {
  const currentDateTime = dayjs();
  const selectedDayjs = selectedDate ? dayjs(selectedDate) : null;
  const isSelectedDateToday = selectedDayjs?.isSame(currentDateTime, 'day');
  const eventStartDateTime =
    eventStartDate && eventStartTime
      ? dayjs(`${eventStartDate} ${eventStartTime}`)
      : null;
  const selectedDateTime = selectedDate
    ? dayjs(`${selectedDate} ${value}`)
    : null;

  // 10分間隔で時間オプションを生成
  const timeOptions = Array.from({ length: 24 * 6 }, (_, index) => {
    const hours = Math.floor(index / 6);
    const minutes = (index % 6) * 10;
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
    const optionDateTime = dayjs(`${selectedDate} ${timeString}`);

    // 選択された日付が今日で、現在時刻より前の時間、または開始日時より前の時間はフィルタリング
    if (
      (selectedDate &&
        isSelectedDateToday &&
        optionDateTime.isBefore(currentDateTime)) ||
      (eventStartDateTime && optionDateTime.isBefore(eventStartDateTime))
    ) {
      return null;
    }
    return timeString;
  }).filter(Boolean) as string[];

  // 現在時刻以降の最も近い10分間隔の時間を取得する関数
  const getNextValidTime = useCallback(() => {
    const baseTime =
      eventStartDateTime && eventStartDateTime.isAfter(currentDateTime)
        ? eventStartDateTime
        : currentDateTime;
    const currentMinutes = baseTime.minute();
    const roundedMinutes = Math.ceil(currentMinutes / 10) * 10;
    return baseTime.minute(roundedMinutes).second(0).format('HH:mm');
  }, [currentDateTime, eventStartDateTime]);

  // コンポーネントマウント時と日付変更時に時間を更新
  useEffect(() => {
    if (
      (selectedDate &&
        isSelectedDateToday &&
        dayjs(`${selectedDate} ${value}`).isBefore(currentDateTime)) ||
      (eventStartDateTime &&
        selectedDateTime &&
        selectedDateTime.isBefore(eventStartDateTime))
    ) {
      onChange(getNextValidTime());
    }
  }, [
    selectedDate,
    isSelectedDateToday,
    currentDateTime,
    onChange,
    value,
    getNextValidTime,
    eventStartDateTime,
    selectedDateTime,
  ]);

  // Autocompleteの選択変更時のハンドラ
  const handleTimeChange = (
    event: React.SyntheticEvent,
    newValue: string | null,
  ) => {
    if (newValue) {
      onChange(newValue);
    }
  };

  // テキスト入力時のハンドラ
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    // 時間形式（HH:MM）の正規表現
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(inputValue)) {
      const inputDateTime = dayjs(`${selectedDate} ${inputValue}`);
      // 選択された日付が今日で、現在時刻より前の時間、または開始日時より前の時間は自動更新
      if (
        (selectedDate &&
          isSelectedDateToday &&
          inputDateTime.isBefore(currentDateTime)) ||
        (eventStartDateTime && inputDateTime.isBefore(eventStartDateTime))
      ) {
        onChange(getNextValidTime());
      } else {
        onChange(inputValue);
      }
    }
  };

  // Autocompleteコンポーネントを返す
  return (
    <Autocomplete
      value={value}
      onChange={handleTimeChange}
      options={timeOptions}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          onChange={handleInputChange}
          sx={{ width: 300, backgroundColor: 'white', ...sx }}
          disabled={disabled}
          size="small"
        />
      )}
      renderOption={(props, option) => <MenuItem {...props}>{option}</MenuItem>}
    />
  );
};

export default TimeInput;

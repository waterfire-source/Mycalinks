import { AdvertisementImageUpload } from '@/app/auth/(dashboard)/advertisement/components/AdvertisementModal/AdvertisementImageUpload';
import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useEffect, useState } from 'react';
import { AppAdvertisementDataType, AppAdvertisementKind } from '@prisma/client';
import { createOrUpdateAdvertisement } from '@/feature/advertisement/hooks/useCreateOrUpdateAppAdvertisement';
import { AdvertisementTableRowData } from '@/app/auth/(dashboard)/advertisement/components/AdvertisementContent';
import { RequiredTitle } from '@/components/inputFields/RequiredTitle';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('ja');

const toDateTime = (date: string, time: string) =>
  date && time ? dayjs.tz(`${date} ${time}`, 'Asia/Tokyo').toDate() : undefined;

type StartType = 'now' | 'specific';
type EndType = '' | 'specific';

interface Props {
  eventType?: AppAdvertisementKind;
  setFormData: React.Dispatch<
    React.SetStateAction<createOrUpdateAdvertisement | undefined>
  >;
  selectedRow: AdvertisementTableRowData | null;
}

export const AdvertisementModalContent = ({
  eventType,
  setFormData,
  selectedRow,
}: Props) => {
  const [title, setTitle] = useState<string>('');

  const [startType, setStartType] = useState<StartType>('now');
  const [endType, setEndType] = useState<EndType>('');

  const [startDate, setStartDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  const [displayType, setDisplayType] = useState<AppAdvertisementDataType>(
    AppAdvertisementDataType.TEXT,
  );
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string>();
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const [bodyText, setBodyText] = useState<string>('');

  useEffect(() => {
    if (!selectedRow) return;

    // タイトル
    setTitle(selectedRow.displayName);

    // 開始日時
    if (selectedRow.startAt) {
      const start = dayjs(selectedRow.startAt).tz('Asia/Tokyo');
      setStartType('specific');
      setStartDate(start.format('YYYY-MM-DD'));
      setStartTime(start.format('HH:mm'));
    }

    // 終了日時
    if (selectedRow.endAt && !isNaN(new Date(selectedRow.endAt).getTime())) {
      const end = dayjs(selectedRow.endAt).tz('Asia/Tokyo');
      setEndType('specific');
      setEndDate(end.format('YYYY-MM-DD'));
      setEndTime(end.format('HH:mm'));
    }

    // 表示タイプ
    if (selectedRow.dataType) {
      setDisplayType(selectedRow.dataType as AppAdvertisementDataType);
    }

    // 本文 or 画像
    setBodyText(selectedRow.dataText || '');
    setImageUrl(selectedRow.dataImages.map((d) => d.imageUrl));

    // サムネイル
    setThumbnailImageUrl(selectedRow.thumbnailImageUrl);
  }, [selectedRow]);

  const now = dayjs().tz('Asia/Tokyo');
  const nowDate = now.format('YYYY-MM-DD');
  const nowTime = now.format('HH:mm');

  const handleStartTypeChange = (value: StartType) => {
    setStartType(value);
    if (value === 'specific') {
      setStartDate(startDate || nowDate);
      setStartTime(startTime || nowTime);
    }
  };

  const handleEndTypeChange = (value: EndType) => {
    setEndType(value);
    if (value === 'specific') {
      setEndDate(endDate || nowDate);
      setEndTime(endTime || nowTime);
    }
  };

  useEffect(() => {
    const startAt =
      startType === 'now'
        ? dayjs().tz('Asia/Tokyo').toDate()
        : toDateTime(startDate, startTime);
    const endAt =
      endType === 'specific' ? toDateTime(endDate, endTime) : undefined;

    setFormData({
      id: selectedRow?.id, // ← 編集時は id を含める
      displayName: title,
      kind: eventType,
      startAt,
      endAt,
      thumbnailImageUrl,
      dataType: displayType,
      dataText:
        displayType === AppAdvertisementDataType.TEXT ? bodyText : undefined,
      dataImages:
        displayType === AppAdvertisementDataType.IMAGE
          ? imageUrl.map((url) => ({ imageUrl: url }))
          : [],
    });
  }, [
    selectedRow?.id,
    title,
    eventType,
    startType,
    startDate,
    startTime,
    endType,
    endDate,
    endTime,
    thumbnailImageUrl,
    displayType,
    imageUrl,
    bodyText,
    setFormData,
  ]);

  const dateTimeSx = {
    maxWidth: '120px',
    height: 40,
    backgroundColor: 'white',
    '& .MuiInputBase-root': { height: '100%' },
    '& input': { padding: '8px' },
  } as const;

  return (
    <Stack spacing={1.5} sx={{ width: '100%', pl: 2 }}>
      {/* タイトル */}
      <Stack direction="column" spacing={0.5}>
        <RequiredTitle title="タイトル" />
        <TextField
          variant="outlined"
          size="small"
          multiline
          rows={2}
          sx={{ width: '40%', backgroundColor: 'white' }}
          onChange={(e) => setTitle(e.target.value)}
          value={title}
        />
      </Stack>

      {/* サムネイル (お知らせ / クーポンのみ) */}
      {((eventType || selectedRow?.kind) ===
        AppAdvertisementKind.NOTIFICATION ||
        (eventType || selectedRow?.kind) === AppAdvertisementKind.TICKET) && (
        <Stack direction="column" spacing={0.5}>
          <Typography>サムネイル</Typography>
          <AdvertisementImageUpload
            imageUrl={thumbnailImageUrl}
            onImageUploaded={setThumbnailImageUrl}
            height={100}
          />
        </Stack>
      )}

      {/* 掲載開始日時 */}
      <Stack direction="column" spacing={0.5}>
        <Typography sx={{ minWidth: '150px' }}>掲載開始日時</Typography>
        <RadioGroup
          row
          value={startType}
          onChange={(e) => handleStartTypeChange(e.target.value as StartType)}
        >
          <FormControlLabel
            value="now"
            control={<Radio size="small" />}
            label="今すぐ"
            sx={{ height: 20 }}
          />
          <FormControlLabel
            value="specific"
            control={<Radio size="small" />}
            label="日時を指定する"
            sx={{ height: 20 }}
          />
        </RadioGroup>

        <Stack direction="row" spacing={1}>
          <TextField
            type="date"
            value={startType === 'now' ? nowDate : startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={startType === 'now'}
            sx={dateTimeSx}
          />
          <TextField
            type="time"
            value={startType === 'now' ? nowTime : startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={startType === 'now'}
            sx={dateTimeSx}
          />
        </Stack>
      </Stack>

      {/* 掲載終了日時 */}
      <Stack direction="column" spacing={0.5}>
        <Typography sx={{ minWidth: '150px' }}>掲載終了日時</Typography>
        <RadioGroup
          row
          value={endType}
          onChange={(e) => handleEndTypeChange(e.target.value as EndType)}
        >
          <FormControlLabel
            value=""
            control={<Radio size="small" />}
            label="設定しない"
            sx={{ height: 20 }}
          />
          <FormControlLabel
            value="specific"
            control={<Radio size="small" />}
            label="日時を指定する"
            sx={{ height: 20 }}
          />
        </RadioGroup>

        <Stack direction="row" spacing={1}>
          <TextField
            type="date"
            value={endType === 'specific' ? endDate : nowDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={endType !== 'specific'}
            sx={dateTimeSx}
          />
          <TextField
            type="time"
            value={endType === 'specific' ? endTime : nowTime}
            onChange={(e) => setEndTime(e.target.value)}
            disabled={endType !== 'specific'}
            sx={dateTimeSx}
          />
        </Stack>
      </Stack>

      {/* 表示タイプ */}
      <Stack direction="column" spacing={0.5}>
        <Typography>表示タイプ</Typography>
        <RadioGroup
          row
          value={displayType}
          onChange={(e) =>
            setDisplayType(e.target.value as AppAdvertisementDataType)
          }
        >
          <FormControlLabel
            value={AppAdvertisementDataType.TEXT}
            control={<Radio size="small" />}
            label="テキスト"
            sx={{ height: 20 }}
          />
          <FormControlLabel
            value={AppAdvertisementDataType.IMAGE}
            control={<Radio size="small" />}
            label="画像"
            sx={{ height: 20 }}
          />
        </RadioGroup>
      </Stack>

      {/* テキスト or 画像入力 */}
      {displayType === AppAdvertisementDataType.TEXT ? (
        <Stack direction="column" spacing={0.5}>
          <RequiredTitle title="本文" />
          <TextField
            variant="outlined"
            size="small"
            multiline
            rows={6}
            sx={{ width: '40%', backgroundColor: 'white' }}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
          />
        </Stack>
      ) : (
        <Stack direction="column" spacing={0.5}>
          <RequiredTitle title="掲載画像" />
          <AdvertisementImageUpload
            imageUrl={imageUrl}
            onImageUploaded={setImageUrl}
            height={130}
          />
        </Stack>
      )}
    </Stack>
  );
};

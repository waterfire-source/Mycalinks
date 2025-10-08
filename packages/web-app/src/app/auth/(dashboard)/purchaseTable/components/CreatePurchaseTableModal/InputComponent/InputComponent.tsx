'use client';

import { PurchaseTableElement } from '@/app/auth/(dashboard)/purchaseTable/components/CreatePurchaseTableModal/CreatePurchaseTableModal';
import SecondaryButtonWithIcon from '@/components/buttons/SecondaryButtonWithIcon';
import { mycaPosCommonConstants } from '@/constants/mycapos';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { palette } from '@/theme/palette';
import { ChromePicker } from 'react-color';
import {
  Box,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Popover,
  OutlinedInput,
} from '@mui/material';
import { PurchaseTableOrder } from '@prisma/client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { CustomTemplate } from '@/app/auth/(dashboard)/purchaseTable/hooks/useFetchCustomTemplates';
import { HelpIcon } from '@/components/common/HelpIcon';

interface Props {
  setPurchaseTable: React.Dispatch<
    React.SetStateAction<PurchaseTableElement | undefined>
  >;
  purchaseTable: PurchaseTableElement | undefined;
  customTemplates: CustomTemplate[];
}

export const InputComponent = ({
  setPurchaseTable,
  purchaseTable,
  customTemplates,
}: Props) => {
  const [customTemplateUrl, setCustomTemplateUrl] = useState<string | null>(
    null,
  );
  const [templateUrl, setTemplateUrl] = useState<string | null>(
    purchaseTable?.customTemplateImageUrl || null,
  );
  const { store } = useStore();

  const { setAlertState } = useAlert();
  const [colorPickerAnchor, setColorPickerAnchor] = useState<{
    element: HTMLElement | null;
    type: 'background' | 'title' | 'cardname' | null;
  }>({ element: null, type: null });

  // カスタムテンプレートアップロードボタン実行時
  useEffect(() => {
    if (customTemplateUrl !== null) {
      setPurchaseTable((prev) => {
        return {
          ...prev,
          customTemplateImageUrl: customTemplateUrl,
        };
      });
    }
  }, [customTemplateUrl, setPurchaseTable]);

  // フォーマット変更時プレビューに反映
  useEffect(() => {
    const selectedFormat = mycaPosCommonConstants.purchaseTableFormats.find(
      (formatItem) => formatItem.format === purchaseTable?.format,
    );

    if (selectedFormat) {
      // カスタムテンプレートがない場合は標準テンプレートを使用
      if (!purchaseTable?.customTemplateImageUrl) {
        setTemplateUrl(selectedFormat.templateUrl);
      } else {
        // カスタムテンプレートがある場合はそれを使用
        setTemplateUrl(purchaseTable.customTemplateImageUrl);
      }
    }
  }, [purchaseTable?.format, purchaseTable?.customTemplateImageUrl]);

  const handleCommentChange = (key: string, value: string) => {
    // 1行ごとの文字数を数える
    const lines = value.split('\n');
    const lineLengths = lines.map((line) => {
      return line.length;
    });
    // 改行は２回まで、1行ごとに２０文字までしか入力できない

    if (value.split('\n').length > 3) {
      setAlertState({
        message: '改行は２回まで、１行ごとに２０文字までしか入力できません',
        severity: 'error',
      });
      return;
    }
    if (lineLengths.some((length) => length > 20)) {
      setAlertState({
        message: '１行ごとに２０文字までしか入力できません',
        severity: 'error',
      });
      return;
    }
    setPurchaseTable((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
  };
  const handleStringChange = (key: string, value: string) => {
    setPurchaseTable((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
  };
  const handleBooleanChange = (key: string, value: boolean) => {
    setPurchaseTable((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });
  };
  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files?.length) {
      const fileData = event.target.files[0];
      const formDataForImage = new FormData();

      formDataForImage.append('file', fileData);
      formDataForImage.append('kind', 'item');

      const res = await fetch(
        `/api/store/${store.id}/functions/upload-image/`,
        {
          method: 'POST',
          headers: {},
          body: formDataForImage,
        },
      );

      const resJson = await res.json();

      if (resJson.imageUrl) {
        setCustomTemplateUrl(resJson.imageUrl);
      }
    }
  };

  // ローカルストレージ + 初期化をまとめて処理
  useEffect(() => {
    const saved = localStorage.getItem('purchaseTable');
    let parsedColor: string | undefined;
    let parsedBackgroundTextColor: string | undefined;
    let parsedCardnameAndPriceTextColor: string | undefined;
    let parsedComment: string | undefined;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsedColor = parsed.color;
        parsedBackgroundTextColor = parsed.background_text_color;
        parsedCardnameAndPriceTextColor = parsed.cardname_and_price_text_color;
        parsedComment = parsed.comment;
      } catch (e) {
        console.error('ローカルストレージの読み込みに失敗しました', e);
      }
    }

    setPurchaseTable((prev) => {
      const base = prev ?? {};
      return {
        ...base,
        orderBy: base.orderBy ?? PurchaseTableOrder.CUSTOM,
        showTitle: base.showTitle ?? true, // デフォルトでタイトル表示を有効にする
        color: base.color ?? parsedColor ?? '#b82a2a',
        background_text_color:
          base.background_text_color ?? parsedBackgroundTextColor ?? '#FFFFFF',
        cardname_and_price_text_color:
          base.cardname_and_price_text_color ??
          parsedCardnameAndPriceTextColor ??
          '#FFFFFF',
        comment: base.comment ?? parsedComment ?? '',
      };
    });
  }, [setPurchaseTable]);

  const handleColorClick = (
    event: React.MouseEvent<HTMLElement>,
    type: 'background' | 'title' | 'cardname',
  ) => {
    setColorPickerAnchor({
      element: event.currentTarget,
      type,
    });
  };

  const handleColorClose = () => {
    setColorPickerAnchor({ element: null, type: null });
  };

  const handleColorChange = (color: any) => {
    if (!colorPickerAnchor.type) return;

    const colorValue = color.hex;
    switch (colorPickerAnchor.type) {
      case 'background':
        handleStringChange('color', colorValue);
        break;
      case 'title':
        handleStringChange('background_text_color', colorValue);
        break;
      case 'cardname':
        handleStringChange('cardname_and_price_text_color', colorValue);
        break;
    }
  };

  // カスタムテンプレートのvalue管理
  // アップロードされた時に選択肢を戻すため
  const getSelectBoxValue = () => {
    const availableUrls = customTemplates
      .filter((template) => template.url)
      .map((template) => template.url);

    if (
      purchaseTable?.customTemplateImageUrl &&
      availableUrls.includes(purchaseTable.customTemplateImageUrl)
    ) {
      return purchaseTable.customTemplateImageUrl;
    }

    return '';
  };

  return (
    <Stack sx={{ flex: 1 }} height="100%" gap={1.5} alignItems="center">
      {/* 1行目 */}
      <Stack
        direction="row"
        spacing={2}
        width="90%"
        flexWrap="wrap"
        sx={{ py: 1 }}
      >
        {/* 左側 */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flex={1}
        >
          <Typography noWrap>タイトル</Typography>
          <TextField
            size="small"
            type="text"
            required
            sx={{ width: '50%', backgroundColor: 'white' }}
            onChange={(e) => handleStringChange('title', e.target.value)}
            value={purchaseTable?.title ?? ''}
          />
        </Stack>
        {/* 右側 */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flex={1}
        >
          <Typography noWrap>並び順(必須)</Typography>
          <FormControl size="small" sx={{ width: '50%' }}>
            <InputLabel sx={{ color: 'black' }}>並び替え</InputLabel>
            <Select
              value={purchaseTable?.orderBy ?? PurchaseTableOrder.CUSTOM}
              onChange={(e) =>
                handleStringChange('orderBy', e.target.value as string)
              }
              label="並び替え"
              sx={{ backgroundColor: 'white' }}
            >
              <MenuItem value={PurchaseTableOrder.PRICE_DESC}>
                価格降順
              </MenuItem>
              <MenuItem value={PurchaseTableOrder.PRICE_ASC}>価格昇順</MenuItem>
              <MenuItem value={PurchaseTableOrder.CUSTOM}>リスト順</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>
      {/* 2行目 */}
      <Stack
        direction="row"
        spacing={2}
        width="90%"
        flexWrap="wrap"
        sx={{ py: 1 }}
      >
        {/* 左側 */}
        <Stack
          direction="row"
          alignItems="center"
          flex={1}
          justifyContent="space-between"
          position="relative"
        >
          <Typography>テンプレート(必須)</Typography>
          <FormControl size="small" sx={{ width: '50%' }}>
            <InputLabel sx={{ color: 'black' }}>テンプレート</InputLabel>
            <Select
              value={purchaseTable?.format}
              onChange={(e) =>
                handleStringChange('format', e.target.value as string)
              }
              label="並び替え"
              sx={{
                backgroundColor: 'white',
              }}
            >
              {mycaPosCommonConstants.purchaseTableFormats.map(
                ({ format, displayName }) => (
                  <MenuItem key={format} value={format}>
                    {displayName}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>
          <Typography
            variant="caption"
            color={palette.text.primary}
            position="absolute"
            left={0}
            top="100%"
          >
            ※ 1回に最大3枚まで生成できます。
          </Typography>
        </Stack>
        {/* 右側 */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flex={1}
        >
          <Typography>カード名背景カラー(必須)</Typography>
          <Box
            onClick={(e) => handleColorClick(e, 'background')}
            sx={{
              width: '50%',
              height: 40,
              backgroundColor: 'white',
              border: '1px solid rgba(0, 0, 0, 0.23)',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                backgroundColor: purchaseTable?.color || '#ffffff',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginRight: 1,
              }}
            />
            <Typography>{purchaseTable?.color || ''}</Typography>
          </Box>
        </Stack>
      </Stack>
      {/* 3行目 - テキスト色の設定 */}
      <Stack
        direction="row"
        spacing={2}
        width="90%"
        flexWrap="wrap"
        sx={{ py: 1 }}
      >
        {/* 左側 - 背景テキスト色 */}
        <Stack
          direction="row"
          alignItems="center"
          flex={1}
          justifyContent="space-between"
        >
          <Stack>
            <Typography>タイトルテキスト色(必須)</Typography>
          </Stack>

          <Box
            onClick={(e) => handleColorClick(e, 'title')}
            sx={{
              width: '50%',
              height: 40,
              backgroundColor: 'white',
              border: '1px solid rgba(0, 0, 0, 0.23)',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                backgroundColor:
                  purchaseTable?.background_text_color || '#ffffff',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginRight: 1,
              }}
            />
            <Typography>
              {purchaseTable?.background_text_color || ''}
            </Typography>
          </Box>
        </Stack>
        {/* 右側 - カード名・価格テキスト色 */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flex={1}
        >
          <Stack>
            <Typography>カード名・価格テキスト色</Typography>
            <Typography>(必須)</Typography>
          </Stack>
          <Box
            onClick={(e) => handleColorClick(e, 'cardname')}
            sx={{
              width: '50%',
              height: 40,
              backgroundColor: 'white',
              border: '1px solid rgba(0, 0, 0, 0.23)',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                backgroundColor:
                  purchaseTable?.cardname_and_price_text_color || '#ffffff',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginRight: 1,
              }}
            />
            <Typography>
              {purchaseTable?.cardname_and_price_text_color || ''}
            </Typography>
          </Box>
        </Stack>
      </Stack>
      {/* 4行目 */}
      <Stack
        direction="row"
        spacing={2}
        justifyContent="left"
        alignItems="center"
        width="90%"
        flexWrap="wrap"
      >
        {/* 左側 */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          alignItems="center"
        >
          <HelpIcon helpArchivesNumber={3324} />
          <SecondaryButtonWithIcon
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            カスタムテンプレートをアップロード
          </SecondaryButtonWithIcon>
          <input
            id="fileInput"
            type="file"
            hidden
            onChange={handleImageChange}
          />
        </Stack>
        {/* 右側 */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="center"
        >
          <Checkbox
            checked={!!purchaseTable?.showStoreName}
            onChange={(e) =>
              handleBooleanChange('showStoreName', e.target.checked)
            }
            sx={{
              padding: 0,
              margin: 0,
              color: 'primary.main',
              '&.Mui-checked': {
                color: 'primary.main',
              },
            }}
          />
          <Typography>店舗名を記載する</Typography>
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="center"
        >
          <Checkbox
            checked={!!purchaseTable?.showTitle}
            onChange={(e) => handleBooleanChange('showTitle', e.target.checked)}
            sx={{
              padding: 0,
              margin: 0,
              color: 'primary.main',
              '&.Mui-checked': {
                color: 'primary.main',
              },
            }}
          />
          <Typography>タイトルを表示する</Typography>
        </Stack>
      </Stack>
      {/* カスタムテンプレートが存在する場合 */}
      {customTemplates.length > 0 && (
        <Stack direction="row" width="90%" py={1}>
          <Stack
            direction="row"
            alignItems="center"
            gap={2}
            flex={1}
            width="100%"
          >
            <Typography>カスタムテンプレート</Typography>
            <FormControl size="small" sx={{ width: '50%' }}>
              <Select
                value={getSelectBoxValue()}
                onChange={(e) =>
                  handleStringChange(
                    'customTemplateImageUrl',
                    e.target.value as string,
                  )
                }
                label="並び替え"
                sx={{
                  backgroundColor: 'white',
                }}
                displayEmpty
                input={<OutlinedInput notched={false} />}
              >
                <MenuItem value="">
                  <Typography sx={{ color: 'grey.500' }}>任意</Typography>
                </MenuItem>
                {customTemplates
                  .filter((template) => template.url)
                  .map((template) => (
                    <MenuItem key={template.id} value={template.url!!}>
                      {template.displayName}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      )}
      {/* 5行目 */}
      <Stack spacing={0.5} alignItems="center" width="90%">
        <Typography noWrap alignSelf="flex-start">
          注意事項
        </Typography>
        <Stack width="100%" flex={1} gap={1}>
          <TextField
            value={purchaseTable?.comment ?? ''}
            multiline
            fullWidth
            rows={3}
            onChange={(e) => handleCommentChange('comment', e.target.value)}
            sx={{ backgroundColor: 'white' }}
          />
          <Typography variant="caption" color={palette.text.primary}>
            ※ 注意事項は1行あたり20文字、3行までしか入力できません。
          </Typography>
        </Stack>
      </Stack>
      {/* 6行目 */}
      <Stack spacing={0.5} width="90%">
        <Typography textAlign="left">プレビュー（イメージ）</Typography>
        <Box
          sx={{
            width: '100%',
            height: 300,
            border: '1px solid #ccc',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
            gap: 2, // 画像の間隔を開ける
          }}
        >
          {templateUrl && (
            <Image
              src={templateUrl}
              alt="Template"
              width={240}
              height={280}
              style={{ objectFit: 'contain' }}
            />
          )}
        </Box>
      </Stack>
      {/* Add Color Picker Popover */}
      <Popover
        open={Boolean(colorPickerAnchor.element)}
        anchorEl={colorPickerAnchor.element}
        onClose={handleColorClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 1 }}>
          <ChromePicker
            color={
              colorPickerAnchor.type === 'background'
                ? purchaseTable?.color || '#ffffff'
                : colorPickerAnchor.type === 'title'
                ? purchaseTable?.background_text_color || '#ffffff'
                : purchaseTable?.cardname_and_price_text_color || '#ffffff'
            }
            onChange={handleColorChange}
          />
        </Box>
      </Popover>
    </Stack>
  );
};

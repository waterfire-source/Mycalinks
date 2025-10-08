import React, { useState } from 'react';
import { ReactNode } from 'react';
import { Box, Stack, SxProps, Tabs, Theme, Typography } from '@mui/material';
import { TabsProps } from '@mui/material/Tabs';
import { CustomTabTableStyle } from '@/components/tabs/CustomTabTableStyle';

/**
 * タブごとの定義
 *
 * - `key`: タブクリック時に `onTabChange(key)` で親に通知して表示内容を切り替える
 * - `value`: タブに表示するラベル
 */
export interface TabDef {
  key: string;
  value: string;
}

/*
 * カスタムタブコンポーネントのプロパティ
 *
 * 本コンポーネントは内部で MUI の `<Tabs>` を使用する
 *
 * ### フィールド概要
 * - `tabs`: タブの定義
 * - `content`: タブコンテンツ
 * - `header?`: ヘッダー領域に表示するコンテンツ（ある場合のみ）
 * - `footer?`: フッター領域に表示するコンテンツ（ある場合のみ）
 * - `onTabChange?`: タブクリック時のコールバック
 * - `containerSx?`: コンテンツ領域に追加で適用する sx
 */
export interface CustomTabProps extends Omit<TabsProps, 'content'> {
  tabs: TabDef[];
  content: ReactNode;
  tabDescription?: string;
  header?: ReactNode;
  footer?: ReactNode;
  onTabChange?: (value: string) => void;
  containerSx?: SxProps<Theme>;
}

/**
 * 要件に沿ったカスタムタブコンポーネント
 */
export const CustomTab: React.FC<CustomTabProps> = ({
  tabs,
  content,
  header,
  footer,
  onTabChange,
  tabDescription,
  containerSx,
  ...muiTabProps
}: CustomTabProps) => {
  // タブ選択のステート（必要に応じて props.value で制御する形でもOK）
  const [currentTab, setCurrentTab] = useState<string>(tabs[0]?.key || '');

  const handleChangeTab = (_: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    onTabChange?.(newValue);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
    >
      {/* ========== タブ領域 ========== */}
      <Box
        sx={{
          borderBottom: '8px solid',
          borderBottomColor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            margin: 0,
            padding: 0,
            minHeight: '31px',
          }}
          {...muiTabProps}
        >
          {tabs.map((tab) => (
            <CustomTabTableStyle
              key={tab.key}
              label={<Box>{tab.value}</Box>}
              value={tab.key}
            />
          ))}
          {tabDescription && (
            <Stack direction="row" alignItems="center" p={1}>
              <Typography sx={{ color: 'text.primary' }}>
                {tabDescription}
              </Typography>
            </Stack>
          )}
        </Tabs>
      </Box>

      {/* ========== コンテンツ領域 ========== */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'grid',
          flexGrow: 1,
          backgroundColor: 'common.white',
          // 3行: [ ヘッダー(有れば), コンテンツ, フッター(有れば)]
          gridTemplateRows: `
            auto
            1fr
            auto
          `,
          ...containerSx,
        }}
      >
        {/* ========== ヘッダー領域 (ある場合) ========== */}
        {header ? (
          <Box
            sx={{
              // ヘッダーの高さ
              height: '57px',
              px: 1,
              '@media (max-width: 1400px)': {
                height: '51px',
              },
              // 見た目の都合でボーダーや背景色などあれば追加
            }}
          >
            {header}
          </Box>
        ) : (
          // ヘッダーが無い場合は高さ0
          <Box sx={{ height: 0, overflow: 'hidden' }} />
        )}

        {/* ========== メインコンテンツ領域 ========== */}
        <Box
          sx={{
            overflowY: 'auto',
            p: 1,
            height: '100%',
          }}
        >
          {/* （ローディング状態などがあればここで制御） */}
          {content}
        </Box>

        {/* ========== フッター領域 (ある場合) ========== */}
        {footer ? (
          <Box
            sx={{
              width: '100%',
              height: '57px',
              px: 1,
              boxShadow: '0px -4px 4px rgba(0, 0, 0, 0.1)',
              '@media (max-width: 1400px)': {
                height: '51px',
              },
            }}
          >
            {footer}
          </Box>
        ) : (
          // フッターが無い場合は高さ0
          <Box sx={{ height: 0, overflow: 'hidden' }} />
        )}
      </Box>
    </Box>
  );
};

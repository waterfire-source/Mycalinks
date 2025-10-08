# EC Core Components Icons - アイコンコンポーネント

## 目的
ECサイトで使用される特殊なアイコンコンポーネントを提供

## 実装されているコンポーネント (1個)

```
icons/
└── statusIcon.tsx (75行)
```

## 主要実装

### statusIcon.tsx (75行) - 進捗状況アイコン
```typescript
import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

interface Props {
  current: number;
  total: number;
}

export const StatusIcon: React.FC<Props> = ({ current, total }) => {
  const progress = (current / total) * 100;

  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress
        variant="determinate"
        value={100}
        size={40}
        thickness={4.5}
        sx={{
          color: '#C0C0C0',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      <CircularProgress
        variant="determinate"
        value={progress}
        size={40}
        thickness={4.8}
        sx={{
          color: '#D32F2F',
          position: 'absolute',
          left: 0,
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            sx={{
              color: '#D32F2F',
              fontWeight: 'bold',
            }}
            variant="body2"
          >
            {current}
          </Typography>
          <Typography
            sx={{
              color: '#505050',
            }}
            variant="caption"
          >
            /{total}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
```

## 主要な技術実装

### 二重円形プログレスバー
- **背景円**: 完全な円（100%）をグレー（#C0C0C0）で表示
- **進捗円**: 計算された進捗率を赤色（#D32F2F）で表示
- **重なり効果**: position: absolute による重ね合わせ
- **角丸**: strokeLinecap: 'round' による丸い端点

### 中央テキスト表示
- **絶対位置**: 円の中央に配置
- **フレックス**: 中央揃えのフレックスレイアウト
- **数値表示**: 現在値（赤色・太字）と総数（グレー・小文字）
- **フォントサイズ**: body2 と caption の組み合わせ

### Material-UI 統合
- **CircularProgress**: Material-UI の円形プログレス
- **Typography**: 統一されたフォントスタイル
- **Box**: レイアウトコンテナ
- **sx プロパティ**: CSS-in-JS スタイリング

### 色彩設計
- **進捗色**: #D32F2F（赤色）- 重要度を表現
- **背景色**: #C0C0C0（薄いグレー）- 控えめな背景
- **テキスト色**: #505050（濃いグレー）- 読みやすさ重視

## 使用パターン

### 1. 基本的な進捗表示
```typescript
import { StatusIcon } from './icons/statusIcon';

const ProgressPage = () => {
  const [current, setCurrent] = useState(3);
  const [total, setTotal] = useState(10);

  return (
    <div>
      <h3>作業進捗</h3>
      <StatusIcon current={current} total={total} />
      <p>{current}/{total} 完了</p>
    </div>
  );
};
```

### 2. 動的な進捗更新
```typescript
import { StatusIcon } from './icons/statusIcon';

const TaskManager = () => {
  const [tasks, setTasks] = useState([
    { id: 1, completed: true },
    { id: 2, completed: false },
    { id: 3, completed: true },
    { id: 4, completed: false },
    { id: 5, completed: false },
  ]);

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  const handleTaskToggle = (id: number) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div>
      <StatusIcon current={completedCount} total={totalCount} />
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleTaskToggle(task.id)}
            />
            タスク {task.id}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### 3. 複数の進捗状況表示
```typescript
import { StatusIcon } from './icons/statusIcon';

const MultiProgressPage = () => {
  const progressData = [
    { label: '注文処理', current: 8, total: 10 },
    { label: '発送準備', current: 3, total: 8 },
    { label: '品質チェック', current: 10, total: 10 },
    { label: '在庫管理', current: 5, total: 12 },
  ];

  return (
    <div>
      <h2>業務進捗一覧</h2>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {progressData.map((item, index) => (
          <div key={index} style={{ textAlign: 'center' }}>
            <StatusIcon current={item.current} total={item.total} />
            <p>{item.label}</p>
            <p>{Math.round((item.current / item.total) * 100)}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 4. リアルタイム更新
```typescript
import { StatusIcon } from './icons/statusIcon';
import { useEffect, useState } from 'react';

const RealTimeProgress = () => {
  const [progress, setProgress] = useState({ current: 0, total: 100 });

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => ({
        ...prev,
        current: Math.min(prev.current + 1, prev.total)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const percentage = Math.round((progress.current / progress.total) * 100);
  const isComplete = progress.current === progress.total;

  return (
    <div style={{ textAlign: 'center' }}>
      <StatusIcon current={progress.current} total={progress.total} />
      <h3>{isComplete ? '完了!' : `処理中... ${percentage}%`}</h3>
      <p>
        {progress.current} / {progress.total} 件処理済み
      </p>
    </div>
  );
};
```

## 関連ディレクトリ
- `../`: ECサイトコアコンポーネント
- `../../`: ECサイトコア機能
- `/components/`: アプリ全体のコンポーネント

## 開発ノート
- **シンプル設計**: 単一責任の原則に従った小さなコンポーネント
- **視覚的効果**: 二重円形プログレスバーによる直感的な進捗表示
- **Material-UI統合**: 統一されたデザインシステム
- **カスタマイズ可能**: 色・サイズ・フォントの調整が容易
- **アクセシビリティ**: 数値表示による補完情報
- **パフォーマンス**: 軽量で高速な描画

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 
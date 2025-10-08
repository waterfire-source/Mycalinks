# EC Core Components Alerts - アラートコンポーネント

## 目的
ECサイトで使用される通知・アラート表示コンポーネントを提供

## 実装されているコンポーネント (1個)

```
alerts/
└── Alert.tsx (67行)
```

## 主要実装

### Alert.tsx (67行) - カスタムアラートコンポーネント
```typescript
import {
  Alert as MuiAlert,
  AlertProps as MuiAlertProps,
  Snackbar,
  SnackbarProps,
} from '@mui/material';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  bgColor?: string;
  color?: string;
  duration?: number;
  anchorOrigin?: SnackbarProps['anchorOrigin'];
  severity?: MuiAlertProps['severity'];
};

export const Alert = ({
  isOpen,
  onClose,
  message,
  bgColor = 'primary.main',
  color = 'white',
  duration = 3000,
  anchorOrigin = { vertical: 'top', horizontal: 'center' },
  severity = 'success',
}: Props) => {
  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      onClick={onClose}
      sx={{
        '& .MuiAlert-root': {
          bgcolor: bgColor,
          color: color,
          borderRadius: '10px',
          '& .MuiAlert-message': {
            textAlign: 'left',
            flex: 1,
          },
        },
      }}
    >
      <MuiAlert
        severity={severity}
        icon={false}
        onClose={onClose}
        onClick={onClose}
        sx={{
          '& .MuiAlert-message': {
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.9rem',
            p: 0,
          },
        }}
      >
        {message}
      </MuiAlert>
    </Snackbar>
  );
};
```

## 主要な技術実装

### Snackbar + Alert の統合 (Alert.tsx - 67行)
- **Material-UI統合**: Snackbar と Alert の組み合わせ
- **カスタマイズ**: 背景色・文字色・位置・表示時間の設定可能
- **自動非表示**: autoHideDuration による自動消去
- **クリック非表示**: onClick による手動消去

### デフォルト設定
- **背景色**: primary.main（青色）
- **文字色**: white（白色）
- **表示時間**: 3000ms（3秒）
- **位置**: 上部中央（top center）
- **重要度**: success

### スタイリング特徴
- **角丸デザイン**: 10px の角丸による現代的な外観
- **アイコン非表示**: icon={false} によるシンプルな表示
- **フレックスレイアウト**: メッセージの中央揃え
- **カスタムフォント**: 0.9rem のフォントサイズ

### 柔軟な設定
- **位置設定**: anchorOrigin による表示位置の変更
- **色設定**: bgColor・color による色の変更
- **重要度**: severity による種類の変更
- **表示時間**: duration による表示時間の調整

## 使用パターン

### 1. 基本的な成功通知
```typescript
import { Alert } from './alerts/Alert';

const SuccessNotification = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(true);
  };

  return (
    <div>
      <button onClick={handleSuccess}>操作を実行</button>
      <Alert
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        message="操作が正常に完了しました"
      />
    </div>
  );
};
```

### 2. エラー通知
```typescript
import { Alert } from './alerts/Alert';

const ErrorNotification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleError = (error: string) => {
    setErrorMessage(error);
    setIsOpen(true);
  };

  return (
    <div>
      <button onClick={() => handleError('エラーが発生しました')}>
        エラーを発生
      </button>
      <Alert
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        message={errorMessage}
        bgColor="error.main"
        color="white"
        severity="error"
      />
    </div>
  );
};
```

### 3. 警告通知
```typescript
import { Alert } from './alerts/Alert';

const WarningNotification = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleWarning = () => {
    setIsOpen(true);
  };

  return (
    <div>
      <button onClick={handleWarning}>警告を表示</button>
      <Alert
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        message="この操作は元に戻せません"
        bgColor="warning.main"
        color="black"
        severity="warning"
        duration={5000} // 5秒表示
      />
    </div>
  );
};
```

### 4. 情報通知
```typescript
import { Alert } from './alerts/Alert';

const InfoNotification = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleInfo = () => {
    setIsOpen(true);
  };

  return (
    <div>
      <button onClick={handleInfo}>情報を表示</button>
      <Alert
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        message="新しい機能が追加されました"
        bgColor="info.main"
        color="white"
        severity="info"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </div>
  );
};
```

### 5. カスタム位置での通知
```typescript
import { Alert } from './alerts/Alert';

const CustomPositionAlert = () => {
  const [alerts, setAlerts] = useState({
    topLeft: false,
    topRight: false,
    bottomLeft: false,
    bottomRight: false,
  });

  const showAlert = (position: keyof typeof alerts) => {
    setAlerts(prev => ({ ...prev, [position]: true }));
  };

  const closeAlert = (position: keyof typeof alerts) => {
    setAlerts(prev => ({ ...prev, [position]: false }));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '20px' }}>
      <button onClick={() => showAlert('topLeft')}>左上に表示</button>
      <button onClick={() => showAlert('topRight')}>右上に表示</button>
      <button onClick={() => showAlert('bottomLeft')}>左下に表示</button>
      <button onClick={() => showAlert('bottomRight')}>右下に表示</button>

      <Alert
        isOpen={alerts.topLeft}
        onClose={() => closeAlert('topLeft')}
        message="左上の通知"
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      />
      <Alert
        isOpen={alerts.topRight}
        onClose={() => closeAlert('topRight')}
        message="右上の通知"
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      />
      <Alert
        isOpen={alerts.bottomLeft}
        onClose={() => closeAlert('bottomLeft')}
        message="左下の通知"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
      <Alert
        isOpen={alerts.bottomRight}
        onClose={() => closeAlert('bottomRight')}
        message="右下の通知"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </div>
  );
};
```

### 6. 複数通知の管理
```typescript
import { Alert } from './alerts/Alert';

type NotificationItem = {
  id: string;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  bgColor: string;
};

const NotificationManager = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addNotification = (notification: Omit<NotificationItem, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccess = () => {
    addNotification({
      message: '成功しました',
      severity: 'success',
      bgColor: 'success.main',
    });
  };

  const showError = () => {
    addNotification({
      message: 'エラーが発生しました',
      severity: 'error',
      bgColor: 'error.main',
    });
  };

  return (
    <div>
      <button onClick={showSuccess}>成功通知</button>
      <button onClick={showError}>エラー通知</button>

      {notifications.map((notification, index) => (
        <Alert
          key={notification.id}
          isOpen={true}
          onClose={() => removeNotification(notification.id)}
          message={notification.message}
          bgColor={notification.bgColor}
          severity={notification.severity}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          // 複数表示時の位置調整
          sx={{
            top: `${80 + index * 70}px !important`,
          }}
        />
      ))}
    </div>
  );
};
```

### 7. フォーム送信での通知
```typescript
import { Alert } from './alerts/Alert';

const FormWithNotification = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [notification, setNotification] = useState({
    isOpen: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // フォーム送信処理
      const response = await submitForm(formData);
      
      if (response.success) {
        setNotification({
          isOpen: true,
          message: 'フォームが正常に送信されました',
          severity: 'success',
        });
        setFormData({ name: '', email: '' }); // フォームリセット
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setNotification({
        isOpen: true,
        message: error.message || '送信に失敗しました',
        severity: 'error',
      });
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="名前"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        />
        <input
          type="email"
          placeholder="メールアドレス"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        />
        <button type="submit">送信</button>
      </form>

      <Alert
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        message={notification.message}
        bgColor={notification.severity === 'success' ? 'success.main' : 'error.main'}
        severity={notification.severity}
      />
    </div>
  );
};
```

## 関連ディレクトリ
- `../`: ECサイトコアコンポーネント
- `@mui/material`: Material-UI コンポーネント

## 開発ノート
- **Material-UI拡張**: Snackbar と Alert の組み合わせによる高機能化
- **カスタマイズ性**: 色・位置・時間・重要度の柔軟な設定
- **使いやすさ**: シンプルな Props による直感的な使用
- **統一性**: ECサイト全体で一貫した通知デザイン
- **アクセシビリティ**: Material-UI による支援技術対応
- **パフォーマンス**: 軽量で高速な表示・非表示

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 
# EC Forget Password - ECパスワード忘れ・リセット機能

## 目的
ECサイトにおけるパスワード忘れ時の安全なパスワードリセット機能を提供し、3段階のフローによる確実なパスワード変更を実現

## 機能概要
- **パスワードリセット要求**: メールアドレスによるリセット要求
- **仮パスワードサインイン**: メール送信された仮パスワードでのログイン
- **新パスワード設定**: 安全な新パスワードの設定・更新
- **フロー管理**: localStorage による段階的フロー制御

## 内容概要
```
packages/web-app/src/app/ec/forget-password/
├── page.tsx                    # パスワードリセット要求画面 (123行)
├── sign-in/
│   └── page.tsx                # 仮パスワードサインイン画面 (179行)
└── change-password/
    └── page.tsx                # パスワード変更画面 (160行)
```

## 重要ファイル
- `page.tsx`: パスワードリセット要求画面 - メールアドレス入力・リセット要求
- `sign-in/page.tsx`: 仮パスワードサインイン画面 - 仮パスワードでの認証
- `change-password/page.tsx`: パスワード変更画面 - 新パスワード設定

## 主要機能実装

### 1. パスワードリセット要求画面
```typescript
// packages/web-app/src/app/ec/forget-password/page.tsx (123行)
const schema = z.object({
  mail: z.string().email('メールアドレスのご登録が確認できませんでした。再度正しいメールアドレスを入力してください'),
});

const ForgotPasswordPage = () => {
  const { forgetPassword } = useEcPasswordReset();
  const { startResetFlow } = usePasswordResetFlow();

  const onSubmit = async (data: FormData) => {
    try {
      const result = await forgetPassword({ mail: data.mail });

      if (result && result.ok) {
        startResetFlow(); // フロー開始
        router.push(PATH.FORGET_PASSWORD.signIn);
      } else if (result && result.error) {
        console.error('パスワード再設定APIエラー:', result.error);
      }
    } catch (error) {
      console.error('パスワード再設定リクエストが失敗しました:', error);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Typography variant="h5" align="center" fontWeight="bold">
        -パスワード再発行-
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, borderRadius: '8px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Image src="/images/logo/mycaLogoOnly.png" alt="Mycalinks Logo" width={96} height={96} />
        </Box>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body1" sx={{ color: errors.mail ? 'error.main' : 'inherit' }}>
                メールアドレス
              </Typography>
              <TextField
                {...register('mail')}
                fullWidth
                type="email"
                error={!!errors.mail}
              />
              <ErrorMessage errors={errors} name="mail" />
            </Box>
            
            <PrimaryButton type="submit" fullWidth>
              送信する
            </PrimaryButton>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};
```

### 2. 仮パスワードサインイン画面
```typescript
// packages/web-app/src/app/ec/forget-password/sign-in/page.tsx (179行)
const ForgetPasswordSignInPage = () => {
  const passwordResetFlow = usePasswordResetFlow();
  const { signIn } = useEcPasswordReset();
  const [showPassword, setShowPassword] = useState(false);

  // フロー状態チェック
  useEffect(() => {
    if (passwordResetFlow.initialized) {
      passwordResetFlow.redirectIfInvalidAccess('signIn');
    }
  }, [passwordResetFlow.initialized]);

  const onSubmit = async (data: FormData) => {
    try {
      const res = await signIn({ email: data.mail, password: data.password });
      
      if (res && res.length > 0 && res[0].id) {
        // userIdをsession保持
        sessionStorage.setItem('userId', res[0].id);
        passwordResetFlow.markAsAuthenticated();
        router.push(PATH.FORGET_PASSWORD.changePassword);
      }
    } catch (error) {
      console.error('Login request failed:', error);
    }
  };

  // フロー状態確認
  if (!passwordResetFlow.initialized || !passwordResetFlow.checkAccessFor('signIn')) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Typography variant="h5" align="center" fontWeight="bold">
        サインイン
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, borderRadius: '8px' }}>
        <Typography variant="body2" color="error" align="center" sx={{ mb: 2 }}>
          仮パスワードが書かれたメールを送信しました<br />
          下記よりログインし、すぐにパスワードを更新してください
        </Typography>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body1">メールアドレス</Typography>
              <TextField {...register('mail')} fullWidth type="email" error={!!errors.mail} />
            </Box>
            
            <Box>
              <Typography variant="body1">パスワード</Typography>
              <TextField
                {...register('password')}
                fullWidth
                type={showPassword ? 'text' : 'password'}
                error={!!errors.password}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  ),
                }}
              />
            </Box>
            
            <PrimaryButton type="submit" fullWidth>ログイン</PrimaryButton>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};
```

### 3. パスワード変更画面
```typescript
// packages/web-app/src/app/ec/forget-password/change-password/page.tsx (160行)
const ChangePasswordPage = () => {
  const passwordResetFlow = usePasswordResetFlow();
  const { changePassword } = useEcPasswordReset();
  const [showPassword, setShowPassword] = useState(false);

  // フロー状態チェック
  useEffect(() => {
    if (passwordResetFlow.initialized) {
      passwordResetFlow.redirectIfInvalidAccess('changePassword');
    }
  }, [passwordResetFlow.initialized]);

  const onSubmit = async (data: FormData) => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      console.error('User IDが見つかりません');
      return;
    }
    
    try {
      const result = await changePassword({
        user: Number(userId),
        password: data.password,
      });

      if (result && 'ok' in result) {
        passwordResetFlow.completeFlow(); // フロー完了
        sessionStorage.removeItem('userId'); // セキュリティ的にuserIdを削除
        router.push(PATH.LOGIN);
      }
    } catch (error) {
      console.error('パスワード変更に失敗しました:', error);
    }
  };

  // フロー状態確認
  if (!passwordResetFlow.initialized || !passwordResetFlow.checkAccessFor('changePassword')) {
    return <Container><CircularProgress /></Container>;
  }

  return (
    <Container component="main" maxWidth="sm">
      <Typography variant="h5" align="center" fontWeight="bold">
        -パスワード変更-
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, borderRadius: '8px' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body1">パスワード</Typography>
              <TextField
                {...register('password')}
                fullWidth
                type={showPassword ? 'text' : 'password'}
                error={!!errors.password}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  ),
                }}
              />
              <ErrorMessage errors={errors} name="password" />
            </Box>
            
            <PrimaryButton type="submit" fullWidth>
              パスワード変更
            </PrimaryButton>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};
```

### 4. パスワードリセットフロー管理
```typescript
// usePasswordResetFlow.ts (64行)
const FLOW_KEY = 'password-reset-flow-state';
type FlowState = 'idle' | 'requested' | 'authenticated' | 'completed';

export const usePasswordResetFlow = () => {
  const [flowState, setFlowState] = useState<FlowState>('idle');
  const [initialized, setInitialized] = useState(false);

  // localStorage からフロー状態復元
  useEffect(() => {
    const savedState = typeof window !== 'undefined'
      ? (localStorage.getItem(FLOW_KEY) as FlowState | null)
      : null;
    if (savedState) setFlowState(savedState);
    setInitialized(true);
  }, []);

  // フロー状態更新
  const updateFlowState = (newState: FlowState) => {
    setFlowState(newState);
    localStorage.setItem(FLOW_KEY, newState);
  };

  // フロー制御関数
  const startResetFlow = () => updateFlowState('requested');
  const markAsAuthenticated = () => updateFlowState('authenticated');
  const completeFlow = () => {
    updateFlowState('completed');
    localStorage.removeItem(FLOW_KEY);
  };

  // ページアクセス権限チェック
  const checkAccessFor = (page: 'signIn' | 'changePassword') => {
    if (!initialized) return false;
    switch (page) {
      case 'signIn': return flowState === 'requested';
      case 'changePassword': return flowState === 'authenticated';
      default: return false;
    }
  };

  // 不正アクセス時のリダイレクト
  const redirectIfInvalidAccess = (page: 'signIn' | 'changePassword') => {
    if (!checkAccessFor(page)) {
      router.replace(PATH.FORGET_PASSWORD.root);
      return true;
    }
    return false;
  };

  return {
    flowState, startResetFlow, markAsAuthenticated, completeFlow,
    checkAccessFor, redirectIfInvalidAccess, initialized,
  };
};
```

### 5. パスワードリセットAPI統合
```typescript
// useEcPasswordReset.ts (127行)
export const useEcPasswordReset = () => {
  const { setAlertState } = useAlert();
  const clientAPI = createClientAPI();

  // パスワード再発行API
  const forgetPassword = async (request: { mail: string }) => {
    try {
      const result = await clientAPI.ec.forgetPassword(request);
      if (result instanceof CustomError) {
        setAlertState({
          message: result.message || 'パスワード再発行に失敗しました',
          severity: 'error',
        });
        return null;
      }
      return result;
    } catch (error) {
      setAlertState({
        message: 'パスワード再発行中にエラーが発生しました',
        severity: 'error',
      });
      return null;
    }
  };

  // パスワード変更API
  const changePassword = async ({ user, password }: { user: number; password: string }) => {
    const hashedPassword = CustomCrypto.sha256(password);
    try {
      const result = await clientAPI.ec.changePassword({
        user,
        hashed_password: hashedPassword,
      });
      
      if (result instanceof CustomError) {
        setAlertState({
          message: result.message || 'パスワード変更に失敗しました',
          severity: 'error',
        });
        return null;
      }
      
      return result;
    } catch (error) {
      setAlertState({
        message: 'パスワード変更中にエラーが発生しました',
        severity: 'error',
      });
      return null;
    }
  };

  // アプリケーションログインAPI
  const signIn = async ({ email, password }: { email: string; password: string }) => {
    const hashedPassword = CustomCrypto.sha256(password);
    try {
      const result = await clientAPI.ec.appLogin({ email, hashedPassword });

      if (result.length === 0) {
        setAlertState({
          message: 'ログインかパスワードが間違っています',
          severity: 'error',
        });
        return null;
      }

      setAppStorageData({ longToken: result[0].longToken });
      return result;
    } catch (error) {
      setAlertState({
        message: 'サインイン中にエラーが発生しました',
        severity: 'error',
      });
      return null;
    }
  };

  return { forgetPassword, changePassword, signIn };
};
```

## データフロー

### 1. パスワードリセットフロー
```
メール入力 → forgetPassword API → startResetFlow → sign-in画面遷移
```

### 2. 仮パスワード認証フロー
```
仮パスワード入力 → signIn API → sessionStorage保存 → markAsAuthenticated → change-password画面遷移
```

### 3. パスワード変更フロー
```
新パスワード入力 → changePassword API → completeFlow → sessionStorage削除 → ログイン画面遷移
```

## 技術実装

### フロー状態管理
```typescript
// localStorage による永続化
const FLOW_KEY = 'password-reset-flow-state';
type FlowState = 'idle' | 'requested' | 'authenticated' | 'completed';

// 状態遷移制御
idle → requested → authenticated → completed
```

### セキュリティ対策
```typescript
// パスワードハッシュ化
const hashedPassword = CustomCrypto.sha256(password);

// 一時的なユーザーID保存
sessionStorage.setItem('userId', res[0].id);
sessionStorage.removeItem('userId'); // 完了時削除

// 不正アクセス防止
const redirectIfInvalidAccess = (page) => {
  if (!checkAccessFor(page)) {
    router.replace(PATH.FORGET_PASSWORD.root);
  }
};
```

### フォームバリデーション
```typescript
// Zod スキーマバリデーション
const schema = z.object({
  mail: z.string().email('メールアドレスのご登録が確認できませんでした'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
});

// React Hook Form 統合
const methods = useForm<FormData>({
  resolver: zodResolver(schema),
  mode: 'onBlur',
  reValidateMode: 'onChange',
});
```

## UI/UX設計

### 統一されたレイアウト
```typescript
// 共通レイアウトパターン
<Container component="main" maxWidth="sm" sx={{ py: 1 }}>
  <Typography variant="h5" align="center" fontWeight="bold">
    {pageTitle}
  </Typography>
  
  <Paper elevation={2} sx={{ p: 3, borderRadius: '8px' }}>
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
      <Image src="/images/logo/mycaLogoOnly.png" alt="Mycalinks Logo" width={96} height={96} />
    </Box>
    
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* フォームフィールド */}
      <PrimaryButton type="submit" fullWidth>
        {buttonText}
      </PrimaryButton>
    </form>
  </Paper>
</Container>
```

### パスワード表示切り替え
```typescript
// 統一されたパスワード表示トグル
<TextField
  type={showPassword ? 'text' : 'password'}
  InputProps={{
    endAdornment: (
      <IconButton onClick={() => setShowPassword(!showPassword)}>
        {showPassword ? <Visibility /> : <VisibilityOff />}
      </IconButton>
    ),
  }}
/>
```

## 使用パターン

### 1. パスワードリセット開始
```typescript
// メールアドレス入力・送信
const handleForgetPassword = async (email: string) => {
  const result = await forgetPassword({ mail: email });
  if (result?.ok) {
    startResetFlow();
    router.push(PATH.FORGET_PASSWORD.signIn);
  }
};
```

### 2. 仮パスワード認証
```typescript
// 仮パスワードでのサインイン
const handleTempPasswordSignIn = async (email: string, tempPassword: string) => {
  const result = await signIn({ email, password: tempPassword });
  if (result?.[0]?.id) {
    sessionStorage.setItem('userId', result[0].id);
    markAsAuthenticated();
    router.push(PATH.FORGET_PASSWORD.changePassword);
  }
};
```

### 3. 新パスワード設定
```typescript
// 新パスワードでの更新
const handleChangePassword = async (newPassword: string) => {
  const userId = sessionStorage.getItem('userId');
  const result = await changePassword({ user: Number(userId), password: newPassword });
  if (result?.ok) {
    completeFlow();
    sessionStorage.removeItem('userId');
    router.push(PATH.LOGIN);
  }
};
```

## 依存関係

### 外部ライブラリ
- **React Hook Form**: フォーム状態管理・バリデーション
- **Zod**: スキーマバリデーション
- **Material-UI**: UI コンポーネント・アイコン
- **Next.js**: ルーティング・ナビゲーション

### 内部モジュール
- **useEcPasswordReset**: パスワードリセットAPI統合
- **usePasswordResetFlow**: フロー状態管理
- **useAlert**: エラー・成功メッセージ表示
- **CustomCrypto**: パスワードハッシュ化
- **PATH**: パス定数定義

## 関連ディレクトリ
- `../login/` - ログイン画面（完了後の遷移先）
- `../(core)/hooks/` - useEcPasswordReset・usePasswordResetFlow
- `../(core)/constants/` - パス定義
- `/contexts/` - AlertContext
- `/utils/` - CustomCrypto

## 開発ノート
- **3段階フロー**: 要求→認証→変更の確実な段階管理
- **セキュリティ**: パスワードハッシュ化・sessionStorage管理・不正アクセス防止
- **フロー制御**: localStorage による状態永続化・ページアクセス権限管理
- **UX配慮**: パスワード表示切り替え・統一されたレイアウト・明確な案内文
- **エラーハンドリング**: useAlert による統一されたエラー表示

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 
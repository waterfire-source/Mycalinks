import { AlertContextProps } from '@/contexts/AlertContext';

interface Props<T> {
  url: string;
  onMessage: (type: string, data: T) => void;
  setAlertState: AlertContextProps['setAlertState'];
  errorMessage: string;
  reconnectInterval?: number;
  maxRetries?: number;
}

export class SSEClient<T extends Record<string, unknown>> {
  private eventSource: EventSource | null = null;
  private url: string;
  private reconnectInterval: number;
  private maxRetries: number;
  private retryCount: number = 0;
  private isClosed = false;
  private onMessage: (type: string, data: T) => void;
  private setAlertState: AlertContextProps['setAlertState'];
  private errorMessage: string;

  /**
   * リアルタイムAPIと通信するクライアント
   * @type APIから返ってくるイベントのデータ型
   */
  constructor({
    url,
    onMessage,
    setAlertState,
    errorMessage,
    reconnectInterval = 5000,
    maxRetries = 5,
  }: Props<T>) {
    this.url = url;
    this.onMessage = onMessage;
    this.setAlertState = setAlertState;
    this.reconnectInterval = reconnectInterval;
    this.maxRetries = maxRetries;
    this.errorMessage = errorMessage;
  }

  // 接続開始
  public connect(): void {
    if (this.eventSource?.readyState === EventSource.OPEN) {
      console.warn(`すでに${this.url}は接続されています`);
      return;
    }

    this.eventSource = new EventSource(this.url);

    this.eventSource.onopen = () => {
      console.info('SSEコネクションが接続されました');
      this.retryCount = 0; // 接続成功時にリトライカウントをリセット
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { obj: T; type: string };
        if ('ok' in data) {
          console.info(data.ok);
          return;
        }
        this.onMessage(data.type, data.obj); //イベントタイプも含めて送信する
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSEでエラーが発生:', error);
      this.retryCount++;
      if (this.retryCount <= this.maxRetries) {
        this.reconnect();
      } else {
        console.error(`${this.maxRetries} 回再接続しましたが失敗しました。`);
        this.setAlertState({
          severity: 'error',
          message: this.errorMessage,
        });
        this.close(); // リトライ回数上限を超えたら接続を閉じる
      }
    };
  }

  // 再接続処理
  private reconnect(): void {
    if (this.isClosed) return;

    console.info(`再接続 ${this.reconnectInterval}ms...`);
    this.close();

    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  // 接続終了
  public close(): void {
    this.isClosed = true;
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.info('SSEコネクションの接続を終了。');
    }
  }
}

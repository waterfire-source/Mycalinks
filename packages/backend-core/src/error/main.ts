//バックエンドコアエラーを発しやすくするやつ

export type BackendCoreErrorObj = {
  internalMessage: string; //内部向け
  externalMessage?: string; //顧客向け
  errorCode?: string; //エラーコード
};

/**
 * バックエンドコアエラー
 */
export class BackendCoreError extends Error {
  public internalMessage: string;
  public externalMessage?: string;
  public errorCode?: string;

  public static shortCuts = {
    development: {
      internalMessage: '開発エラー',
    },
  } as const;

  constructor(
    param: BackendCoreErrorObj | keyof typeof BackendCoreError.shortCuts,
  ) {
    if (typeof param == 'string') {
      param = BackendCoreError.shortCuts[param];
    }

    super(param.internalMessage); //ErrorクラスにはmessageTextを渡す
    this.internalMessage = param.internalMessage;
    this.externalMessage = param.externalMessage;
    this.errorCode = param.errorCode;
    console.error(this.internalMessage);
  }

  /**
   * 失敗したら何回かリトライするデコレータ
   * @param maxRetries リトライ回数
   * @param delay リトライ間隔
   * @param throwLastError 最後のエラーをthrowするかどうか
   * @returns
   */
  public static RetryOnFailure = ({
    maxRetries = 3,
    delay = 1000,
    throwLastError = false,
  }: {
    maxRetries?: number;
    delay?: number;
    throwLastError?: boolean;
  }) => {
    return (target: Object, propertyKey: string | symbol, descriptor: any) => {
      // descriptorがundefinedの場合は早期リターン
      if (!descriptor) {
        return;
      }

      const originalMethod = descriptor.value!;

      //関数書き換え
      descriptor.value = async function (...args: number[]) {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            return await originalMethod.apply(this, args);
          } catch (error) {
            lastError = error as Error;
            console.warn(
              `試行 ${attempt}/${maxRetries} に失敗しました: ${target.constructor.name}.${String(propertyKey)}`,
              error,
            );

            if (attempt < maxRetries) {
              const thisDelay = Math.pow(2, attempt) * delay;
              console.log(`${thisDelay}ms後に再試行します...`);
              await new Promise((resolve) => setTimeout(resolve, thisDelay));
            }
          }
        }

        console.error(
          `全ての試行に失敗しました: ${target.constructor.name}.${String(propertyKey)}. 最後のエラー:`,
          lastError,
        );

        if (throwLastError && lastError) {
          throw lastError;
        }

        return null;
      };

      return descriptor;
    };
  };
}

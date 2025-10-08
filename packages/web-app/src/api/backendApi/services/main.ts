import { BackendApiAuthService } from '@/api/backendApi/auth/main';
import { ApiPrivileges, BackendAPI } from '@/api/backendApi/main';
import { BackendCoreError, BackendService } from 'backend-core';

/**
 * APIオブジェクトありきで動くやつ
 * リクエストパラメータなどを考慮した上の処理
 * コントローラに近い Backendcoreを継承している
 */
export class BackendApiService extends BackendService {
  public core?: unknown;

  constructor(public API: BackendAPI<any>) {
    super();
    this.setProcessId(this.API.processId);

    this.setIds({
      corporationId: this.resources.corporation?.id,
      storeId:
        Number(this.API.params?.store_id) || Number(this.resources.store?.id), //パスパラム優先,
    });
  }

  /**
   * 実行に特定のポリシーが必要
   */
  public static WithPrivileges = (privileges: ApiPrivileges) => {
    return (
      target: unknown,
      propertyKey: string | symbol,
      descriptor?: PropertyDescriptor,
    ) => {
      // descriptorがundefinedの場合は早期リターン
      if (!descriptor) {
        return;
      }

      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        if (!(this instanceof BackendApiService)) {
          throw new BackendCoreError({
            internalMessage: `権限ポリシーチェックデコレータではBackendApiServiceのインスタンスが必要です`,
            externalMessage: 'サーバーエラー',
          });
        }

        const authService = new BackendApiAuthService(this.API);
        authService.checkRole(privileges.role); //ロールチェック
        if (privileges.policies) {
          authService.checkPolicies(privileges.policies); //ポリシーチェック
        }

        return await originalMethod.apply(this, args);
      };

      return descriptor;
    };
  };

  // /**
  //  * コアサービスを注入するデコレータ
  //  * @param CoreService コアサービスのコンストラクタ
  //  * @returns
  //  */
  // public static WithCore = <T extends new (...args: any[]) => any>(
  //   CoreService: T,
  // ) => {
  //   return function (target: any) {
  //     return class extends target {
  //       declare core: InstanceType<T>;

  //       constructor(...args: any[]) {
  //         super(...args);

  //         this.core = new CoreService();
  //         this.core.resources = this.resources;
  //         this.core.ids = this.ids;
  //       }
  //     };
  //   };
  // };
}

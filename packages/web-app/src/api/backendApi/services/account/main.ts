import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiService } from '@/api/backendApi/services/main';
import { Account, Account_Group, Prisma } from '@prisma/client';
import { BackendService } from 'backend-core';
import { ApiError } from '@/api/backendApi/error/apiError';
import { apiPolicies } from 'common';

/**
 * API側で使うTransactionサービス
 */
export class BackendApiAccountService extends BackendApiService {
  // declare core: BackendCoreTransactionService;

  constructor(API: BackendAPI<any>, specificAccountId?: Account['id']) {
    super(API);
    // this.addCore(new BackendCoreTransactionService());
    this.setIds({
      accountId: specificAccountId ?? API.resources.actionAccount?.id,
    });
  }

  //管理できる店を取得する
  @BackendService.WithIds(['accountId'])
  public async getManagableStores() {
    //このアカウントが管理できるストア一覧を取得
    const stores = await this.API.db.account_Store.findMany({
      where: {
        account_id: this.ids.accountId!,
      },
    });

    return stores.map((e) => e.store_id);
  }

  //担当者のクエリ
  @BackendService.WithIds(['storeId'])
  @BackendService.WithResources(['actionAccount'])
  public async getStaffQuery() {
    return {
      connect: {
        id: this.API.resources.actionAccount!.id,
        stores: {
          some: {
            store_id: this.ids.storeId!,
          },
        },
      },
    };
  }

  /**
   * 自分以下の権限グループを取得するWhereクエリを組み立てる
   */
  @BackendService.WithResources(['actionAccount'])
  public async getManagableAccountGroupQuery() {
    const actionAccountGroup = this.API.resources!.actionAccount!.group;

    const whereInput: Prisma.Account_GroupWhereInput = {};

    Object.keys(apiPolicies).forEach((p) => {
      const key = p as keyof typeof apiPolicies;
      if (!actionAccountGroup[key])
        //自分では不可になっていたら条件で不可を追加
        whereInput[key] = false;
    });

    return whereInput;
  }

  /**
   * ポリシーをチェック
   */
  public checkPolicy(
    policies: Array<keyof typeof apiPolicies>,
    specificGroup?: Account_Group,
  ) {
    const group = specificGroup ?? this.API.resources.actionAccount?.group;

    if (!group) throw new ApiError('permission');

    //ポリシー確認
    if (!policies.every((p) => group[p])) throw new ApiError('permission');
  }

  /**
   * 管理可能なアカウント一覧を取得する（自分以下で、かつ自分の所属している店舗に所属しているアカウントのみ）
   */
  @BackendService.WithIds(['accountId'])
  public async getManagableAccounts(
    whereQuery: Prisma.AccountWhereInput = {}, // 追加の条件
  ) {
    // const actionAccountGroup = this.API.resources?.actionAccount?.group!;

    const managableStores = await this.getManagableStores();

    // クエリの構築
    const whereCondition: Prisma.AccountWhereInput = {
      group: await this.getManagableAccountGroupQuery(), //自分以下の権限を持っている人のみ
      stores: {
        some: {
          store_id: {
            in: managableStores,
          },
        },
      },
      ...whereQuery,
    };

    const accounts = await this.API.db.account.findManyExists({
      where: whereCondition,
      select: {
        id: true,
        display_name: true,
        nick_name: true,
        code: true,
        email: true,
        linked_corporation_id: true,
        group_id: true,
        stores: {
          //管理できる店舗一覧だけ取得
          include: {
            store: {
              select: {
                id: true,
                display_name: true,
              },
            },
          },
        },
      },
    });

    //アカウント作成権限がなかったらcodeをすべて隠す
    // if(this.API.resources.)

    return accounts;
  }

  /**
   * 従業員コードを生成する
   */
  public async generateStaffCode() {
    // 6桁のランダムな従業員コードを生成する関数
    const generateCode = () => {
      let code: number;
      do {
        code = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
      } while (
        // 全ての桁が同じ数字である場合は再生成
        code
          .toString()
          .split('')
          .every((digit) => digit === code.toString()[0])
      );
      return code;
    };

    // 法人に紐づくスタッフコードの一覧取得
    const staffCodes = await this.API.db.account.findMany({
      where: {
        linked_corporation_id: this.API.resources!.corporation!.id,
      },
      select: {
        code: true,
      },
    });

    // 重複しないコードが生成されるまでループ
    while (true) {
      const code = generateCode();

      // 同じ法人内で既に使用されているコードがないかチェック
      const existingStaff = staffCodes.find((e) => e.code === code);
      if (!existingStaff) {
        return code;
      }
    }
  }

  //従業員コードを確認する（同時にこの法人かどうかも確認）
  @BackendService.WithResources(['corporation'])
  public async verifyStaffCode(code: Account['code']) {
    //従業員コードがあるか確認
    const thisStaffAccountInfo = await this.API.db.account.findFirstExists({
      where: {
        linked_corporation_id: this.API.resources.corporation!.id,
        code,
      },
      include: {
        group: true,
      },
    });

    //あったら返す
    if (thisStaffAccountInfo) {
      return thisStaffAccountInfo;
    }

    throw new ApiError({
      status: 400,
      messageText: '従業員コードが不正です',
    });
  }
}

export type ApiPolicies = keyof typeof apiPolicies;

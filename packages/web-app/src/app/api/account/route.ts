import { apiRole, BackendAPI } from '@/api/backendApi/main';

import { type apiPrivilegesType } from '@/types/BackendAPI';
import { Prisma } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { createAccountApi } from 'api-generator';
import { CustomCrypto } from '@/utils/crypto';
import { Password } from '@/utils/password';
import { TaskManager } from 'backend-core';
import { BackendApiAccountService } from '@/api/backendApi/services/account/main';

//条件を指定して、アカウントを取得するAPI
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos],
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const account = new BackendApiAccountService(API);

    const whereQuery: Prisma.AccountWhereInput = {};

    Object.entries(API.query).forEach(([prop, value]: [string, unknown]) => {
      switch (prop) {
        case 'id':
          whereQuery[prop] = {
            in: (value as string).split(',').map((e) => parseInt(e)),
          };
          break;
        // case 'kind':
        //   whereQuery[prop] = value as Account['kind'];
        //   break;

        case 'staff_code':
          if (value) {
            whereQuery.code = Number(value);
          }
          break;
      }
    });

    let result: any = [];

    const managableAccounts = await account.getManagableAccounts(whereQuery);

    // 結果を整形
    result = managableAccounts.map((managableAccount) => {
      return {
        ...managableAccount,
      };
    });

    return API.status(200).response({ data: { accounts: result } });
  },
);

// アカウント作成
export const POST = BackendAPI.create(
  createAccountApi,
  async (API, { body }) => {
    const { email, stores, group_id, display_name, nick_name } = body;

    // 既に登録されているか確認
    const existingAccount = await API.db.account.findUnique({
      where: {
        email,
      },
    });
    if (existingAccount) {
      throw new ApiError({
        status: 400,
        messageText: '登録済みのメールアドレスです',
      });
    }

    //ポリシーの内容が適切か確認する
    const accountModel = new BackendApiAccountService(API);

    const thisAccountGroup = await API.db.account_Group.findUnique({
      where: {
        ...(await accountModel.getManagableAccountGroupQuery()),
        id: group_id,
      },
    });

    if (!thisAccountGroup)
      throw new ApiError({
        status: 401,
        messageText: 'アカウントの作成権限がありません',
      });

    const managableStores = await accountModel.getManagableStores();
    if (!stores.every((s) => managableStores.includes(s.store_id)))
      throw new ApiError({
        status: 401,
        messageText: 'アカウントの作成権限がありません',
      });

    // 従業員コードを生成
    const code = await accountModel.generateStaffCode();

    // パスワードを生成
    const password = Password.generatePassword();
    const { hash, salt } = CustomCrypto.generateHash(password);

    // トランザクション
    const result = await API.transaction(async (tx) => {
      // 従業員アカウントを作成
      const staffAccount = await tx.account.create({
        data: {
          display_name: display_name,
          email: email,
          hashed_password: hash,
          nick_name,
          code,
          linked_corporation: {
            connect: {
              id: API.user!.corporation_id,
            },
          },
          salt,
          // 店舗と紐付け
          stores: {
            create: stores,
          },
          // アカウントグループと紐付け
          group: {
            connect: {
              id: group_id,
            },
          },
        },
        select: {
          id: true,
          code: true,
        },
      });

      //メール送信に失敗したらロールバックする感じでOK
      const taskManager = new TaskManager({
        targetWorker: 'notification',
        kind: 'sendEmail',
      });

      await taskManager.publish({
        body: [
          {
            as: 'system',
            to: email,
            title: '従業員アカウントの作成',
            bodyText: `従業員アカウントを登録しました。従業員コード: ${code} 、初期パスワード: ${password} です。`,
          },
        ],
        fromSystem: true,
        service: API,
        specificGroupId: `send-email-${email}`,
      });

      console.log(`従業員作成時の初期パスワード: ${password}`);

      return staffAccount;
    });

    return result;
  },
);

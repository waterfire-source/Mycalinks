import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { Prisma } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { createStoreDef } from '@/app/api/store/def';
import { mycaPosCommonConstants } from '@/constants/mycapos';
import { CustomCrypto } from 'common';

// ストア情報取得API
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos],
        policies: [], // 実行に必要なポリシー
      },
    };

    // BackendAPIをセットアップ
    const API = await BackendAPI.setUp(req, apiDef);
    const { searchParams } = new URL(req.url);
    const includesEcSetting = searchParams.get('includesEcSetting') === 'true';

    // クエリパラメータの処理
    const whereQuery: Prisma.StoreWhereInput = {};
    const storeId = parseInt(searchParams.get('id') || '');
    if (!isNaN(storeId)) {
      whereQuery.id = storeId;
    }

    let result: any = [];

    const { id: account_id } = API.user!; // ログインしているアカウントIDを取得

    const selectResult = await API.db.store.findMany({
      where: {
        accounts: {
          some: {
            account_id,
          },
        },
        ...whereQuery,
        is_active: true, //アクティブじゃないとだめ
      },
      select: {
        id: true,
        receipt_logo_url: true,
        opened: true,
        display_name: true,
        total_cash_price: true, //ロールによって厳しく制限する必要がありそう
        buy_term: true,
        status_message: true,
        status_message_updated_at: true,
        auto_print_receipt: true,
        use_wholesale_price_order_column: true, //仕入れ値の使い方のカラム指定
        use_wholesale_price_order_rule: true, //仕入れ値の使い方の並び替えルール
        wholesale_price_keep_rule: true, //仕入れ値の保持ルール
        point_enabled: true, //ポイント機能を利用するか否か
        //ポイント付与周り
        visit_point_enabled: true, //来店ポイントを付与するか否か
        visit_point_per: true, //来店ポイントの付与機会
        visit_point_amount: true, //来店ポイントの量
        sell_point_enabled: true, //販売ポイントを付与するか否か
        sell_point_per: true, //何円につき販売ポイントを付与するのか
        sell_point_limit_enabled: true, //販売ポイント上限
        sell_point_limit_per: true, //販売ポイント制限の機会
        sell_point_limit_amount: true, //販売ポイント制限の量
        buy_point_enabled: true, //買取ポイントを付与するか否か
        buy_point_per: true, //何円につき買取ポイントを付与するのか
        buy_point_limit_enabled: true, //買取ポイント上限
        buy_point_limit_per: true, //買取ポイント制限の機会
        buy_point_limit_amount: true, //買取ポイント制限の量
        sell_point_payment_method: true, //販売ポイントの支払い方法 cash,square,paypay,felica,bankみたいにカンマ区切り
        buy_point_payment_method: true, //買取ポイントの支払い方法 cash,bankみたいにカンマ区切り
        //ポイント利用周り
        point_rate: true, //1ポイントを利用する時現金の何円相当になるか
        point_spend_limit_enabled: true, //ポイント消費の制限を設けるか否か
        point_spend_limit_per: true, //ポイント消費の制限の機会
        point_spend_limit_amount: true, //ポイント消費の制限の量
        point_expire_enabled: true, //ポイントの有効期限を設定するか否か
        point_expire_day: true, //何日でポイントの有効期限がくるようにするか（自動でポイントが0になる）
        //税金
        tax_rate: true,
        tax_mode: true,
        price_adjustment_round_rule: true,
        price_adjustment_round_rank: true,
        full_address: true,
        zip_code: true,
        phone_number: true,
        square_location_id: true,

        leader_name: true,
        register_cash_reset_enabled: true,
        register_cash_check_timing: true,
        register_cash_manage_by_separately: true,

        mycalinks_ec_enabled: true,
        mycalinks_ec_terms_accepted: true,
        ochanoko_ec_enabled: true,

        allow_print_no_price_label: true,

        staff_barcode_timeout_minutes: true,

        billing_source_corporation_name: true,
        billing_source_address: true,
        billing_source_phone_number: true,
        billing_source_email: true,
        billing_source_bank_name: true,

        billing_source_bank_branch_name: true,

        billing_source_bank_account_type: true,
        billing_source_bank_account_number: true,
        billing_source_bank_account_name_ruby: true,

        ec_setting: includesEcSetting || undefined,
      },
    });

    result = selectResult;

    return API.status(200).response({ data: result });
  },
);

// ストア作成API
export const POST = BackendAPI.defineApi(
  createStoreDef,
  async (API, { body }) => {
    // [TODO] 管理者用の認証も用意したい
    if (API.user?.id != 1 && process.env.NEXT_PUBLIC_DATABASE_KIND != 'staging')
      throw new ApiError({
        status: 401,
        messageText: '実行できません',
      });

    // API.bodyから必要な情報を抽出
    const { email, corporation_id } = body;

    //法人アカウントを取得
    const corpInfo = await API.db.corporation.findUnique({
      where: {
        id: corporation_id,
      },
      // include: {
      //   accounts: true,
      // },
    });

    const corpAccount = await API.db.account.findFirst({
      where: {
        linked_corporation_id: corporation_id,
        code: null,
        group_id: mycaPosCommonConstants.account.specialAccountGroup.corp.id,
      },
    });

    if (!corpInfo || !corpAccount)
      throw new ApiError({
        status: 500,
        messageText: '法人が見つかりません',
      });

    const txRes = await API.transaction(async (tx) => {
      // 店舗アカウントを作成
      const storeAccount = await tx.account.create({
        data: {
          display_name: `店舗アカウント ${email}`,
          email: email,
          // kind: AccountKind.store,
          hashed_password: '',
          linked_corporation: {
            connect: {
              id: corporation_id,
            },
          },
          group: {
            connect: {
              id: mycaPosCommonConstants.account.specialAccountGroup.store.id,
            },
          },
          salt: '',
          login_flg: false,
          // 店舗を作成
          stores: {
            create: {
              store: {
                create: {
                  code: CustomCrypto.generateUuidV7(),
                  display_name: `店舗 ${email}`,
                  is_active: false, //非アクティブ状態で作成する
                  qr_iv: '', //これ早く削除したい
                },
              },
            },
          },
        },
        include: {
          stores: {
            include: {
              store: true,
            },
          },
        },
      });
      const store = storeAccount.stores[0].store;

      // 店舗と法人アカウントの紐付け
      await tx.account_Store.create({
        data: {
          store_id: store.id,
          account_id: corpAccount.id,
        },
      });

      const result = await tx.account.findUnique({
        where: {
          id: storeAccount.id,
        },
        include: {
          stores: {
            include: {
              store: true,
            },
          },
        },
      });

      return result!;
    });

    return {
      account: txRes,
    };
  },
);

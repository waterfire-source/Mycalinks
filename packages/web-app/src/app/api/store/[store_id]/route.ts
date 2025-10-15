import { apiRole, BackendAPI, ResponseMsgKind } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { ItemStatus, PaymentService } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiSquareService } from '@/api/backendApi/services/square/main';
import { api } from '@/app/api/store/api';
import { ItemTask, TaskManager } from 'backend-core';

//店基本情報の更新
//買取規約文の更新などもできる
export const PUT = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    let {
      // opened,
      buy_term,
      use_wholesale_price_order_column,
      use_wholesale_price_order_rule,
      wholesale_price_keep_rule,
      display_name,
      leader_name,
      image_url,
      receipt_logo_url,
      full_address,
      zip_code,
      phone_number,
      // current_password,
      point_enabled, //ポイント機能を利用するか否か
      //ポイント付与周り
      visit_point_enabled, //来店ポイントを付与するか否か
      visit_point_per, //来店ポイントの付与機会
      visit_point_amount, //来店ポイントの量
      sell_point_enabled, //販売ポイントを付与するか否か
      sell_point_per, //何円につき販売ポイントを付与するのか
      sell_point_limit_enabled, //販売ポイント上限
      sell_point_limit_per, //販売ポイント制限の機会
      sell_point_limit_amount, //販売ポイント制限の量
      sell_point_payment_method, //販売ポイントの支払い方法
      buy_point_payment_method, //買取ポイントの支払い方法
      buy_point_enabled, //買取ポイントを付与するか否か
      buy_point_per, //何円につき買取ポイントを付与するのか
      buy_point_limit_enabled, //買取ポイント上限
      buy_point_limit_per, //買取ポイント制限の機会
      buy_point_limit_amount, //買取ポイント制限の量
      //ポイント利用周り
      point_rate, //1ポイントを利用する時現金の何円相当になるか
      point_spend_limit_enabled, //ポイント消費の制限を設けるか否か
      point_spend_limit_per, //ポイント消費の制限の機会
      point_spend_limit_amount, //ポイント消費の制限の量
      point_expire_enabled, //ポイントの有効期限を設定するか否か
      point_expire_day, //何日でポイントの有効期限がくるようにするか（自動でポイントが0になる）
      //お金
      price_adjustment_round_rule,
      price_adjustment_round_rank,

      square_location_id,
      register_cash_reset_enabled,
      register_cash_check_timing,
      register_cash_manage_by_separately,

      mycalinks_ec_enabled,
      mycalinks_ec_terms_accepted,
      ochanoko_ec_enabled,
      shopify_ec_enabled,
      payment_service,

      billing_source_corporation_name,
      billing_source_address,
      billing_source_phone_number,
      billing_source_email,
      billing_source_bank_name,
      billing_source_bank_branch_name,
      billing_source_bank_account_type,
      billing_source_bank_account_number,
      billing_source_bank_account_name_ruby,

      ec_setting,
    } = API.body as api[1]['request']['body'];

    let reservedStockNumber: number | undefined = undefined;
    let needRecalculateEcItemPrice: boolean = false;

    const { store_id: id } = API.params;

    if (!id || isNaN(id)) throw new ApiError('notEnough');

    //SquareのlocationIdが指定されている時は所有権を確認する
    if (square_location_id) {
      const squareService = new BackendApiSquareService(API);
      await squareService.grantToken();
      const squareLocations = await squareService.getLocations();
      if (
        !squareLocations?.locations ||
        !squareLocations.locations.find((e) => e.id == square_location_id)
      ) {
        throw new ApiError({
          status: 400,
          messageText:
            '指定されたSquare Locationは連携されているアカウントに存在しません',
        });
      }

      //所有権があったら、ついでにpayment_serviceをsquareに変更する
      payment_service = PaymentService.square;
    }

    const prevSetting = API.resources.store!;

    //おちゃのこ連携は、おちゃのこのアクセストークンがないとできない
    if (ochanoko_ec_enabled) {
      if (
        !(
          prevSetting.ec_setting?.ochanoko_api_token ??
          ec_setting?.ochanoko_api_token
        )
      ) {
        throw new ApiError({
          status: 400,
          messageText:
            'おちゃのこ連携を有効にするには、おちゃのこのアクセストークンが必要です',
        });
      }
    }

    //Shopify連携は、Shopifyのアクセストークンがないとできない
    if (shopify_ec_enabled) {
      if (!prevSetting.ec_setting?.shopify_access_token) {
        throw new ApiError({
          status: 400,
          messageText:
            'Shopify連携を有効にするには、Shopifyのアクセストークンが必要です',
        });
      }
    }

    const txRes = await API.transaction(async (tx) => {
      const updateResult = await tx.store.update({
        where: {
          id: parseInt(id || ''),
        },
        data: {
          // opened, //開閉店
          buy_term, //買取受付書
          use_wholesale_price_order_column,
          use_wholesale_price_order_rule,
          wholesale_price_keep_rule,
          display_name,
          image_url,
          receipt_logo_url,
          full_address,
          zip_code,
          phone_number,
          point_enabled, //ポイント機能を利用するか否か
          //ポイント付与周り
          visit_point_enabled, //来店ポイントを付与するか否か
          visit_point_per, //来店ポイントの付与機会
          visit_point_amount, //来店ポイントの量
          sell_point_enabled, //販売ポイントを付与するか否か
          sell_point_per, //何円につき販売ポイントを付与するのか
          sell_point_limit_enabled, //販売ポイント上限
          sell_point_limit_per, //販売ポイント制限の機会
          sell_point_limit_amount, //販売ポイント制限の量
          sell_point_payment_method, //販売ポイントの支払い方法
          buy_point_enabled, //買取ポイントを付与するか否か
          buy_point_per, //何円につき買取ポイントを付与するのか
          buy_point_limit_enabled, //買取ポイント上限
          buy_point_limit_per, //買取ポイント制限の機会
          buy_point_limit_amount, //買取ポイント制限の量
          buy_point_payment_method, //買取ポイントの支払い方法
          //ポイント利用周り
          point_rate, //1ポイントを利用する時現金の何円相当になるか
          point_spend_limit_enabled, //ポイント消費の制限を設けるか否か
          point_spend_limit_per, //ポイント消費の制限の機会
          point_spend_limit_amount, //ポイント消費の制限の量
          point_expire_enabled, //ポイントの有効期限を設定するか否か
          point_expire_day, //何日でポイントの有効期限がくるようにするか（自動でポイントが0になる）
          //お金
          price_adjustment_round_rank,
          price_adjustment_round_rule,

          square_location_id,
          register_cash_reset_enabled,
          register_cash_check_timing,
          register_cash_manage_by_separately,
          leader_name,

          billing_source_corporation_name,
          billing_source_address,
          billing_source_phone_number,
          billing_source_email,
          billing_source_bank_name,
          billing_source_bank_branch_name,
          billing_source_bank_account_type,
          billing_source_bank_account_number,
          billing_source_bank_account_name_ruby,

          mycalinks_ec_enabled,
          mycalinks_ec_terms_accepted,
          payment_service,
          ochanoko_ec_enabled,
          shopify_ec_enabled,
        },
        include: {
          ec_setting: true,
          accounts: true,
          ec_about_us: true,
        },
      });

      API.resources.store = updateResult;

      //mycalinks_ec_enabledはmycalinks_ec_terms_acceptedがtrueじゃないとだめ
      if (updateResult.mycalinks_ec_enabled) {
        if (!updateResult.mycalinks_ec_terms_accepted) {
          throw new ApiError({
            status: 400,
            messageText:
              'Mycalinks ECを有効にするには利用規約に同意してください',
          });
        }

        //利用可能な配送方法が最低でも1つ必要
        const availableShippingMethod = await API.db.shipping_Method.count({
          where: {
            store_id: updateResult.id,
            deleted: false,
          },
        });

        if (availableShippingMethod === 0) {
          throw new ApiError({
            status: 400,
            messageText:
              'ECを有効にするには、利用可能な配送方法が最低でも1つ必要です',
          });
        }

        //設定が完了していなかったらエラー
        if (!API.resources.store!.ec_setting) {
          throw new ApiError({
            status: 400,
            messageText: 'ECを有効にするには、EC設定を完了させてください',
          });
        }

        //店舗情報が未登録の時はエラー
        if (!updateResult.ec_about_us) {
          throw new ApiError({
            status: 400,
            messageText:
              'ECを有効にするには、ECの店舗紹介情報を登録してください',
          });
        }
      }

      //ECの設定
      if (ec_setting) {
        //EC設定はじめてだったら空のモデルを作る
        if (!API.resources.store!.ec_setting) {
          await tx.ec_Setting.create({
            data: {
              store_id: updateResult.id,
            },
          });
        }

        //設定
        const {
          auto_listing,
          auto_stocking,
          auto_sell_price_adjustment,
          price_adjustment_round_rank,
          price_adjustment_round_rule,
          reserved_stock_number,
          enable_same_day_shipping,
          same_day_limit_hour,
          shipping_days,
          closed_day,
          free_shipping_price,
          delayed_payment_method,
          order_change_request_deadline_days_when_missing_item,
          ochanoko_email,
          ochanoko_account_id,
          ochanoko_password,
          ochanoko_api_token,
          notification_email,
        } = ec_setting;

        reservedStockNumber = reserved_stock_number ?? 0;
        if (
          (auto_sell_price_adjustment !== undefined &&
            auto_sell_price_adjustment !==
              prevSetting.ec_setting?.auto_sell_price_adjustment) ||
          (price_adjustment_round_rank !== undefined &&
            price_adjustment_round_rank !==
              prevSetting.ec_setting?.price_adjustment_round_rank) ||
          (price_adjustment_round_rule !== undefined &&
            price_adjustment_round_rule !==
              prevSetting.ec_setting?.price_adjustment_round_rule)
        ) {
          needRecalculateEcItemPrice = true;
        }

        const updateEcSettingRes = await tx.ec_Setting.update({
          where: {
            store_id: updateResult.id,
          },
          data: {
            auto_listing,
            auto_stocking,
            auto_sell_price_adjustment,
            price_adjustment_round_rank,
            price_adjustment_round_rule,
            reserved_stock_number,
            enable_same_day_shipping,
            same_day_limit_hour,
            shipping_days,
            closed_day,
            free_shipping_price,
            delayed_payment_method,
            order_change_request_deadline_days_when_missing_item,
            ochanoko_email,
            ochanoko_account_id,
            ochanoko_password,
            ochanoko_api_token,
            notification_email,
          },
        });

        API.resources.store!.ec_setting = updateEcSettingRes;
      }

      //ここでレジ金リセットはしなくなった
      //なお、レジが全て閉まってないと閉店 レジが一つでも開いてないと開店できない
      //開閉店をいじられた時
      const prevStoreSetting = API.resources.store!;

      //レジ現金の管理の仕方はレジを作成してからじゃもう変えられない
      if (
        prevStoreSetting.register_cash_manage_by_separately !=
        updateResult.register_cash_manage_by_separately
      ) {
        const allRegisters = await tx.register.findManyExists({
          where: {
            store_id: updateResult.id,
          },
        });

        if (allRegisters.length)
          throw new ApiError({
            status: 400,
            messageText:
              'レジ金の一括/個別管理設定は有効なレジがある時は行えません',
          });
      }

      return updateResult;
    });

    //reserved_stock_numberを変えられていた場合、Productのec_stock_numberを必要に応じて書き換える
    if (
      reservedStockNumber != undefined &&
      reservedStockNumber != prevSetting.ec_setting?.reserved_stock_number
    ) {
      const allTargetProducts = await API.db.product.findMany({
        where: {
          store_id: prevSetting.id,
          pos_reserved_stock_number: null,
          is_active: true,
          mycalinks_ec_enabled: true,
        },
        select: {
          id: true,
        },
      });

      //再計算させる
      const tasks: ItemTask.UpdateProductData[] = allTargetProducts.map(
        (e) => ({
          id: e.id,
          recalculateEcStockNumber: true,
        }),
      );

      //タスクを送信
      if (tasks.length) {
        const taskManager = new TaskManager({
          targetWorker: 'product',
          kind: 'updateProduct',
        });

        await taskManager.publish({
          body: tasks,
          service: API,
          processDescription: 'EC在庫数を再計算します',
        });
      }
    }

    //ECの価格%を変えられた場合、Itemの価格計算をしなおす
    if (needRecalculateEcItemPrice) {
      const allTargetItems = await API.db.item.findMany({
        where: {
          store_id: prevSetting.id,
          status: {
            not: ItemStatus.DELETED,
          },
          category: {
            ec_enabled: true,
          },
          genre: {
            ec_enabled: true,
          },
        },
        select: {
          id: true,
        },
      });

      const tasks: ItemTask.UpdateItemData[] = allTargetItems.map((e) => ({
        id: e.id,
        recalculatePrice: true,
      }));

      if (tasks.length) {
        const taskManager = new TaskManager({
          targetWorker: 'item',
          kind: 'updateItem',
        });

        await taskManager.publish({
          body: tasks,
          service: API,
          processDescription: 'EC価格を再計算します',
        });
      }
    }

    return API.status(200).response({ msgContent: ResponseMsgKind.updated });
  },
);

//特定の店の詳細情報を取得する（現在はトークンなしでもアクセスできる顧客用）
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [''],
        policies: [],
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id: id } = API.params;

    if (!id || isNaN(id)) throw new ApiError('notEnough');

    let result: Record<string, unknown> | null = {};

    const findResult = await API.db.store.findUnique({
      where: {
        id: parseInt(id || ''),
      },
      select: {
        id: true,
        display_name: true,
        receipt_logo_url: true,
        image_url: true,
        buy_term: true,
        full_address: true,
        zip_code: true,
        phone_number: true,
      },
    });

    result = findResult;

    return API.status(200).response({ data: result });
  },
);

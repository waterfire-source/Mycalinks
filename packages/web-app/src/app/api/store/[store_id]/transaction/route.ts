import { apiRole, BackendAPI } from '@/api/backendApi/main';

import { type apiPrivilegesType } from '@/types/BackendAPI';
import {
  Account,
  Prisma,
  Register,
  SystemLogDomain,
  TaxMode,
  Transaction,
  TransactionKind,
  TransactionPaymentMethod,
  TransactionStatus,
  TransactionTaxKind,
} from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendTransactionAPI } from '@/app/api/store/[store_id]/transaction/api';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';

import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { BackendApiRegisterService } from '@/api/backendApi/services/register/main';
import { BackendApiStoreService } from '@/api/backendApi/services/store/main';
import { defPolicies, getTransactionApi } from 'api-generator';
import { BackendApiCustomerService } from '@/api/backendApi/services/customer/main';
import { BackendApiTransactionService } from '@/api/backendApi/services/transaction/main';
import { BackendApiLogService } from '@/api/backendApi/services/log/main';
import { BackendApiAccountService } from '@/api/backendApi/services/account/main';

//取引の作成
//IDを指定した場合、既存の取引をベースに情報を更新（あるいはそのまま取引作成を完了させる）
//asDraftを指定した場合、下書き保存となる（売上も変動しないし、在庫も変動しない）
//[TODO] 流石にロジックを分割したい
//[TODO] 更新形と完了形でAPIを明確に分けたい
export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos, apiRole.everyone], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const logService = new BackendApiLogService(
      API,
      SystemLogDomain.TRANSACTION,
      '取引作成・更新APIのログを残します',
    );

    //取引を作成していく
    // if(!API.body?.dataForPrisma) return API.status(400).response({ msgKind:'notEnoughData' })

    const {
      // staff_account_id,
      customer_id, //独自の顧客ID
      transaction_kind,
      subtotal_price,
      tax,
      discount_price,
      coupon_discount_price,
      point_discount_price,
      payment_method,
      recieved_price,
      buy__is_assessed,
      change_price,
      set_deals, //セット販売

      register_id,

      id_kind, //身分証の種類
      id_number, //身分証の番号
      parental_consent_image_url, //保護者承諾書
      parental_contact, //保護者の連絡先
      can_create_signature, //買取の署名を作成できる状態にするかどうか
      description, //備考欄

      id,

      disableGivePoint, //ポイント付与を無効にする
    } = API.body as BackendTransactionAPI[0]['request']['body'];

    let { total_price, carts, asDraft } =
      API.body as BackendTransactionAPI[0]['request']['body'];

    const staff_account_id = API.resources.actionAccount?.id;

    const thisUserRole = API.role;
    //[TODO] ここのロールを切り替えたい
    const isTbUser = !thisUserRole.includes(apiRole.pos);

    //tbユーザーは下書き作成じゃないといけない
    asDraft = isTbUser ? true : asDraft;

    let term_accepted_at: undefined | null | Date = undefined; //お客さんが同意したかどうか

    carts ||= [];
    total_price ||= 0;

    //total_priceが0より小さかったらエラー
    if (total_price < 0) {
      throw new ApiError({
        status: 400,
        messageText: '合計金額は0以上で指定してください',
      });
    }

    const { store_id } = API.params;

    let insertId: number = 0;
    const transactionModel = new BackendApiTransactionService(API);

    const tax_kind =
      API.resources.store!.tax_mode == TaxMode.INCLUDE
        ? TransactionTaxKind.INCLUDE_TAX
        : API.resources.store!.tax_mode == TaxMode.EXCLUDE
        ? TransactionTaxKind.EXCLUDE_TAX
        : null;

    //予約受付IDがあるのに顧客IDがなかったらエラー
    let hidden: Transaction['hidden'] = false;

    const includesReservationDeposit = carts.some(
      (e) => e.reservation_reception_product_id_for_deposit,
    );
    const includesReservationReceive = carts.some(
      (e) => e.reservation_reception_product_id_for_receive,
    );

    if (includesReservationDeposit) {
      if (!customer_id) {
        throw new ApiError({
          status: 400,
          messageText: '予約の受付には顧客情報が必要です',
        });
      }

      //予約受付IDがあるのに支払い方法が現金じゃなかったらエラー
      if (payment_method && payment_method != TransactionPaymentMethod.cash) {
        throw new ApiError({
          status: 400,
          messageText: '予約の受付では現金のみ対応しております',
        });
      }

      //予約受付IDがあるのに販売じゃなかったらエラー
      if (transaction_kind != TransactionKind.sell) {
        throw new ApiError({
          status: 400,
          messageText: '予約の受付では販売のみ対応しております',
        });
      }

      //予約受付IDがあるのにポイントを使おうとしてたらエラー
      if (point_discount_price) {
        throw new ApiError({
          status: 400,
          messageText: '予約の受付ではポイントを利用できません',
        });
      }

      hidden = true; //前金支払い取引は非表示取引として作成
    }

    //予約受け取り
    if (includesReservationReceive) {
      if (!customer_id) {
        throw new ApiError({
          status: 400,
          messageText: '予約受け取りには顧客情報が必要です',
        });
      }

      if (transaction_kind != TransactionKind.sell) {
        throw new ApiError({
          status: 400,
          messageText: '予約受け取りでは販売のみ対応しております',
        });
      }
    }

    let thisRegisterInfo: Register | null = null;

    //このレジを取得する
    const thisRegister = new BackendApiRegisterService(
      API,
      API.user?.register_id ?? register_id ?? 0,
    );

    try {
      thisRegisterInfo = await thisRegister.core.existingObj;
    } catch (e) {
      console.log('レジが選択されてない？');
    }

    //顧客
    const customerQuery: Partial<Prisma.TransactionCreateInput> = {};

    //ポイント割引指定してるのにcustomerIdなかったらエラー
    if (point_discount_price && !customer_id)
      throw new ApiError({
        status: 400,
        messageText: `ポイントを利用するためには顧客の指定が必要です`,
      });

    const customerService = new BackendApiCustomerService(API, customer_id);

    if (customer_id) {
      //顧客があるのか確認
      const customerInfo = await customerService.core.existingObj;

      customerQuery.customer = {
        connect: {
          id: customerInfo.id,
        },
      };

      //ここで、同意しているかどうかを見る
      term_accepted_at = customerInfo.term_accepted_at;
    }

    //カートの中身が適切か調べる
    const checkCartRes = await transactionModel.checkCart({
      carts,
      setDeals: set_deals,
      transactionKind: transaction_kind,
      customerApiService: customerService,
      paymentMethod: payment_method,
      fromTablet: isTbUser,
    });

    const set_deal_discount_price = checkCartRes.set_deal_discount_price;
    const total_reservation_price = checkCartRes.total_reservation_price;
    const total_consignment_sale_price =
      checkCartRes.total_consignment_sale_price;

    //念の為、total_reservation_priceがtotal_priceと等しいか確認
    if (includesReservationDeposit && total_reservation_price != total_price)
      throw new ApiError({
        status: 500,
        messageText: `予約受付の合計金額が前金の合計金額と等しくありません`,
      });

    //担当者系
    let reception_staff_account_id: Account['id'] | undefined = undefined;
    let input_staff_account_id: Account['id'] | undefined = undefined;
    let final_staff_account_id: Account['id'] | undefined = undefined;

    try {
      const createTransactionResult = await API.transaction(async (tx) => {
        //買取受付番号
        let reception_number: Transaction['reception_number'] = null;
        let currentTransactionInfo: Transaction | null = null;

        //idが指定されている場合、今cartsを指定されていたら最初にcartsやsetDealsを削除する
        if (id) {
          currentTransactionInfo = await tx.transaction.findUnique({
            where: {
              id: Number(id),
              store_id: parseInt(store_id || '0'),
            },
          });

          //存在しているか確認
          if (
            !currentTransactionInfo?.id ||
            currentTransactionInfo?.status != TransactionStatus.draft
          )
            throw new ApiError({
              status: 404,
              messageText: `指定された取引が存在しません`,
            });

          //カートをあらかじめ削除
          if (carts) {
            await Promise.all([
              tx.transaction_Cart.deleteMany({
                where: {
                  transaction_id: Number(id),
                },
              }),
              //セット販売とかも一旦削除する
              tx.transaction_Set_Deal.deleteMany({
                where: {
                  transaction_id: Number(id),
                },
              }),
            ]);

            //ID指定されてて下書きモードだったら入力担当者に入れる
            if (asDraft) {
              input_staff_account_id = staff_account_id;
            }
          }
        } else if (asDraft) {
          //下書き作成モードで、初めての作成モードで買取だったら買取受付番号を発行する
          //顧客IDは必要ない
          //このストアの受付番号のうち、下書きとして使われていない一番最小のものを取得する
          reception_number = await transactionModel.core.issueReceptionNumber();

          //受付担当者に入れる
          reception_staff_account_id = staff_account_id;

          //cartsの中身があったらinputにもいれる
          if (carts?.length) {
            input_staff_account_id = staff_account_id;
          }
        }

        //下書きモードじゃなかったら会計担当者に入れる
        if (!asDraft) {
          final_staff_account_id = staff_account_id;

          //入力担当者がまだ入ってなかったら入れる
          if (!currentTransactionInfo?.input_staff_account_id) {
            input_staff_account_id = staff_account_id;
          }
        }

        return await tx.transaction.upsert({
          where: {
            id: Number(id || 0),
          },
          create: {
            ...(final_staff_account_id
              ? {
                  staff_account: {
                    connect: {
                      id: final_staff_account_id,
                    },
                  },
                }
              : null),
            ...(reception_staff_account_id
              ? {
                  reception_staff_account: {
                    connect: {
                      id: reception_staff_account_id,
                    },
                  },
                }
              : null),
            ...(input_staff_account_id
              ? {
                  input_staff_account: {
                    connect: {
                      id: input_staff_account_id,
                    },
                  },
                }
              : null),
            store: {
              connect: {
                id: parseInt(store_id || ''),
              },
            },
            ...customerQuery, //会員かもしくは会員登録をした場合はこのクエリを入れる
            transaction_kind,
            point_discount_price,
            total_price,
            subtotal_price,
            tax,
            status: TransactionStatus.draft, //一旦下書きとして作成
            discount_price,
            coupon_discount_price,
            set_deal_discount_price,
            total_consignment_sale_price,
            payment_method,
            id_kind,
            id_number,
            tax_kind,
            parental_consent_image_url,
            parental_contact,
            can_create_signature,
            term_accepted_at: term_accepted_at
              ? new Date(term_accepted_at)
              : undefined,
            reception_number,
            buy__is_assessed,
            description,
            ...(thisRegisterInfo
              ? {
                  register: {
                    connect: {
                      id: thisRegisterInfo.id,
                    },
                  },
                }
              : null),
            transaction_carts: checkCartRes.cartsInput,
            set_deals: checkCartRes.setDealInput,
            hidden,
            total_reservation_price,
          },
          update: {
            ...(final_staff_account_id
              ? {
                  staff_account: {
                    connect: {
                      id: final_staff_account_id,
                    },
                  },
                }
              : null),
            ...(reception_staff_account_id
              ? {
                  reception_staff_account: {
                    connect: {
                      id: reception_staff_account_id,
                    },
                  },
                }
              : null),
            ...(input_staff_account_id
              ? {
                  input_staff_account: {
                    connect: {
                      id: input_staff_account_id,
                    },
                  },
                }
              : null),
            store: {
              connect: {
                id: parseInt(store_id || ''),
              },
            },
            ...customerQuery, //会員かもしくは会員登録をした場合はこのクエリを入れる
            transaction_kind,
            point_discount_price,
            total_price,
            subtotal_price,
            tax,
            status: TransactionStatus.draft, //一旦下書きとして作成
            updated_at: new Date(),
            discount_price,
            coupon_discount_price,
            set_deal_discount_price,
            total_consignment_sale_price,
            payment_method,
            buy__is_assessed, //査定済みかどうか
            id_kind,
            id_number,
            tax_kind,
            parental_consent_image_url,
            parental_contact,
            can_create_signature,
            description,
            term_accepted_at: term_accepted_at
              ? new Date(term_accepted_at)
              : undefined,
            ...(thisRegisterInfo
              ? {
                  register: {
                    connect: {
                      id: thisRegisterInfo.id,
                    },
                  },
                }
              : null),
            //削除してあるため、新規作成といった形で
            ...(carts
              ? {
                  transaction_carts: checkCartRes.cartsInput,
                }
              : null),
            ...(carts
              ? {
                  set_deals: checkCartRes.setDealInput,
                }
              : null),
            hidden,
            total_reservation_price,
          },
          include: {
            customer: true,
            transaction_carts: {
              include: {
                product: {
                  include: {
                    condition_option: true,
                    item: true,
                    consignment_client: {
                      select: {
                        display_name: true,
                        display_name_on_receipt: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      });

      //ログを残す
      logService.core.add('取引下書き作成完了');
      logService.core.setLogResource({
        TRANSACTION: createTransactionResult.id,
      });
      logService.core.addJson({
        createTransactionResult,
      });

      insertId = createTransactionResult.id;
      const transactionService = new BackendApiTransactionService(
        API,
        insertId,
      );
      transactionService.core.targetObject = createTransactionResult;

      //この先については下書きじゃなかった時にのみ行う処理
      if (asDraft) {
        //下書きであれば、ここで返す

        const [printReceptionNumber] = await Promise.all([
          //受付番号の印刷
          transactionService.printReceptionNumber(),

          //買取受付で、査定完了してたらプッシュ通知を送信する
          (async () => {
            if (
              createTransactionResult.transaction_kind == TransactionKind.buy &&
              createTransactionResult.reception_number &&
              createTransactionResult.buy__is_assessed
            ) {
              const mycaAppService = new BackendApiMycaAppService(API);

              //プッシュ通知を送る
              if (createTransactionResult.customer?.myca_user_id) {
                await mycaAppService.sendPushNotification({
                  mycaUserId: createTransactionResult.customer.myca_user_id!,
                  title: '買取査定完了のお知らせ',
                  body: `受付番号:${createTransactionResult.reception_number}の買取査定が終了しました。査定内容を確認して、買取受付までお越しください。`,
                });
                logService.core.add('買取査定完了のプッシュ通知を送信しました');
              }

              await API.db.transaction.update({
                where: {
                  id: createTransactionResult.id,
                },
                data: {
                  buy__assessed_total_price:
                    createTransactionResult.total_price,
                },
              });
            }
          })(),
        ]);

        const { receiptCommand, receiptCommandForStaff } = printReceptionNumber;

        logService.core.add('取引を下書きで終わらせ、受付番号をかえします');
        await logService.core.save();

        return API.status(201).response({
          data: {
            id: insertId,
            status: createTransactionResult.status,
            reception_number: createTransactionResult.reception_number,
            purchaseReceptionNumberReceiptCommand: receiptCommand,
            purchaseReceptionNumberForStaffReceiptCommand:
              receiptCommandForStaff,
          },
        });
      }

      //ここからは担当者IDがないといけない
      if (!staff_account_id)
        throw new ApiError({
          status: 400,
          messageText: '従業員が指定されていません',
        });

      //レジがあるか
      if (!thisRegisterInfo)
        throw new ApiError({
          status: 500,
          messageText: '取引を完了させるためにはレジの指定が必要です',
        });

      //買取の場合、清算権限がないとダメ
      if (transaction_kind == TransactionKind.buy) {
        const accountModel = new BackendApiAccountService(API);
        accountModel.checkPolicy(defPolicies(['finish_buy_transaction']));
      }

      let paying = false;

      //ここが重くなってしまったら
      const txResult = await API.transaction(
        async (tx) => {
          //支払いが確認できるまでは、在庫を調節したくないためトランザクションを張る

          await Promise.all([
            //在庫変動
            transactionService.core.consumeProducts({
              allProductInfo: checkCartRes.allProductInfo,
            }),
            //ポイント変動
            customer_id &&
              transactionService.processPoints({
                disableGivePoint,
                customerApiService: customerService,
              }),
          ]);

          //決済を行う。ここで失敗したら在庫調整もすべてリセットされる形
          const paymentRes = await transactionService.processPayment({
            registerApiService: thisRegister,
            cashReceivedPrice: recieved_price,
            cashChangePrice: change_price ?? undefined,
          });

          paying = paymentRes.paying;
        },
        {
          maxWait: 5 * 1000, // default: 2000
          timeout: 6 * 60 * 1000, // タイムアウトは6分（決済が5分のため）
        },
      );

      //ログを残す
      logService.core.add('お会計処理完了');

      //支払い待機中か即時で完了したか確認する
      if (paying) {
        //ここで支払いを待機する
        try {
          logService.core.add('支払い待機をします');
          await transactionService.core.waitForPayment();
        } catch (e: any) {
          logService.core.add('支払い待機中にエラーが発生したので中止します');
          try {
            logService.core.addJson({
              error: e,
            });
          } catch (e) {
            console.log(e);
          }

          //エラー吐いてたら在庫変動やポイント変動をロールバックする
          const thisTransaction = new BackendApiTransactionService(
            API,
            createTransactionResult.id,
          );

          const transactionInfo = await thisTransaction.core.existingObj;

          //すでにcanceledになったらロールバック処理は入れない
          if (transactionInfo.status != TransactionStatus.canceled) {
            await API.transaction(async (tx) => {
              await thisTransaction.core.return({});
            });
          }

          throw e;
        }
      }

      //完了したらfinished_atを入れる
      await API.db.transaction.update({
        where: {
          id: createTransactionResult.id,
        },
        data: {
          finished_at: new Date(),
        },
      });
    } catch (e: any) {
      //失敗したらとりあえずTransactionのstatusをcanceledにする
      //ID指定されていたら、下書きのままにする
      console.log(e);

      if (insertId && !id) {
        await API.db.transaction.update({
          where: {
            id: insertId,
          },
          data: {
            status: TransactionStatus.canceled,
          },
        });
      }

      throw e;
    }

    logService.core.add('取引の作成・更新APIが終了しました');

    await logService.core.save();

    return API.status(201).response({
      data: {
        id: insertId,
        status: TransactionStatus.completed,
        autoPrintReceiptEnabled: thisRegisterInfo!.auto_print_receipt_enabled,
      },
    });
  },
);

//条件を指定して、取引の情報を取得するAPI
export const GET = BackendAPI.create(
  getTransactionApi,
  async (API, { query, params }) => {
    const isCustomer = !API.user?.id; //認証なしユーザーかどうか

    if (!isCustomer) {
      const account = new BackendApiAccountService(API);

      const managableStores = await account.getManagableStores();

      if (!managableStores.includes(Number(params?.store_id)))
        throw new ApiError('permission');
    }

    const whereQuery: Array<Prisma.TransactionWhereInput> = [];
    let includesHidden = false;

    let includeSales = false;
    let includeStats = false; //部門ごとなどの統計情報を含めるかどうか
    let includeSummary = false; //合計数を含めるかどうか
    let today = false; //todayは今日というより、今回の営業
    Object.entries(query).forEach(([prop, value]: any) => {
      switch (prop) {
        case 'id':
          whereQuery.push({
            [prop]: {
              in: value.split(',').map((e: string) => parseInt(e)),
            },
          });
          includesHidden = true;
          break;
        case 'customer_name':
          whereQuery.push({
            customer: {
              full_name: {
                contains: value,
              },
            },
          });
          break;
        case 'customer_id':
        case 'staff_account_id':
        case 'register_account_id':
        case 'register_id':
        case 'reception_number':
          whereQuery.push({
            [prop]: parseInt(value || '0'),
          });
          break;

        case 'transaction_kind':
          whereQuery.push({
            [prop]: value,
          });
          break;
        case 'description':
          if (value) {
            whereQuery.push({
              description: {
                contains: value,
              },
            });
          }
          break;
        case 'payment_method':
          whereQuery.push({
            [prop]: value,
          });
          break;

        case 'status':
          //返品取引も含める
          whereQuery.push({
            status: value,
          });
          break;

        //商品名で検索
        case 'productName':
          whereQuery.push({
            transaction_carts: {
              some: {
                product: {
                  is: {
                    display_name: {
                      contains: value,
                    },
                  },
                },
              },
            },
          });
          break;

        case 'is_return': //返品取引かどうか
          whereQuery.push({
            is_return: value,
          });
          break;

        case 'is_returned_transaction': //返品された取引かどうか
          whereQuery.push({
            return_transactions: {
              ...(value ? { some: {} } : { none: {} }),
            },
          });
          break;

        case 'buy__is_assessed':
          whereQuery.push({
            [prop]: value,
          });
          break;

        case 'includeSales': //売上などの情報を含めるかどうか
          includeSales = !isCustomer; //認証済みだったら含めることができる
          break;

        case 'includeStats': //部門などの統計情報まで含めるかどうか
          includeStats = !isCustomer; //認証済みだったら含めることができる
          break;

        case 'includeSummary': //合計数を含めるかどうか
          includeSummary = !isCustomer; //認証済みだったら含めることができる
          break;

        case 'finishedAtStart': //期間開始日時
          whereQuery.push({
            finished_at: {
              gte: new Date(value),
            },
          });
          break;

        case 'finishedAtEnd': //期間終了日時
          whereQuery.push({
            finished_at: {
              lt: new Date(value),
            },
          });
          break;

        case 'createdAtStart': //開始日時
          whereQuery.push({
            created_at: {
              gte: new Date(value),
            },
          });
          break;

        case 'createdAtEnd': //開始日時
          whereQuery.push({
            created_at: {
              lt: new Date(value),
            },
          });
          break;

        case 'today': //今回の営業の情報に絞るかどうか
          today = true;
          break;
      }
    });

    if (!includesHidden) {
      whereQuery.push({
        hidden: false, //非表示取引は含めない
      });
    }

    let transactions: any = [];
    let sales: any = []; //売上の情報など
    let stats: any = {}; //統計情報など
    let summary: any = {}; //合計数
    const { store_id } = params;

    if (today) {
      //今回の営業に絞る場合、営業開始日時を取得する

      const storeModel = new BackendApiStoreService(API);

      //最終開店日時を取得
      const lastOpenedAt = await storeModel.core.todayOpenedAt;

      //条件に入れる
      whereQuery.push({
        finished_at: {
          gt: lastOpenedAt,
        },
      });
    }

    const transactionModel = new BackendApiTransactionService(API);

    // eslint-disable-next-line
    // @ts-ignore
    const selectResult = await API.db.transaction.findMany({
      where: {
        AND: [
          {
            store_id: Number(store_id),
          },
          ...structuredClone(whereQuery), //値渡しする
        ],
      },
      ...transactionModel.listTransactionFields, //フィールドをDAO?から取得 tsエラーになるため一旦anyで
      orderBy: [
        ...API.orderByQuery,
        {
          id: 'desc',
        },
      ],
      ...API.limitQuery,
    });

    selectResult.forEach((t) => {
      //transaction_cartsの順番
      //@ts-expect-error becuase of because of
      if (t.transaction_carts) {
        //@ts-expect-error becuase of because of
        t.transaction_carts = t.transaction_carts.sort((a, b) =>
          a.order_number && b.order_number
            ? a.order_number - b.order_number
            : a.id - b.id,
        );
      }

      //@ts-expect-error becuase of because of
      (t.transaction_carts || []).forEach((p) => {
        const productModel = new BackendApiProductService(API);
        p.product.displayNameWithMeta =
          productModel.core.getProductNameWithMeta(p.product);
      });

      //返品取引を従来の形にする（わかりやすくするため）
      if (!isCustomer) {
        //@ts-expect-error返品取引を従来の形にする（わかりやすくするため）
        if (t.return_transactions.length) {
          //1番目のものを取り出す
          //@ts-expect-error 返品取引を従来の形にする（わかりやすくするため）
          const returnTransaction = t.return_transactions[0];

          //@ts-expect-error返品取引を従来の形にする（わかりやすくするため）
          t.return_transaction = {
            id: returnTransaction.id,
            staff_account: {
              display_name: returnTransaction.staff_account?.display_name,
            },
          };
        } else {
          //@ts-expect-error返品取引を従来の形にする（わかりやすくするため）
          t.return_transaction_id = null;
        }
      }

      //customer_cartsの方も
      //@ts-expect-error becuase of because of
      (t.transaction_customer_carts || []).forEach((cart) => {
        //@ts-expect-error becuase of because of
        const productOnCart = t.transaction_carts.find(
          //@ts-expect-error becuase of because of
          (e) => e.product_id == cart.product_id,
        );

        cart.product = {
          ...productOnCart?.product,
        };
      });
    });

    transactions = BackendAPI.useFlat(
      selectResult,
      {
        product__id: 'product_id',
        product__display_name: 'product_name',
        staff_account__display_name: 'staff_account_name',
        reception_staff_account__display_name: 'reception_staff_account_name',
        input_staff_account__display_name: 'input_staff_account_name',
        register__display_name: 'register_name',
        customer__full_name: 'customer_name',
        customer__full_name_ruby: 'customer_name_ruby',
        product__item__genre__display_name: 'product_genre_name',
        product__item__category__display_name: 'product_category_name',
        return_transaction__id: 'return_transaction_id', //[TODO] 見直したい
        return_transaction__staff_account__display_name:
          'return_staff_account_name',
      },
      {
        payment: true,
      },
    );

    //売上などの情報を取得する ここでは取引が完了したもののみ入れる
    if (includeSales) {
      //とりあえず取引種類、支払い方法別にまとめる
      const salesInfo = await API.db.transaction.groupBy({
        where: {
          store_id: Number(store_id),
          status: TransactionStatus.completed,
          AND: [
            ...structuredClone(whereQuery), //値渡しする,
          ],
        },
        by: ['transaction_kind', 'is_return', 'payment_method'],
        _sum: {
          total_sale_price: true,
          total_consignment_sale_price: true,
        },
      });

      //[TODO] 一旦現状対応のため、返品のものはマイナスとして形状
      const rawSales = salesInfo.map((e) => ({
        total_price: e._sum.total_sale_price || 0,
        total_consignment_sale_price: e._sum.total_consignment_sale_price || 0,
        transaction_kind: e.transaction_kind,
        is_return: e.is_return,
        payment_method: e.payment_method,
      }));

      sales = rawSales.filter((sale) => {
        //返品系の場合、処理をする
        if (sale.is_return) {
          const originalRecord = rawSales.find(
            (e) =>
              e.transaction_kind == sale.transaction_kind &&
              e.payment_method == sale.payment_method,
          );

          if (originalRecord) {
            originalRecord.total_price -= sale.total_price;
            originalRecord.total_consignment_sale_price -=
              sale.total_consignment_sale_price;
          } else {
            rawSales.push({
              total_price: -1 * sale.total_price,
              total_consignment_sale_price:
                -1 * sale.total_consignment_sale_price,
              is_return: false,
              transaction_kind: sale.transaction_kind,
              payment_method: sale.payment_method,
            });
          }

          return false;
        }

        return true;
      });
    }
    //合計件数を取得する
    if (includeSummary) {
      const totalCount = await API.db.transaction.count({
        where: {
          store_id: Number(store_id),
          AND: [
            ...structuredClone(whereQuery), //値渡しする,
          ],
        },
      });
      summary = {
        total_count: totalCount,
      };
    }

    //統計情報
    if (includeStats) {
      //ここで取得できるIDを使ってクエリを構築
      const transactionModel = new BackendApiTransactionService(API);
      const statsData = await transactionModel.core.getTransactionStats(
        selectResult.map((e) => e.id),
      );

      stats = {
        ...statsData,
      };
    }

    return {
      transactions,
      sales,
      stats,
      summary,
    };
  },
);

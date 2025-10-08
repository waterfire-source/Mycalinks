import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { Customer, Transaction, TransactionStatus } from '@prisma/client';
import { Barcode } from '@/utils/barcode';
import { jpFormat } from 'dayjs-jp-format'; // load on demand
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import { defPolicies } from 'api-generator';
import { BackendApiTransactionService } from '@/api/backendApi/services/transaction/main';
import { customDayjs } from 'common';
customDayjs.extend(jpFormat); // use plugin

//顧客アカウントを作る、もしくはすでに存在しているアカウントを取得するAPI
export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos, ''], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    let { myca_user_id, mycaBarCode } = API.body;

    const {
      birthday,
      zip_code,
      prefecture,
      city,
      address2,
      building,
      full_name,
      full_name_ruby,
      phone_number,
      gender,
      career,
      is_active,
      term_accepted_at,
    } = API.body;

    //POSの読み取ったID
    let pos_user_id: number | null = null;

    const { store_id } = API.params;

    if (mycaBarCode) {
      //QRの検証を行う
      const barcodeRes = Barcode.verifyBarcode(mycaBarCode);

      //バーコードの種類によって格納する変数を分ける
      switch (barcodeRes.kind) {
        case 'app':
          myca_user_id = barcodeRes.userId!;
          break;
        case 'pos':
          pos_user_id = barcodeRes.customerId!;
          myca_user_id = null;
          break;
      }

      if (!myca_user_id && !pos_user_id) throw new ApiError('permission');
    }

    //顧客情報を作る
    let result: any = {};

    let customerInfo:
      | (Customer & {
          transactions: Array<{
            created_at: Transaction['created_at'];
            status: Transaction['status'];
          }>;
        } & { barcode?: string })
      | null = await API.db.customer.findFirst({
      where: {
        id: pos_user_id || undefined,
        store_id: parseInt(store_id || '0'),
        myca_user_id: myca_user_id || undefined,
      },
      include: {
        transactions: {
          select: {
            created_at: true,
            status: true,
          },
        },
      },
    });

    customerInfo = !myca_user_id && !pos_user_id ? null : customerInfo;

    //登録していなくて、
    if (!customerInfo) {
      //アプリの方だった場合は、新しくMycaデータベースから参照して作る
      if (myca_user_id) {
        //MycaAPIの方から顧客情報を取得する

        const mycaAppClient = new BackendApiMycaAppService(API);

        const mycaUserInfo = await mycaAppClient.core.user.getInfo({
          user: myca_user_id,
        });

        if (!mycaUserInfo) throw new ApiError('notExist');

        customerInfo = await API.db.customer.create({
          data: {
            store_id: parseInt(store_id || ''),
            email: mycaUserInfo.mail,
            myca_user_id: mycaUserInfo.id,
            birthday: customDayjs.tz(mycaUserInfo.birthday).isValid()
              ? customDayjs.tz(mycaUserInfo.birthday).toDate()
              : null,
            registration_date: customDayjs.tz(mycaUserInfo.created).isValid()
              ? customDayjs.tz(mycaUserInfo.created).toDate()
              : null,
            address: mycaUserInfo.address,
            zip_code: mycaUserInfo.zip_code,
            city: mycaUserInfo.city,
            prefecture: mycaUserInfo.prefecture,
            building: mycaUserInfo.building,
            address2: mycaUserInfo.address2,
            phone_number: mycaUserInfo.phone_number,
            gender: mycaUserInfo.gender,
            career: mycaUserInfo.career,
            full_name: mycaUserInfo.full_name,
            full_name_ruby: mycaUserInfo.full_name_ruby,
            owned_point: 0, //初期ポイントは0
          },
          include: {
            transactions: {
              select: {
                created_at: true,
                status: true,
              },
            },
          },
        });

        API.status(201); //作成完了
      } else {
        //アプリの方じゃなかったら、新規登録に必要な情報があるか確認
        //とりあえず名前がなかったら登録しない
        if (!full_name) throw new ApiError('notExist');

        //POS会員として登録する
        customerInfo = await API.db.customer.create({
          data: {
            store_id: parseInt(store_id || ''),
            birthday: customDayjs(birthday).isValid()
              ? customDayjs(birthday).toDate()
              : null,
            registration_date: new Date(),
            zip_code,
            city,
            prefecture,
            building,
            address2,
            phone_number,
            gender,
            career,
            full_name,
            full_name_ruby,
            is_active: is_active === undefined ? false : is_active, //アクティブかどうかは指定されていなかったら非アクティブで
            term_accepted_at: term_accepted_at
              ? new Date(term_accepted_at)
              : undefined,
          },
          include: {
            transactions: {
              select: {
                created_at: true,
                status: true,
              },
            },
          },
        });

        //POS会員として登録した場合、バーコードも生成する
        (customerInfo.barcode = Barcode.generateCustomerBarcode(
          customerInfo.id,
        )),
          API.status(201); //作成完了
      }
    }

    let lastUsedDate: Date | null = null;

    const sortedTransactions = customerInfo.transactions
      .filter((each) => each.status == TransactionStatus.completed)
      .sort(
        (a, b) =>
          customDayjs(b.created_at).unix() - customDayjs(a.created_at).unix(),
      );

    lastUsedDate = sortedTransactions.length
      ? sortedTransactions[0].created_at
      : null;

    result = {
      id: customerInfo.id,
      email: customerInfo.email,
      myca_user_id: customerInfo.myca_user_id,
      birthday: customerInfo.birthday,
      registration_date: customerInfo.registration_date,
      owned_point: customerInfo.owned_point,
      point_exp: customerInfo.point_exp,
      lastUsedDate,
      address: `${customerInfo.zip_code || ''} ${
        customerInfo.prefecture || ''
      } ${customerInfo.city || ''} ${customerInfo.address2 || ''} ${
        customerInfo.building || ''
      }`,
      zip_code: customerInfo.zip_code,
      prefecture: customerInfo.prefecture,
      city: customerInfo.city,
      address2: customerInfo.address2,
      building: customerInfo.building,
      phone_number: customerInfo.phone_number,
      gender: customerInfo.gender,
      career: customerInfo.career,
      full_name: customerInfo.full_name,
      full_name_ruby: customerInfo.full_name_ruby,
      barcode: customerInfo.barcode,
      is_active: customerInfo.is_active,
      memo: customerInfo.memo,
    };

    return API.response({ data: result });
  },
);

//顧客アカウントを、customerIdで取得する
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: defPolicies(['list_customer']), //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id } = API.params;

    const whereQuery: any = [];

    Object.entries(API.query).forEach(([prop, value]: any) => {
      switch (prop) {
        case 'id':
          whereQuery.push({
            [prop]: {
              in: value.split(',').map((e: string) => parseInt(e)),
            },
          });

          break;

        case 'full_name':
          if (value) {
            whereQuery.push({
              OR: [
                {
                  full_name: {
                    contains: value,
                  },
                },
                {
                  full_name_ruby: {
                    contains: value,
                  },
                },
              ],
            });
          }
          break;

        case 'memo':
          if (value) {
            whereQuery.push({
              memo: { contains: value },
            });
          }
          break;

        default:
          return false;
      }
    });

    let result: any = {};

    const customerInfo = await API.db.customer.findMany({
      where: {
        AND: [
          {
            store_id: parseInt(store_id || '0'),
          },
          ...whereQuery,
        ],
      },
      include: {
        transactions: {
          select: {
            id: true,
            created_at: true,
            status: true,
          },
        },
      },
    });

    //それぞれの顧客について最後の取引日を取得する
    result = await Promise.all(
      customerInfo.map(async (eachCustomer) => {
        let lastUsedDate: Date | null = null;
        const sortedTransactions = eachCustomer.transactions
          .filter((each) => each.status == TransactionStatus.completed)
          .sort(
            (a, b) =>
              customDayjs(b.created_at).unix() -
              customDayjs(a.created_at).unix(),
          );

        let transactionStats: any = {
          groupByItemGenreTransactionKind: [],
        };

        //取引統計情報が必要かどうか
        if (API.query?.includesTransactionStats) {
          const transactionModel = new BackendApiTransactionService(API);

          //ここで取得できるIDを使ってクエリを構築
          const statsData = await transactionModel.core.getTransactionStats(
            sortedTransactions.map((e) => e.id),
          );

          transactionStats = statsData;
        }

        lastUsedDate = sortedTransactions.length
          ? sortedTransactions[0].created_at
          : null;

        //バーコードもついでに発行する
        const barcode = Barcode.generateCustomerBarcode(eachCustomer.id);

        return {
          id: eachCustomer.id,
          email: eachCustomer.email,
          myca_user_id: eachCustomer.myca_user_id,
          birthday: eachCustomer.birthday,
          registration_date: eachCustomer.registration_date,
          owned_point: eachCustomer.owned_point,
          point_exp: eachCustomer.point_exp,
          lastUsedDate,
          transactionStats,
          address: `${eachCustomer.zip_code || ''} ${
            eachCustomer.prefecture || ''
          } ${eachCustomer.city || ''} ${eachCustomer.address2 || ''} ${
            eachCustomer.building || ''
          }`,
          zip_code: eachCustomer.zip_code,
          prefecture: eachCustomer.prefecture,
          city: eachCustomer.city,
          address2: eachCustomer.address2,
          building: eachCustomer.building,
          phone_number: eachCustomer.phone_number,
          gender: eachCustomer.gender,
          career: eachCustomer.career,
          full_name: eachCustomer.full_name,
          full_name_ruby: eachCustomer.full_name_ruby,
          is_active: eachCustomer.is_active,
          memo: eachCustomer.memo,
          barcode,
        };
      }),
    );

    return API.response({ data: result });
  },
);

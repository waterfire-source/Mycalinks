import { BackendService } from '@/services/internal/main';

//バックエンドのPOS契約サービス

import {
  Contract,
  Contract_Payment,
  ContractPaymentKind,
  ContractPaymentStatus,
  ContractStatus,
  Corporation,
} from '@prisma/client';
import { BackendCoreError } from '@/error/main';
import { CustomCrypto, customDayjs, posCommonConstants } from 'common';
import { TaskManager } from '@/task/main';
import { BackendCoreGmoService } from '@/services/internal/gmo/main';
import { Dayjs } from 'dayjs';

export class BackendCoreContractService extends BackendService {
  constructor(specificContractId?: Contract['id']) {
    super();
    this.setIds({
      contractId: specificContractId,
    });
  }

  public targetObject:
    | (Contract & {
        corporation: Corporation | null;
      })
    | null = null;

  public get existingObj(): Promise<NonNullable<typeof this.targetObject>> {
    if (this.targetObject) return Promise.resolve(this.targetObject);

    return (async () => {
      if (!this.ids.contractId)
        throw new BackendCoreError({
          internalMessage: '存在しない契約です',
        });

      const contract = await this.primaryDb.contract.findUnique({
        where: {
          id: this.ids.contractId,
        },
        include: {
          corporation: true,
        },
      });

      if (!contract)
        throw new BackendCoreError({
          internalMessage: '存在しない契約です',
        });

      this.targetObject = contract;

      return contract;
    })();
  }

  /**
   * 次の支払い月を取得する
   * @returns 次の支払い月のDateオブジェクト
   */
  @BackendService.WithIds(['contractId'])
  public async setNextPaymentMonth() {
    const contractInfo = await this.existingObj;

    //今払うべき月があるか確認
    const unpaidMonths = await this.getUnpaidMonths();

    //あったら、明日に設定する
    const now = customDayjs().tz();
    const today = now.startOf('day');

    let candidate: Dayjs;

    if (unpaidMonths.length > 0) {
      candidate = today.add(1, 'day');
    } else {
      //なかったら、次の契約日に設定する
      const startAt = customDayjs(contractInfo.start_at).tz();
      const contractDay = Number(startAt.format('DD'));

      const thisMonthStart = today.startOf('month');
      const nextMonthStart = thisMonthStart.add(1, 'month');

      //日を設定していく
      candidate = nextMonthStart.date(contractDay);

      //月が同じじゃなかったら、月末を取得
      if (candidate.month() != nextMonthStart.month()) {
        candidate = candidate.endOf('month');
      }
    }

    //この月をセットする
    return await this.db.contract.update({
      where: {
        id: this.ids.contractId!,
      },
      data: {
        next_payment_at: candidate.toDate(),
      },
    });
  }

  /**
   * 月額料を支払えてない月を取得する
   * @param
   * @returns 支払うべき月の配列
   */
  @BackendService.WithIds(['contractId'])
  public async getUnpaidMonths() {
    const contractInfo = await this.existingObj;

    if (!contractInfo || contractInfo.status != ContractStatus.STARTED)
      throw new BackendCoreError({
        internalMessage: '契約が開始されていません',
      });

    const now = customDayjs().tz();
    const startMonth = Number(
      customDayjs(contractInfo.start_at).tz().format('YYYYMM'),
    );
    const nowMonth = Number(now.format('YYYYMM'));

    //過去の支払いを取得していく
    const payments = await this.primaryDb.contract_Payment.findMany({
      where: {
        contract_id: contractInfo.id,
        kind: ContractPaymentKind.MONTHLY_FEE,
        target_month: {
          not: null,
        },
      },
      orderBy: {
        target_month: 'asc',
      },
    });

    const shouldPayMonths: Array<{
      target_month: number;
      retry_count: number;
    }> = [];

    //開始月を含めて、今の月までの支払い状況を確認する
    for (
      let targetMonth = startMonth;
      targetMonth <= nowMonth;
      targetMonth = targetMonth + 1
    ) {
      const thisMonth = Number(targetMonth.toString().slice(4)); //202501の1の部分
      if (thisMonth < 1 || thisMonth > 12) continue; //1~12以外はスキップ

      //この月の支払いがあるか確認
      const thisMonthPayment = payments.filter(
        (p) => p.target_month == targetMonth,
      );

      //成功している支払いがあったら飛ばす
      if (
        thisMonthPayment.filter((p) => p.status == ContractPaymentStatus.PAID)
          .length > 0
      )
        continue;

      //失敗している回数を取得
      const failedCount = thisMonthPayment.filter(
        (p) => p.status != ContractPaymentStatus.PAID,
      ).length;

      //ここから下は、支払い月として認識する
      shouldPayMonths.push({
        target_month: targetMonth,
        retry_count: failedCount, //失敗回数=今回の試行番号
      });
    }

    //支払うべき月を返す
    return shouldPayMonths;
  }

  /**
   * 契約支払い
   */
  @BackendService.WithIds(['contractId'])
  @BackendService.WithTx
  public async createPayment({
    kind,
    target_month,
    retry_count,
  }: {
    kind: Contract_Payment['kind'];
    target_month?: Contract_Payment['target_month'];
    retry_count?: Contract_Payment['retry_count'];
  }) {
    if (kind == ContractPaymentKind.MONTHLY_FEE && !target_month)
      throw new BackendCoreError({
        internalMessage: '支払い対象月の指定が必要です',
      });

    //カード情報を取得する
    const contractInfo = await this.db.contract.findUnique({
      where: {
        id: this.ids.contractId!,
      },
      include: {
        cards: true,
        corporation: true,
      },
    });

    //カードを取得する
    if (!contractInfo || !contractInfo.corporation?.ceo_name)
      throw new BackendCoreError({
        internalMessage: '契約が見つかりません',
      });

    const card = contractInfo.cards.filter((e) => e.is_primary)[0];

    if (!card)
      throw new BackendCoreError({
        internalMessage: 'カードが登録されていません',
      });

    const total_price =
      kind == ContractPaymentKind.INITIAL_FEE
        ? contractInfo.initial_payment_price
        : contractInfo.monthly_payment_price;

    //支払いを作成
    const createPaymentRes = await this.db.contract_Payment.create({
      data: {
        contract_id: this.ids.contractId!,
        status: ContractPaymentStatus.PENDING,
        kind,
        target_month,
        card_id: card.id,
        total_price,
        retry_count,
      },
    });

    const gmoService = new BackendCoreGmoService('contract');
    this.give(gmoService);

    const { finished, accessId, createChargeRes } =
      await gmoService.client.createContractPayment({
        contractId: this.ids.contractId!,
        paymentId: createPaymentRes.id,
        cardInfo: card,
        totalAmount:
          kind == ContractPaymentKind.INITIAL_FEE
            ? contractInfo.initial_payment_price
            : contractInfo.monthly_payment_price,
        from: kind == ContractPaymentKind.INITIAL_FEE ? 'customer' : 'system',
        payer: {
          name: contractInfo.corporation.ceo_name,
          email: contractInfo.email!,
        },
      });

    const updatePaymentRes = await this.db.contract_Payment.update({
      where: {
        id: createPaymentRes.id,
      },
      data: {
        gmo_access_id: accessId,
        status: finished ? ContractPaymentStatus.PAID : undefined,
        finished_at: finished ? new Date() : undefined,
      },
      include: {
        card: true,
      },
    });

    return {
      gmoPayment: createChargeRes,
      contractPayment: updatePaymentRes,
    };
  }

  /**
   * 初回支払いを済ませてactivateするときのやつ
   */
  @BackendService.WithIds(['contractId'])
  @BackendService.WithTx
  public async activate() {
    const contractInfo = await this.existingObj;

    if (!contractInfo.corporation)
      throw new BackendCoreError({
        internalMessage: '法人がありません',
      });

    //contractのupdate
    const updateRes = await this.db.contract.update({
      where: {
        id: contractInfo.id,
      },
      data: {
        status: ContractStatus.STARTED,
        next_payment_at: contractInfo.start_at,
      },
    });

    //アカウントを作成
    const createAccountRes = await this.db.account.create({
      data: {
        email: contractInfo.email!,
        hashed_password: '',
        salt: '',
        login_flg: false,
        linked_corporation_id: contractInfo.corporation!.id,
        display_name: `本部マスターアカウント`,
        group_id: posCommonConstants.account.specialAccountGroup.corp.id,
      },
      include: {
        linked_corporation: true,
      },
    });

    //店舗を一つだけ作成する
    const createStoreRes = await this.db.store.create({
      data: {
        code: CustomCrypto.generateUuidV7(),
        display_name: `法人${contractInfo.corporation.name} の最初の店舗`,
        is_active: false, //非アクティブ状態で作成する
        qr_iv: '', //これ早く削除したい
      },
    });

    // 店舗アカウントを作成
    const storeAccount = await this.db.account.create({
      data: {
        display_name: `店舗マスターアカウント`,
        email: createStoreRes.code, //店舗アカウントだけ店舗コード
        // kind: AccountKind.store,
        hashed_password: '',
        linked_corporation: {
          connect: {
            id: contractInfo.corporation.id,
          },
        },
        group: {
          connect: {
            id: posCommonConstants.account.specialAccountGroup.store.id,
          },
        },
        salt: '',
        login_flg: false,
        // 店舗を作成
        stores: {
          create: {
            store: {
              connect: {
                id: createStoreRes.id,
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

    //店舗と法人アカウントの紐付け
    await this.db.account_Store.create({
      data: {
        store_id: createStoreRes.id,
        account_id: createAccountRes.id,
      },
    });

    //メールで送る
    const taskManager = new TaskManager({
      targetWorker: 'notification',
      kind: 'sendEmail',
    });

    await taskManager.publish({
      body: [
        {
          as: 'system',
          to: createAccountRes.email,
          title: `[Mycalinks POS] アカウント開設のお知らせ`,
          bodyText: `
アカウントを開設しました

法人名:${contractInfo.corporation.name}
本部用アカウントメールアドレス:${createAccountRes.email}

初期店舗コード:${createStoreRes.code}`,
        },
      ],
      service: this,
      fromSystem: true,
      specificGroupId: `send-email-${createAccountRes.email}`,
    });
  }

  /**
   * カード情報を保存する（顧客は作れている前提）
   */
  @BackendService.WithIds(['contractId'])
  public async saveContractCard({
    token,
  }: {
    token: string; //カードのトークン
  }) {
    //メンバーIDを取得（一応DBから取得する）
    const thisContractInfo = await this.db.contract.findUnique({
      where: {
        id: this.ids.contractId!,
      },
    });

    if (!thisContractInfo || !thisContractInfo.gmo_customer_id)
      throw new Error('決済システムエラー');

    const memberId = thisContractInfo.gmo_customer_id;

    //トークンを使ってカードを保存する
    const gmoService = new BackendCoreGmoService('contract');
    this.give(gmoService);

    const saveCardRes = await gmoService.client.saveCard({
      token,
      memberId,
    });

    if (!saveCardRes.cardResult || !saveCardRes.onfileCardResult)
      throw new BackendCoreError({
        internalMessage: '決済システムエラー',
      });

    //無事作成できたら、カードレコードを作成
    const createCardRes = await this.db.gmo_Credit_Card.create({
      data: {
        customer_id: memberId,
        card_id: saveCardRes.onfileCardResult.cardId!,
        masked_card_number: saveCardRes.cardResult.cardNumber!,
        name: saveCardRes.cardResult.cardholderName!,
        expire_month: saveCardRes.cardResult.expiryMonth!,
        expire_year: saveCardRes.cardResult.expiryYear!,
        issue_code: saveCardRes.cardResult.issuerCode!,
        brand: saveCardRes.cardResult.brand!,
        contract_id: this.ids.contractId!,
      },
    });

    //こいつ以外、すべてプライマリーじゃなくする
    //すでに登録されているものはすべてprimaryを外す
    await this.db.gmo_Credit_Card.updateMany({
      where: {
        contract_id: this.ids.contractId!,
        id: {
          not: createCardRes.id,
        },
      },
      data: {
        is_primary: false,
      },
    });

    return createCardRes;
  }
}

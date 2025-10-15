import {
  BackendCoreContractService,
  TaskCallback,
  TaskManager,
  workerDefs,
} from 'backend-core';
import { customDayjs } from 'common';
import {
  ContractPaymentKind,
  ContractPaymentStatus,
  ContractStatus,
} from '@prisma/client';

//契約定期支払い
export const payContractSubscriptionController: TaskCallback<
  typeof workerDefs.scheduled.kinds.payContractSubscription.body
> = async (task) => {
  //今日を取得
  const now = customDayjs().tz();
  const today = now.startOf('day');

  //本日支払わないといけないやつ取得
  const targetContracts = await task.db.contract.findMany({
    where: {
      status: ContractStatus.STARTED,
      start_at: {
        lte: today.toDate(),
      },
      next_payment_at: today.toDate(),
    },
  });

  //それぞれの契約に対して、支払わないといけない月を見ていく
  for (const contract of targetContracts) {
    //支払わないといけない月を見ていく

    const thisContract = new BackendCoreContractService(contract.id);
    task.give(thisContract);
    const unpaidMonths = await thisContract.getUnpaidMonths(); //支払わないといけない月

    //支払わないといけない月があったら、支払いを行う
    if (unpaidMonths.length > 0) {
      //支払いを1つずつ行う
      for (const month of unpaidMonths) {
        const targetYear = Number(month.target_month.toString().slice(0, 4));
        const targetMonth = Number(month.target_month.toString().slice(4));

        await task.transaction(async (tx) => {
          //支払いを行う
          const { gmoPayment, contractPayment } =
            await thisContract.createPayment({
              kind: ContractPaymentKind.MONTHLY_FEE,
              target_month: month.target_month,
              retry_count: month.retry_count,
            });

          const cardInfo = contractPayment.card.masked_card_number;

          //成功してても失敗しててもメール
          const title = '[Mycalinks POS] 月額料のお支払い';
          const mailTo = contract.email;

          let body = `
${targetYear}年${targetMonth}月の月額料のお支払い${
            contractPayment.status == ContractPaymentStatus.PAID
              ? 'が完了'
              : 'に失敗'
          }しました。
お支払い日時: ${customDayjs(contractPayment.finished_at)
            .tz()
            .format('YYYY/MM/DD HH:mm')}
お支払い金額: ${contractPayment.total_price}円
お支払いカード: ${cardInfo}

            `;

          //失敗した時はリトライ回数とかも明記
          if (contractPayment.status != ContractPaymentStatus.PAID) {
            body += `
リトライ回数: ${month.retry_count}回
            `;
          }

          const taskManager = new TaskManager({
            targetWorker: 'notification',
            kind: 'sendEmail',
          });

          await taskManager.publish({
            body: [
              {
                as: 'service',
                to: mailTo || '',
                title,
                bodyText: body,
              },
            ],
            fromSystem: true,
            service: task,
            specificGroupId: `send-email-${mailTo}`,
          });
        });
      }
    }

    //次のお支払日を設定する
    await thisContract.setNextPaymentMonth();
  }
};

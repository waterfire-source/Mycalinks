import { BackendJob, getPrisma } from 'backend-core';
import { transactionCalculator } from './calculators/transaction';
import { productCalculator } from './calculators/product';
import v8 from 'v8';
import { customDayjs } from 'common';
import { ecCalculator } from './calculators/ec';

console.log(v8.getHeapStatistics());

(async () => {
  const db = getPrisma();

  console.log('daily jobを開始します');

  let done = `
${new Date().toISOString()}: jobを開始  
`;

  //ストアごとのjobを行う

  //対象日を取得
  const targetDay = customDayjs()
    //@ts-ignore
    .tz()
    .startOf('day')
    .subtract(1, 'day')
    .toDate();

  //対象のストアを取得
  const allStores = await db.store.findMany({
    where: {
      is_active: true,
    },
    include: {
      ec_setting: true,
      accounts: true,
    },
  });

  //ここは非同期にするかも
  for (const store of allStores) {
    const job = new BackendJob({
      store,
    });

    job.resetIds({
      storeId: store.id,
    });

    //取引の集計
    console.log(`${store.id}の取引の集計を開始します`);
    try {
      await transactionCalculator(job, targetDay);
      done += `
${new Date().toISOString()}: ${store.id}の取引の集計を終了しました
`;
    } catch (e) {
      console.error(store.id, e);
    }

    //在庫の集計
    console.log(`${store.id}の在庫の集計を開始します`);
    try {
      await productCalculator(job, targetDay);
      done += `
${new Date().toISOString()}: ${store.id}の在庫の集計を終了しました
`;
    } catch (e) {
      console.error(store.id, e);
    }

    //ECの集計
    console.log(`${store.id}のECの集計を開始します`);
    try {
      await ecCalculator(job, targetDay);
      done += `
${new Date().toISOString()}: ${store.id}のECの集計を終了しました
`;
    } catch (e) {
      console.error(store.id, e);
    }
  }

  //全て終わったらプロセスを正常に終了させる

  console.log(done); //[TODO] これをCloudWatchとかに出力
  console.log('daily jobを終了します');

  process.exit(0);
})();

import { BackendJob, getPrisma } from 'backend-core';
import { returnPayingTransaction } from './calculators/transaction';
import v8 from 'v8';
import {
  adjustOchanokoProductStockNumber,
  adjustShopifyProductStockNumber,
} from './calculators/product';
import { customDayjs } from 'common';

console.log(v8.getHeapStatistics());

(async () => {
  const db = getPrisma();

  console.log('ensure-consistency jobを開始します');

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

    //支払い中取引の取り消し
    console.log(`${store.id}の支払い中取引の取り消しを開始します`);
    try {
      await returnPayingTransaction(job, targetDay);
      done += `
${new Date().toISOString()}: ${store.id}の支払い中取引の取り消しを終了しました
`;
    } catch (e) {
      console.error(store.id, e);
    }

    //おちゃのこの在庫数と価格を是正
    console.log(`${store.id}のおちゃのこの在庫数と価格を是正します`);
    try {
      await adjustOchanokoProductStockNumber(job);
      done += ` 
${new Date().toISOString()}: ${store.id}のおちゃのこの在庫数と価格を是正しました
`;
    } catch (e) {
      console.error(store.id, e);
    }

    //Shopifyの在庫数と価格を是正
    console.log(`${store.id}のShopifyの在庫数と価格を是正します`);
    try {
      await adjustShopifyProductStockNumber(job);
      done += ` 
${new Date().toISOString()}: ${store.id}のShopifyの在庫数と価格を是正しました
`;
    } catch (e) {
      console.error(store.id, e);
    }
  }

  //全て終わったらプロセスを正常に終了させる

  console.log(done); //[TODO] これをCloudWatchとかに出力
  console.log('ensure-consistency jobを終了します');

  process.exit(0);
})();

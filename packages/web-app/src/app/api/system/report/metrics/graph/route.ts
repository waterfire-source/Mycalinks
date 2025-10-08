import { BackendAPI } from '@/api/backendApi/main';
import { createMetricsGraphDef } from '@/app/api/system/report/def';
import { CloudWatchCustomClient, SNSCustomClient } from 'backend-core';
import { sleep } from 'common';
import { GooglePresentationService } from 'backend-core';
import { customDayjs } from 'common';

//メトリクスグラフ画像生成API
export const POST = BackendAPI.defineApi(createMetricsGraphDef, async (API) => {
  const cloudwatch = new CloudWatchCustomClient();

  const today = customDayjs().tz();

  //マスターDB
  const masterDbImageUrl = await cloudwatch.getMetricsGraphImage({
    widgetDef:
      CloudWatchCustomClient.widgetDefs.rds.masterInstanceCpuUtilization,
  });

  console.log('masterDbImageUrl', masterDbImageUrl);

  await sleep(1000);

  //リードレプリカDB
  const readReplicaDbImageUrl = await cloudwatch.getMetricsGraphImage({
    widgetDef:
      CloudWatchCustomClient.widgetDefs.rds.readReplicaInstanceCpuUtilization,
  });

  console.log('readReplicaDbImageUrl', readReplicaDbImageUrl);

  await sleep(1000);

  //ECSサービス
  const prodWebAppServiceImageUrl = await cloudwatch.getMetricsGraphImage({
    widgetDef:
      CloudWatchCustomClient.widgetDefs.ecs
        .posProductionWebAppServiceCpuUtilization,
  });

  console.log('prodWebAppServiceImageUrl', prodWebAppServiceImageUrl);

  const publicProdWebAppServiceImageUrl = await cloudwatch.getMetricsGraphImage(
    {
      widgetDef:
        CloudWatchCustomClient.widgetDefs.ecs
          .posPublicProductionWebAppServiceCpuUtilization,
    },
  );

  console.log(
    'publicProdWebAppServiceImageUrl',
    publicProdWebAppServiceImageUrl,
  );

  const customerProdWebAppServiceImageUrl =
    await cloudwatch.getMetricsGraphImage({
      widgetDef:
        CloudWatchCustomClient.widgetDefs.ecs
          .posCustomerProductionWebAppServiceCpuUtilization,
    });

  console.log(
    'customerProdWebAppServiceImageUrl',
    customerProdWebAppServiceImageUrl,
  );

  const prodAppApiServiceImageUrl = await cloudwatch.getMetricsGraphImage({
    widgetDef:
      CloudWatchCustomClient.widgetDefs.ecs
        .appProductionApiServiceCpuUtilization,
  });

  console.log('prodAppApiServiceImageUrl', prodAppApiServiceImageUrl);

  await sleep(1000);

  //ECSワーカー
  const prodItemWorkerServiceImageUrl = await cloudwatch.getMetricsGraphImage({
    widgetDef:
      CloudWatchCustomClient.widgetDefs.ecs
        .posProductionItemWorkerServiceCpuUtilization,
  });

  console.log('prodItemWorkerServiceImageUrl', prodItemWorkerServiceImageUrl);

  await sleep(1000);

  //POSロードバランサー
  const prodLoadBalancerRequestImageUrl = await cloudwatch.getMetricsGraphImage(
    {
      widgetDef:
        CloudWatchCustomClient.widgetDefs.elb.posProductionLoadBalancerRequest,
    },
  );

  console.log(
    'prodLoadBalancerRequestImageUrl',
    prodLoadBalancerRequestImageUrl,
  );

  await sleep(1000);

  const publicProdLoadBalancerRequestImageUrl =
    await cloudwatch.getMetricsGraphImage({
      widgetDef:
        CloudWatchCustomClient.widgetDefs.elb
          .posPublicProductionLoadBalancerRequest,
    });

  console.log(
    'publicProdLoadBalancerRequestImageUrl',
    publicProdLoadBalancerRequestImageUrl,
  );

  await sleep(1000);

  const customerProdLoadBalancerRequestImageUrl =
    await cloudwatch.getMetricsGraphImage({
      widgetDef:
        CloudWatchCustomClient.widgetDefs.elb
          .posCustomerProductionLoadBalancerRequest,
    });

  console.log(
    'customerProdLoadBalancerRequestImageUrl',
    customerProdLoadBalancerRequestImageUrl,
  );

  await sleep(1000);

  const prodAppApiLoadBalancerRequestImageUrl =
    await cloudwatch.getMetricsGraphImage({
      widgetDef:
        CloudWatchCustomClient.widgetDefs.elb.appProductionLoadBalancerRequest,
    });

  console.log(
    'prodAppApiLoadBalancerRequestImageUrl',
    prodAppApiLoadBalancerRequestImageUrl,
  );

  await sleep(1000);

  //CloudFront
  const prodCloudFrontRequestImageUrl = await cloudwatch.getMetricsGraphImage({
    widgetDef:
      CloudWatchCustomClient.widgetDefs.cloudfront.staticDistributionRequest,
  });

  console.log('prodCloudFrontRequestImageUrl', prodCloudFrontRequestImageUrl);

  const imageUrls = [
    {
      imageUrl: masterDbImageUrl,
      title: 'DBマスターインスタンスCPU使用率 下は先月',
    },
    {
      imageUrl: readReplicaDbImageUrl,
      title: 'DBリードレプリカインスタンスCPU使用率 下は先月',
    },
    {
      imageUrl: prodWebAppServiceImageUrl,
      title: 'Mycalinks本番環境ECSサービスCPU使用率 下は先月',
    },
    {
      imageUrl: publicProdWebAppServiceImageUrl,
      title: 'テスト店舗環境ECSサービスCPU使用率 下は先月',
    },
    {
      imageUrl: customerProdWebAppServiceImageUrl,
      title: '顧客環境ECSサービスCPU使用率 下は先月',
    },
    {
      imageUrl: prodAppApiServiceImageUrl,
      title: 'アプリAPI本番環境ECSサービスCPU使用率 下は先月',
    },
    {
      imageUrl: prodItemWorkerServiceImageUrl,
      title: 'Mycalinks本番環境ECS 商品関連ワーカーCPU使用率 下は先月',
    },
    {
      imageUrl: prodLoadBalancerRequestImageUrl,
      title:
        'Mycalinks本番環境ロードバランサ リクエスト数とターゲットの応答速度 下は先月',
    },
    {
      imageUrl: publicProdLoadBalancerRequestImageUrl,
      title:
        'テスト店舗環境ロードバランサ リクエスト数とターゲットの応答速度 下は先月',
    },
    {
      imageUrl: customerProdLoadBalancerRequestImageUrl,
      title:
        '顧客環境ロードバランサ リクエスト数とターゲットの応答速度 下は先月',
    },
    {
      imageUrl: prodAppApiLoadBalancerRequestImageUrl,
      title:
        'アプリAPI本番環境ロードバランサ リクエスト数とターゲットの応答速度 下は先月',
    },
    {
      imageUrl: prodCloudFrontRequestImageUrl,
      title: '本番画像・ファイル配信 リクエスト数とキャッシュヒット率 下は先月',
    },
  ];

  const presentationService = new GooglePresentationService();
  await presentationService.createPresentationFromTemplate(
    'report',
    'report',
    `${today.format('YYYY_MM')}月分Mycaレポート_${today.format(
      'YYYY-MM-DD_HH:mm',
    )}作成`,
  );

  await presentationService.addImageSlides(imageUrls);

  const sns = new SNSCustomClient('slackInfra');
  await sns.sendToSlack({
    message: `
  1ヶ月の集計結果発表します！　Googleプレゼンテーションも作って以下に配置したよ！
  ${presentationService.editUrl}

  ${imageUrls
    .map(
      ({ imageUrl, title }) => `
  
  ＝${title}＝
  ${imageUrl.join('\n')}

  `,
    )
    .join('\n')}

      `,
    subject: 'Mycaインフラメトリクス（自動生成）',
  });
});

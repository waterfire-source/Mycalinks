//AWS関連の処理をまとめる
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import {
  SendEmailCommand,
  SendEmailCommandInput,
  SESClient,
} from '@aws-sdk/client-ses';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
  SendMessageCommand,
} from '@aws-sdk/client-sqs';
import { BackendCoreError } from '@/error/main';
import { Upload } from '@aws-sdk/lib-storage';
import { PassThrough } from 'stream';
import { CustomCrypto } from 'common';
import {
  CloudWatchClient,
  GetMetricWidgetImageCommand,
} from '@aws-sdk/client-cloudwatch';
import { metricsGraphWidgetDef } from '@/services/external/aws/widgets';
import { workerDefs } from '@/task/main';
import {
  SchedulerClient,
  CreateScheduleCommand,
} from '@aws-sdk/client-scheduler';
import { getSignedUrl } from '@aws-sdk/cloudfront-signer'; // ESM対応

const awsConfig = {
  credentials: {
    accessKeyId: process.env.AMAZON_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AMAZON_SECRET_ACCESS_KEY || '',
  },
  region: 'ap-northeast-1',
};

//カスタムクラス
export class S3CustomClient extends S3Client {
  public customConfig = {
    buckets: {
      private: {
        name: process.env.PRIVATE_STATIC_BUCKET!,
        host: process.env.PRIVATE_STATIC_BUCKET_HOST!,
        keyPairId: process.env.PRIVATE_STATIC_BUCKET_KEY_PAIR_ID!,
        privateKey: process.env.PRIVATE_STATIC_BUCKET_PRIVATE_KEY!,
      },
      public: {
        name: process.env.AMAZON_S3_BUCKET!,
        host: process.env.AMAZON_S3_BUCKET!,
      },
    },
  };

  private get bucket() {
    return this.customConfig.buckets[this.mode].name;
  }

  private get host() {
    return this.customConfig.buckets[this.mode].host;
  }

  constructor(private mode: 'private' | 'public' = 'public') {
    super(awsConfig); //親クラスに渡す
  }

  //ランダム文字列
  private get randomFileName() {
    return Math.random().toString(32).substring(2) + uuidv4();
  }

  /**
   * フォルダを空にする
   */
  public emptyDir = async (dir: string) => {
    const listParams = {
      Bucket: this.bucket,
      Prefix: dir,
    };

    const listedObjects = await this.send(new ListObjectsV2Command(listParams));

    if (!listedObjects.Contents) return true;

    //削除を実行
    for (const file of listedObjects.Contents) {
      await this.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: file.Key,
        }),
      );
    }

    return true;
  };
  /**
   * ファイルアップロード
   * @returns
   */
  public upload = async ({
    upDir,
    buffer,
    extension,
    fileName,
    customSettings,
  }: {
    upDir: string;
    buffer: Buffer | null;
    extension: string;
    fileName?: string;
    customSettings?: Partial<PutObjectCommandInput>;
  }) => {
    fileName = fileName
      ? this.randomFileName + '/' + fileName + extension
      : this.randomFileName + extension;

    //S3に送信する
    await this.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: `${upDir}${fileName}`,
        Body: buffer || undefined,
        ...customSettings,
      }),
    );

    return `https://${this.host}/${upDir}${fileName}`;
  };

  /**
   * ストリーム配信
   */
  public streamUpload = async ({
    upDir,
    extension,
    mimetype,
    callback,
    fileName,
  }: {
    upDir: string;
    extension: string;
    mimetype: string;
    fileName?: string;
    callback: (passThrough: PassThrough) => Promise<void>;
  }) => {
    const passThrough = new PassThrough(); // 書き込み用のStream
    const actualFileName = fileName || this.randomFileName + extension;

    const uploader = new Upload({
      client: this,
      params: {
        Bucket: this.bucket,
        Body: passThrough,
        Key: `${upDir}${actualFileName}`,
        ContentType: mimetype,
      },
    });

    const uploadPromise = uploader.done();

    //アップロード開始
    await callback(passThrough);

    //アップロード完了
    passThrough.end();
    await uploadPromise;

    return `https://${this.host}/${upDir}${actualFileName}`;
  };

  /**
   * CloudFrontのSignedURL生成
   */
  public getSignedUrl(url: string, expireInSec: number = 60 * 30) {
    if (this.mode != 'private')
      throw new BackendCoreError({
        internalMessage:
          'CloudFrontのSignedURLはprivateモードでのみ生成できます',
      });

    const dateLessThan = new Date(Date.now() + expireInSec * 1000);

    const signedUrl = getSignedUrl({
      url,
      keyPairId: this.customConfig.buckets.private.keyPairId,
      privateKey: this.customConfig.buckets.private.privateKey,
      dateLessThan,
    });

    return signedUrl;
  }
}

//SQS
export class SQSCustomClient extends SQSClient {
  public customConfig = {
    queueUrl: '',
    maxRetryCount: 3,
  };

  constructor(queueUrl: string) {
    super(awsConfig); //親クラスに渡す
    this.customConfig.queueUrl = queueUrl;
    console.log(`キューURL: ${this.customConfig.queueUrl}`);
  }

  /**
   * メッセージを受け取る
   */
  public receiveMessage = async (): Promise<{
    body: Record<string, unknown>;
    receiptHandle: string;
  } | null> => {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.customConfig.queueUrl,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 20, //20秒待ってからメッセージを受け取る
      MessageAttributeNames: ['All'],
    });

    const res = await this.send(command);

    const messages = res.Messages || [];
    const message = messages[0];

    if (!message || !message.Body || !message.ReceiptHandle) return null;
    const retryCount = Number(message.Attributes?.ApproximateReceiveCount || 0);

    //SNSのボディをさらに確認する
    let snsBodyJson: Record<string, unknown> | null = null;

    try {
      const sqsBodyJson = JSON.parse(message.Body);

      //ここで、MessageがなかったらSQS直接送信であるため、そのまま返す
      if (!sqsBodyJson.Message) {
        snsBodyJson = sqsBodyJson;
      } else {
        const snsMessage = sqsBodyJson.Message;
        snsBodyJson = JSON.parse(snsMessage);
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }

    return {
      body: snsBodyJson!,
      receiptHandle: message.ReceiptHandle,
    };
  };

  /**
   * メッセージを送信する
   */
  public sendTask = async ({
    groupId,
    worker,
    kind,
    body,
  }: {
    groupId: string;
    worker: keyof typeof workerDefs;
    kind: string;
    body: Record<string, unknown>;
  }) => {
    const bodyText = JSON.stringify(body);
    const md5 = CustomCrypto.md5(groupId + bodyText); //FIFO用

    const command = new SendMessageCommand({
      QueueUrl: this.customConfig.queueUrl,
      MessageGroupId: groupId,
      MessageDeduplicationId: md5,
      MessageBody: JSON.stringify(body),
      MessageAttributes: {
        taskKind: {
          DataType: 'String',
          StringValue: kind,
        },
      },
    });

    try {
      const result = await this.send(command);
      return result.MessageId;
    } catch (error) {
      console.error('Failed to send task:', error);
      throw error;
    }
  };

  /**
   * メッセージを削除する
   */
  public deleteMessage = async (messageId: string) => {
    const command = new DeleteMessageCommand({
      QueueUrl: this.customConfig.queueUrl,
      ReceiptHandle: messageId,
    });

    return await this.send(command);
  };

  /**
   * ARNに変換
   */
  public get arn() {
    if (!this.customConfig.queueUrl) {
      throw new BackendCoreError({
        internalMessage: 'Queue URL is not set.',
      });
    }

    const match = this.customConfig.queueUrl.match(
      /^https:\/\/sqs\.([a-z0-9-]+)\.amazonaws\.com\/(\d{12})\/(.+)$/,
    );

    if (!match) {
      throw new BackendCoreError({
        internalMessage: 'Invalid SQS queue URL format.',
      });
    }

    const [, region, accountId, queueName] = match;

    return `arn:aws:sqs:${region}:${accountId}:${queueName}`;
  }
}

export class SNSCustomClient extends SNSClient {
  public customConfig = {
    topicArn: '',
  };

  public static topicArns = {
    item: process.env.ITEM_SNS_TOPIC_ARN || '',
    transaction: process.env.TRANSACTION_SNS_TOPIC_ARN || '',
    slack: process.env.SLACK_SNS_TOPIC_ARN || '',
    slackInfra: process.env.SLACK_INFRA_SNS_TOPIC_ARN || '',
  };

  constructor(topic?: keyof typeof SNSCustomClient.topicArns) {
    super(awsConfig); //親クラスに渡す
    if (topic) {
      this.customConfig.topicArn = SNSCustomClient.topicArns[topic];
      console.log(`トピックARN: ${this.customConfig.topicArn}`);
    }
  }

  /**
   * メッセージを送信する（主にタスク用） 一旦廃止
   */
  // public publishTask = async (
  //   groupId: string,
  //   kind: string,
  //   body: Record<string, unknown>,
  // ) => {
  //   const bodyText = JSON.stringify(body);
  //   const md5 = CustomCrypto.md5(groupId + bodyText); //FIFO用
  //   const command = new PublishCommand({
  //     TopicArn: this.customConfig.topicArn,
  //     Message: bodyText,
  //     MessageGroupId: groupId,
  //     MessageDeduplicationId: md5,
  //     MessageAttributes: {
  //       taskKind: {
  //         DataType: 'String',
  //         StringValue: kind,
  //       },
  //     },
  //   });

  //   try {
  //     const result = await this.send(command);
  //     return result.MessageId;
  //   } catch (error) {
  //     console.error('Failed to send task:', error);
  //     throw error;
  //   }
  // };

  //開発用
  public sendToSlack = async ({
    message,
    subject,
  }: {
    message: string;
    subject: string;
  }) => {
    const slackCommand = {
      version: '1.0',
      source: 'custom',
      content: {
        title: subject,
        description: message,
      },
    };

    this.customConfig.topicArn =
      this.customConfig.topicArn || SNSCustomClient.topicArns.slack;

    const command = new PublishCommand({
      TopicArn: this.customConfig.topicArn,
      Message: JSON.stringify(slackCommand),
      Subject: subject,
    });

    return await this.send(command);
  };
}

//メール送信など
export class SESCustomClient extends SESClient {
  // private API: BackendAPI<any>;

  constructor() {
    super(awsConfig); //親クラスに渡す
    // this.API = API;
  }

  //システムとしてメールを送信（ioの方のメールアドレス）
  @BackendCoreError.RetryOnFailure({
    maxRetries: 2,
    delay: 300,
    throwLastError: true,
  })
  public async sendEmail({
    as = 'system',
    to,
    cc,
    bcc,
    title,
    bodyText,
  }: {
    as: 'system' | 'service';
    to: string; //メールアドレス
    cc?: string[];
    bcc?: string[];
    title: string;
    bodyText: string;
  }) {
    const from =
      as == 'service'
        ? process.env.SERVICE_EMAIL_ADDRESS
        : process.env.SYSTEM_EMAIL_ADDRESS;

    const params: SendEmailCommandInput = {
      Destination: {
        ToAddresses: [to],
        BccAddresses: bcc,
        CcAddresses: cc,
      },
      Message: {
        Body: {
          Text: {
            Data: bodyText,
            Charset: 'utf-8',
          },
        },
        Subject: {
          Data: title,
          Charset: 'utf-8',
        },
      },
      Source: from,
    };

    const res = await this.send(new SendEmailCommand(params));
    return res.MessageId;
  }
}

export class CloudWatchCustomClient extends CloudWatchClient {
  constructor() {
    super(awsConfig); //親クラスに渡す
  }

  private customConfig = {
    metricsGraphDir: 'system/report/metrics/graph/',
  };

  public static widgetDefs = metricsGraphWidgetDef;

  /**
   * メトリクスグラフ画像を生成 ここ一ヶ月と、先月の分も取得
   */
  public getMetricsGraphImage = async ({
    widgetDef,
  }: {
    widgetDef: Record<string, unknown>;
  }) => {
    //今月のデータ取得
    widgetDef.start = '-PT720H';
    widgetDef.end = 'P0D';

    let command = new GetMetricWidgetImageCommand({
      MetricWidget: JSON.stringify(widgetDef),
    });

    let res = await this.send(command);
    let imageBuffer = res.MetricWidgetImage;

    if (!imageBuffer) {
      throw new BackendCoreError({
        internalMessage: 'メトリクスグラフ画像の生成に失敗しました',
      });
    }

    //S3にアップロード
    const s3 = new S3CustomClient();
    const imageUrl = await s3.upload({
      upDir: this.customConfig.metricsGraphDir,
      buffer: Buffer.from(imageBuffer),
      extension: '.png',
      customSettings: {
        ContentType: 'image/png',
        ContentDisposition: 'inline',
      },
    });

    //先月のデータ取得
    widgetDef.start = '-PT1440H';
    widgetDef.end = '-PT720H';

    command = new GetMetricWidgetImageCommand({
      MetricWidget: JSON.stringify(widgetDef),
    });

    res = await this.send(command);
    imageBuffer = res.MetricWidgetImage;

    if (!imageBuffer) {
      throw new BackendCoreError({
        internalMessage: 'メトリクスグラフ画像の生成に失敗しました',
      });
    }

    //S3にアップロード
    const imageUrl2 = await s3.upload({
      upDir: this.customConfig.metricsGraphDir,
      buffer: Buffer.from(imageBuffer),
      extension: '.png',
      customSettings: {
        ContentType: 'image/png',
        ContentDisposition: 'inline',
      },
    });

    return [imageUrl, imageUrl2];
  };
}

/**
 * EventBridge
 */
export class EventBridgeSchedulerCustomClient extends SchedulerClient {
  constructor() {
    super(awsConfig); //親クラスに渡す
  }

  private customConfig = {
    sqsRoleArn: process.env.EVENT_BRIDGE_SQS_ROLE_ARN || '',
    env: process.env.NEXT_PUBLIC_DATABASE_KIND || '',
  };

  /**
   * 決められた時間にSQSのタスクを追加する方法
   */
  public sendSqsTaskAt = async ({
    at,
    body,
    sqsArn,
    groupId,
  }: {
    at: Date;
    body: Record<string, unknown>;
    sqsArn: string;
    groupId: string;
  }) => {
    const name = `pos-${this.customConfig.env}-for-sqs-${groupId}`;
    const time = at.toISOString().slice(0, 19);

    console.log(time);

    const command = new CreateScheduleCommand({
      Name: name,
      ScheduleExpression: `at(${time})`,
      Target: {
        Arn: sqsArn,
        RoleArn: this.customConfig.sqsRoleArn,
        Input: JSON.stringify(body),
        SqsParameters: {
          MessageGroupId: groupId,
        },
        RetryPolicy: {
          MaximumEventAgeInSeconds: 60 * 60 * 24, //1日
          MaximumRetryAttempts: 5, //5回繰り返す
        },
      },
      FlexibleTimeWindow: {
        Mode: 'OFF',
      },
      ActionAfterCompletion: 'DELETE',
    });

    return await this.send(command);
  };
}

//Emailを受け取ってwebhook化する
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3Handler } from 'aws-lambda';
import { Readable } from 'stream';
import { simpleParser } from 'mailparser';
import { OchanokoMailService } from './services/ochanoko';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { MailService } from './services/main';
import nodemailer from 'nodemailer';
import { TaskService } from './services/task';
const sesClient = new SESv2Client();

const transporter = nodemailer.createTransport({
  SES: { sesClient, SendEmailCommand },
});

// Stream → Buffer 変換
const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

const s3 = new S3Client(); // リージョンは適宜変更
const botToken = process.env.BOT_TOKEN!;
const webAppOrigin = process.env.WEB_APP_ORIGIN!;
const infoEmail = process.env.INFO_EMAIL!;
const infoEmailTo = process.env.INFO_EMAIL_TO!;
const systemFrom = process.env.SYSTEM_FROM!;

export const handler: S3Handler = async (event) => {
  for (const record of event.Records) {
    const { bucket, object } = record.s3;

    const command = new GetObjectCommand({
      Bucket: bucket.name,
      Key: object.key,
    });

    const response = await s3.send(command);

    const bodyStream = response.Body as Readable;
    const rawEmail = await streamToBuffer(bodyStream);

    const parsed = await simpleParser(rawEmail);

    const mailService = new MailService(parsed);

    //infoに来てた場合は特例としてそのままメールを転送する
    if (mailService.to == infoEmail) {
      const raw = await transporter.sendMail({
        from: systemFrom,
        to: infoEmailTo,
        replyTo: parsed.from?.text, // 元の送信者に返信できるように
        subject: parsed.subject || '(No Subject)',
        text: parsed.text,
        html: parsed.html || `<pre>${parsed.text}</pre>`,
        attachments: parsed.attachments.map((att) => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })),
      });

      console.log('メールを転送しました:', raw.messageId);
      return;
    }

    console.log(`メールが届きました: ${JSON.stringify(parsed)}`);

    const provider = mailService.provider;

    if (!provider) {
      console.log('providerが見つかりませんでした');
      return;
    }

    let reqBody: Record<string, unknown> = {};
    let path = '';

    switch (provider) {
      //おちゃのこからのメール
      case 'ochanoko': {
        const ochanokoMailService = new OchanokoMailService(parsed);
        const orderInfo = ochanokoMailService.orderInfo;

        if (!orderInfo) {
          console.log('注文情報が見つかりませんでした');
          return;
        }

        // path = OchanokoMailService.config.webhookPath;
        // reqBody = {
        //   orderInfo,
        // };

        //おちゃのこだけSQSにメッセージを直接送信する
        const taskService = new TaskService('externalEc');

        const mailMd5ed = taskService.md5(orderInfo.storeEmail);

        const messageId = await taskService.publish({
          groupId: `ochanoko-${mailMd5ed}-order`,
          kind: 'ochanokoOrder',
          body: [
            {
              task_item_id: 1,
              data: {
                email: orderInfo.storeEmail,
                order_id: orderInfo.orderId,
                kind: orderInfo.status,
              },
            },
          ],
        });

        console.log('メッセージを送信しました:', messageId);

        return;

        break;
      }
    }

    console.log(`${webAppOrigin}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        BotToken: botToken,
      },
      body: JSON.stringify(reqBody),
    });

    let retryCount = 0;
    const maxRetries = 2;
    let resJson;

    while (retryCount <= maxRetries) {
      try {
        const res = await fetch(`${webAppOrigin}${path}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            BotToken: botToken,
          },
          body: JSON.stringify(reqBody),
        });

        if (!res.ok) {
          throw new Error('フェッチに失敗しました');
        }

        resJson = await res.json();

        break;
      } catch (error) {
        if (retryCount === maxRetries) {
          throw error;
        }
        retryCount++;
        const waitTime = 5000 * retryCount;
        console.log(
          `フェッチに失敗しました。${waitTime}秒後にリトライします: ${error}`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    console.log(resJson);
    console.log('処理が全て完了');
  }
};

import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import crypto from 'crypto';
const sqsClient = new SQSClient();

export class TaskService {
  private config = {
    queues: {
      externalEc: process.env.EXTERNAL_EC_WORKER_QUEUE_URL || '',
    },
  };

  private get queueUrl() {
    return this.config.queues[this.targetWorker];
  }

  public md5(text: string) {
    const hash = crypto.createHash('md5').update(text).digest('hex');

    return hash;
  }

  constructor(private targetWorker: keyof typeof this.config.queues) {}

  public async publish({
    kind,
    groupId,
    body,
  }: {
    kind: string;
    groupId: string;
    body: Array<{
      task_item_id: number;
      data: Record<string, unknown>;
    }>;
  }) {
    const messageBody = {
      targetWorker: this.targetWorker,
      kind,
      body,
      resources: {},
      fromProcessId: Date.now(),
      ids: {},
      chunkId: 1,
      fromSystem: true,
    };

    const bodyText = JSON.stringify(messageBody);
    const md5 = this.md5(groupId + bodyText); //FIFO用

    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageGroupId: groupId,
      MessageDeduplicationId: md5,
      MessageBody: JSON.stringify(messageBody),
      MessageAttributes: {
        taskKind: {
          DataType: 'String',
          StringValue: kind,
        },
      },
    });

    try {
      const result = await sqsClient.send(command);
      return result.MessageId;
    } catch (error) {
      console.error('Failed to send task:', error);
      throw error;
    }
  }
}

export type SendPushNotification = {
  deviceId: string;
  sound?: string;
  title: string;
  body: string;
};

export type SendEmail = {
  as: 'system' | 'service';
  to: string;
  cc?: string[];
  bcc?: string[];
  title: string;
  bodyText: string;
};

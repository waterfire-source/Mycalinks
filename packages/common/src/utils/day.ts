import dayjs, { Dayjs } from 'dayjs';

import customParseFormat from 'dayjs/plugin/customParseFormat';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import 'dayjs/locale/ja';

// プラグインを拡張
dayjs.extend(customParseFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.locale('ja');

export const formatDate = (date: dayjs.Dayjs): string => {
  return date
    .format('YYYY/MM/DD(dd) HH:mm:ss')
    .replace('dd', ['日', '月', '火', '水', '木', '金', '土'][date.day()]);
};

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Cron from 'croner';
import { ConfigType } from 'dayjs';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');

interface CustomDayjs extends Dayjs {
  tz(timezone?: string, keepLocalTime?: boolean): Dayjs;
  offsetName(type?: 'short' | 'long'): string | undefined;
}

interface DayjsTimezone {
  (date?: ConfigType, timezone?: string): Dayjs;
  (date: ConfigType, format: string, timezone?: string): Dayjs;
  guess(): string;
  setDefault(timezone?: string): void;
}

type CustomDayjsFunction = (date?: dayjs.ConfigType) => CustomDayjs;
type CustomDayjsProp = {
  tz: DayjsTimezone;
  extend: (plugin: dayjs.PluginFunc<unknown>, option?: unknown) => void;
  locale: (locale: string) => void;
};

export const customDayjs = dayjs as CustomDayjsFunction & CustomDayjsProp;

// 曜日を漢字1文字で取得
export const getJapaneseDay = (date: Date | string | dayjs.Dayjs): string => {
  const day = customDayjs(date).day();
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return days[day];
};

//指定された時間が指定されたCRON表現の一部に一致するか確認
export const checkIfPartOfCron = (
  cronExpression: string,
  date: Date,
  startDate: Date, //開始日時
  endDate: Date | null, //終了日時
): boolean => {
  if (!cronExpression) return false;

  //とりあえず開始日時よりも後ろじゃなかったらtrueなはずがないためfalseを返す
  if (startDate.getTime() > date.getTime()) return false;

  //終了日時が設定されていない場合、CRONの範囲内にあるかどうか判断しようがないためtrue
  if (!endDate) return true;

  const dayjsStartDate = customDayjs(startDate);

  //あとは開始〜終了の間にいるかどうかだけ調べる
  const saleLength = endDate.getTime() - startDate.getTime();

  //10分
  const backInterval = 1000 * 60 * 10;

  //この時間の前の開始時間を探索していって、saleLength分の長さまで遡ってもなかったらfalse
  let backLength = 0;

  while (backLength < saleLength) {
    const targetDate = customDayjs(date.getTime() - backLength);

    //チェックする
    if (checkIfPointOfCron(targetDate, dayjsStartDate, cronExpression)) {
      return true;
    } else {
      backLength += backInterval;
    }
  }

  //見つかってないことになるためfalse
  return false;
};

//日毎問題をクリアしたCRONに変換しつつ、確認する
const checkIfPointOfCron = (
  targetDate: dayjs.Dayjs,
  dayjsStartDate: dayjs.Dayjs,
  cronExpression: string,
) => {
  //手動で考慮するべき事項を入れる（/nが月、週、日に対して入れられていた場合）
  const cronArr = cronExpression.split(' ');
  if (cronArr.length != 5) return false;

  if (cronArr[3].includes('/')) {
    //〜月毎とかがあった場合
    const rate = parseInt(cronArr[3].split('/')[1]);

    //今の月 - 開始月 がrateで割り切れるか確認
    const passedMonths = targetDate
      .startOf('month')
      .diff(dayjsStartDate.startOf('month'), 'months');

    //割り切れるなら、月のところを*にする
    if (passedMonths % rate) {
      return false;
    } else {
      cronArr[3] = '*';
    }
  }

  if (cronArr[2].includes('/')) {
    //〜日毎とかがあった場合
    const rate = parseInt(cronArr[2].split('/')[1]);

    //今の日 - 開始日 がrateで割り切れるか確認
    const passedMonths = targetDate
      .startOf('day')
      .diff(dayjsStartDate.startOf('day'), 'days');

    //割り切れるなら、月のところを*にする
    if (passedMonths % rate) {
      return false;
    } else {
      cronArr[2] = '*';
    }
  }

  cronExpression = cronArr.join(' ');
  const delta = 1000;

  const adjustedTimestamp = targetDate.subtract(delta, 'milliseconds');

  //明示的にタイムゾーンを設定
  const cronJob = new Cron(cronExpression, { timezone: 'Asia/Tokyo' });
  const nextRunTime = cronJob.nextRun(adjustedTimestamp.toDate());

  if (!nextRunTime) return false;

  const secondsDelta = nextRunTime.getTime() - adjustedTimestamp.valueOf();
  return secondsDelta == delta;
};

// jsのDateをstringに変換
export const dateToStr = (input: Date | string): string => {
  const date = input instanceof Date ? input : new Date(input);

  if (isNaN(date.getTime())) {
    console.error('Invalid date format');
  }

  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);

  return `${year}/${month}/${day}/${hours}:${minutes}`;
};

export const formatTime = (date: Date | string): string => {
  const dayjsDate = customDayjs(date);
  if (!dayjsDate.isValid()) {
    console.error('Invalid date format');
    return '';
  }
  return dayjsDate.format('HH:mm');
};

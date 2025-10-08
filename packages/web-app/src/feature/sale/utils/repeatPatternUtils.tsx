import { dayNames } from '@/constants/day';

export enum RecurrenceType {
  none = 'none',
  daily = 'daily',
  weekly = 'weekly',
  monthlyByDate = 'monthlyByDate',
  monthlyByWeek = 'monthlyByWeek',
  yearly = 'yearly',
  weekday = 'weekday',
}

export interface ParsedRepeatPattern {
  // 繰り返し頻度（例：'毎日', '2日ごと', '毎週', '2週ごと', '毎月', '2ヶ月ごと' など）
  frequency: string;
  // 週単位の場合：曜日のリスト（例：['月', '火']）
  weekdays?: string[];
  // 月単位の場合：日付または「第○週の○曜日」の形式
  day?: string;
  // 終了日時（saleEndDatetime）
  end?: string;

  // 繰り返し頻度の種別（例：'毎日', '2日ごと', '毎週', '2週ごと', '毎月', '2ヶ月ごと' など）
  type: RecurrenceType;
}

/**
 * 指定された繰り返しパターン（cron形式）と終了ルールに基づいて、繰り返しの情報をオブジェクトとして返します。
 *
 * 例:
 *   毎日（2024-09-26T08:50:00.000Zまで）
 *     → { frequency: '毎日', end: '2024-09-26T08:50:00.000Zまで' }
 *
 *   2日ごと（2024-09-08T16:10:00.000Zまで）
 *     → { frequency: '2日ごと', end: '2024-09-08T16:10:00.000Zまで' }
 *
 *   2ヶ月ごと（26日）（2024-09-26T22:00:00.000Zまで）
 *     → { frequency: '2ヶ月ごと', day: '26日', end: '2024-09-26T22:00:00.000Zまで' }
 *
 *   週単位の場合（例： 毎週（月、火、金曜日）
 *     → { frequency: '毎週', weekdays: ['月', '火', '金'] }
 *
 * @param repeatPattern 繰り返しパターン（cron形式の文字列）
 * @param saleEndDatetime 繰り返し終了日時
 * @returns ParsedRepeatPattern オブジェクト
 */
export const getRepeatPatternLabel = (
  repeatPattern?: string,
  saleEndDatetime?: Date,
): ParsedRepeatPattern => {
  if (!repeatPattern) return { frequency: 'なし', type: RecurrenceType.none };

  const cronParts = repeatPattern.split(' ');
  const parsed: ParsedRepeatPattern = {
    frequency: '不明',
    type: RecurrenceType.none,
  };

  // 【毎日】
  // "0 0 * * *" のパターンを最初にチェック
  if (cronParts[2] === '*' && cronParts[3] === '*' && cronParts[4] === '*') {
    parsed.frequency = '毎日';
    parsed.type = RecurrenceType.daily;
  }
  // 【日単位 - 間隔指定】
  else if (
    cronParts[2].includes('/') &&
    cronParts[3] === '*' &&
    cronParts[4] === '*'
  ) {
    const interval = cronParts[2].split('/')[1] || '1';
    parsed.frequency = interval === '1' ? '毎日' : `${interval}日ごと`;
    parsed.type = RecurrenceType.daily;
  }
  // 【週単位 - 曜日範囲指定】
  // 例： "0 0 * * 1-5" （平日毎日）のパターンを処理
  else if (cronParts[4].includes('-')) {
    const [start, end] = cronParts[4].split('-').map(Number);
    const daysNumeric = Array.from(
      { length: end - start + 1 },
      (_, i) => start + i,
    );
    const weekdays = daysNumeric
      .map((day) => {
        const dayObj = dayNames.find((d) => d.value === day);
        return dayObj ? dayObj.name : '';
      })
      .filter((n) => n !== '');
    parsed.frequency = '毎週';
    parsed.weekdays = weekdays;
    parsed.type = RecurrenceType.weekly;
  }
  // 【週単位 - 個別曜日指定】
  // cronParts[4] が '*' ではなく、かつ '#' を含まない → 週パターンと判定
  else if (cronParts[4] !== '*' && !cronParts[4].includes('#')) {
    // 例： cronParts[2] が "*/7" といった形の場合、7で割ることで週の間隔が得られる
    const rawInterval = cronParts[2].split('/')[1];
    const intervalNum = rawInterval ? parseInt(rawInterval, 10) / 7 : 1;
    parsed.frequency = intervalNum === 1 ? '毎週' : `${intervalNum}週ごと`;
    // cronParts[4] は曜日の数値のリスト（例："1,3,5"）
    const daysNumeric = cronParts[4].split(',').map(Number);
    daysNumeric.sort((a, b) => {
      const idxA = dayNames.findIndex((d) => d.value === a);
      const idxB = dayNames.findIndex((d) => d.value === b);
      return idxA - idxB;
    });
    const weekdays = daysNumeric
      .map((day) => {
        const dayObj = dayNames.find((d) => d.value === day);
        return dayObj ? dayObj.name : '';
      })
      .filter((n) => n !== '');
    parsed.weekdays = weekdays;
    parsed.type = RecurrenceType.weekly;
  }
  // 【毎年】
  // "0 0 1 1 *" のパターンをチェック
  else if (
    !isNaN(Number(cronParts[2])) && // 日付が数値
    !isNaN(Number(cronParts[3])) && // 月が数値
    cronParts[4] === '*' // 曜日が *
  ) {
    parsed.frequency = '毎年';
    parsed.day = `${cronParts[3]}月${cronParts[2]}日`;
    parsed.type = RecurrenceType.yearly;
  }
  // 【月単位】
  // 上記以外の場合（月単位、または曜日指定の月パターン）
  else {
    // cronParts[3] で月の間隔を指定している（例： "*/2" なら 2ヶ月毎）
    const monthInterval = cronParts[3].split('/')[1] || '1';
    parsed.frequency =
      monthInterval === '1' ? '毎月' : `${monthInterval}ヶ月ごと`;
    if (cronParts[4].includes('#')) {
      // 曜日指定の月パターン
      // 例： cronParts[4] が "5#2" の場合 → 「第2週の金曜日」と表示
      const parts = cronParts[4].split('#');
      const weekdayNumber = parseInt(parts[0], 10);
      const dayObj = dayNames.find((d) => d.value === weekdayNumber);
      parsed.day = `第${parts[1]}週の${dayObj ? dayObj.name : ''}曜日`;
      parsed.type = RecurrenceType.monthlyByWeek;
    } else {
      // 通常の月パターンの場合、cronParts[2] に日が入っている（例："26" → 26日）
      parsed.day = `${cronParts[2]}日`;
      parsed.type = RecurrenceType.monthlyByDate;
    }
  }

  if (saleEndDatetime) {
    parsed.end = `${saleEndDatetime}`;
  }

  return parsed;
};

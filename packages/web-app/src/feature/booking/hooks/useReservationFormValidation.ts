import { ReservationsFormState, FormErrors } from '@/feature/booking';
import { useState } from 'react';
import dayjs from 'dayjs';

export const useReservationFormValidation = () => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (formData: ReservationsFormState): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.limit_count)
      newErrors.limit_count = '予約受付上限を入力してください';
    if (!formData.start_at) newErrors.start_at = '予約開始日を入力してください';
    if (!formData.end_at) newErrors.end_at = '予約終了日を入力してください';

    // 過去の日付チェック
    if (
      formData.start_at &&
      dayjs(formData.start_at).isBefore(dayjs(), 'day')
    ) {
      newErrors.start_at = '予約開始日は今日以降の日付を選択してください';
    }
    if (formData.end_at && dayjs(formData.end_at).isBefore(dayjs(), 'day')) {
      newErrors.end_at = '予約終了日は今日以降の日付を選択してください';
    }

    if (
      formData.start_at &&
      formData.end_at &&
      formData.start_at > formData.end_at
    ) {
      newErrors.end_at = '終了日は開始日以降にしてください';
    }
    if (
      typeof formData.limit_count === 'number' &&
      typeof formData.limit_count_per_user === 'number' &&
      formData.limit_count_per_user > formData.limit_count
    ) {
      newErrors.limit_count_per_user = '予約受付上限以下で入力してください';
    }
    if (!formData.limit_count_per_user)
      newErrors.limit_count_per_user = '1人当たりの予約上限を入力してください';

    if (formData.deposit_price === undefined) {
      newErrors.deposit_price = '前金を入力してください';
    }
    if (formData.remaining_price === undefined)
      newErrors.remaining_price = '残金を入力してください';

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  return {
    errors,
    validate,
    setErrors,
  };
};
